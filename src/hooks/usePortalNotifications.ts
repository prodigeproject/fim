import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NotificationOptions {
  registrationId?: string;
  userId?: string;
  enabled?: boolean;
}

interface RegistrationChange {
  new: {
    id: string;
    selection_stage: string;
    final_result: string | null;
    interview_date: string | null;
    selection_passed: boolean | null;
  };
  old: {
    selection_stage: string;
    final_result: string | null;
    interview_date: string | null;
    selection_passed: boolean | null;
  };
}

export function usePortalNotifications({ 
  registrationId, 
  userId,
  enabled = true 
}: NotificationOptions = {}) {
  const notificationPermission = useRef<NotificationPermission>("default");

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      notificationPermission.current = "granted";
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      notificationPermission.current = permission;
      return permission === "granted";
    }

    return false;
  }, []);

  // Send browser push notification
  const sendBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if (notificationPermission.current === "granted") {
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || "/favicon.png",
          badge: "/favicon.png",
          tag: "fim-portal",
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto close after 10 seconds
        setTimeout(() => notification.close(), 10000);
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }
  }, []);

  // Handle registration changes
  const handleRegistrationChange = useCallback((payload: RegistrationChange) => {
    const { new: newRecord, old: oldRecord } = payload;

    // Selection stage changed
    if (newRecord.selection_stage !== oldRecord.selection_stage) {
      const stageLabels: Record<string, string> = {
        administrasi: "Seleksi Administrasi",
        wawancara: "Seleksi Wawancara",
        pengumuman: "Pengumuman Hasil",
      };

      const newStage = stageLabels[newRecord.selection_stage] || newRecord.selection_stage;
      
      toast.success("Status Seleksi Diperbarui", {
        description: `Anda telah memasuki tahap: ${newStage}`,
        duration: 8000,
      });

      sendBrowserNotification(
        "Status Seleksi Diperbarui",
        `Anda telah memasuki tahap: ${newStage}`
      );
    }

    // Interview scheduled
    if (newRecord.interview_date && !oldRecord.interview_date) {
      const interviewDate = new Date(newRecord.interview_date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      toast.info("Jadwal Wawancara Ditentukan", {
        description: `Wawancara dijadwalkan pada: ${interviewDate}`,
        duration: 10000,
      });

      sendBrowserNotification(
        "Jadwal Wawancara Ditentukan",
        `Wawancara dijadwalkan pada: ${interviewDate}`
      );
    }

    // Interview date changed
    if (
      newRecord.interview_date && 
      oldRecord.interview_date && 
      newRecord.interview_date !== oldRecord.interview_date
    ) {
      const newDate = new Date(newRecord.interview_date).toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      toast.warning("Jadwal Wawancara Diubah", {
        description: `Jadwal baru: ${newDate}`,
        duration: 10000,
      });

      sendBrowserNotification(
        "Jadwal Wawancara Diubah",
        `Jadwal baru: ${newDate}`
      );
    }

    // Selection passed in administrasi
    if (
      newRecord.selection_stage === "administrasi" &&
      newRecord.selection_passed === true &&
      oldRecord.selection_passed !== true
    ) {
      toast.success("Selamat! Anda Lolos Administrasi", {
        description: "Tahap selanjutnya adalah wawancara. Pantau terus status Anda.",
        duration: 10000,
      });

      sendBrowserNotification(
        "Selamat! Anda Lolos Administrasi",
        "Tahap selanjutnya adalah wawancara. Pantau terus status Anda."
      );
    }

    // Final result announced
    if (newRecord.final_result && !oldRecord.final_result) {
      if (newRecord.final_result === "lolos") {
        toast.success("🎉 Selamat! Anda Diterima", {
          description: "Anda diterima sebagai peserta Forum Indonesia Muda!",
          duration: 15000,
        });

        sendBrowserNotification(
          "🎉 Selamat! Anda Diterima",
          "Anda diterima sebagai peserta Forum Indonesia Muda!"
        );
      } else {
        toast.info("Pengumuman Hasil Seleksi", {
          description: "Hasil seleksi telah diumumkan. Silakan cek dashboard Anda.",
          duration: 10000,
        });

        sendBrowserNotification(
          "Pengumuman Hasil Seleksi",
          "Hasil seleksi telah diumumkan. Silakan cek dashboard Anda."
        );
      }
    }

  }, [sendBrowserNotification]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!enabled || !registrationId) return;

    // Request permission on mount
    requestPermission();

    const channel = supabase
      .channel(`registration-status-${registrationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fim_registrations",
          filter: `id=eq.${registrationId}`,
        },
        (payload) => {
          handleRegistrationChange(payload as unknown as RegistrationChange);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, registrationId, handleRegistrationChange, requestPermission]);

  // Subscribe to interview schedule changes
  useEffect(() => {
    if (!enabled || !registrationId) return;

    const channel = supabase
      .channel(`interview-schedule-${registrationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "interview_schedules",
          filter: `registration_id=eq.${registrationId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast.info("Jadwal Wawancara Dibuat", {
              description: "Jadwal wawancara Anda telah dibuat. Cek detailnya di dashboard.",
              duration: 8000,
            });
          } else if (payload.eventType === "UPDATE") {
            const newData = payload.new as { status?: string };
            if (newData.status === "completed") {
              toast.success("Wawancara Selesai", {
                description: "Terima kasih telah mengikuti wawancara. Hasil akan diumumkan segera.",
                duration: 10000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, registrationId]);

  return {
    requestPermission,
    sendBrowserNotification,
    notificationPermission: notificationPermission.current,
  };
}
