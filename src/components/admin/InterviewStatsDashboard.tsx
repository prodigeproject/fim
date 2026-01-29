import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  CalendarCheck, 
  Clock, 
  UserX, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Users 
} from "lucide-react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface InterviewSchedule {
  id: string;
  registration_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  interviewer_name: string | null;
  created_at: string;
}

const COLORS = {
  completed: "hsl(var(--chart-2))",
  scheduled: "hsl(var(--chart-1))",
  no_show: "hsl(var(--chart-5))",
  cancelled: "hsl(var(--muted-foreground))",
};

export default function InterviewStatsDashboard() {
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month");

  // Fetch all interview schedules
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["interview-schedules-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("interview_schedules")
        .select("id, registration_id, scheduled_date, scheduled_time, status, interviewer_name, created_at")
        .order("scheduled_date", { ascending: true });
      
      if (error) throw error;
      return data as InterviewSchedule[];
    },
  });

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    switch (period) {
      case "week":
        return { start: subDays(now, 7), end: now };
      case "month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "quarter":
        return { start: subMonths(now, 3), end: now };
      case "year":
        return { start: subMonths(now, 12), end: now };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [period]);

  // Filter schedules by date range
  const filteredSchedules = useMemo(() => {
    if (!schedules) return [];
    return schedules.filter(s => {
      const date = new Date(s.scheduled_date);
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [schedules, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredSchedules.length) {
      return {
        total: 0,
        completed: 0,
        scheduled: 0,
        noShow: 0,
        cancelled: 0,
        completionRate: 0,
        noShowRate: 0,
      };
    }

    const completed = filteredSchedules.filter(s => s.status === "completed").length;
    const scheduled = filteredSchedules.filter(s => s.status === "scheduled").length;
    const noShow = filteredSchedules.filter(s => s.status === "no_show").length;
    const cancelled = filteredSchedules.filter(s => s.status === "cancelled").length;
    const total = filteredSchedules.length;

    // Calculate rates excluding still scheduled interviews
    const finishedInterviews = completed + noShow + cancelled;
    const completionRate = finishedInterviews > 0 ? Math.round((completed / finishedInterviews) * 100) : 0;
    const noShowRate = finishedInterviews > 0 ? Math.round((noShow / finishedInterviews) * 100) : 0;

    return { total, completed, scheduled, noShow, cancelled, completionRate, noShowRate };
  }, [filteredSchedules]);

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: "Selesai", value: stats.completed, color: COLORS.completed },
      { name: "Terjadwal", value: stats.scheduled, color: COLORS.scheduled },
      { name: "Tidak Hadir", value: stats.noShow, color: COLORS.no_show },
      { name: "Dibatalkan", value: stats.cancelled, color: COLORS.cancelled },
    ].filter(d => d.value > 0);
  }, [stats]);

  // Time series data for trends
  const trendData = useMemo(() => {
    if (!schedules || schedules.length === 0) return [];

    const intervals = period === "week" 
      ? eachWeekOfInterval({ start: dateRange.start, end: dateRange.end })
      : period === "month"
      ? eachWeekOfInterval({ start: dateRange.start, end: dateRange.end })
      : eachMonthOfInterval({ start: dateRange.start, end: dateRange.end });

    return intervals.map((intervalStart, idx) => {
      const intervalEnd = period === "week" || period === "month"
        ? endOfWeek(intervalStart, { weekStartsOn: 1 })
        : idx < intervals.length - 1 ? intervals[idx + 1] : dateRange.end;

      const intervalSchedules = schedules.filter(s => {
        const date = new Date(s.scheduled_date);
        return date >= intervalStart && date <= intervalEnd;
      });

      return {
        period: format(intervalStart, period === "year" ? "MMM" : "dd MMM", { locale: localeId }),
        selesai: intervalSchedules.filter(s => s.status === "completed").length,
        tidakHadir: intervalSchedules.filter(s => s.status === "no_show").length,
        dibatalkan: intervalSchedules.filter(s => s.status === "cancelled").length,
        terjadwal: intervalSchedules.filter(s => s.status === "scheduled").length,
      };
    });
  }, [schedules, period, dateRange]);

  // Interviewer performance data
  const interviewerData = useMemo(() => {
    if (!filteredSchedules.length) return [];

    const interviewerMap: Record<string, { total: number; completed: number; noShow: number; cancelled: number }> = {};

    filteredSchedules.forEach(s => {
      const name = s.interviewer_name || "Tidak Ditentukan";
      if (!interviewerMap[name]) {
        interviewerMap[name] = { total: 0, completed: 0, noShow: 0, cancelled: 0 };
      }
      interviewerMap[name].total++;
      if (s.status === "completed") interviewerMap[name].completed++;
      if (s.status === "no_show") interviewerMap[name].noShow++;
      if (s.status === "cancelled") interviewerMap[name].cancelled++;
    });

    return Object.entries(interviewerMap)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        fullName: name,
        ...data,
        successRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredSchedules]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Statistik Wawancara</h3>
          <p className="text-sm text-muted-foreground">
            Analisis performa dan tren wawancara
          </p>
        </div>
        <Select value={period} onValueChange={(v: typeof period) => setPeriod(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">7 Hari Terakhir</SelectItem>
            <SelectItem value="month">Bulan Ini</SelectItem>
            <SelectItem value="quarter">3 Bulan Terakhir</SelectItem>
            <SelectItem value="year">12 Bulan Terakhir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wawancara</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.scheduled} masih terjadwal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Tingkat kehadiran: {stats.completionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.noShow}</div>
            <p className="text-xs text-muted-foreground">
              Tingkat ketidakhadiran: {stats.noShowRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dibatalkan</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              Wawancara yang dibatalkan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribusi Status</CardTitle>
            <CardDescription>Pembagian status wawancara</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                Tidak ada data untuk periode ini
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trends Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tren Wawancara</CardTitle>
            <CardDescription>Performa wawancara dari waktu ke waktu</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" tick={{ fontSize: 10 }} />
                  <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line 
                    type="monotone" 
                    dataKey="selesai" 
                    name="Selesai"
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tidakHadir" 
                    name="Tidak Hadir"
                    stroke="hsl(var(--chart-5))" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="terjadwal" 
                    name="Terjadwal"
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                Tidak ada data untuk periode ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interviewer Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Performa Interviewer
          </CardTitle>
          <CardDescription>
            Statistik wawancara berdasarkan interviewer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interviewerData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={interviewerData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    const labels: Record<string, string> = {
                      completed: "Selesai",
                      noShow: "Tidak Hadir",
                      cancelled: "Dibatalkan",
                    };
                    return [value, labels[name as string] || name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar 
                  dataKey="completed" 
                  name="Selesai" 
                  stackId="a" 
                  fill="hsl(var(--chart-2))" 
                />
                <Bar 
                  dataKey="noShow" 
                  name="Tidak Hadir" 
                  stackId="a" 
                  fill="hsl(var(--chart-5))" 
                />
                <Bar 
                  dataKey="cancelled" 
                  name="Dibatalkan" 
                  stackId="a" 
                  fill="hsl(var(--muted-foreground))" 
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Tidak ada data interviewer untuk periode ini
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
