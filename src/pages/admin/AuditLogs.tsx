import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Shield, Search, LogIn, LogOut, FileText, UserPlus, UserX, Edit, Trash2, Send, Pin, Archive, Users, Settings, Mail, ArrowUpDown, Globe, Download, Loader2, FileSpreadsheet, ShieldX, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from "xlsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Comprehensive action icons mapping
const actionIcons: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  create_article: FileText,
  edit_article: Edit,
  delete_article: Trash2,
  publish_article: Send,
  archive_article: Archive,
  pin_article: Pin,
  unpin_article: Pin,
  activate_user: UserPlus,
  deactivate_user: UserX,
  create_user: UserPlus,
  reset_password: Settings,
  change_password: Settings,
  create_club: Users,
  edit_club: Edit,
  delete_club: Trash2,
  create_regional: Globe,
  edit_regional: Edit,
  delete_regional: Trash2,
  send_newsletter: Mail,
  schedule_newsletter: Mail,
  create_subscriber: UserPlus,
  edit_subscriber: Edit,
  delete_subscriber: Trash2,
  create_prd_document: FileText,
  edit_prd_document: Edit,
  terminate_session: LogOut,
  bulk_delete_articles: Trash2,
  bulk_archive_articles: Archive,
  bulk_publish_articles: Send,
  unauthorized_access_attempt: ShieldX,
};

// Comprehensive action labels mapping
const actionLabels: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  create_article: "Buat Artikel",
  edit_article: "Edit Artikel",
  delete_article: "Hapus Artikel",
  publish_article: "Publish Artikel",
  archive_article: "Arsipkan Artikel",
  pin_article: "Pin Artikel",
  unpin_article: "Unpin Artikel",
  activate_user: "Aktifkan User",
  deactivate_user: "Nonaktifkan User",
  create_user: "Buat User",
  reset_password: "Reset Password",
  change_password: "Ubah Password",
  create_club: "Buat FIM Club",
  edit_club: "Edit FIM Club",
  delete_club: "Hapus FIM Club",
  create_regional: "Buat Regional",
  edit_regional: "Edit Regional",
  delete_regional: "Hapus Regional",
  send_newsletter: "Kirim Newsletter",
  schedule_newsletter: "Jadwalkan Newsletter",
  create_subscriber: "Tambah Subscriber",
  edit_subscriber: "Edit Subscriber",
  delete_subscriber: "Hapus Subscriber",
  create_prd_document: "Buat PRD",
  edit_prd_document: "Edit PRD",
  terminate_session: "Hentikan Sesi",
  bulk_delete_articles: "Bulk Hapus Artikel",
  bulk_archive_articles: "Bulk Arsipkan Artikel",
  bulk_publish_articles: "Bulk Publish Artikel",
  unauthorized_access_attempt: "Akses Ditolak",
};

