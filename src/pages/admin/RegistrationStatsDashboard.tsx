import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar as CalendarIcon,
  BarChart3,
  FileDown,
  Filter,
  Loader2,
  FileText,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart,
  Line
} from "recharts";
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, isWithinInterval } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Registration {
  id: string;
  created_at: string;
  registration_status: string;
  selection_stage: string | null;
  batch_id: string | null;
  final_result: string | null;
}

interface TrainingRegistration {
  id: string;
  is_submitted: boolean;
  submitted_at: string | null;
  completion_percentage: number;
  registration_id: string;
}

interface Batch {
  id: string;
  batch_name: string;
  batch_number: number;
}

const STATUS_COLORS = {
  pending: "#f59e0b",
  completed: "#3b82f6",
  approved: "#10b981",
  rejected: "#ef4444",
};

const STAGE_COLORS = {
  administrasi: "#3b82f6",
  wawancara: "#f59e0b",
  pengumuman: "#10b981",
};

const STATUS_LABELS = {
  pending: "Menunggu",
  completed: "Selesai",
  approved: "Diterima",
  rejected: "Ditolak",
};

const STAGE_LABELS = {
  administrasi: "Administrasi",
  wawancara: "Wawancara",
  pengumuman: "Pengumuman",
};

export default function RegistrationStatsDashboard() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState<"daily" | "weekly">("daily");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  // Fetch batches for filter
  const { data: batches } = useQuery({
    queryKey: ["registration-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_settings")
        .select("id, batch_name, batch_number")
        .order("batch_number", { ascending: false });
      
      if (error) throw error;
      return data as Batch[];
    },
  });

  // Fetch all registrations with batch and stage info
  const { data: registrations, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ["registration-stats-full", selectedBatch, selectedStage],
    queryFn: async () => {
      let query = supabase
        .from("fim_registrations")
        .select("id, created_at, registration_status, selection_stage, batch_id, final_result")
        .order("created_at", { ascending: true });
      
      if (selectedBatch !== "all") {
        query = query.eq("batch_id", selectedBatch);
      }
      
      if (selectedStage !== "all") {
        query = query.eq("selection_stage", selectedStage);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Registration[];
    },
    refetchInterval: 30000,
  });

  // Fetch training registrations
  const { data: trainingData, isLoading: isLoadingTraining } = useQuery({
    queryKey: ["training-registration-stats-full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_training_registrations")
        .select("id, is_submitted, submitted_at, completion_percentage, registration_id");
      
      if (error) throw error;
      return data as TrainingRegistration[];
    },
    refetchInterval: 30000,
  });

  // Filter registrations by date range
  const filteredRegistrations = registrations?.filter(r => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const regDate = new Date(r.created_at);
    return isWithinInterval(regDate, { start: dateRange.from, end: dateRange.to });
  });

  // Calculate stats
  const totalRegistrations = filteredRegistrations?.length || 0;
  const pendingCount = filteredRegistrations?.filter(r => r.registration_status === "pending").length || 0;
  const completedCount = filteredRegistrations?.filter(r => r.registration_status === "completed").length || 0;
  const approvedCount = filteredRegistrations?.filter(r => r.registration_status === "approved").length || 0;
  const rejectedCount = filteredRegistrations?.filter(r => r.registration_status === "rejected").length || 0;

  // Stage stats
  const stageAdministrasi = filteredRegistrations?.filter(r => r.selection_stage === "administrasi").length || 0;
  const stageWawancara = filteredRegistrations?.filter(r => r.selection_stage === "wawancara").length || 0;
  const stagePengumuman = filteredRegistrations?.filter(r => r.selection_stage === "pengumuman").length || 0;
  const lolosCount = filteredRegistrations?.filter(r => r.final_result === "lolos").length || 0;
  const tidakLolosCount = filteredRegistrations?.filter(r => r.final_result === "tidak_lolos").length || 0;

  const submittedTrainingCount = trainingData?.filter(t => t.is_submitted).length || 0;
  const avgCompletion = trainingData?.length 
    ? Math.round(trainingData.reduce((acc, t) => acc + (t.completion_percentage || 0), 0) / trainingData.length)
    : 0;

  // Prepare chart data for daily trend
  const getDailyTrendData = () => {
    if (!filteredRegistrations || !dateRange?.from || !dateRange?.to) return [];
    
    const days = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayRegistrations = filteredRegistrations.filter(r => 
        format(new Date(r.created_at), "yyyy-MM-dd") === dayStr
      );

      return {
        date: format(day, "dd MMM", { locale: id }),
        total: dayRegistrations.length,
        pending: dayRegistrations.filter(r => r.registration_status === "pending").length,
        approved: dayRegistrations.filter(r => r.registration_status === "approved").length,
        rejected: dayRegistrations.filter(r => r.registration_status === "rejected").length,
      };
    });
  };

  // Prepare chart data for weekly trend
  const getWeeklyTrendData = () => {
    if (!filteredRegistrations || !dateRange?.from || !dateRange?.to) return [];
    
    const weeks = eachWeekOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    }, { weekStartsOn: 1 });

    return weeks.map((weekStart, index) => {
      const weekEnd = index < weeks.length - 1 ? weeks[index + 1] : dateRange.to;
      const weekRegistrations = filteredRegistrations.filter(r => {
        const regDate = new Date(r.created_at);
        return regDate >= weekStart && regDate < (weekEnd || new Date());
      });

      return {
        date: `Minggu ${format(weekStart, "dd MMM", { locale: id })}`,
        total: weekRegistrations.length,
        pending: weekRegistrations.filter(r => r.registration_status === "pending").length,
        approved: weekRegistrations.filter(r => r.registration_status === "approved").length,
        rejected: weekRegistrations.filter(r => r.registration_status === "rejected").length,
      };
    });
  };

  const trendData = timeRange === "daily" ? getDailyTrendData() : getWeeklyTrendData();

  // Pie chart data for status breakdown
  const statusBreakdownData = [
    { name: STATUS_LABELS.pending, value: pendingCount, color: STATUS_COLORS.pending },
    { name: STATUS_LABELS.completed, value: completedCount, color: STATUS_COLORS.completed },
    { name: STATUS_LABELS.approved, value: approvedCount, color: STATUS_COLORS.approved },
    { name: STATUS_LABELS.rejected, value: rejectedCount, color: STATUS_COLORS.rejected },
  ].filter(d => d.value > 0);

  // Stage breakdown data
  const stageBreakdownData = [
    { name: STAGE_LABELS.administrasi, value: stageAdministrasi, color: STAGE_COLORS.administrasi },
    { name: STAGE_LABELS.wawancara, value: stageWawancara, color: STAGE_COLORS.wawancara },
    { name: STAGE_LABELS.pengumuman, value: stagePengumuman, color: STAGE_COLORS.pengumuman },
  ].filter(d => d.value > 0);

  // Funnel data for conversion
  const funnelData = [
    { name: "Total Pendaftar", value: totalRegistrations, fill: "#3b82f6" },
    { name: "Formulir Tersubmit", value: submittedTrainingCount, fill: "#8b5cf6" },
    { name: "Tahap Administrasi", value: stageAdministrasi + stageWawancara + stagePengumuman, fill: "#f59e0b" },
    { name: "Tahap Wawancara", value: stageWawancara + stagePengumuman, fill: "#10b981" },
    { name: "Lolos/Diterima", value: lolosCount, fill: "#22c55e" },
  ].filter(d => d.value > 0);

  // Batch comparison data
  const batchComparisonData = batches?.map(batch => {
    const batchRegs = registrations?.filter(r => r.batch_id === batch.id) || [];
    return {
      name: batch.batch_name,
      total: batchRegs.length,
      lolos: batchRegs.filter(r => r.final_result === "lolos").length,
      tidakLolos: batchRegs.filter(r => r.final_result === "tidak_lolos").length,
    };
  }).filter(d => d.total > 0) || [];

  // Training completion data
  const trainingCompletionData = [
    { name: "0-25%", value: trainingData?.filter(t => t.completion_percentage <= 25).length || 0 },
    { name: "26-50%", value: trainingData?.filter(t => t.completion_percentage > 25 && t.completion_percentage <= 50).length || 0 },
    { name: "51-75%", value: trainingData?.filter(t => t.completion_percentage > 50 && t.completion_percentage <= 75).length || 0 },
    { name: "76-99%", value: trainingData?.filter(t => t.completion_percentage > 75 && t.completion_percentage < 100).length || 0 },
    { name: "100%", value: trainingData?.filter(t => t.completion_percentage === 100).length || 0 },
  ];

  const isLoading = isLoadingRegistrations || isLoadingTraining;

  // Preset date ranges
  const presetRanges = [
    { label: "7 Hari", from: subDays(new Date(), 6), to: new Date() },
    { label: "14 Hari", from: subDays(new Date(), 13), to: new Date() },
    { label: "30 Hari", from: subDays(new Date(), 29), to: new Date() },
    { label: "3 Bulan", from: subDays(new Date(), 89), to: new Date() },
  ];

  // Export to PDF
  const handleExportPDF = async () => {
    if (!chartRef.current) return;
    
    setIsExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      // Header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageWidth, 40, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Laporan Statistik Pendaftaran FIM", pageWidth / 2, 20, { align: "center" });
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Periode: ${dateRange?.from ? format(dateRange.from, "dd MMM yyyy", { locale: id }) : "-"} - ${dateRange?.to ? format(dateRange.to, "dd MMM yyyy", { locale: id }) : "-"}`, pageWidth / 2, 30, { align: "center" });
      pdf.setTextColor(0, 0, 0);
      yPos = 50;

      // Summary Stats
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Ringkasan Statistik", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const statsData = [
        ["Total Pendaftar", totalRegistrations.toString()],
        ["Menunggu Review", pendingCount.toString()],
        ["Diterima", approvedCount.toString()],
        ["Ditolak", rejectedCount.toString()],
        ["Tahap Administrasi", stageAdministrasi.toString()],
        ["Tahap Wawancara", stageWawancara.toString()],
        ["Tahap Pengumuman", stagePengumuman.toString()],
        ["Hasil Lolos", lolosCount.toString()],
        ["Formulir Tersubmit", submittedTrainingCount.toString()],
        ["Rata-rata Kelengkapan", `${avgCompletion}%`],
      ];

      const colWidth = (pageWidth - margin * 2) / 2;
      statsData.forEach((row, index) => {
        const x = margin + (index % 2) * colWidth;
        const y = yPos + Math.floor(index / 2) * 8;
        pdf.text(`${row[0]}: ${row[1]}`, x, y);
      });
      yPos += Math.ceil(statsData.length / 2) * 8 + 10;

      // Capture chart as image
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Check if we need a new page
      if (yPos + imgHeight > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Grafik Visual", margin, yPos);
      yPos += 8;

      pdf.addImage(imgData, "PNG", margin, yPos, imgWidth, Math.min(imgHeight, pageHeight - yPos - margin));

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Dicetak pada ${format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      pdf.save(`Statistik-Pendaftaran-FIM-${format(new Date(), "yyyyMMdd")}.pdf`);
      toast.success("PDF berhasil diunduh");
    } catch (error) {
      console.error("Export PDF error:", error);
      toast.error("Gagal mengexport PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statistik Pendaftaran FIM</h1>
          <p className="text-muted-foreground">
            Dashboard analitik pendaftaran dan progress formulir
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Auto-refresh 30s
          </Badge>
          
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            {/* Batch Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Batch/Angkatan</Label>
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Batch</SelectItem>
                  {batches?.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage Filter */}
            <div className="space-y-2">
              <Label className="text-xs">Tahap Seleksi</Label>
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Tahap" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tahap</SelectItem>
                  <SelectItem value="administrasi">Administrasi</SelectItem>
                  <SelectItem value="wawancara">Wawancara</SelectItem>
                  <SelectItem value="pengumuman">Pengumuman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label className="text-xs">Periode</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {dateRange?.from && dateRange?.to ? (
                      <>
                        {format(dateRange.from, "dd MMM", { locale: id })} - {format(dateRange.to, "dd MMM yyyy", { locale: id })}
                      </>
                    ) : (
                      "Pilih Tanggal"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium mb-2">Periode Cepat</p>
                    <div className="flex flex-wrap gap-2">
                      {presetRanges.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDateRange({ from: preset.from, to: preset.to });
                            setIsCustomRange(false);
                          }}
                          className={cn(
                            dateRange?.from?.getTime() === preset.from.getTime() && 
                            dateRange?.to?.getTime() === preset.to.getTime() && 
                            !isCustomRange && "bg-primary text-primary-foreground"
                          )}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setIsCustomRange(true);
                    }}
                    numberOfMonths={2}
                    locale={id}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalRegistrations}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {selectedBatch !== "all" 
                ? batches?.find(b => b.id === selectedBatch)?.batch_name 
                : "Semua batch"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {totalRegistrations > 0 ? Math.round((pendingCount / totalRegistrations) * 100) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diterima</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {totalRegistrations > 0 ? Math.round((approvedCount / totalRegistrations) * 100) : 0}% acceptance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {totalRegistrations > 0 ? Math.round((rejectedCount / totalRegistrations) * 100) : 0}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stage Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tahap Administrasi</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{stageAdministrasi}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tahap Wawancara</CardTitle>
            <MessageSquare className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-amber-600">{stageWawancara}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hasil Lolos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-green-600">{lolosCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Tidak lolos: {tidakLolosCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Training Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Formulir Tersubmit</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{submittedTrainingCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Dari {trainingData?.length || 0} formulir yang dibuat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Kelengkapan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{avgCompletion}%</div>
            )}
            <p className="text-xs text-muted-foreground">
              Tingkat kelengkapan formulir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div ref={chartRef} className="grid gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Trend Pendaftaran
                </CardTitle>
                <CardDescription>
                  Grafik pendaftaran berdasarkan periode yang dipilih
                </CardDescription>
              </div>
              <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as "daily" | "weekly")}>
                <TabsList>
                  <TabsTrigger value="daily">Harian</TabsTrigger>
                  <TabsTrigger value="weekly">Mingguan</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    name="Diterima"
                    stroke={STATUS_COLORS.approved}
                    fill={STATUS_COLORS.approved}
                    fillOpacity={0.2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    name="Menunggu"
                    stroke={STATUS_COLORS.pending}
                    fill={STATUS_COLORS.pending}
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Status</CardTitle>
            <CardDescription>Distribusi status pendaftaran</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : statusBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stage Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Breakdown Tahap Seleksi</CardTitle>
            <CardDescription>Distribusi tahap seleksi saat ini</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : stageBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stageBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stageBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Comparison Bar Chart */}
        {batchComparisonData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Perbandingan Antar Batch</CardTitle>
              <CardDescription>Statistik pendaftaran dan hasil seleksi per batch</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={batchComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Total Pendaftar" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lolos" name="Lolos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="tidakLolos" name="Tidak Lolos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="lolos" name="Trend Lolos" stroke="#16a34a" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Training Completion Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Kelengkapan Formulir</CardTitle>
            <CardDescription>Distribusi tingkat kelengkapan formulir pendaftaran</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trainingCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    name="Jumlah"
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Funnel Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Funnel Konversi</CardTitle>
            <CardDescription>Alur pendaftaran hingga diterima</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="value" position="right" fill="hsl(var(--foreground))" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
