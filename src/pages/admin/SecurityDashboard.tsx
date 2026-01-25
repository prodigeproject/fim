import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  TrendingUp,
  Users,
  FileWarning,
  RefreshCw,
  Loader2,
  Calendar,
  Globe,
  Monitor,
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
} from "recharts";

interface UnauthorizedAttempt {
  id: string;
  user_id: string;
  username: string | null;
  email: string | null;
  attempted_path: string;
  user_role: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];

export default function SecurityDashboard() {
  const [dateRange, setDateRange] = useState("7");

  const { data: attempts, isLoading, refetch } = useQuery({
    queryKey: ["unauthorized-attempts", dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data, error } = await supabase
        .from("unauthorized_access_attempts")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UnauthorizedAttempt[];
    },
  });

  // Calculate statistics
  const stats = {
    total: attempts?.length || 0,
    today: attempts?.filter(a => 
      new Date(a.created_at) >= startOfDay(new Date())
    ).length || 0,
    uniqueUsers: new Set(attempts?.map(a => a.user_id)).size,
    topPath: attempts?.reduce((acc, curr) => {
      acc[curr.attempted_path] = (acc[curr.attempted_path] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const mostAccessedPath = stats.topPath 
    ? Object.entries(stats.topPath).sort((a, b) => b[1] - a[1])[0]
    : null;

  // Prepare chart data - daily trend
  const dailyTrend = Array.from({ length: parseInt(dateRange) }, (_, i) => {
    const date = subDays(new Date(), parseInt(dateRange) - 1 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const count = attempts?.filter(a => {
      const aDate = new Date(a.created_at);
      return aDate >= dayStart && aDate <= dayEnd;
    }).length || 0;
    return {
      date: format(date, "dd MMM", { locale: localeId }),
      count,
    };
  });

  // Prepare path distribution data
  const pathDistribution = Object.entries(stats.topPath || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({
      name: path.replace("/admin/", ""),
      value: count,
    }));

  // Hourly distribution for today
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const count = attempts?.filter(a => {
      const aDate = new Date(a.created_at);
      return aDate >= startOfDay(new Date()) && aDate.getHours() === hour;
    }).length || 0;
    return {
      hour: `${hour.toString().padStart(2, "0")}:00`,
      count,
    };
  });

  // Get top offenders
  const userAttempts = attempts?.reduce((acc, curr) => {
    const key = curr.user_id;
    if (!acc[key]) {
      acc[key] = {
        user_id: curr.user_id,
        username: curr.username,
        email: curr.email,
        count: 0,
        lastAttempt: curr.created_at,
      };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { user_id: string; username: string | null; email: string | null; count: number; lastAttempt: string }>);

  const topOffenders = Object.values(userAttempts || {})
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            Security Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor percobaan akses tidak sah ke halaman admin
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

      {/* Alert Banner */}
      {stats.today >= 10 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Peringatan Keamanan</p>
                <p className="text-sm text-muted-foreground">
                  Terdeteksi {stats.today} percobaan akses tidak sah hari ini. Periksa aktivitas mencurigakan.
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
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              percobaan akses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Unik</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              mencoba akses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Halaman Terbanyak</CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {mostAccessedPath ? mostAccessedPath[0].replace("/admin/", "") : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {mostAccessedPath ? `${mostAccessedPath[1]} percobaan` : "tidak ada data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Harian
            </CardTitle>
            <CardDescription>
              Percobaan akses tidak sah per hari
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
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
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    name="Percobaan"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Distribusi Halaman
            </CardTitle>
            <CardDescription>
              Halaman yang paling sering diakses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pathDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pathDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {pathDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
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

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Distribusi Per Jam (Hari Ini)
          </CardTitle>
          <CardDescription>
            Percobaan akses berdasarkan jam
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
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
                <Bar dataKey="count" fill="hsl(var(--destructive))" name="Percobaan" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Offenders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User dengan Percobaan Terbanyak
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topOffenders.length > 0 ? (
              <div className="space-y-4">
                {topOffenders.map((user, i) => (
                  <div key={user.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? "bg-destructive text-destructive-foreground" :
                        i === 1 ? "bg-orange-500 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {user.username || user.email || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Terakhir: {format(new Date(user.lastAttempt), "dd MMM HH:mm", { locale: localeId })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={i === 0 ? "destructive" : "secondary"}>
                      {user.count} percobaan
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

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Percobaan Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : attempts && attempts.length > 0 ? (
                <div className="space-y-3">
                  {attempts.slice(0, 10).map((attempt) => (
                    <div key={attempt.id} className="text-sm border-b pb-2 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {attempt.username || attempt.email || "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(attempt.created_at), "dd MMM HH:mm", { locale: localeId })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {attempt.attempted_path.replace("/admin/", "")}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {attempt.user_role || "unknown"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Tidak ada data
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Full Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Percobaan Akses</CardTitle>
          <CardDescription>
            Daftar lengkap percobaan akses tidak sah
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Halaman</TableHead>
                  <TableHead>User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : attempts && attempts.length > 0 ? (
                  attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(attempt.created_at), "dd MMM yyyy HH:mm:ss", { locale: localeId })}
                      </TableCell>
                      <TableCell>{attempt.username || "-"}</TableCell>
                      <TableCell>{attempt.email || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{attempt.user_role || "-"}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {attempt.attempted_path}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {attempt.user_agent || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data percobaan akses
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