export default function AuditLogs() {
  const { isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "security">("all");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch audit logs with separate profile query
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", actionFilter, sortOrder, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: sortOrder === "asc" })
        .limit(500);
      
      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      if (startDate) {
        query = query.gte("created_at", `${startDate}T00:00:00`);
      }
      if (endDate) {
        query = query.lte("created_at", `${endDate}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map((log) => log.user_id).filter(Boolean) || [])];
      let profileMap: Record<string, { username: string; full_name: string | null }> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .in("id", userIds);

        profileMap = profiles?.reduce((acc, p) => {
          acc[p.id] = { username: p.username, full_name: p.full_name };
          return acc;
        }, {} as Record<string, { username: string; full_name: string | null }>) || {};
      }

      return data?.map((log) => ({
        ...log,
        profiles: log.user_id ? profileMap[log.user_id] : null,
      }));
    },
    enabled: isSuperAdmin,
  });

  // Filter logs by search term and tab
  const filteredLogs = logs?.filter((log: any) => {
    // First filter by tab
    if (activeTab === "security" && log.action !== "unauthorized_access_attempt") {
      return false;
    }
    
    // Then filter by search term
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(search) ||
      log.profiles?.username?.toLowerCase().includes(search) ||
      log.profiles?.full_name?.toLowerCase().includes(search) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(search))
    );
  });

  // Get unique actions for filter dropdown
  const uniqueActions = [...new Set(logs?.map((log: any) => log.action) || [])];
  
  // Count security logs
  const securityLogsCount = logs?.filter((log: any) => log.action === "unauthorized_access_attempt").length || 0;

  // Export to CSV
  const exportToCSV = async () => {
    if (!filteredLogs?.length) {
      toast({ title: "Tidak ada data untuk diekspor", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      const headers = ["Waktu", "Pengguna", "Aksi", "Detail", "IP Address"];
      const rows = filteredLogs.map((log: any) => [
        new Date(log.created_at).toLocaleString("id-ID"),
        log.profiles?.full_name || log.profiles?.username || "System",
        actionLabels[log.action] || log.action,
        log.details ? JSON.stringify(log.details) : "",
        log.ip_address || "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Export berhasil" });
    } catch (error) {
      toast({ title: "Gagal export", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Export to XLSX
  const exportToXLSX = async () => {
    if (!filteredLogs?.length) {
      toast({ title: "Tidak ada data untuk diekspor", variant: "destructive" });
      return;
    }

    setIsExporting(true);
    try {
      const data = filteredLogs.map((log: any) => ({
        "Waktu": new Date(log.created_at).toLocaleString("id-ID"),
        "Pengguna": log.profiles?.full_name || log.profiles?.username || "System",
        "Aksi": actionLabels[log.action] || log.action,
        "Detail": log.details ? JSON.stringify(log.details) : "",
        "IP Address": log.ip_address || "",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Audit Log");

      // Auto-size columns
      const colWidths = [
        { wch: 20 }, // Waktu
        { wch: 25 }, // Pengguna
        { wch: 20 }, // Aksi
        { wch: 50 }, // Detail
        { wch: 15 }, // IP Address
      ];
      ws["!cols"] = colWidths;

      XLSX.writeFile(wb, `audit-log-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      toast({ title: "Export XLSX berhasil" });
    } catch (error) {
      toast({ title: "Gagal export", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">
          Hanya Super Admin yang dapat mengakses halaman ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">
          Pantau semua aktivitas di panel admin
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "security")}>
        <TabsList>
          <TabsTrigger value="all">Semua Log</TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <ShieldX className="h-4 w-4" />
            Akses Ditolak
            {securityLogsCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {securityLogsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan aksi, pengguna, atau detail..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aksi</SelectItem>
                  {uniqueActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {actionLabels[action] || action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Date Range Filter & Export */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <div>
                  <Label className="text-xs">Dari Tanggal</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-xs">Sampai Tanggal</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={exportToCSV} 
                  disabled={isExporting || !filteredLogs?.length}
                  variant="outline"
                  className="gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  CSV
                </Button>
                <Button 
                  onClick={exportToXLSX} 
                  disabled={isExporting || !filteredLogs?.length}
                  className="gap-2"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  XLSX
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredLogs?.length ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Menampilkan {filteredLogs.length} log
                {startDate && ` dari ${format(new Date(startDate), "dd MMM yyyy", { locale: localeId })}`}
                {endDate && ` sampai ${format(new Date(endDate), "dd MMM yyyy", { locale: localeId })}`}
              </p>
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Detail</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log: any) => {
                    const ActionIcon = actionIcons[log.action] || FileText;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {log.profiles?.full_name || log.profiles?.username || "System"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <ActionIcon className="h-3 w-3" />
                            {actionLabels[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.details && (
                            <span className="text-sm text-muted-foreground truncate block">
                              {typeof log.details === "string" 
                                ? log.details 
                                : JSON.stringify(log.details).slice(0, 80) + (JSON.stringify(log.details).length > 80 ? "..." : "")
                              }
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {log.ip_address || "-"}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Tidak ada log yang ditemukan
            </p>
          )}
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold">Log Akses Ditolak</h3>
                  <p className="text-sm text-muted-foreground">
                    Catatan percobaan akses halaman tanpa izin oleh moderator
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : filteredLogs?.length ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Pengguna</TableHead>
                        <TableHead>Halaman yang Dicoba</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log: any) => (
                        <TableRow key={log.id} className="bg-destructive/5">
                          <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString("id-ID")}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {log.profiles?.full_name || log.profiles?.username || "Unknown"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {log.details?.attempted_path || "-"}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-destructive border-destructive">
                              {log.details?.user_role || "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShieldX className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Tidak ada percobaan akses tidak sah</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
