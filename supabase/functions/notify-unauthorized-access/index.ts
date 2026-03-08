import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface UnauthorizedAccessRequest {
  userId: string;
  username: string;
  email: string;
  attemptedPath: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
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
    // ── Auth check ──────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const {
      userId, username, email, attemptedPath, userRole, ipAddress, userAgent,
    }: UnauthorizedAccessRequest = await req.json();

    console.log("Recording unauthorized access attempt for user:", username);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Record the attempt
    const { error: insertError } = await supabase
      .from("unauthorized_access_attempts")
      .insert({
        user_id: userId, username, email,
        attempted_path: attemptedPath, user_role: userRole,
        ip_address: ipAddress, user_agent: userAgent,
      });

    if (insertError) console.error("Error inserting unauthorized access attempt:", insertError);

    // Count recent attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase
      .from("unauthorized_access_attempts")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    const attemptCount = recentAttempts?.length || 0;

    // Send email alert at threshold
    if (attemptCount >= 3 && attemptCount % 3 === 0) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

      const formattedTime = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta", weekday: "long", year: "numeric",
        month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit",
      });

      const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333}.container{max-width:600px;margin:0 auto;padding:20px}.header{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;padding:20px;text-align:center;border-radius:8px 8px 0 0}.content{background:#f9f9f9;padding:20px;border:1px solid #e0e0e0}.info-table{width:100%;border-collapse:collapse}.info-table td{padding:10px;border-bottom:1px solid #e0e0e0}.info-table td:first-child{font-weight:bold;color:#666;width:140px}.footer{background:#f0f0f0;padding:15px;text-align:center;font-size:12px;color:#666;border-radius:0 0 8px 8px}.alert-box{background:#fef2f2;border:1px solid #fecaca;border-left:4px solid #dc2626;padding:15px;border-radius:8px;margin:15px 0}</style></head><body><div class="container"><div class="header"><h1 style="margin:0">🚨 Peringatan Keamanan</h1><p style="margin:10px 0 0;opacity:.9">Percobaan Akses Tidak Sah Terdeteksi</p></div><div class="content"><div class="alert-box"><strong>⚠️ Perhatian!</strong><br>Pengguna berikut telah mencoba mengakses halaman yang tidak diizinkan sebanyak <strong>${attemptCount} kali</strong> dalam 1 jam terakhir.</div><table class="info-table"><tr><td>Username</td><td><strong>${username}</strong></td></tr><tr><td>Email</td><td>${email}</td></tr><tr><td>Role</td><td>${userRole}</td></tr><tr><td>Halaman Dituju</td><td><code>${attemptedPath}</code></td></tr><tr><td>Waktu</td><td>${formattedTime} WIB</td></tr><tr><td>IP Address</td><td><code>${ipAddress || "N/A"}</code></td></tr></table></div><div class="footer"><p>© ${new Date().getFullYear()} Forum Indonesia Muda</p></div></div></body></html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "FIM Security <onboarding@resend.dev>",
          to: ["web@forumindonesiamuda.org"],
          subject: `🚨 [SECURITY] Akses Tidak Sah Berulang: ${username}`,
          html: emailHtml,
        }),
      });

      return json({ success: true, emailSent: true, attemptCount });
    }

    return json({ success: true, emailSent: false, attemptCount });
  } catch (error: any) {
    console.error("Error in notify-unauthorized-access:", error);
    return json({ success: false, error: error.message }, 500);
  }
};

serve(handler);
