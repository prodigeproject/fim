import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  LogOut,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface AdminSession {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
  } | null;
  is_current: boolean;
  last_activity: string;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string | null;
  };
}

function parseUserAgent(ua: string | null): { browser: string; os: string; device: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Desktop" };

  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  // Browser detection
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";
  else if (ua.includes("Opera")) browser = "Opera";

  // OS detection
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Device detection
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobile";
  } else if (ua.includes("Tablet") || ua.includes("iPad")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

export default function SessionsManagement() {
  const { isSuperAdmin, user, session } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Register current session on mount
  useEffect(() => {
    const registerSession = async () => {
      if (!user || !session) return;

      const deviceInfo = parseUserAgent(navigator.userAgent);
      
      // Create or update current session
      const { data, error } = await supabase
        .from("admin_sessions")
        .upsert({
          user_id: user.id,
          session_token: session.access_token.substring(0, 50), // Store partial token for identification
          ip_address: "client", // Can't get real IP from client
          user_agent: navigator.userAgent,
          device_info: deviceInfo,
          is_current: true,
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        }, {
          onConflict: "session_token",
        })
        .select()
        .single();

      if (data) {
        setCurrentSessionId(data.id);
      }
    };

    registerSession();

    // Update last activity periodically
    const interval = setInterval(() => {
      if (currentSessionId) {
        supabase
          .from("admin_sessions")
          .update({ last_activity: new Date().toISOString() })
          .eq("id", currentSessionId);
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user, session, currentSessionId]);

  // Fetch all sessions (super admin can see all, others see only their own)
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["admin-sessions", isSuperAdmin],
    queryFn: async () => {
      let query = supabase
        .from("admin_sessions")
        .select("*")
        .order("last_activity", { ascending: false });

      if (!isSuperAdmin) {
        query = query.eq("user_id", user?.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(data?.map((s) => s.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name")
        .in("id", userIds);

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.id] = { username: p.username, full_name: p.full_name };
        return acc;
      }, {} as Record<string, { username: string; full_name: string | null }>);

      return data?.map((s) => ({
        ...s,
        profiles: profileMap?.[s.user_id],
      })) as AdminSession[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Terminate session mutation
  const terminateMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("admin_sessions")
        .delete()
        .eq("id", sessionId);
      
      if (error) throw error;

      // Log audit
      await supabase.rpc("log_audit_event", {
        p_user_id: user?.id,
        p_action: "terminate_session",
        p_resource_type: "admin_session",
        p_resource_id: sessionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
      toast({ title: "Sesi berhasil dihentikan" });
    },
    onError: (error) => {
      toast({ title: "Gagal menghentikan sesi", description: error.message, variant: "destructive" });
    },
  });

  // Group sessions by user
  const sessionsByUser = sessions?.reduce((acc, session) => {
    const userId = session.user_id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(session);
    return acc;
  }, {} as Record<string, AdminSession[]>);

  // Check for multiple active sessions for current user
  const currentUserSessions = sessions?.filter(s => s.user_id === user?.id) || [];
  const hasMultipleSessions = currentUserSessions.length > 1;

  if (!isSuperAdmin && !user) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">Silakan login terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sesi Aktif</h1>
        <p className="text-muted-foreground">
          {isSuperAdmin 
            ? "Pantau semua sesi login aktif di sistem"
            : "Lihat sesi login aktif akun Anda"}
        </p>
      </div>

      {/* Warning if multiple sessions detected */}
      {hasMultipleSessions && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Akun Anda sedang digunakan di {currentUserSessions.length} perangkat
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Jika Anda tidak mengenali salah satu sesi, segera hentikan sesi tersebut dan ubah password Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Sesi Saat Ini
          </CardTitle>
          <CardDescription>Perangkat yang sedang Anda gunakan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <Monitor className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {parseUserAgent(navigator.userAgent).browser} di {parseUserAgent(navigator.userAgent).os}
              </p>
              <p className="text-sm text-muted-foreground">
                {parseUserAgent(navigator.userAgent).device} • Aktif sekarang
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Perangkat Ini
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* All Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isSuperAdmin ? "Semua Sesi Aktif" : "Sesi Anda"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : sessions?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  {isSuperAdmin && <TableHead>Pengguna</TableHead>}
                  <TableHead>Perangkat</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Terakhir Aktif</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((sess) => {
                  const deviceInfo = sess.device_info || parseUserAgent(sess.user_agent);
                  const isCurrent = sess.id === currentSessionId;
                  const DeviceIcon = deviceInfo.device === "Mobile" ? Smartphone : Monitor;
                  
                  return (
                    <TableRow key={sess.id} className={isCurrent ? "bg-green-50 dark:bg-green-950" : ""}>
                      {isSuperAdmin && (
                        <TableCell>
                          <div>
                            <p className="font-medium">{sess.profiles?.full_name || sess.profiles?.username}</p>
                            <p className="text-sm text-muted-foreground">{sess.profiles?.username}</p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{deviceInfo.os}</span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">Saat ini</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{deviceInfo.browser}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{sess.ip_address || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(sess.last_activity).toLocaleString("id-ID")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!isCurrent && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => terminateMutation.mutate(sess.id)}
                            disabled={terminateMutation.isPending}
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Hentikan
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Tidak ada sesi aktif
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
