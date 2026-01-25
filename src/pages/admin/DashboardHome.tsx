import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Clock, CheckCircle, Users, MapPin, Mail, UserPlus } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArticleStatsCharts } from "@/components/admin/ArticleStatsCharts";
import { BackupManager } from "@/components/admin/BackupManager";
import { toast } from "sonner";

export default function DashboardHome() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { profile, isSuperAdmin } = useAdminAuth();

  // Real-time subscription for new registrations (super admin only)
  useEffect(() => {
    if (!isSuperAdmin) return;

    const channel = supabase
      .channel("dashboard-registrations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fim_registrations",
        },
        (payload) => {
          const newReg = payload.new as { full_name: string; email: string };
          toast.info(`Pendaftaran baru: ${newReg.full_name}`, {
            description: newReg.email,
            action: {
              label: "Lihat",
              onClick: () => navigate("/admin/registrations"),
            },
            duration: 8000,
            icon: <UserPlus className="h-4 w-4" />,
          });
          // Invalidate queries to refresh stats
          queryClient.invalidateQueries({ queryKey: ["admin-registration-stats"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fim_registrations",
        },
        (payload) => {
          const updatedReg = payload.new as { 
            full_name: string; 
            registration_status: string;
            selection_stage: string;
          };
          const oldReg = payload.old as { 
            registration_status: string;
            selection_stage: string;
          };
          
          // Show notification if status or stage changed
          if (updatedReg.registration_status !== oldReg.registration_status) {
            toast.info(`Status pendaftaran berubah`, {
              description: `${updatedReg.full_name}: ${oldReg.registration_status} → ${updatedReg.registration_status}`,
              duration: 5000,
            });
          } else if (updatedReg.selection_stage !== oldReg.selection_stage) {
            toast.info(`Tahap seleksi berubah`, {
              description: `${updatedReg.full_name}: ${oldReg.selection_stage || '-'} → ${updatedReg.selection_stage || '-'}`,
              duration: 5000,
            });
          }
          
          queryClient.invalidateQueries({ queryKey: ["admin-registration-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin, queryClient, navigate]);

  // Fetch article stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data: articles, error } = await supabase
        .from("articles")
        .select("id, status, view_count");
      
      if (error) throw error;

      const published = articles?.filter(a => a.status === "published").length || 0;
      const draft = articles?.filter(a => a.status === "draft").length || 0;
      const scheduled = articles?.filter(a => a.status === "scheduled").length || 0;
      const totalViews = articles?.reduce((acc, a) => acc + (a.view_count || 0), 0) || 0;

      return { published, draft, scheduled, totalViews, total: articles?.length || 0 };
    },
  });

  // Fetch FIM Club count
  const { data: clubCount } = useQuery({
    queryKey: ["admin-club-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("fim_clubs")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch Regional count
  const { data: regionalCount } = useQuery({
    queryKey: ["admin-regional-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("fim_regionals")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch Newsletter subscriber count
  const { data: subscriberStats } = useQuery({
    queryKey: ["admin-subscriber-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("is_active");
      if (error) throw error;
      const total = data?.length || 0;
      const active = data?.filter(s => s.is_active).length || 0;
      return { total, active };
    },
  });

  // Fetch recent articles
  const { data: recentArticles, isLoading: articlesLoading } = useQuery({
    queryKey: ["admin-recent-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, status, created_at, published_at")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent audit logs (super admin only)
  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, created_at, user_id")
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Fetch profiles separately for display
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(l => l.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, username, full_name")
            .in("id", userIds);
          
          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          return data.map(log => ({
            ...log,
            profile: log.user_id ? profileMap.get(log.user_id) : null
          }));
        }
      }
      return data?.map(log => ({ ...log, profile: null })) || [];
    },
    enabled: isSuperAdmin,
  });

  const articleStatCards = [
    { title: "Artikel Published", value: stats?.published || 0, icon: CheckCircle, color: "text-green-500" },
    { title: "Artikel Draft", value: stats?.draft || 0, icon: FileText, color: "text-yellow-500" },
    { title: "Artikel Scheduled", value: stats?.scheduled || 0, icon: Clock, color: "text-blue-500" },
    { title: "Total Views", value: stats?.totalViews || 0, icon: Eye, color: "text-purple-500" },
  ];

  const organizationStatCards = [
    { title: "FIM Club", value: clubCount || 0, icon: Users, color: "text-primary", link: "/admin/clubs" },
    { title: "Regional FIM", value: regionalCount || 0, icon: MapPin, color: "text-orange-500", link: "/admin/regionals" },
    { title: "Newsletter Aktif", value: subscriberStats?.active || 0, icon: Mail, color: "text-emerald-500", link: "/admin/newsletter" },
  ];

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  const actionLabels: Record<string, string> = {
    login: "Login",
    logout: "Logout",
    create_article: "Buat Artikel",
    update_article: "Update Artikel",
    delete_article: "Hapus Artikel",
    create_admin_user: "Buat Akun Admin",
    activate_user: "Aktifkan User",
    deactivate_user: "Nonaktifkan User",
    broadcast_newsletter: "Kirim Broadcast",
    schedule_broadcast: "Jadwalkan Broadcast",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Selamat datang, {profile?.full_name || profile?.username}!
        </h1>
        <p className="text-muted-foreground">
          Kelola konten dan pantau aktivitas website FIM
        </p>
      </div>

      {/* Organization Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Data Organisasi</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {organizationStatCards.map((stat) => (
            <Link key={stat.title} to={stat.link}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Article Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Statistik Artikel</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {articleStatCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Artikel Terbaru</CardTitle>
            <Link to="/admin/articles">
              <Button variant="outline" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {articlesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : recentArticles?.length ? (
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-foreground truncate">
                        {article.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(article.created_at!).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[article.status!]}`}>
                      {article.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Belum ada artikel
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity (Super Admin Only) */}
        {isSuperAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <Link to="/admin/audit-logs">
                <Button variant="outline" size="sm">Lihat Semua</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : recentLogs?.length ? (
                <div className="space-y-3">
                  {recentLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {log.profile?.full_name || log.profile?.username || "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {actionLabels[log.action] || log.action}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada aktivitas
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Article Stats Charts */}
      {isSuperAdmin && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Statistik Artikel</h2>
          <ArticleStatsCharts />
        </div>
      )}

      {/* Backup Manager */}
      {isSuperAdmin && (
        <div>
          <BackupManager />
        </div>
      )}
    </div>
  );
}
