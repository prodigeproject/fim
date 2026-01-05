import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

export function useNewRegistrationsCount() {
  const { isSuperAdmin } = useAdminAuth();

  const { data: count = 0, refetch } = useQuery({
    queryKey: ["new-registrations-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("fim_registrations")
        .select("*", { count: "exact", head: true })
        .eq("registration_status", "pending");

      if (error) throw error;
      return count || 0;
    },
    enabled: isSuperAdmin,
    refetchInterval: 30000,
  });

  // Listen for realtime updates
  useEffect(() => {
    if (!isSuperAdmin) return;

    const channel = supabase
      .channel("new-registrations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "fim_registrations",
        },
        (payload) => {
          // Show toast notification for new registration
          const newReg = payload.new as { full_name: string; email: string };
          toast.info(`Pendaftaran baru: ${newReg.full_name}`, {
            description: newReg.email,
            action: {
              label: "Lihat",
              onClick: () => window.location.href = "/admin/registrations",
            },
          });
          refetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fim_registrations",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSuperAdmin, refetch]);

  return count;
}
