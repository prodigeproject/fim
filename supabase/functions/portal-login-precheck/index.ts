import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PrecheckRequest {
  email: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { email }: PrecheckRequest = await req.json();
    const normalizedEmail = (email || "").toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return json({ error: "Email tidak valid" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Check block list first
    const { data: blocked } = await supabase
      .from("blocked_registrations")
      .select("id, blocked_reason")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (blocked) {
      return json({
        exists: false,
        is_blocked: true,
        blocked_reason: blocked.blocked_reason ?? null,
      });
    }

    // Check registration existence & verification flag
    const { data: reg, error: regError } = await supabase
      .from("fim_registrations")
      .select("id, auth_user_id, email_verified")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (regError) {
      console.error("portal-login-precheck regError:", regError);
      return json({ error: "Failed to check registration" }, 500);
    }

    if (!reg) {
      return json({ exists: false, is_blocked: false });
    }

    return json({
      exists: true,
      registration_id: reg.id,
      auth_user_id: reg.auth_user_id,
      email_verified: !!reg.email_verified,
      is_blocked: false,
    });
  } catch (e: any) {
    console.error("portal-login-precheck error:", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
