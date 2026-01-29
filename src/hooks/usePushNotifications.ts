import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function usePushNotifications() {
  const { isSuperAdmin, user, role } = useAdminAuth();
  const isAdmin = role === "super_admin" || (role as string) === "admin" || role === "moderator";
  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  // Show notification
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        icon: "/favicon.png",
        badge: "/favicon.png",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  }, []);

  // Listen to pending articles for super admin
  useEffect(() => {
    if (!isSuperAdmin || !user) return;

    // Request permission on mount
    requestPermission();

    // Subscribe to new articles that need approval
    const channel = supabase
      .channel("pending-articles-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "articles",
          filter: "needs_approval=eq.true",
        },
        async (payload) => {
          // Check if this is a new approval request
          const oldData = payload.old as { needs_approval?: boolean };
          const newData = payload.new as { 
            needs_approval?: boolean; 
            title?: string; 
            author_id?: string;
          };

          if (!oldData.needs_approval && newData.needs_approval) {
            // Fetch author info
            let authorName = "Moderator";
            if (newData.author_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("username, full_name")
                .eq("id", newData.author_id)
                .single();
              
              if (profile) {
                authorName = profile.full_name || profile.username;
              }
            }

            showNotification("Artikel Baru Menunggu Persetujuan", {
              body: `"${newData.title}" oleh ${authorName} perlu direview`,
              tag: `article-approval-${payload.new.id}`,
              requireInteraction: true,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "articles",
          filter: "needs_approval=eq.true",
        },
        async (payload) => {
          const newData = payload.new as { 
            title?: string; 
            author_id?: string;
            id?: string;
          };

          // Fetch author info
          let authorName = "Moderator";
          if (newData.author_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, full_name")
              .eq("id", newData.author_id)
              .single();
            
            if (profile) {
              authorName = profile.full_name || profile.username;
            }
          }

          showNotification("Artikel Baru Menunggu Persetujuan", {
            body: `"${newData.title}" oleh ${authorName} perlu direview`,
            tag: `article-approval-${newData.id}`,
            requireInteraction: true,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin, user, requestPermission, showNotification]);

  // Listen to new registrations for all admins
  useEffect(() => {
    if (!isAdmin || !user) return;

    requestPermission();

    const channel = supabase
      .channel("new-registrations-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fim_registrations",
        },
        (payload) => {
          const newData = payload.new as { 
            full_name?: string;
            email?: string;
            id?: string;
          };

          showNotification("Pendaftar Baru", {
            body: `${newData.full_name} (${newData.email}) telah mendaftar`,
            tag: `registration-${newData.id}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, user, requestPermission, showNotification]);

  // Listen to interview schedules for all admins
  useEffect(() => {
    if (!isAdmin || !user) return;

    const channel = supabase
      .channel("interview-schedule-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interview_schedules",
        },
        async (payload) => {
          const newData = payload.new as { 
            registration_id?: string;
            scheduled_date?: string;
            scheduled_time?: string;
            id?: string;
          };

          // Fetch registrant info
          let registrantName = "Peserta";
          if (newData.registration_id) {
            const { data: registration } = await supabase
              .from("fim_registrations")
              .select("full_name")
              .eq("id", newData.registration_id)
              .single();
            
            if (registration) {
              registrantName = registration.full_name;
            }
          }

          showNotification("Wawancara Dijadwalkan", {
            body: `${registrantName} - ${newData.scheduled_date} pukul ${newData.scheduled_time}`,
            tag: `interview-${newData.id}`,
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "interview_schedules",
        },
        async (payload) => {
          const oldData = payload.old as { status?: string };
          const newData = payload.new as { 
            registration_id?: string;
            status?: string;
            id?: string;
          };

          // Notify on status change to completed
          if (oldData.status !== "completed" && newData.status === "completed") {
            let registrantName = "Peserta";
            if (newData.registration_id) {
              const { data: registration } = await supabase
                .from("fim_registrations")
                .select("full_name")
                .eq("id", newData.registration_id)
                .single();
              
              if (registration) {
                registrantName = registration.full_name;
              }
            }

            showNotification("Wawancara Selesai", {
              body: `Wawancara ${registrantName} telah selesai`,
              tag: `interview-completed-${newData.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, user, showNotification]);

  return { requestPermission, showNotification };
}
