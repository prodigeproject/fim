import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
import { FileDown, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  const { toast } = useToast();
  const chartsRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

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

  // Export to PDF function
  const exportToPDF = async () => {
    if (!chartsRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartsRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const now = new Date();
      
      // Title
      pdf.setFontSize(20);
      pdf.text("Statistik Artikel - Forum Indonesia Muda", 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Generated: ${format(now, "dd MMMM yyyy HH:mm", { locale: localeId })}`, 20, 28);
      
      // Summary stats
      pdf.setFontSize(12);
      pdf.text(`Total Artikel: ${articles?.length || 0}`, 20, 40);
      pdf.text(`Total Views: ${articles?.reduce((acc, a) => acc + (a.view_count || 0), 0) || 0}`, 20, 48);
      
      // Add charts image
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 20, 55, imgWidth, Math.min(imgHeight, 200));
      
      pdf.save(`statistik-artikel-${format(now, "yyyy-MM-dd")}.pdf`);
      toast({ title: "Export PDF berhasil" });
    } catch (error) {
      console.error("Export error:", error);
      toast({ title: "Gagal export PDF", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

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
    <div className="space-y-4">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={exportToPDF} disabled={isExporting} variant="outline">
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileDown className="h-4 w-4 mr-2" />
          )}
          Export PDF
        </Button>
      </div>
      
      <div ref={chartsRef} className="grid lg:grid-cols-2 gap-6">
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
    </div>
  );
}
