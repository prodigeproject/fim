import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Monitor, 
  Smartphone, 
  Clock, 
  Activity,
  Wifi,
  WifiOff 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

interface OnlineAdmin {
  id: string;
  user_id: string;
  last_activity: string;
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
  } | null;
  user_agent: string | null;
  profile?: {
    username: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  };
  role?: string;
}

function parseUserAgent(ua: string | null): { browser: string; os: string; device: string } {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Desktop" };

  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS";

  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobile";
  } else if (ua.includes("Tablet") || ua.includes("iPad")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

export default function OnlineAdminsDashboard() {
  const { isSuperAdmin, user, role } = useAdminAuth();
  const [now, setNow] = useState(new Date());

  // Update time every minute for relative time display
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch online admins (active in last 5 minutes)
  const { data: onlineAdmins, isLoading } = useQuery({
    queryKey: ["online-admins"],
    queryFn: async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: sessions, error } = await supabase
        .from("admin_sessions")
        .select("*")
        .gte("last_activity", fiveMinutesAgo)
        .order("last_activity", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all users
      const userIds = [...new Set(sessions?.map(s => s.user_id) || [])];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, email")
        .in("id", userIds);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const profileMap = profiles?.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, typeof profiles[0]>);

      const roleMap = roles?.reduce((acc, r) => {
        acc[r.user_id] = r.role;
        return acc;
      }, {} as Record<string, string>);

      return sessions?.map(s => ({
        ...s,
        profile: profileMap?.[s.user_id],
        role: roleMap?.[s.user_id],
      })) as OnlineAdmin[];
    },
    enabled: !!role, // Enable for all admin roles
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get unique online users (deduplicate by user_id)
  const uniqueOnlineUsers = onlineAdmins?.reduce((acc, session) => {
    if (!acc.find(s => s.user_id === session.user_id)) {
      acc.push(session);
    }
    return acc;
  }, [] as OnlineAdmin[]) || [];

  const isOnline = (lastActivity: string) => {
    const diff = Date.now() - new Date(lastActivity).getTime();
    return diff < 5 * 60 * 1000; // Active in last 5 minutes
  };

  const isActive = (lastActivity: string) => {
    const diff = Date.now() - new Date(lastActivity).getTime();
    return diff < 60 * 1000; // Active in last minute
  };

  // Allow access for all admin roles

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Online</h1>
        <p className="text-muted-foreground">Pantau aktivitas admin yang sedang online</p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Online</p>
                <p className="text-3xl font-bold">{uniqueOnlineUsers.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Wifi className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Sekarang</p>
                <p className="text-3xl font-bold">
                  {onlineAdmins?.filter(a => isActive(a.last_activity)).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sesi Aktif</p>
                <p className="text-3xl font-bold">{onlineAdmins?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Monitor className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Online Admins Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin Sedang Online
          </CardTitle>
          <CardDescription>
            Menampilkan admin yang aktif dalam 5 menit terakhir
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : uniqueOnlineUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueOnlineUsers.map((admin) => {
                const deviceInfo = admin.device_info || parseUserAgent(admin.user_agent);
                const isCurrentlyActive = isActive(admin.last_activity);
                const DeviceIcon = deviceInfo.device === "Mobile" ? Smartphone : Monitor;
                const isMe = admin.user_id === user?.id;

                return (
                  <Card key={admin.id} className={`${isMe ? "border-primary" : ""}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={admin.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {admin.profile?.full_name?.[0] || admin.profile?.username?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span 
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                              isCurrentlyActive ? "bg-green-500" : "bg-yellow-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">
                              {admin.profile?.full_name || admin.profile?.username}
                            </p>
                            {isMe && (
                              <Badge variant="outline" className="text-xs">Anda</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            @{admin.profile?.username}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {admin.role === "super_admin" ? "Super Admin" : "Moderator"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <DeviceIcon className="h-3 w-3" />
                            <span>{deviceInfo.browser} • {deviceInfo.os}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {isCurrentlyActive 
                                ? "Aktif sekarang" 
                                : formatDistanceToNow(new Date(admin.last_activity), { 
                                    addSuffix: true,
                                    locale: id 
                                  })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <WifiOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada admin yang sedang online</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
