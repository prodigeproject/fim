import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecaptchaPublicConfig {
  site_key: string;
  enabled_signup: boolean;
  enabled_login: boolean;
  enabled_forgot_password: boolean;
  enabled_admin_login: boolean;
}

export function useRecaptchaConfig() {
  return useQuery({
    queryKey: ["recaptcha-public-config"],
    queryFn: async (): Promise<RecaptchaPublicConfig> => {
      const { data, error } = await supabase.rpc("get_recaptcha_public_config");

      if (error) {
        console.error("Error fetching recaptcha config:", error);
        return {
          site_key: "",
          enabled_signup: false,
          enabled_login: false,
          enabled_forgot_password: false,
          enabled_admin_login: false,
        };
      }

      // RPC returns an array, get first row
      const config = Array.isArray(data) ? data[0] : data;
      
      return {
        site_key: config?.site_key || "",
        enabled_signup: config?.enabled_signup || false,
        enabled_login: config?.enabled_login || false,
        enabled_forgot_password: config?.enabled_forgot_password || false,
        enabled_admin_login: config?.enabled_admin_login || false,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
