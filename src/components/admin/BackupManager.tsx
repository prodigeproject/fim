import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Archive, FileText, Users, MapPin, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

type TableName = "articles" | "profiles" | "fim_clubs" | "fim_regionals" | "alumni_stories" | "alumni_other" | "newsletter_subscribers" | "audit_logs";

interface BackupItem {
  name: string;
  table: TableName;
  icon: React.ReactNode;
  count?: number;
}

export function BackupManager() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTable, setCurrentTable] = useState("");

  // Fetch counts for each table
  const { data: counts } = useQuery({
    queryKey: ["backup-counts"],
    queryFn: async () => {
      const tables = ["articles", "profiles", "fim_clubs", "fim_regionals", "alumni_stories", "alumni_other", "newsletter_subscribers", "audit_logs"] as const;
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
    { name: "Audit Log", table: "audit_logs", icon: <Clock className="h-4 w-4" />, count: counts?.audit_logs },
  ];

  const exportSingleTable = async (tableName: "articles" | "profiles" | "fim_clubs" | "fim_regionals" | "alumni_stories" | "alumni_other" | "newsletter_subscribers" | "audit_logs") => {
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
      const wb = XLSX.utils.book_new();
      const tables = backupItems.map(item => item.table);
      
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const item = backupItems[i];
        setCurrentTable(item.name);
        setProgress(((i + 1) / tables.length) * 100);
        
        try {
          const data = await exportSingleTable(table);
          if (data.length > 0) {
            const ws = XLSX.utils.json_to_sheet(data);
            
            // Auto-size columns
            const colWidths = Object.keys(data[0] || {}).map(key => ({
              wch: Math.max(
                key.length,
                ...data.map(row => String(row[key] || "").slice(0, 50).length)
              )
            }));
            ws["!cols"] = colWidths;
            
            XLSX.utils.book_append_sheet(wb, ws, item.name.slice(0, 31)); // Sheet name max 31 chars
          }
        } catch (err) {
          console.error(`Error exporting ${table}:`, err);
        }
      }
      
      const now = new Date();
      XLSX.writeFile(wb, `fim-backup-${format(now, "yyyy-MM-dd-HHmm")}.xlsx`);
      
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
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...data.map(row => String(row[key] || "").slice(0, 50).length)
        )
      }));
      ws["!cols"] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, item.name);
      
      const now = new Date();
      XLSX.writeFile(wb, `fim-${item.table}-${format(now, "yyyy-MM-dd")}.xlsx`);
      
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Backup Data
            </CardTitle>
            <CardDescription>
              Export seluruh data ke file XLSX
            </CardDescription>
          </div>
          <Button onClick={handleExportAll} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Backup Semua
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isExporting && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Exporting: {currentTable}</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                disabled={isExporting}
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
