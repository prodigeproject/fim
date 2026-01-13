import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationSettings {
  id: string;
  batch_name: string;
  batch_number: number;
  is_registration_open: boolean;
  registration_start_date: string | null;
  registration_end_date: string | null;
  max_participants: number | null;
  description: string | null;
  is_active: boolean;
}

export function useRegistrationStatus() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["registration-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_settings")
        .select("*")
        .eq("is_active", true)
        .order("batch_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as RegistrationSettings | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isRegistrationOpen = data?.is_registration_open ?? false;
  const currentBatch = data;

  return {
    isRegistrationOpen,
    currentBatch,
    isLoading,
    error,
    refetch,
  };
}
