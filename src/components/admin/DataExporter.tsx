import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { format } from "date-fns";

type ExportFormat = "json" | "csv" | "excel";

interface ExportTable {
  id: string;
  name: string;
  label: string;
  description: string;
}

const EXPORTABLE_TABLES: ExportTable[] = [
  { id: "fim_registrations", name: "fim_registrations", label: "Pendaftar", description: "Data pendaftaran peserta" },
  { id: "fim_training_registrations", name: "fim_training_registrations", label: "Data Pelatihan", description: "Data formulir pelatihan" },
  { id: "articles", name: "articles", label: "Artikel", description: "Artikel dan berita" },
  { id: "newsletter_subscribers", name: "newsletter_subscribers", label: "Subscriber", description: "Daftar subscriber newsletter" },
  { id: "audit_logs", name: "audit_logs", label: "Audit Logs", description: "Log aktivitas sistem" },
  { id: "interview_schedules", name: "interview_schedules", label: "Jadwal Wawancara", description: "Data jadwal wawancara" },
];

interface DataExporterProps {
  className?: string;
}

export function DataExporter({ className }: DataExporterProps) {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("excel");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleTableToggle = (tableId: string) => {
    setSelectedTables(prev =>
      prev.includes(tableId)
        ? prev.filter(t => t !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAll = () => {
    setSelectedTables(EXPORTABLE_TABLES.map(t => t.id));
  };

  const clearAll = () => {
    setSelectedTables([]);
  };

  const fetchTableData = async (tableName: string) => {
    let query = supabase.from(tableName as any).select("*");

    // Apply date filter if provided
    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };

  const exportToJSON = (data: Record<string, any[]>) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    downloadFile(blob, `export_${format(new Date(), "yyyyMMdd_HHmmss")}.json`);
  };

  const exportToCSV = (data: Record<string, any[]>) => {
    // Export each table as separate CSV
    Object.entries(data).forEach(([tableName, rows]) => {
      if (rows.length === 0) return;

      const headers = Object.keys(rows[0]);
      const csvRows = [
        headers.join(","),
        ...rows.map(row =>
          headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(",")
        ),
      ];

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      downloadFile(blob, `${tableName}_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
    });
  };

  const exportToExcel = async (data: Record<string, any[]>) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FIM Admin";
    workbook.created = new Date();

    Object.entries(data).forEach(([tableName, rows]) => {
      if (rows.length === 0) return;

      const tableInfo = EXPORTABLE_TABLES.find(t => t.name === tableName);
      const sheetName = tableInfo?.label || tableName;
      const worksheet = workbook.addWorksheet(sheetName.substring(0, 31));

      // Add headers
      const headers = Object.keys(rows[0]);
      worksheet.columns = headers.map(header => ({
        header: header.replace(/_/g, " ").toUpperCase(),
        key: header,
        width: 20,
      }));

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE53935" },
      };
      worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

      // Add data rows
      rows.forEach((row, index) => {
        const rowData: Record<string, any> = {};
        headers.forEach(header => {
          let value = row[header];
          if (value === null || value === undefined) {
            rowData[header] = "";
          } else if (typeof value === "object") {
            rowData[header] = JSON.stringify(value);
          } else {
            rowData[header] = value;
          }
        });
        worksheet.addRow(rowData);

        // Alternate row colors
        if (index % 2 === 1) {
          worksheet.getRow(index + 2).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF5F5F5" },
          };
        }
      });

      // Auto filter
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    downloadFile(blob, `FIM_Export_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      toast.error("Pilih minimal satu tabel untuk diekspor");
      return;
    }

    setIsExporting(true);
    try {
      const allData: Record<string, any[]> = {};

      for (const tableId of selectedTables) {
        const table = EXPORTABLE_TABLES.find(t => t.id === tableId);
        if (table) {
          const data = await fetchTableData(table.name);
          allData[table.name] = data;
        }
      }

      switch (exportFormat) {
        case "json":
          exportToJSON(allData);
          break;
        case "csv":
          exportToCSV(allData);
          break;
        case "excel":
          await exportToExcel(allData);
          break;
      }

      toast.success("Data berhasil diekspor");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  const formatIcons: Record<ExportFormat, typeof FileJson> = {
    json: FileJson,
    csv: FileText,
    excel: FileSpreadsheet,
  };

  const FormatIcon = formatIcons[exportFormat];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Export data dari database ke format JSON, CSV, atau Excel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Pilih Tabel</Label>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                Pilih Semua
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Hapus Semua
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {EXPORTABLE_TABLES.map(table => (
              <div
                key={table.id}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleTableToggle(table.id)}
              >
                <Checkbox
                  checked={selectedTables.includes(table.id)}
                  onCheckedChange={() => handleTableToggle(table.id)}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{table.label}</p>
                  <p className="text-xs text-muted-foreground">{table.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Format Export</Label>
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel (.xlsx)
                </div>
              </SelectItem>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV (.csv)
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON (.json)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Filter */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Dari Tanggal</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Sampai Tanggal</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || selectedTables.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mengekspor...
            </>
          ) : (
            <>
              <FormatIcon className="h-4 w-4 mr-2" />
              Export {selectedTables.length} Tabel
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
