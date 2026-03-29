import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface PrecheckRequest {
  email: string;
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const cors = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...cors },
    });

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

    // ── Rate limiting ───────────────────────────────────────
    // Check both IP-based and email-based limits (stricter)
    const realIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                   req.headers.get("x-real-ip") ||
                   req.headers.get("cf-connecting-ip") ||
                   "unknown";

    // IP rate limit: 5 attempts per 15 minutes
    const { data: ipRateData } = await supabase.rpc("check_rate_limit", {
      p_identifier: realIp,
      p_endpoint: "portal-login",
      p_max_requests: 5,
      p_window_seconds: 900,
    });

    if (ipRateData?.[0] && !ipRateData[0].allowed) {
      console.log(`Portal login IP rate limited: ${realIp}`);
      return json({
        error: "Terlalu banyak percobaan dari jaringan ini. Coba lagi dalam 15 menit.",
        rate_limited: true,
      }, 429);
    }

    // Email rate limit: 5 attempts per 15 minutes per email
    const { data: emailRateData } = await supabase.rpc("check_rate_limit", {
      p_identifier: `email:${normalizedEmail}`,
      p_endpoint: "portal-login",
      p_max_requests: 5,
      p_window_seconds: 900,
    });

    if (emailRateData?.[0] && !emailRateData[0].allowed) {
      console.log(`Portal login email rate limited: ${normalizedEmail}`);
      return json({
        error: "Terlalu banyak percobaan untuk akun ini. Coba lagi dalam 15 menit.",
        rate_limited: true,
      }, 429);
    }

    // Check block list
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

    // Check registration
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
