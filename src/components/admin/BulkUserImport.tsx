import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, FileSpreadsheet, Download, CheckCircle, XCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import * as ExcelJS from "exceljs";

interface DynamicRole {
  id: string;
  name: string;
  label: string;
}

interface ImportResult {
  email: string;
  full_name: string;
  role: string;
  success: boolean;
  error?: string;
  password?: string;
}

const SYSTEM_ROLES = {
  super_admin: "Super Admin",
  admin: "Admin",
  moderator: "Moderator",
};

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password.slice(0, 8) + 'A1!x';
}

async function extractFunctionErrorMessage(err: any): Promise<string> {
  try {
    const ctx = err?.context;
    if (ctx && typeof ctx === "object" && typeof ctx.text === "function") {
      const text = await ctx.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          return parsed?.error || parsed?.message || text;
        } catch {
          return text;
        }
      }
    }
  } catch {}
  return err?.message || "Terjadi kesalahan";
}

function parseRole(roleStr: string | undefined): "super_admin" | "moderator" | "admin" | null {
  if (!roleStr) return null;
  const normalized = roleStr.toLowerCase().trim().replace(/\s+/g, "_");
  if (normalized === "super_admin" || normalized === "superadmin") return "super_admin";
  if (normalized === "admin") return "admin";
  if (normalized === "moderator") return "moderator";
  return null;
}

