import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Eye, Clock, CheckCircle } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardHome() {
  const { profile, isSuperAdmin } = useAdminAuth();

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
        .select(`
          id, 
          action, 
          created_at,
          profiles!audit_logs_user_id_fkey(username, full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin,
  });

  const statCards = [
    { title: "Artikel Published", value: stats?.published || 0, icon: CheckCircle, color: "text-green-500" },
    { title: "Artikel Draft", value: stats?.draft || 0, icon: FileText, color: "text-yellow-500" },
    { title: "Artikel Scheduled", value: stats?.scheduled || 0, icon: Clock, color: "text-blue-500" },
    { title: "Total Views", value: stats?.totalViews || 0, icon: Eye, color: "text-purple-500" },
  ];

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
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

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Artikel Terbaru</CardTitle>
            <Link to="/fim-admin-portal-2024/articles">
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
                        {new Date(article.created_at).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[article.status]}`}>
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
              <Link to="/fim-admin-portal-2024/audit-logs">
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
                          {log.profiles?.full_name || log.profiles?.username || "System"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.action}
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
    </div>
  );
}