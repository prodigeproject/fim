import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { format, subDays, startOfDay, endOfDay, subHours } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
  Loader2,
  Globe,
  Search,
  Ban,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string | null;
  success: boolean;
  attempted_at: string;
}

const COLORS = {
  success: "#22c55e",
  failed: "#ef4444",
};

export default function LoginMonitoringDashboard() {
  const [dateRange, setDateRange] = useState("7");
  const [searchEmail, setSearchEmail] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "failed">("all");

  // Fetch login attempts
  const { data: attempts, isLoading, refetch } = useQuery({
    queryKey: ["login-attempts", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("login_attempts")
        .select("*")
        .gte("attempted_at", startDate.toISOString())
        .order("attempted_at", { ascending: false });

      if (error) throw error;
      return data as LoginAttempt[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds for real-time feel
  });

  // Calculate statistics
  const stats = {
    total: attempts?.length || 0,
    successful: attempts?.filter(a => a.success).length || 0,
    failed: attempts?.filter(a => !a.success).length || 0,
    today: attempts?.filter(a => 
      new Date(a.attempted_at) >= startOfDay(new Date())
    ).length || 0,
    todayFailed: attempts?.filter(a => 
      new Date(a.attempted_at) >= startOfDay(new Date()) && !a.success
    ).length || 0,
    uniqueIPs: new Set(attempts?.map(a => a.ip_address)).size,
    uniqueEmails: new Set(attempts?.map(a => a.email.toLowerCase())).size,
  };

  // Calculate blocked IPs (5+ failed attempts in last 15 minutes per IP)
  const blockedIPs = (() => {
    const fifteenMinutesAgo = subHours(new Date(), 0.25);
    const recentFailedByIP: Record<string, { count: number; email: string; lastAttempt: string }> = {};
    
    attempts?.forEach(a => {
      if (!a.success && new Date(a.attempted_at) >= fifteenMinutesAgo && a.ip_address) {
        if (!recentFailedByIP[a.ip_address]) {
          recentFailedByIP[a.ip_address] = { count: 0, email: a.email, lastAttempt: a.attempted_at };
        }
        recentFailedByIP[a.ip_address].count++;
        if (new Date(a.attempted_at) > new Date(recentFailedByIP[a.ip_address].lastAttempt)) {
          recentFailedByIP[a.ip_address].lastAttempt = a.attempted_at;
          recentFailedByIP[a.ip_address].email = a.email;
        }
      }
    });

    return Object.entries(recentFailedByIP)
      .filter(([_, data]) => data.count >= 5)
      .map(([ip, data]) => ({ ip, ...data }))
      .sort((a, b) => b.count - a.count);
  })();

  // Success rate
  const successRate = stats.total > 0 
    ? ((stats.successful / stats.total) * 100).toFixed(1) 
    : "0";

  // Prepare chart data - daily trend
  const dailyTrend = Array.from({ length: parseInt(dateRange) }, (_, i) => {
    const date = subDays(new Date(), parseInt(dateRange) - 1 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const dayAttempts = attempts?.filter(a => {
      const aDate = new Date(a.attempted_at);
      return aDate >= dayStart && aDate <= dayEnd;
    }) || [];
    
    return {
      date: format(date, "dd MMM", { locale: localeId }),
      berhasil: dayAttempts.filter(a => a.success).length,
      gagal: dayAttempts.filter(a => !a.success).length,
    };
  });

  // Hourly distribution for today
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const count = attempts?.filter(a => {
      const aDate = new Date(a.attempted_at);
      return aDate >= startOfDay(new Date()) && aDate.getHours() === hour;
    }).length || 0;
    const failed = attempts?.filter(a => {
      const aDate = new Date(a.attempted_at);
      return aDate >= startOfDay(new Date()) && aDate.getHours() === hour && !a.success;
    }).length || 0;
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      total: count,
      gagal: failed,
    };
  });

  // Success vs Failed pie chart
  const pieData = [
    { name: "Berhasil", value: stats.successful },
    { name: "Gagal", value: stats.failed },
  ];

  // Get top offenders (most failed attempts)
  const topOffenders = (() => {
    const emailCounts: Record<string, { failed: number; lastAttempt: string }> = {};
    
    attempts?.forEach(a => {
      if (!a.success) {
        if (!emailCounts[a.email]) {
          emailCounts[a.email] = { failed: 0, lastAttempt: a.attempted_at };
        }
        emailCounts[a.email].failed++;
        if (new Date(a.attempted_at) > new Date(emailCounts[a.email].lastAttempt)) {
          emailCounts[a.email].lastAttempt = a.attempted_at;
        }
      }
    });

    return Object.entries(emailCounts)
      .map(([email, data]) => ({ email, ...data }))
      .sort((a, b) => b.failed - a.failed)
      .slice(0, 5);
  })();

  // Filter attempts for table
  const filteredAttempts = attempts?.filter(a => {
    const matchesEmail = !searchEmail || a.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "success" && a.success) || 
      (filterStatus === "failed" && !a.success);
    return matchesEmail && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Login Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor percobaan login admin secara real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Hari ini</SelectItem>
              <SelectItem value="7">7 hari terakhir</SelectItem>
              <SelectItem value="30">30 hari terakhir</SelectItem>
              <SelectItem value="90">90 hari terakhir</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Alert for blocked IPs */}
      {blockedIPs.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Ban className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">IP Terblokir</p>
                <p className="text-sm text-muted-foreground">
                  {blockedIPs.length} IP sedang diblokir karena terlalu banyak percobaan gagal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert for high failed attempts today */}
      {stats.todayFailed >= 10 && (
        <Card className="border-orange-500 bg-orange-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-600">Peringatan</p>
                <p className="text-sm text-muted-foreground">
                  Terdeteksi {stats.todayFailed} percobaan login gagal hari ini
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Percobaan</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              dalam {dateRange} hari terakhir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successful} berhasil, {stats.failed} gagal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              {stats.todayFailed} gagal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IP Terblokir</CardTitle>
            <Ban className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{blockedIPs.length}</div>
            <p className="text-xs text-muted-foreground">
              dalam 15 menit terakhir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Harian
            </CardTitle>
            <CardDescription>
              Login berhasil vs gagal per hari
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="berhasil" fill={COLORS.success} name="Berhasil" />
                  <Bar dataKey="gagal" fill={COLORS.failed} name="Gagal" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Rasio Login
            </CardTitle>
            <CardDescription>
              Persentase berhasil vs gagal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stats.total > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    <Cell fill={COLORS.success} />
                    <Cell fill={COLORS.failed} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Distribusi Per Jam (Hari Ini)
          </CardTitle>
          <CardDescription>
            Percobaan login berdasarkan jam
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" className="text-xs" interval={2} />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Total"
                />
                <Line 
                  type="monotone" 
                  dataKey="gagal" 
                  stroke={COLORS.failed} 
                  strokeWidth={2}
                  name="Gagal"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Blocked IPs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              IP Terblokir Saat Ini
            </CardTitle>
            <CardDescription>
              IP dengan 5+ gagal login dalam 15 menit terakhir
            </CardDescription>
          </CardHeader>
          <CardContent>
            {blockedIPs.length > 0 ? (
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {blockedIPs.map((item, i) => (
                    <div key={item.ip} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-mono text-sm font-medium">{item.ip}</p>
                        <p className="text-xs text-muted-foreground">{item.email}</p>
                      </div>
                      <Badge variant="destructive">{item.count} gagal</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Tidak ada IP terblokir
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Offenders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Email dengan Login Gagal Terbanyak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topOffenders.length > 0 ? (
              <div className="space-y-3">
                {topOffenders.map((item, i) => (
                  <div key={item.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-destructive text-destructive-foreground" :
                        i === 1 ? "bg-orange-500 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">
                          {item.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Terakhir: {format(new Date(item.lastAttempt), "dd MMM HH:mm", { locale: localeId })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={i === 0 ? "destructive" : "secondary"}>
                      {item.failed} gagal
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Tidak ada data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle>Detail Percobaan Login</CardTitle>
              <CardDescription>Log semua percobaan login admin</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="success">Berhasil</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredAttempts.length > 0 ? (
                  filteredAttempts.slice(0, 100).map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(attempt.attempted_at), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                      </TableCell>
                      <TableCell>{attempt.email}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {attempt.ip_address || "-"}
                      </TableCell>
                      <TableCell>
                        {attempt.success ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Berhasil
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Gagal
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
