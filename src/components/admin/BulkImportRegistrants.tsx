import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ExcelJS from "exceljs";

interface ParsedRegistrant {
  row: number;
  email: string;
  full_name: string;
  phone?: string;
  phone_country_code?: string;
  errors: string[];
  isValid: boolean;
}

interface Batch {
  id: string;
  batch_name: string;
  batch_number: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{8,20}$/;

export function BulkImportRegistrants() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRegistrant[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  // Fetch batches
  const { data: batches } = useQuery({
    queryKey: ["registration-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_settings")
        .select("id, batch_name, batch_number")
        .order("batch_number", { ascending: false });
      
      if (error) throw error;
      return data as Batch[];
    },
  });

  // Fetch existing emails for validation
  const { data: existingEmails } = useQuery({
    queryKey: ["existing-registration-emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("email");
      
      if (error) throw error;
      return new Set(data.map(r => r.email.toLowerCase()));
    },
    enabled: isOpen,
  });

  // Fetch blocked registrations
  const { data: blockedData } = useQuery({
    queryKey: ["blocked-registrations-check"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blocked_registrations")
        .select("email, phone, full_name");
      
      if (error) throw error;
      return {
        emails: new Set(data.map(r => r.email?.toLowerCase()).filter(Boolean)),
        phones: new Set(data.map(r => r.phone).filter(Boolean)),
        names: new Set(data.map(r => r.full_name?.toLowerCase()).filter(Boolean)),
      };
    },
    enabled: isOpen,
  });

