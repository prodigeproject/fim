import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";

const COLORS = ["#2563eb", "#16a34a", "#eab308", "#dc2626", "#8b5cf6", "#06b6d4"];

const categoryLabels: Record<string, string> = {
  pengumuman: "Pengumuman",
  prestasi: "Prestasi",
  kegiatan: "Kegiatan",
  sosial: "Sosial",
  opini: "Opini",
  tips: "Tips",
};

const statusLabels: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
  archived: "Archived",
  rejected: "Rejected",
};

export function ArticleStatsCharts() {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["article-stats-charts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, category, status, created_at, published_at, view_count");
      if (error) throw error;
      return data;
    },
  });

  // Category distribution data
  const categoryData = useMemo(() => {
    if (!articles) return [];
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      const cat = a.category || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: categoryLabels[name] || name,
      value,
    }));
  }, [articles]);

  // Status distribution data
  const statusData = useMemo(() => {
    if (!articles) return [];
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      const status = a.status || "draft";
      counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: statusLabels[name] || name,
      value,
    }));
  }, [articles]);

  // Daily articles for last 30 days
  const dailyData = useMemo(() => {
    if (!articles) return [];
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });
    
    return last30Days.map(date => {
      const dateStr = format(date, "yyyy-MM-dd");
      const count = articles.filter(a => {
        if (!a.created_at) return false;
        return format(parseISO(a.created_at), "yyyy-MM-dd") === dateStr;
      }).length;
      
      return {
        date: format(date, "dd MMM", { locale: localeId }),
        articles: count,
      };
    });
  }, [articles]);

  // Top categories by views
  const viewsByCategory = useMemo(() => {
    if (!articles) return [];
    const views: Record<string, number> = {};
    articles.forEach(a => {
      const cat = a.category || "other";
      views[cat] = (views[cat] || 0) + (a.view_count || 0);
    });
    return Object.entries(views)
      .map(([name, views]) => ({
        name: categoryLabels[name] || name,
        views,
      }))
      .sort((a, b) => b.views - a.views);
  }, [articles]);

  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Category Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribusi Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Articles Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Artikel per Hari (30 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="articles" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Views by Category Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total Views per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={viewsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="hsl(var(--supporting))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
