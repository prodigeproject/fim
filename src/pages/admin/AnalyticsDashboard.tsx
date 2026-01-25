import { useMemo, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  LineChart,
  Line,
  Legend
} from "recharts";
import { 
  Eye, 
  TrendingUp, 
  FileText, 
  Users,
  Calendar,
  ArrowUp,
  ArrowDown,
  Download,
  FileSpreadsheet,
  FileImage,
  Loader2
} from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const categoryLabels: Record<string, string> = {
  pengumuman: "Pengumuman",
  prestasi: "Prestasi",
  kegiatan: "Kegiatan",
  sosial: "Sosial",
  opini: "Opini",
  tips: "Tips",
};

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const { user, isSuperAdmin } = useAdminAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Fetch all articles for analytics - filter by author for moderators
  const { data: articles, isLoading } = useQuery({
    queryKey: ["analytics-articles", user?.id, isSuperAdmin],
    queryFn: async () => {
      let query = supabase
        .from("articles")
        .select("id, title, slug, category, view_count, status, created_at, published_at, tags, author_id")
        .order("view_count", { ascending: false });
      
      // Moderators only see their own articles
      if (!isSuperAdmin && user) {
        query = query.eq("author_id", user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch newsletter subscribers for analytics
  const { data: subscribers } = useQuery({
    queryKey: ["analytics-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id, email, is_active, subscribed_at, unsubscribed_at, created_at");
      if (error) throw error;
      return data;
    },
  });

  // Fetch scheduled broadcasts
  const { data: broadcasts } = useQuery({
    queryKey: ["analytics-broadcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_broadcasts")
        .select("id, status, sent_count, failed_count, total_recipients, sent_at, created_at")
        .eq("status", "sent");
      if (error) throw error;
      return data;
    },
  });

  // Calculate article statistics
  const stats = useMemo(() => {
    if (!articles) return null;

    const publishedArticles = articles.filter(a => a.status === "published");
    const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
    const avgViewsPerArticle = publishedArticles.length > 0 
      ? Math.round(totalViews / publishedArticles.length) 
      : 0;

    // Views in last 7 days (approximate based on recent articles)
    const last7Days = subDays(new Date(), 7);
    const recentArticles = articles.filter(a => 
      a.published_at && new Date(a.published_at) >= last7Days
    );
    const recentViews = recentArticles.reduce((sum, a) => sum + (a.view_count || 0), 0);

    return {
      totalArticles: articles.length,
      publishedArticles: publishedArticles.length,
      totalViews,
      avgViewsPerArticle,
      recentViews,
      draftCount: articles.filter(a => a.status === "draft").length,
    };
  }, [articles]);

  // Monthly views chart (last 12 months)
  const monthlyViews = useMemo(() => {
    if (!articles) return [];
    
    const last12Months = eachMonthOfInterval({
      start: startOfMonth(subMonths(new Date(), 11)),
      end: startOfMonth(new Date()),
    });

    return last12Months.map(monthStart => {
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      // Get articles published in this month
      const monthArticles = articles.filter(a => {
        if (!a.published_at) return false;
        const pubDate = new Date(a.published_at);
        return pubDate >= monthStart && pubDate < monthEnd;
      });

      const views = monthArticles.reduce((sum, a) => sum + (a.view_count || 0), 0);
      const articlesCount = monthArticles.length;

      return {
        month: format(monthStart, "MMM yy", { locale: id }),
        fullMonth: format(monthStart, "MMMM yyyy", { locale: id }),
        views,
        articles: articlesCount,
      };
    });
  }, [articles]);

  // Calculate newsletter statistics
  const newsletterStats = useMemo(() => {
    if (!subscribers) return null;

    const activeSubscribers = subscribers.filter(s => s.is_active);
    const inactiveSubscribers = subscribers.filter(s => !s.is_active);
    
    // Growth in last 30 days
    const last30Days = subDays(new Date(), 30);
    const newSubscribers = subscribers.filter(s => 
      s.subscribed_at && new Date(s.subscribed_at) >= last30Days
    );
    
    // Unsubscribed in last 30 days
    const recentUnsubscribes = subscribers.filter(s => 
      s.unsubscribed_at && new Date(s.unsubscribed_at) >= last30Days
    );

    // Broadcast stats
    const totalSent = broadcasts?.reduce((sum, b) => sum + (b.sent_count || 0), 0) || 0;
    const totalFailed = broadcasts?.reduce((sum, b) => sum + (b.failed_count || 0), 0) || 0;
    const deliveryRate = totalSent > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 100) : 0;

    return {
      totalSubscribers: subscribers.length,
      activeSubscribers: activeSubscribers.length,
      inactiveSubscribers: inactiveSubscribers.length,
      newSubscribers30d: newSubscribers.length,
      unsubscribes30d: recentUnsubscribes.length,
      growthRate: subscribers.length > 0 ? Math.round((newSubscribers.length / subscribers.length) * 100) : 0,
      totalBroadcastsSent: broadcasts?.length || 0,
      totalEmailsSent: totalSent,
      deliveryRate,
    };
  }, [subscribers, broadcasts]);

  // Subscriber growth by day (last 30 days)
  const subscriberGrowth = useMemo(() => {
    if (!subscribers) return [];
    
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(date => {
      const dayStart = startOfDay(date);
      const count = subscribers.filter(s => {
        if (!s.subscribed_at) return false;
        const subDate = startOfDay(new Date(s.subscribed_at));
        return subDate.getTime() === dayStart.getTime();
      }).length;

      return {
        date: format(date, "dd MMM", { locale: id }),
        subscribers: count,
      };
    });
  }, [subscribers]);

  // Top articles by views
  const topArticles = useMemo(() => {
    if (!articles) return [];
    return articles
      .filter(a => a.status === "published")
      .slice(0, 10)
      .map(a => ({
        title: a.title.length > 40 ? a.title.substring(0, 40) + "..." : a.title,
        fullTitle: a.title,
        views: a.view_count || 0,
        category: a.category,
        slug: a.slug,
      }));
  }, [articles]);

  // Category distribution
  const categoryData = useMemo(() => {
    if (!articles) return [];
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: categoryLabels[name] || name,
      value,
    }));
  }, [articles]);

  // Views by category
  const viewsByCategory = useMemo(() => {
    if (!articles) return [];
    const views: Record<string, number> = {};
    articles.forEach(a => {
      views[a.category] = (views[a.category] || 0) + (a.view_count || 0);
    });
    return Object.entries(views)
      .map(([name, views]) => ({
        name: categoryLabels[name] || name,
        views,
      }))
      .sort((a, b) => b.views - a.views);
  }, [articles]);

  // Trending topics (tags)
  const trendingTopics = useMemo(() => {
    if (!articles) return [];
    const tagCounts: Record<string, { count: number; views: number }> = {};
    
    articles.forEach(a => {
      if (a.tags && Array.isArray(a.tags)) {
        a.tags.forEach((tag: string) => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = { count: 0, views: 0 };
          }
          tagCounts[tag].count++;
          tagCounts[tag].views += a.view_count || 0;
        });
      }
    });

    return Object.entries(tagCounts)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        views: data.views,
        avgViews: Math.round(data.views / data.count),
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [articles]);

  // Articles by day (last 30 days)
  const articlesByDay = useMemo(() => {
    if (!articles) return [];
    
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });

    return last30Days.map(date => {
      const dayStart = startOfDay(date);
      const count = articles.filter(a => {
        if (!a.published_at) return false;
        const pubDate = startOfDay(new Date(a.published_at));
        return pubDate.getTime() === dayStart.getTime();
      }).length;

      return {
        date: format(date, "dd MMM", { locale: id }),
        articles: count,
      };
    });
  }, [articles]);

  // Engagement rate (views per article age)
  const engagementData = useMemo(() => {
    if (!articles) return [];
    
    return articles
      .filter(a => a.status === "published" && a.published_at)
      .map(a => {
        const daysOld = Math.max(1, Math.ceil(
          (Date.now() - new Date(a.published_at!).getTime()) / (1000 * 60 * 60 * 24)
        ));
        const viewsPerDay = (a.view_count || 0) / daysOld;
        return {
          title: a.title.length > 25 ? a.title.substring(0, 25) + "..." : a.title,
          engagement: Math.round(viewsPerDay * 10) / 10,
          views: a.view_count || 0,
          daysOld,
        };
      })
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);
  }, [articles]);

  // Export to CSV function
  const exportToCSV = () => {
    if (!articles) return;
    setIsExporting(true);

    try {
      const headers = [
        "Judul",
        "Slug",
        "Kategori",
        "Status",
        "Views",
        "Tanggal Dibuat",
        "Tanggal Publikasi",
        "Tags"
      ];

      const rows = articles.map(a => [
        `"${a.title.replace(/"/g, '""')}"`,
        a.slug,
        categoryLabels[a.category] || a.category,
        a.status,
        a.view_count || 0,
        a.created_at ? format(new Date(a.created_at), "yyyy-MM-dd HH:mm", { locale: id }) : "",
        a.published_at ? format(new Date(a.published_at), "yyyy-MM-dd HH:mm", { locale: id }) : "",
        a.tags?.join("; ") || ""
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `analytics-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Export berhasil", description: `File ${filename} berhasil diunduh` });
    } catch (error) {
      toast({ title: "Export gagal", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Export summary report
  const exportSummaryReport = () => {
    if (!stats || !articles) return;
    setIsExporting(true);

    try {
      const now = new Date();
      const monthYear = format(now, "MMMM yyyy", { locale: id });
      
      let report = `LAPORAN ANALYTICS BULANAN - ${monthYear.toUpperCase()}\n`;
      report += `Generated: ${format(now, "dd MMMM yyyy HH:mm", { locale: id })}\n\n`;
      
      report += "=== RINGKASAN ===\n";
      report += `Total Views: ${stats.totalViews.toLocaleString()}\n`;
      report += `Total Artikel: ${stats.totalArticles}\n`;
      report += `Artikel Published: ${stats.publishedArticles}\n`;
      report += `Artikel Draft: ${stats.draftCount}\n`;
      report += `Rata-rata Views per Artikel: ${stats.avgViewsPerArticle}\n`;
      report += `Views 7 Hari Terakhir: ${stats.recentViews}\n\n`;

      report += "=== TOP 10 ARTIKEL (Views) ===\n";
      topArticles.forEach((a, i) => {
        report += `${i + 1}. ${a.fullTitle} - ${a.views.toLocaleString()} views\n`;
      });
      report += "\n";

      report += "=== VIEWS PER KATEGORI ===\n";
      viewsByCategory.forEach(c => {
        report += `${c.name}: ${c.views.toLocaleString()} views\n`;
      });
      report += "\n";

      report += "=== TRENDING TOPICS ===\n";
      trendingTopics.forEach((t, i) => {
        report += `${i + 1}. #${t.tag} - ${t.views.toLocaleString()} views (${t.count} artikel)\n`;
      });
      report += "\n";

      report += "=== ENGAGEMENT RATE (Views/Hari) ===\n";
      engagementData.forEach((e, i) => {
        report += `${i + 1}. ${e.title} - ${e.engagement} views/hari\n`;
      });

      const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `laporan-analytics-${format(now, "yyyy-MM")}.txt`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "Laporan berhasil diexport", description: `File ${filename} berhasil diunduh` });
    } catch (error) {
      toast({ title: "Export gagal", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF with improved layout and charts data
  const exportToPDF = async () => {
    if (!stats) return;
    setIsExportingPDF(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const now = new Date();
      const monthYear = format(now, "MMMM yyyy", { locale: id });
      
      // Helper function for drawing boxes
      const drawStatBox = (x: number, y: number, width: number, height: number, label: string, value: string, color: [number, number, number] = [30, 64, 175]) => {
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.roundedRect(x, y, width, height, 3, 3, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(label, x + width / 2, y + 8, { align: 'center' });
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(value, x + width / 2, y + 20, { align: 'center' });
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(0, 0, 0);
      };

      // Header with background
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("LAPORAN ANALYTICS", pageWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Forum Indonesia Muda - ${monthYear}`, pageWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text(`Generated: ${format(now, "dd MMMM yyyy HH:mm", { locale: id })}`, pageWidth / 2, 38, { align: 'center' });
      pdf.setTextColor(0, 0, 0);

      // Stats boxes row
      const boxWidth = (pageWidth - margin * 2 - 15) / 4;
      const boxY = 55;
      drawStatBox(margin, boxY, boxWidth, 28, "TOTAL VIEWS", stats.totalViews.toLocaleString(), [30, 64, 175]);
      drawStatBox(margin + boxWidth + 5, boxY, boxWidth, 28, "TOTAL ARTIKEL", stats.totalArticles.toString(), [16, 185, 129]);
      drawStatBox(margin + (boxWidth + 5) * 2, boxY, boxWidth, 28, "PUBLISHED", stats.publishedArticles.toString(), [245, 158, 11]);
      drawStatBox(margin + (boxWidth + 5) * 3, boxY, boxWidth, 28, "AVG VIEWS", stats.avgViewsPerArticle.toString(), [139, 92, 246]);

      // Newsletter stats
      if (newsletterStats) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("Newsletter Statistics", margin, 100);
        pdf.setFont("helvetica", "normal");
        
        const nlBoxWidth = (pageWidth - margin * 2 - 10) / 3;
        drawStatBox(margin, 105, nlBoxWidth, 25, "SUBSCRIBERS", newsletterStats.activeSubscribers.toString(), [59, 130, 246]);
        drawStatBox(margin + nlBoxWidth + 5, 105, nlBoxWidth, 25, "NEW (30d)", newsletterStats.newSubscribers30d.toString(), [34, 197, 94]);
        drawStatBox(margin + (nlBoxWidth + 5) * 2, 105, nlBoxWidth, 25, "DELIVERY RATE", `${newsletterStats.deliveryRate}%`, [168, 85, 247]);
      }
      
      // Top 10 Articles section
      let yPos = 145;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Top 10 Artikel (Views)", margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(9);
      topArticles.slice(0, 10).forEach((article, i) => {
        if (yPos > pageHeight - 30) {
          pdf.addPage();
          yPos = margin;
        }
        // Draw rank badge
        pdf.setFillColor(30, 64, 175);
        pdf.circle(margin + 4, yPos - 1, 4, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7);
        pdf.text(`${i + 1}`, margin + 4, yPos + 1, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
        
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        const titleWidth = pageWidth - margin * 2 - 60;
        const truncatedTitle = article.fullTitle.length > 60 ? article.fullTitle.substring(0, 60) + "..." : article.fullTitle;
        pdf.text(truncatedTitle, margin + 12, yPos);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${article.views.toLocaleString()} views`, pageWidth - margin, yPos, { align: 'right' });
        pdf.setFont("helvetica", "normal");
        yPos += 8;
      });

      // Views by category (Page 2)
      pdf.addPage();
      yPos = margin;
      
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Views per Kategori", pageWidth / 2, 20, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      yPos = 50;

      // Draw category bars
      const maxViews = Math.max(...viewsByCategory.map(c => c.views), 1);
      const barMaxWidth = pageWidth - margin * 2 - 80;
      const colors: [number, number, number][] = [
        [30, 64, 175], [16, 185, 129], [245, 158, 11], [239, 68, 68], [139, 92, 246], [6, 182, 212]
      ];
      
      viewsByCategory.forEach((cat, i) => {
        const barWidth = (cat.views / maxViews) * barMaxWidth;
        const color = colors[i % colors.length];
        
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(cat.name, margin, yPos);
        
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.roundedRect(margin + 45, yPos - 5, barWidth, 8, 2, 2, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${cat.views.toLocaleString()}`, margin + 50 + barWidth, yPos);
        pdf.setFont("helvetica", "normal");
        
        yPos += 15;
      });

      // Trending topics
      yPos += 15;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Trending Topics", margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(9);
      trendingTopics.slice(0, 10).forEach((topic, i) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.setFillColor(colors[i % colors.length][0], colors[i % colors.length][1], colors[i % colors.length][2]);
        const tagWidth = pdf.getTextWidth(`#${topic.tag}`) + 6;
        pdf.roundedRect(margin, yPos - 4, tagWidth, 7, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.text(`#${topic.tag}`, margin + 3, yPos);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "normal");
        pdf.text(`${topic.views.toLocaleString()} views (${topic.count} artikel)`, margin + tagWidth + 5, yPos);
        yPos += 10;
      });

      // Monthly views (Page 3)
      pdf.addPage();
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.text("Views Bulanan (12 Bulan Terakhir)", pageWidth / 2, 20, { align: 'center' });
      pdf.setTextColor(0, 0, 0);
      
      yPos = 50;
      const maxMonthlyViews = Math.max(...monthlyViews.map(m => m.views), 1);
      const monthBarMaxWidth = pageWidth - margin * 2 - 100;
      
      monthlyViews.forEach((month, i) => {
        const barWidth = (month.views / maxMonthlyViews) * monthBarMaxWidth;
        const color = colors[i % colors.length];
        
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(month.fullMonth, margin, yPos);
        
        pdf.setFillColor(color[0], color[1], color[2]);
        pdf.roundedRect(margin + 55, yPos - 4, Math.max(barWidth, 2), 6, 1, 1, 'F');
        
        pdf.setFontSize(8);
        pdf.text(`${month.views.toLocaleString()} views / ${month.articles} artikel`, margin + 60 + barWidth, yPos);
        
        yPos += 10;
      });

      // Engagement rate section
      yPos += 15;
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Top Engagement Rate (Views/Hari)", margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(9);
      engagementData.slice(0, 8).forEach((item, i) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = margin;
        }
        pdf.setFont("helvetica", "normal");
        pdf.text(`${i + 1}. ${item.title}`, margin, yPos);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${item.engagement} views/hari`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
      });

      // Footer on all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Forum Indonesia Muda - Halaman ${i} dari ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      const filename = `laporan-analytics-${format(now, "yyyy-MM")}.pdf`;
      pdf.save(filename);
      
      toast({ title: "PDF berhasil diexport", description: `File ${filename} berhasil diunduh` });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({ title: "Export PDF gagal", variant: "destructive" });
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Statistik artikel dan engagement</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Statistik artikel dan engagement</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={exportToCSV} 
            disabled={isExporting}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={exportSummaryReport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Laporan TXT
          </Button>
          <Button 
            variant="default" 
            onClick={exportToPDF}
            disabled={isExportingPDF}
          >
            {isExportingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileImage className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-3xl font-bold">{stats?.totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span>{stats?.recentViews} views (7 hari)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Artikel</p>
                <p className="text-3xl font-bold">{stats?.totalArticles}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats?.publishedArticles} published, {stats?.draftCount} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata Views</p>
                <p className="text-3xl font-bold">{stats?.avgViewsPerArticle}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">per artikel published</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kategori Aktif</p>
                <p className="text-3xl font-bold">{categoryData.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">dengan artikel</p>
          </CardContent>
        </Card>
      </div>

      {/* Newsletter Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriber</p>
                <p className="text-3xl font-bold">{newsletterStats?.totalSubscribers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUp className="h-4 w-4" />
              <span>+{newsletterStats?.newSubscribers30d || 0} (30 hari)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subscriber Aktif</p>
                <p className="text-3xl font-bold text-green-600">{newsletterStats?.activeSubscribers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {newsletterStats?.inactiveSubscribers || 0} tidak aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Email Terkirim</p>
                <p className="text-3xl font-bold">{newsletterStats?.totalEmailsSent?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-accent" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {newsletterStats?.totalBroadcastsSent || 0} broadcast
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <p className="text-3xl font-bold text-green-600">{newsletterStats?.deliveryRate || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">email berhasil terkirim</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Artikel (Views)</CardTitle>
            <CardDescription>Artikel dengan views terbanyak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topArticles} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="title" 
                    type="category" 
                    width={150}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), "Views"]}
                    labelFormatter={(label) => topArticles.find(a => a.title === label)?.fullTitle || label}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribusi Kategori</CardTitle>
            <CardDescription>Jumlah artikel per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Views per Kategori</CardTitle>
            <CardDescription>Total views berdasarkan kategori artikel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [value.toLocaleString(), "Views"]} />
                  <Bar dataKey="views" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trending Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trending Topics</CardTitle>
            <CardDescription>Tag populer berdasarkan views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trendingTopics.length > 0 ? (
                trendingTopics.map((topic, i) => (
                  <div key={topic.tag} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <Badge variant="outline">#{topic.tag}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{topic.views.toLocaleString()} views</p>
                      <p className="text-xs text-muted-foreground">{topic.count} artikel</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada tag pada artikel
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles Published Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Publikasi 30 Hari Terakhir</CardTitle>
            <CardDescription>Jumlah artikel dipublikasikan per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={articlesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="articles" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Engagement Rate</CardTitle>
            <CardDescription>Views per hari sejak publikasi (top 10)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {engagementData.length > 0 ? (
                engagementData.map((article, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {article.views} views dalam {article.daysOld} hari
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-bold text-green-600">
                        {article.engagement}/hari
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada artikel published
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Views Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📈 Views Artikel per Bulan</CardTitle>
          <CardDescription>Perbandingan views artikel 12 bulan terakhir untuk melihat tren engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(), 
                    name === "views" ? "Total Views" : "Jumlah Artikel"
                  ]}
                  labelFormatter={(label) => monthlyViews.find(m => m.month === label)?.fullMonth || label}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="views" fill="hsl(var(--primary))" name="Views" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="articles" fill="hsl(var(--accent))" name="Artikel" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Subscriber Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📧 Pertumbuhan Subscriber Newsletter</CardTitle>
          <CardDescription>Subscriber baru per hari (30 hari terakhir)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subscriberGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="subscribers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Subscriber Baru"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