  const validateRow = (row: any, rowIndex: number): ParsedRegistrant => {
    const errors: string[] = [];
    
    const email = String(row.email || row.Email || row.EMAIL || "").trim().toLowerCase();
    const full_name = String(row.full_name || row.nama || row.Nama || row.NAMA || row["Nama Lengkap"] || "").trim();
    const phone = String(row.phone || row.telepon || row.Telepon || row.hp || row.HP || row["No. HP"] || "").trim();
    const phone_country_code = String(row.phone_country_code || row.kode_negara || "+62").trim();

    // Required field validation
    if (!email) {
      errors.push("Email wajib diisi");
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push("Format email tidak valid");
    } else if (existingEmails?.has(email)) {
      errors.push("Email sudah terdaftar");
    } else if (blockedData?.emails.has(email)) {
      errors.push("Email terblokir");
    }

    if (!full_name) {
      errors.push("Nama lengkap wajib diisi");
    } else if (full_name.length < 2) {
      errors.push("Nama terlalu pendek");
    } else if (blockedData?.names.has(full_name.toLowerCase())) {
      errors.push("Nama terblokir");
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      errors.push("Format nomor telepon tidak valid");
    } else if (phone && blockedData?.phones.has(phone)) {
      errors.push("Nomor telepon terblokir");
    }

    return {
      row: rowIndex + 1,
      email,
      full_name,
      phone: phone || undefined,
      phone_country_code: phone_country_code || "+62",
      errors,
      isValid: errors.length === 0,
    };
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return rows;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setFileName(file.name);
    setParsedData([]);

    try {
      let rows: any[] = [];

      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        rows = parseCSV(text);
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        
        const worksheet = workbook.worksheets[0];
        if (!worksheet) throw new Error("Tidak ada worksheet dalam file");

        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber - 1] = String(cell.value || '').trim();
        });

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          rows.push(rowData);
        });
      } else {
        throw new Error("Format file tidak didukung. Gunakan CSV atau Excel (.xlsx/.xls)");
      }

      if (rows.length === 0) {
        throw new Error("File kosong atau tidak memiliki data");
      }

      const validated = rows.map((row, index) => validateRow(row, index));
      setParsedData(validated);

      const validCount = validated.filter(r => r.isValid).length;
      const invalidCount = validated.filter(r => !r.isValid).length;

      if (invalidCount > 0) {
        toast.warning(`Ditemukan ${invalidCount} data tidak valid dari ${validated.length} baris`);
      } else {
        toast.success(`${validCount} data siap diimpor`);
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses file");
      setParsedData([]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (data: ParsedRegistrant[]) => {
      const validData = data.filter(r => r.isValid);
      let successCount = 0;
      const errors: string[] = [];

      for (const registrant of validData) {
        try {
          // Create auth user first
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: registrant.email,
            password: crypto.randomUUID().substring(0, 12) + "Aa1!", // Random temp password
            options: {
              data: { full_name: registrant.full_name },
            },
          });

          if (authError) throw authError;

          // Create registration record
          const { error: regError } = await supabase
            .from("fim_registrations")
            .insert({
              auth_user_id: authData.user?.id,
              email: registrant.email,
              full_name: registrant.full_name,
              phone: registrant.phone,
              phone_country_code: registrant.phone_country_code,
              batch_id: selectedBatch || null,
              registration_status: "pending",
              email_verified: true, // Auto-verify for bulk import
              email_verified_at: new Date().toISOString(),
            });

          if (regError) throw regError;

          successCount++;
        } catch (error: any) {
          errors.push(`${registrant.email}: ${error.message}`);
        }
      }

      return { successCount, errors, totalValid: validData.length };
    },
    onSuccess: (result) => {
      if (result.successCount === result.totalValid) {
        toast.success(`${result.successCount} pendaftar berhasil diimpor`);
      } else {
        toast.warning(`${result.successCount}/${result.totalValid} pendaftar berhasil diimpor`);
        if (result.errors.length > 0) {
          console.error("Import errors:", result.errors);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["fim-registrations"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(`Gagal mengimpor: ${error.message}`);
    },
  });

  const handleImport = () => {
    const validData = parsedData.filter(r => r.isValid);
    if (validData.length === 0) {
      toast.error("Tidak ada data valid untuk diimpor");
      return;
    }
    importMutation.mutate(parsedData);
  };

  const handleClose = () => {
    setIsOpen(false);
    setParsedData([]);
    setFileName("");
    setSelectedBatch("");
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template Registrasi");

    worksheet.columns = [
      { header: "email", key: "email", width: 30 },
      { header: "full_name", key: "full_name", width: 30 },
      { header: "phone", key: "phone", width: 20 },
      { header: "phone_country_code", key: "phone_country_code", width: 15 },
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add example row
    worksheet.addRow({
      email: "contoh@email.com",
      full_name: "Nama Lengkap",
      phone: "81234567890",
      phone_country_code: "+62",
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-import-registrasi.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter(r => r.isValid).length;
  const invalidCount = parsedData.filter(r => !r.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import Bulk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Import Bulk Pendaftar</DialogTitle>
          <DialogDescription>
            Upload file CSV atau Excel (.xlsx) untuk mengimpor data pendaftar secara massal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download and batch selection */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label>Batch (Opsional)</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada batch</SelectItem>
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
              ) : (
                <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {fileName || "Klik atau seret file CSV/Excel ke sini"}
              </span>
            </label>
          </div>

          {/* Validation summary */}
          {parsedData.length > 0 && (
            <div className="flex gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                {validCount} Valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  <XCircle className="h-3 w-3 mr-1" />
                  {invalidCount} Tidak Valid
                </Badge>
              )}
            </div>
          )}

          {/* Data preview */}
          {parsedData.length > 0 && (
            <ScrollArea className="h-[300px] border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((row) => (
                    <TableRow key={row.row} className={!row.isValid ? "bg-red-50" : ""}>
                      <TableCell>{row.row}</TableCell>
                      <TableCell className="font-mono text-sm">{row.email}</TableCell>
                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{row.phone || "-"}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {row.errors.map((error, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {error}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          {invalidCount > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Perhatian</AlertTitle>
              <AlertDescription>
                {invalidCount} data tidak valid akan dilewati saat proses import.
                Hanya {validCount} data valid yang akan diimpor.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleImport}
            disabled={validCount === 0 || importMutation.isPending}
          >
            {importMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengimpor...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {validCount} Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
