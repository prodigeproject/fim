import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Shield, Search, LogIn, LogOut, FileText, UserPlus, UserX, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const actionIcons: Record<string, React.ElementType> = {
  login: LogIn,
  logout: LogOut,
  create_article: FileText,
  edit_article: Edit,
  delete_article: Trash2,
  activate_user: UserPlus,
  deactivate_user: UserX,
};

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
};

export default function AuditLogs() {
  const { isSuperAdmin } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  // Fetch audit logs
  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", actionFilter],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select(`
          id,
          action,
          resource_type,
          resource_id,
          details,
          ip_address,
          user_agent,
          created_at,
          profiles!audit_logs_user_id_fkey(username, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (actionFilter !== "all") {
        query = query.eq("action", actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin,
  });

  // Filter logs by search term
  const filteredLogs = logs?.filter((log: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(search) ||
      log.profiles?.username?.toLowerCase().includes(search) ||
      log.profiles?.full_name?.toLowerCase().includes(search)
    );
  });

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

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan aksi atau pengguna..."
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
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="create_article">Buat Artikel</SelectItem>
                <SelectItem value="edit_article">Edit Artikel</SelectItem>
                <SelectItem value="delete_article">Hapus Artikel</SelectItem>
                <SelectItem value="publish_article">Publish Artikel</SelectItem>
              </SelectContent>
            </Select>
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
                                : JSON.stringify(log.details).slice(0, 50) + "..."
                              }
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.ip_address || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Tidak ada log yang ditemukan
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}