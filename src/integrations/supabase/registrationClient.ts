import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

/**
 * Registrant-scoped backend client.
 * Uses a dedicated storageKey so registrant sessions don't overwrite admin sessions.
 */
export const registrationSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    storageKey: "fim_registration_session",
    persistSession: true,
    autoRefreshToken: true,
  },
});
