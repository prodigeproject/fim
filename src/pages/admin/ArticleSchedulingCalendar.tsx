import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  Clock, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays,
  Send,
  CheckCircle2
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  author_id: string;
}

export default function ArticleSchedulingCalendar() {
  const { user, isSuperAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkDate, setBulkDate] = useState<Date | undefined>(undefined);
  const [bulkTime, setBulkTime] = useState("09:00");

  // Fetch scheduled articles
  const { data: scheduledArticles, isLoading } = useQuery({
    queryKey: ["scheduled-articles", format(currentMonth, "yyyy-MM")],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, status, scheduled_at, created_at, author_id")
        .gte("scheduled_at", start.toISOString())
        .lte("scheduled_at", end.toISOString())
        .order("scheduled_at");
      
      if (error) throw error;
      return data as Article[];
    },
  });

  // Fetch draft articles for scheduling
  const { data: draftArticles } = useQuery({
    queryKey: ["draft-articles-for-scheduling"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, status, scheduled_at, created_at, author_id")
        .eq("status", "draft")
        .is("scheduled_at", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Article[];
    },
  });

  // Bulk schedule mutation
  const bulkScheduleMutation = useMutation({
    mutationFn: async ({ articleIds, scheduledAt }: { articleIds: string[]; scheduledAt: Date }) => {
      const { error } = await supabase
        .from("articles")
        .update({
          status: "scheduled",
          scheduled_at: scheduledAt.toISOString(),
        })
        .in("id", articleIds);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-articles"] });
      queryClient.invalidateQueries({ queryKey: ["draft-articles-for-scheduling"] });
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      toast.success(`${selectedArticles.length} artikel berhasil dijadwalkan`);
      setShowBulkDialog(false);
      setSelectedArticles([]);
      setBulkDate(undefined);
    },
    onError: (error: any) => {
      toast.error(`Gagal menjadwalkan: ${error.message}`);
    },
  });

  // Get articles for a specific date
  const getArticlesForDate = (date: Date) => {
    return scheduledArticles?.filter(article => 
      article.scheduled_at && isSameDay(new Date(article.scheduled_at), date)
    ) || [];
  };

  // Articles for selected date
  const selectedDateArticles = selectedDate ? getArticlesForDate(selectedDate) : [];

  // Handle bulk schedule
  const handleBulkSchedule = () => {
    if (!bulkDate || selectedArticles.length === 0) {
      toast.error("Pilih tanggal dan minimal satu artikel");
      return;
    }

    const [hours, minutes] = bulkTime.split(":").map(Number);
    const scheduledAt = new Date(bulkDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    bulkScheduleMutation.mutate({
      articleIds: selectedArticles,
      scheduledAt,
    });
  };

  // Toggle article selection
  const toggleArticle = (id: string) => {
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  // Calendar day modifier for scheduled articles
  const modifiers = useMemo(() => {
    const hasArticles: Date[] = [];
    scheduledArticles?.forEach(article => {
      if (article.scheduled_at) {
        hasArticles.push(new Date(article.scheduled_at));
      }
    });
    return { hasArticles };
  }, [scheduledArticles]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Kalender Jadwal Artikel
          </h1>
          <p className="text-muted-foreground">
            Kelola jadwal publikasi artikel dalam tampilan kalender
          </p>
        </div>
        <Button 
          onClick={() => setShowBulkDialog(true)}
          disabled={selectedArticles.length === 0}
        >
          <Clock className="h-4 w-4 mr-2" />
          Jadwalkan ({selectedArticles.length})
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {format(currentMonth, "MMMM yyyy", { locale: localeId })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
              Hari Ini
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                className="rounded-md border pointer-events-auto"
                modifiers={modifiers}
                modifiersStyles={{
                  hasArticles: {
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                    fontWeight: "bold",
                  },
                }}
                components={{
                  DayContent: ({ date }) => {
                    const articles = getArticlesForDate(date);
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        {date.getDate()}
                        {articles.length > 0 && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                      </div>
                    );
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Selected Date Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate 
                ? format(selectedDate, "dd MMMM yyyy", { locale: localeId })
                : "Pilih Tanggal"}
            </CardTitle>
            <CardDescription>
              {selectedDateArticles.length} artikel terjadwal
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateArticles.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {selectedDateArticles.map(article => (
                      <div key={article.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm line-clamp-2">{article.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(article.scheduled_at!), "HH:mm")}
                            </p>
                          </div>
                          <Badge variant="secondary" className="shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada artikel terjadwal</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pilih tanggal untuk melihat artikel</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Draft Articles for Bulk Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Artikel Draft (Belum Dijadwalkan)
          </CardTitle>
          <CardDescription>
            Pilih artikel untuk dijadwalkan secara massal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draftArticles && draftArticles.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedArticles.length === draftArticles.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedArticles(draftArticles.map(a => a.id));
                          } else {
                            setSelectedArticles([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftArticles.map(article => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedArticles.includes(article.id)}
                          onCheckedChange={() => toggleArticle(article.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(article.created_at), "dd MMM yyyy", { locale: localeId })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Draft</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Semua artikel sudah dijadwalkan atau dipublikasikan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Schedule Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwalkan {selectedArticles.length} Artikel</DialogTitle>
            <DialogDescription>
              Pilih tanggal dan waktu untuk mempublikasikan artikel secara otomatis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tanggal Publikasi</Label>
              <Calendar
                mode="single"
                selected={bulkDate}
                onSelect={setBulkDate}
                className="rounded-md border pointer-events-auto"
                disabled={(date) => date < new Date()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-time">Waktu Publikasi</Label>
              <Input
                id="bulk-time"
                type="time"
                value={bulkTime}
                onChange={(e) => setBulkTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleBulkSchedule}
              disabled={bulkScheduleMutation.isPending || !bulkDate}
            >
              {bulkScheduleMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Jadwalkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
