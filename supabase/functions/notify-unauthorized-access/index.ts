import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      username, 
      email,
      attemptedPath,
      userRole,
      ipAddress, 
      userAgent 
    }: UnauthorizedAccessRequest = await req.json();

    console.log("Recording unauthorized access attempt for user:", username);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Record the attempt
    const { error: insertError } = await supabase
      .from("unauthorized_access_attempts")
      .insert({
        user_id: userId,
        username,
        email,
        attempted_path: attemptedPath,
        user_role: userRole,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error("Error inserting unauthorized access attempt:", insertError);
    }

    // Check how many attempts this user has made in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentAttempts, error: countError } = await supabase
      .from("unauthorized_access_attempts")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Error counting attempts:", countError);
    }

    const attemptCount = recentAttempts?.length || 0;
    console.log(`User ${username} has ${attemptCount} unauthorized attempts in the last hour`);

    // If this is the 3rd attempt or more, send email notification
    if (attemptCount >= 3 && attemptCount % 3 === 0) {
      console.log("Threshold reached, sending email notification to super admins");

      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not configured");
      }

      const formattedTime = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
            .info-table td:first-child { font-weight: bold; color: #666; width: 140px; }
            .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
            .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .badge-danger { background: #fee2e2; color: #dc2626; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🚨 Peringatan Keamanan</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Percobaan Akses Tidak Sah Terdeteksi</p>
            </div>
            <div class="content">
              <div class="alert-box">
                <strong>⚠️ Perhatian!</strong><br>
                Pengguna berikut telah mencoba mengakses halaman yang tidak diizinkan sebanyak <strong>${attemptCount} kali</strong> dalam 1 jam terakhir.
              </div>
              
              <p>Detail percobaan terakhir:</p>
              
              <table class="info-table">
                <tr>
                  <td>Username</td>
                  <td><strong>${username}</strong></td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>${email}</td>
                </tr>
                <tr>
                  <td>Role</td>
                  <td><span class="badge badge-danger">${userRole === 'moderator' ? 'Moderator' : userRole}</span></td>
                </tr>
                <tr>
                  <td>Halaman Dituju</td>
                  <td><code>${attemptedPath}</code></td>
                </tr>
                <tr>
                  <td>Waktu</td>
                  <td>${formattedTime} WIB</td>
                </tr>
                <tr>
                  <td>IP Address</td>
                  <td><code>${ipAddress || 'Tidak tersedia'}</code></td>
                </tr>
                <tr>
                  <td>Browser/Device</td>
                  <td style="font-size: 11px; word-break: break-all;">${userAgent || 'Tidak tersedia'}</td>
                </tr>
              </table>

              <p style="margin-top: 20px; padding: 15px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <strong>📋 Tindakan yang Disarankan:</strong><br>
                1. Periksa aktivitas user di Audit Logs<br>
                2. Pertimbangkan untuk menonaktifkan akun jika mencurigakan<br>
                3. Hubungi user untuk klarifikasi jika diperlukan
              </p>
            </div>
            <div class="footer">
              <p>Email ini dikirim secara otomatis oleh sistem keamanan Admin Panel FIM.</p>
              <p>© ${new Date().getFullYear()} Forum Indonesia Muda</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FIM Security <onboarding@resend.dev>",
          to: ["web@forumindonesiamuda.org"],
          subject: `🚨 [SECURITY] Akses Tidak Sah Berulang: ${username}`,
          html: emailHtml,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Resend API error:", result);
        throw new Error(result.message || "Failed to send email");
      }

      console.log("Security alert email sent successfully:", result);

      return new Response(
        JSON.stringify({ 
          success: true, 
          emailSent: true, 
          attemptCount,
          messageId: result.id 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent: false, 
        attemptCount,
        message: "Attempt recorded" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in notify-unauthorized-access:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
