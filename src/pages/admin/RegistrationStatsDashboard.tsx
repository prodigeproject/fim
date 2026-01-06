import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  BarChart3
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
  Legend
} from "recharts";
import { format, subDays, startOfWeek, eachDayOfInterval, eachWeekOfInterval, subWeeks } from "date-fns";
import { id } from "date-fns/locale";

interface Registration {
  id: string;
  created_at: string;
  registration_status: string;
}

interface TrainingRegistration {
  id: string;
  is_submitted: boolean;
  submitted_at: string | null;
  completion_percentage: number;
}

const STATUS_COLORS = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

const STATUS_LABELS = {
  pending: "Menunggu",
  approved: "Diterima",
  rejected: "Ditolak",
};

export default function RegistrationStatsDashboard() {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly">("daily");

  // Fetch all registrations
  const { data: registrations, isLoading: isLoadingRegistrations } = useQuery({
    queryKey: ["registration-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_registrations")
        .select("id, created_at, registration_status")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as Registration[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch training registrations
  const { data: trainingData, isLoading: isLoadingTraining } = useQuery({
    queryKey: ["training-registration-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_training_registrations")
        .select("id, is_submitted, submitted_at, completion_percentage");
      
      if (error) throw error;
      return data as TrainingRegistration[];
    },
    refetchInterval: 30000,
  });

  // Calculate stats
  const totalRegistrations = registrations?.length || 0;
  const pendingCount = registrations?.filter(r => r.registration_status === "pending").length || 0;
  const approvedCount = registrations?.filter(r => r.registration_status === "approved").length || 0;
  const rejectedCount = registrations?.filter(r => r.registration_status === "rejected").length || 0;

  const submittedTrainingCount = trainingData?.filter(t => t.is_submitted).length || 0;
  const avgCompletion = trainingData?.length 
    ? Math.round(trainingData.reduce((acc, t) => acc + (t.completion_percentage || 0), 0) / trainingData.length)
    : 0;

  // Prepare chart data for daily trend (last 14 days)
  const getDailyTrendData = () => {
    if (!registrations) return [];
    
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayRegistrations = registrations.filter(r => 
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

  // Prepare chart data for weekly trend (last 8 weeks)
  const getWeeklyTrendData = () => {
    if (!registrations) return [];
    
    const weeks = eachWeekOfInterval({
      start: subWeeks(new Date(), 7),
      end: new Date(),
    }, { weekStartsOn: 1 });

    return weeks.map((weekStart, index) => {
      const weekEnd = index < weeks.length - 1 ? weeks[index + 1] : new Date();
      const weekRegistrations = registrations.filter(r => {
        const regDate = new Date(r.created_at);
        return regDate >= weekStart && regDate < weekEnd;
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
    { name: STATUS_LABELS.approved, value: approvedCount, color: STATUS_COLORS.approved },
    { name: STATUS_LABELS.rejected, value: rejectedCount, color: STATUS_COLORS.rejected },
  ].filter(d => d.value > 0);

  // Training completion data
  const trainingCompletionData = [
    { name: "0-25%", value: trainingData?.filter(t => t.completion_percentage <= 25).length || 0 },
    { name: "26-50%", value: trainingData?.filter(t => t.completion_percentage > 25 && t.completion_percentage <= 50).length || 0 },
    { name: "51-75%", value: trainingData?.filter(t => t.completion_percentage > 50 && t.completion_percentage <= 75).length || 0 },
    { name: "76-99%", value: trainingData?.filter(t => t.completion_percentage > 75 && t.completion_percentage < 100).length || 0 },
    { name: "100%", value: trainingData?.filter(t => t.completion_percentage === 100).length || 0 },
  ];

  const isLoading = isLoadingRegistrations || isLoadingTraining;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Statistik Pendaftaran FIM</h1>
          <p className="text-muted-foreground">
            Dashboard analitik pendaftaran dan progress formulir
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          Auto-refresh 30s
        </Badge>
      </div>

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
              Semua waktu
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
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Trend Pendaftaran
                </CardTitle>
                <CardDescription>
                  Grafik pendaftaran {timeRange === "daily" ? "14 hari" : "8 minggu"} terakhir
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
      </div>
    </div>
  );
}