export default function BulkUserImport() {
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"super_admin" | "moderator" | "admin">("moderator");
  const [selectedDynamicRoleId, setSelectedDynamicRoleId] = useState<string>("");
  const [useRolePerRow, setUseRolePerRow] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  // Fetch dynamic roles
  const { data: dynamicRoles } = useQuery({
    queryKey: ["dynamic-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dynamic_roles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as DynamicRole[];
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (users: { email: string; full_name: string; role: "super_admin" | "moderator" | "admin" }[]) => {
      const results: ImportResult[] = [];

      for (const u of users) {
        try {
          if (!u.email || !u.email.includes("@")) {
            results.push({ ...u, success: false, error: "Email tidak valid" });
            continue;
          }

          const password = generateSecurePassword();

          const { data, error } = await supabase.functions.invoke("admin-create-user", {
            body: {
              email: u.email.trim().toLowerCase(),
              password,
              full_name: u.full_name.trim() || u.email.split("@")[0],
              role: u.role,
            },
          });

          if (error) {
            const errorMessage = await extractFunctionErrorMessage(error);
            results.push({ ...u, success: false, error: errorMessage });
            continue;
          }

          if ((data as any)?.success === false) {
            results.push({ ...u, success: false, error: (data as any)?.error || "Gagal membuat pengguna" });
            continue;
          }

          const userId = (data as any)?.user_id;
          results.push({ ...u, success: true, password });

          // Assign dynamic role if specified
          if (selectedDynamicRoleId && userId) {
            try {
              await supabase.from("user_dynamic_roles").insert({
                user_id: userId,
                role_id: selectedDynamicRoleId,
                assigned_by: user?.id,
              });
            } catch (roleError) {
              console.error("Failed to assign dynamic role:", roleError);
            }
          }
        } catch (err: any) {
          results.push({ ...u, success: false, error: err.message || "Unknown error" });
        }
      }

      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-dynamic-roles"] });
      setImportResults(results);
      const successCount = results.filter((r) => r.success).length;
      toast({
        title: `${successCount} dari ${results.length} pengguna berhasil dibuat`,
        description: successCount < results.length ? "Lihat detail untuk error" : undefined,
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal import pengguna",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setImportResults([]);

    try {
      const workbook = new ExcelJS.Workbook();
      const buffer = await file.arrayBuffer();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error("File tidak memiliki sheet");
      }

      const users: { email: string; full_name: string; role: "super_admin" | "moderator" | "admin" }[] = [];

      // Check if there's a Role column (column C)
      const hasRoleColumn = useRolePerRow;

      worksheet.eachRow((row, rowNumber) => {
        // Skip header row
        if (rowNumber === 1) return;

        const email = row.getCell(1).text?.trim() || "";
        const fullName = row.getCell(2).text?.trim() || email.split("@")[0] || "";
        
        let role: "super_admin" | "moderator" | "admin" = selectedRole;
        
        // If using role per row, try to parse from column C
        if (hasRoleColumn) {
          const roleCell = row.getCell(3).text?.trim();
          const parsedRole = parseRole(roleCell);
          if (parsedRole) {
            role = parsedRole;
          }
        }

        if (email && email.includes("@")) {
          users.push({ email, full_name: fullName, role });
        }
      });

      if (users.length === 0) {
        throw new Error("Tidak ada data valid ditemukan. Pastikan kolom A berisi email dan kolom B berisi nama.");
      }

      // Process import
      await importMutation.mutateAsync(users);
    } catch (error: any) {
      toast({
        title: "Gagal membaca file",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    const columns = [
      { header: "Email", key: "email", width: 30 },
      { header: "Nama Lengkap", key: "full_name", width: 30 },
    ];

    // Add Role column if using role per row
    if (useRolePerRow) {
      columns.push({ header: "Role", key: "role", width: 15 });
    }

    worksheet.columns = columns;

    // Add example rows
    if (useRolePerRow) {
      worksheet.addRow({ email: "user1@example.com", full_name: "User Satu", role: "admin" });
      worksheet.addRow({ email: "user2@example.com", full_name: "User Dua", role: "moderator" });
      worksheet.addRow({ email: "user3@example.com", full_name: "User Tiga", role: "super_admin" });
    } else {
      worksheet.addRow({ email: "user1@example.com", full_name: "User Satu" });
      worksheet.addRow({ email: "user2@example.com", full_name: "User Dua" });
      worksheet.addRow({ email: "user3@example.com", full_name: "User Tiga" });
    }

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Add note about roles if using role per row
    if (useRolePerRow) {
      const noteRow = worksheet.addRow({});
      noteRow.getCell(1).value = "Catatan: Role yang valid adalah 'super_admin', 'admin', atau 'moderator'";
      noteRow.getCell(1).font = { italic: true, color: { argb: "FF666666" } };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = useRolePerRow ? "template-import-users-with-role.xlsx" : "template-import-users.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAllPasswords = async () => {
    const successResults = importResults.filter((r) => r.success && r.password);
    const text = successResults
      .map((r) => `${r.email}\t${r.full_name}\t${r.role}\t${r.password}`)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast({ title: "Data tersalin ke clipboard" });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setImportResults([]);
          setFileName("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import XLSX
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Pengguna dari XLSX</DialogTitle>
          <DialogDescription>
            Upload file Excel dengan kolom Email (A), Nama Lengkap (B), dan opsional Role (C)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Download Template</p>
              <p className="text-xs text-muted-foreground">
                Format: Kolom A = Email, Kolom B = Nama{useRolePerRow ? ", Kolom C = Role" : ""}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* Role per row option */}
          <div className="flex items-center space-x-2 p-3 border rounded-lg">
            <Checkbox
              id="useRolePerRow"
              checked={useRolePerRow}
              onCheckedChange={(checked) => setUseRolePerRow(checked === true)}
            />
            <div className="grid gap-1">
              <label
                htmlFor="useRolePerRow"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Gunakan Role per Baris
              </label>
              <p className="text-xs text-muted-foreground">
                Jika diaktifkan, kolom C akan dibaca sebagai role untuk setiap pengguna
              </p>
            </div>
          </div>

          {/* Role Selection - only show if not using role per row */}
          {!useRolePerRow && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Sistem (untuk semua)</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as "super_admin" | "moderator" | "admin")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role Dinamis (opsional)</Label>
                <Select value={selectedDynamicRoleId} onValueChange={setSelectedDynamicRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tidak ada</SelectItem>
                    {dynamicRoles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Dynamic Role for all (when using role per row) */}
          {useRolePerRow && (
            <div className="space-y-2">
              <Label>Role Dinamis (opsional, untuk semua pengguna)</Label>
              <Select value={selectedDynamicRoleId} onValueChange={setSelectedDynamicRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {dynamicRoles?.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload File XLSX</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="xlsx-upload"
              />
              <label htmlFor="xlsx-upload" className="cursor-pointer">
                {isProcessing ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm">Memproses {fileName}...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">
                      {fileName || "Klik atau drag file XLSX ke sini"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: .xlsx atau .xls
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Results */}
          {importResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Hasil Import</Label>
                <Button variant="ghost" size="sm" onClick={copyAllPasswords}>
                  <Copy className="h-3 w-3 mr-1" />
                  Salin Semua
                </Button>
              </div>
              <div className="max-h-[250px] overflow-y-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Nama</th>
                      <th className="p-2 text-left">Role</th>
                      <th className="p-2 text-left">Password / Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.map((result, idx) => (
                      <tr
                        key={idx}
                        className={result.success ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}
                      >
                        <td className="p-2">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </td>
                        <td className="p-2 font-mono">{result.email}</td>
                        <td className="p-2">{result.full_name}</td>
                        <td className="p-2">{SYSTEM_ROLES[result.role as keyof typeof SYSTEM_ROLES] || result.role}</td>
                        <td className="p-2 font-mono">
                          {result.success ? (
                            <span className="text-green-700 dark:text-green-300">
                              {result.password}
                            </span>
                          ) : (
                            <span className="text-red-700 dark:text-red-300">
                              {result.error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                ✓ {importResults.filter((r) => r.success).length} berhasil, ✗{" "}
                {importResults.filter((r) => !r.success).length} gagal
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
