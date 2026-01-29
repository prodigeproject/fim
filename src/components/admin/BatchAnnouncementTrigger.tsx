import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, Loader2, AlertCircle, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface Batch {
  id: string;
  batch_name: string;
  batch_number: number;
  admin_result_announcement_date: string | null;
  final_result_announcement_date: string | null;
}

interface RegistrationCounts {
  adminPassed: number;
  adminFailed: number;
  interviewPassed: number;
  interviewFailed: number;
}

export function BatchAnnouncementTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedStage, setSelectedStage] = useState<"administrasi" | "wawancara" | "">("");

  // Fetch batches
  const { data: batches } = useQuery({
    queryKey: ["batch-announcement-batches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_settings")
        .select("id, batch_name, batch_number, admin_result_announcement_date, final_result_announcement_date")
        .eq("is_active", true)
        .order("batch_number", { ascending: false });
      
      if (error) throw error;
      return data as Batch[];
    },
    enabled: isOpen,
  });

  // Fetch registration counts for selected batch
  const { data: counts } = useQuery({
    queryKey: ["batch-announcement-counts", selectedBatch],
    queryFn: async () => {
      if (!selectedBatch) return null;

      const [adminPassed, adminFailed, interviewPassed, interviewFailed] = await Promise.all([
        supabase
          .from("fim_registrations")
          .select("id", { count: "exact", head: true })
          .eq("batch_id", selectedBatch)
          .eq("selection_stage", "administrasi")
          .eq("selection_passed", true)
          .is("final_result", null),
        supabase
          .from("fim_registrations")
          .select("id", { count: "exact", head: true })
          .eq("batch_id", selectedBatch)
          .eq("selection_stage", "administrasi")
          .eq("selection_passed", false)
          .is("final_result", null),
        supabase
          .from("fim_registrations")
          .select("id", { count: "exact", head: true })
          .eq("batch_id", selectedBatch)
          .eq("selection_stage", "wawancara")
          .eq("selection_passed", true)
          .is("final_result", null),
        supabase
          .from("fim_registrations")
          .select("id", { count: "exact", head: true })
          .eq("batch_id", selectedBatch)
          .eq("selection_stage", "wawancara")
          .eq("selection_passed", false)
          .is("final_result", null),
      ]);

      return {
        adminPassed: adminPassed.count || 0,
        adminFailed: adminFailed.count || 0,
        interviewPassed: interviewPassed.count || 0,
        interviewFailed: interviewFailed.count || 0,
      } as RegistrationCounts;
    },
    enabled: !!selectedBatch,
  });

  const triggerMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("process-batch-announcements", {
        body: {
          manual: true,
          batch_id: selectedBatch || undefined,
          stage: selectedStage || undefined,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const sentCount = data?.sent || 0;
      if (sentCount > 0) {
        toast.success(`${sentCount} email pengumuman berhasil dikirim`);
      } else {
        toast.info("Tidak ada email yang perlu dikirim. Pastikan peserta sudah ditandai Lolos/Tidak Lolos.");
      }
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Gagal mengirim pengumuman: ${error.message}`);
    },
  });

  const selectedBatchData = batches?.find(b => b.id === selectedBatch);

  const getAffectedCount = () => {
    if (!counts) return 0;
    if (!selectedStage) {
      return counts.adminPassed + counts.adminFailed + counts.interviewPassed + counts.interviewFailed;
    }
    if (selectedStage === "administrasi") {
      return counts.adminPassed + counts.adminFailed;
    }
    return counts.interviewPassed + counts.interviewFailed;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Megaphone className="h-4 w-4 mr-2" />
          Kirim Pengumuman
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kirim Pengumuman Batch</DialogTitle>
          <DialogDescription>
            Kirim email pengumuman hasil seleksi secara manual ke peserta yang sudah ditandai Lolos/Tidak Lolos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pilih Batch</Label>
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih batch" />
              </SelectTrigger>
              <SelectContent>
                {batches?.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.batch_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedBatchData && (
            <div className="text-sm text-muted-foreground space-y-1">
              {selectedBatchData.admin_result_announcement_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Pengumuman Admin: {format(new Date(selectedBatchData.admin_result_announcement_date), "d MMMM yyyy", { locale: localeId })}</span>
                </div>
              )}
              {selectedBatchData.final_result_announcement_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Pengumuman Final: {format(new Date(selectedBatchData.final_result_announcement_date), "d MMMM yyyy", { locale: localeId })}</span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Tahap Seleksi (Opsional)</Label>
            <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Semua tahap" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua tahap</SelectItem>
                <SelectItem value="administrasi">Seleksi Administrasi</SelectItem>
                <SelectItem value="wawancara">Seleksi Wawancara</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {counts && selectedBatch && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                Peserta yang akan menerima email:
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(!selectedStage || selectedStage === "administrasi") && (
                  <>
                    <div className="text-green-600">Lolos Admin: {counts.adminPassed}</div>
                    <div className="text-red-600">Tidak Lolos Admin: {counts.adminFailed}</div>
                  </>
                )}
                {(!selectedStage || selectedStage === "wawancara") && (
                  <>
                    <div className="text-green-600">Lolos Wawancara: {counts.interviewPassed}</div>
                    <div className="text-red-600">Tidak Lolos Wawancara: {counts.interviewFailed}</div>
                  </>
                )}
              </div>
              <div className="text-sm font-medium pt-2 border-t">
                Total: {getAffectedCount()} peserta
              </div>
            </div>
          )}

          {getAffectedCount() === 0 && selectedBatch && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tidak ada peserta</AlertTitle>
              <AlertDescription>
                Tidak ada peserta yang perlu diumumkan. Pastikan peserta sudah ditandai Lolos/Tidak Lolos di halaman manajemen pendaftaran.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={() => triggerMutation.mutate()}
            disabled={!selectedBatch || getAffectedCount() === 0 || triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Megaphone className="h-4 w-4 mr-2" />
                Kirim Pengumuman
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
