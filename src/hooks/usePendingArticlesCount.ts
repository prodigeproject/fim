import { useQuery } from "@tanstack/react-query";
import { adminSupabase as supabase } from "@/integrations/supabase/adminClient";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useEffect } from "react";

export function usePendingArticlesCount() {
  const { isSuperAdmin } = useAdminAuth();

  const { data: count = 0, refetch } = useQuery({
    queryKey: ["pending-articles-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("needs_approval", true);

      if (error) throw error;
      return count || 0;
    },
    enabled: isSuperAdmin,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Listen for realtime updates
  useEffect(() => {
    if (!isSuperAdmin) return;

    const channel = supabase
      .channel("pending-articles-count")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "articles",
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
