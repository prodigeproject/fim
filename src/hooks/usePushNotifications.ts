import { useEffect, useCallback } from "react";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

export function usePushNotifications() {
  const { isSuperAdmin, user } = useAdminAuth();

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

  return { requestPermission, showNotification };
}
