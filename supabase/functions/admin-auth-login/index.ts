import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LoginRequest {
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email dan password wajib diisi" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get real IP from headers
    const realIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                   req.headers.get("x-real-ip") ||
                   req.headers.get("cf-connecting-ip") ||
                   "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";

    console.log(`Login attempt from IP: ${realIp}, email: ${email}`);

    // Initialize Supabase client with service role for rate limit check
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit with REAL IP
    const { data: rateLimitData, error: rateLimitError } = await supabaseAdmin.rpc(
      "check_login_rate_limit",
      {
        p_email: email.toLowerCase(),
        p_ip: realIp,
      }
    );

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    }

    // Check if blocked
    if (rateLimitData?.[0]?.is_blocked) {
      console.log(`Login blocked for ${email} from IP ${realIp} - too many attempts`);
      
      // Log failed attempt
      await supabaseAdmin.from("login_attempts").insert({
        email: email.toLowerCase(),
        ip_address: realIp,
        success: false,
      });

      return new Response(
        JSON.stringify({
          error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit.",
          blocked: true,
          shouldShowCaptcha: true,
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if should show captcha (3+ failed attempts)
    const shouldShowCaptcha = rateLimitData?.[0]?.should_show_captcha || false;

    // Perform authentication using anon key (not service role)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    // Log login attempt with REAL IP
    await supabaseAdmin.from("login_attempts").insert({
      email: email.toLowerCase(),
      ip_address: realIp,
      success: !authError,
    });

    if (authError) {
      console.log(`Login failed for ${email}: ${authError.message}`);
      
      // Return remaining attempts info
      const attemptsCount = (rateLimitData?.[0]?.attempts_count || 0) + 1;
      const remainingAttempts = Math.max(0, 5 - attemptsCount);

      return new Response(
        JSON.stringify({
          error: authError.message === "Invalid login credentials" 
            ? "Email atau password salah" 
            : authError.message,
          remainingAttempts,
          shouldShowCaptcha: attemptsCount >= 3,
        }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Login gagal" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (!roleData) {
      // No admin role - sign out and reject
      await supabaseAuth.auth.signOut();
      console.log(`User ${email} has no admin role`);
      
      return new Response(
        JSON.stringify({ error: "Akun tidak memiliki akses admin" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if account is active
    const { data: profileData } = await supabaseAdmin
      .from("profiles")
      .select("is_active, username, full_name, must_change_password")
      .eq("id", authData.user.id)
      .single();

    if (profileData && !profileData.is_active) {
      await supabaseAuth.auth.signOut();
      console.log(`User ${email} account is inactive`);
      
      return new Response(
        JSON.stringify({ error: "Akun telah dinonaktifkan. Hubungi Super Admin." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log successful login to audit
    await supabaseAdmin.rpc("log_audit_event", {
      p_user_id: authData.user.id,
      p_action: "login",
      p_details: { email, ip_address: realIp, user_agent: userAgent },
      p_ip_address: realIp,
      p_user_agent: userAgent,
    });

    // Update last login
    await supabaseAdmin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", authData.user.id);

    // Create/update admin session with real IP
    const sessionToken = crypto.randomUUID();
    await supabaseAdmin.from("admin_sessions").upsert({
      user_id: authData.user.id,
      session_token: sessionToken,
      ip_address: realIp,
      user_agent: userAgent,
      device_info: parseUserAgent(userAgent),
      is_current: true,
      last_activity: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    });

    // Send login notification (fire and forget)
    fetch(`${supabaseUrl}/functions/v1/notify-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        userId: authData.user.id,
        email: authData.user.email,
        username: profileData?.username || email.split("@")[0],
        role: roleData.role,
        ipAddress: realIp,
        userAgent: userAgent,
        loginTime: new Date().toISOString(),
      }),
    }).catch((err) => {
      console.error("Failed to send login notification:", err);
    });

    console.log(`Login successful for ${email} from IP ${realIp}`);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_at: authData.session?.expires_at,
        },
        profile: {
          username: profileData?.username,
          full_name: profileData?.full_name,
          must_change_password: profileData?.must_change_password,
        },
        role: roleData.role,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

// Parse user agent to get device info
function parseUserAgent(ua: string): { browser: string; os: string; device: string } {
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone")) os = "iOS";

  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) {
    device = "Mobile";
  } else if (ua.includes("Tablet") || ua.includes("iPad")) {
    device = "Tablet";
  }

  return { browser, os, device };
}

serve(handler);