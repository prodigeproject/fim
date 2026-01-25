import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Archive, FileText, Users, MapPin, Clock, FolderArchive } from "lucide-react";
import { exportToExcel, exportSingleSheet, getExcelFilename } from "@/lib/excelExport";
import JSZip from "jszip";

type TableName = "articles" | "profiles" | "fim_clubs" | "fim_regionals" | "alumni_stories" | "alumni_other" | "newsletter_subscribers" | "audit_logs" | "fim_registrations" | "fim_training_registrations";

interface BackupItem {
  name: string;
  table: TableName;
  icon: React.ReactNode;
  count?: number;
}

export function BackupManager() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTable, setCurrentTable] = useState("");

  // Fetch counts for each table
  const { data: counts } = useQuery({
    queryKey: ["backup-counts"],
    queryFn: async () => {
      const tables = ["articles", "profiles", "fim_clubs", "fim_regionals", "alumni_stories", "alumni_other", "newsletter_subscribers", "audit_logs", "fim_registrations", "fim_training_registrations"] as const;
      const counts: Record<string, number> = {};
      
      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });
        counts[table] = count || 0;
      }
      
      return counts;
    },
  });

  const backupItems: BackupItem[] = [
    { name: "Artikel", table: "articles", icon: <FileText className="h-4 w-4" />, count: counts?.articles },
    { name: "Profil Admin", table: "profiles", icon: <Users className="h-4 w-4" />, count: counts?.profiles },
    { name: "FIM Club", table: "fim_clubs", icon: <Users className="h-4 w-4" />, count: counts?.fim_clubs },
    { name: "Regional FIM", table: "fim_regionals", icon: <MapPin className="h-4 w-4" />, count: counts?.fim_regionals },
    { name: "Cerita Alumni", table: "alumni_stories", icon: <Users className="h-4 w-4" />, count: counts?.alumni_stories },
    { name: "Alumni Lainnya", table: "alumni_other", icon: <Users className="h-4 w-4" />, count: counts?.alumni_other },
    { name: "Newsletter", table: "newsletter_subscribers", icon: <FileText className="h-4 w-4" />, count: counts?.newsletter_subscribers },
    { name: "Pendaftaran", table: "fim_registrations", icon: <Users className="h-4 w-4" />, count: counts?.fim_registrations },
    { name: "Data Pelatihan", table: "fim_training_registrations", icon: <FileText className="h-4 w-4" />, count: counts?.fim_training_registrations },
    { name: "Audit Log", table: "audit_logs", icon: <Clock className="h-4 w-4" />, count: counts?.audit_logs },
  ];

  const exportSingleTable = async (tableName: TableName) => {
    const { data, error } = await supabase
      .from(tableName)
      .select("*");
    
    if (error) throw error;
    return data || [];
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    setProgress(0);
    
    try {
      const tables = backupItems.map(item => item.table);
      const sheets: { name: string; data: Record<string, unknown>[] }[] = [];
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const item = backupItems[i];
        setCurrentTable(item.name);
        setProgress(((i + 1) / tables.length) * 100);
        
        try {
          const data = await exportSingleTable(table);
          if (data.length > 0) {
            sheets.push({ name: item.name.slice(0, 31), data });
          }
        } catch (err) {
          console.error(`Error exporting ${table}:`, err);
        }
      }
      
      await exportToExcel(sheets, getExcelFilename("fim-backup"));
      
      toast({
        title: "Backup berhasil",
        description: `Semua data berhasil diexport ke file XLSX`,
      });
    } catch (error) {
      console.error("Backup error:", error);
      toast({
        title: "Backup gagal",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setProgress(0);
      setCurrentTable("");
    }
  };

  const handleExportSingle = async (item: BackupItem) => {
    setIsExporting(true);
    setCurrentTable(item.name);
    
    try {
      const data = await exportSingleTable(item.table);
      
      if (data.length === 0) {
        toast({
          title: "Tidak ada data",
          description: `Tabel ${item.name} kosong`,
          variant: "destructive",
        });
        return;
      }
      
      await exportSingleSheet(data, item.name, getExcelFilename(`fim-${item.table}`));
      
      toast({
        title: "Export berhasil",
        description: `${item.name} berhasil diexport`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export gagal",
        description: "Terjadi kesalahan saat export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setCurrentTable("");
    }
  };

  // Export ZIP with database and info for migration
  const handleExportZip = async () => {
    setIsExportingZip(true);
    setProgress(0);
    
    try {
      const zip = new JSZip();
      const dbFolder = zip.folder("database");
      
      // Export each table as JSON
      for (let i = 0; i < backupItems.length; i++) {
        const item = backupItems[i];
        setCurrentTable(item.name);
        setProgress(((i + 1) / backupItems.length) * 80);
        
        try {
          const data = await exportSingleTable(item.table);
          dbFolder?.file(`${item.table}.json`, JSON.stringify(data, null, 2));
        } catch (err) {
          console.error(`Error exporting ${item.table}:`, err);
        }
      }
      
      setProgress(85);
      setCurrentTable("Membuat file info...");
      
      // Create migration info file
      const migrationInfo = {
        exportedAt: new Date().toISOString(),
        projectName: "Forum Indonesia Muda",
        tables: backupItems.map(item => ({
          name: item.name,
          table: item.table,
          count: counts?.[item.table] || 0
        })),
        instructions: [
          "1. File ini berisi export database dalam format JSON",
          "2. Setiap file JSON di folder 'database' merepresentasikan satu tabel",
          "3. Untuk import ke hosting baru, buat tabel dengan struktur yang sama",
          "4. Import data JSON ke masing-masing tabel",
          "5. Pastikan foreign key dan constraint sudah diatur dengan benar",
          "6. File kode sumber (frontend) perlu di-clone dari repository Git terpisah"
        ],
        supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID || "Unknown",
      };
      
      zip.file("migration-info.json", JSON.stringify(migrationInfo, null, 2));
      zip.file("README.txt", `
Forum Indonesia Muda - Database Backup
======================================
Exported at: ${new Date().toLocaleString("id-ID")}

Contents:
- database/ : Folder berisi semua data tabel dalam format JSON
- migration-info.json : Informasi tentang export ini

Tables Included:
${backupItems.map(item => `- ${item.table} (${counts?.[item.table] || 0} records)`).join("\n")}

Instructions for Migration:
1. Setup Supabase project baru di hosting tujuan
2. Buat tabel dengan struktur yang sama (lihat schema di Supabase dashboard sumber)
3. Import setiap file JSON ke tabel yang sesuai
4. Setup edge functions jika diperlukan
5. Update environment variables di aplikasi frontend

Note: File kode frontend perlu di-deploy terpisah dari repository Git.
      `);
      
      setProgress(95);
      setCurrentTable("Membuat file ZIP...");
      
      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fim-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      
      toast({
        title: "Export ZIP berhasil",
        description: "File backup ZIP berhasil diunduh untuk migrasi",
      });
    } catch (error) {
      console.error("ZIP export error:", error);
      toast({
        title: "Export ZIP gagal",
        description: "Terjadi kesalahan saat membuat file ZIP",
        variant: "destructive",
      });
    } finally {
      setIsExportingZip(false);
      setProgress(0);
      setCurrentTable("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Backup Data
            </CardTitle>
            <CardDescription>
              Export seluruh data ke file XLSX atau ZIP untuk migrasi
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportAll} disabled={isExporting || isExportingZip} variant="outline">
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Backup XLSX
            </Button>
            <Button onClick={handleExportZip} disabled={isExporting || isExportingZip}>
              {isExportingZip ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FolderArchive className="h-4 w-4 mr-2" />
              )}
              Export ZIP (Migrasi)
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {(isExporting || isExportingZip) && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Exporting: {currentTable}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {backupItems.map((item) => (
            <div
              key={item.table}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.count !== undefined ? `${item.count} data` : "Loading..."}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleExportSingle(item)}
                disabled={isExporting || isExportingZip}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
