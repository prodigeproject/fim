import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface LoginRequest {
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const cors = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...cors },
    });

  try {
    let email: string, password: string;
    try {
      const body: LoginRequest = await req.json();
      email = body.email;
      password = body.password;
    } catch {
      return json({ error: "Request body tidak valid" }, 400);
    }

    if (!email || !password) {
      return json({ error: "Email dan password wajib diisi" }, 400);
    }

    const realIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                   req.headers.get("x-real-ip") ||
                   req.headers.get("cf-connecting-ip") ||
                   "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    console.log(`Login attempt from IP: ${realIp}, email: ${email}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_login_rate_limit",
      { p_email: email.toLowerCase(), p_ip: realIp }
    );

    if (rateLimitError) console.error("Rate limit check error:", rateLimitError);

    if (rateLimitData?.[0]?.is_blocked) {
      console.log(`Login blocked for ${email} from IP ${realIp}`);
      await supabaseAdmin.from("login_attempts").insert({
        email: email.toLowerCase(), ip_address: realIp, success: false,
      });
      return json({
        error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
        blocked: true, shouldShowCaptcha: true,
      }, 429);
    }

    const shouldShowCaptcha = rateLimitData?.[0]?.should_show_captcha || false;

    // Authenticate
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email, password,
    });

    // Log attempt
    await supabaseAdmin.from("login_attempts").insert({
      email: email.toLowerCase(), ip_address: realIp, success: !authError,
    });

    if (authError) {
      const attemptsCount = (rateLimitData?.[0]?.attempts_count || 0) + 1;
      return json({
        error: authError.message === "Invalid login credentials"
          ? "Email atau password salah" : authError.message,
        remainingAttempts: Math.max(0, 5 - attemptsCount),
        shouldShowCaptcha: attemptsCount >= 3,
      }, 401);
    }

    if (!authData.user) return json({ error: "Login gagal" }, 401);

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", authData.user.id).maybeSingle();

    if (!roleData) {
      await supabaseAuth.auth.signOut();
      return json({ error: "Akun tidak memiliki akses admin" }, 403);
    }

    // Check active
    const { data: profileData } = await supabaseAdmin
      .from("profiles").select("is_active, username, full_name, must_change_password")
      .eq("id", authData.user.id).single();

    if (profileData && !profileData.is_active) {
      await supabaseAuth.auth.signOut();
      return json({ error: "Akun telah dinonaktifkan. Hubungi Super Admin." }, 403);
    }

    // Audit
    await supabaseAdmin.rpc("log_audit_event", {
      p_user_id: authData.user.id, p_action: "login",
      p_details: { email, ip_address: realIp, user_agent: userAgent },
      p_ip_address: realIp, p_user_agent: userAgent,
    });

    await supabaseAdmin.from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", authData.user.id);

    // Session
    const sessionToken = crypto.randomUUID();
    await supabaseAdmin.from("admin_sessions").upsert({
      user_id: authData.user.id, session_token: sessionToken,
      ip_address: realIp, user_agent: userAgent,
      device_info: parseUserAgent(userAgent),
      is_current: true, last_activity: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    // Notify (fire & forget)
    fetch(`${supabaseUrl}/functions/v1/notify-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({
        userId: authData.user.id, email: authData.user.email,
        username: profileData?.username || email.split("@")[0],
        role: roleData.role, ipAddress: realIp, userAgent,
        loginTime: new Date().toISOString(),
      }),
    }).catch((err) => console.error("Failed to send login notification:", err));

    return json({
      success: true,
      user: { id: authData.user.id, email: authData.user.email },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      },
      profile: {
        username: profileData?.username, full_name: profileData?.full_name,
        must_change_password: profileData?.must_change_password,
      },
      role: roleData.role,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
};

function parseUserAgent(ua: string) {
  let browser = "Unknown", os = "Unknown", device = "Desktop";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS";
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) device = "Mobile";
  else if (ua.includes("Tablet") || ua.includes("iPad")) device = "Tablet";
  return { browser, os, device };
}

serve(handler);
