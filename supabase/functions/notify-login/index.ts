import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LoginNotificationRequest {
  userId: string;
  email: string;
  username: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
  loginTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userId, 
      email, 
      username, 
      role, 
      ipAddress, 
      userAgent, 
      loginTime 
    }: LoginNotificationRequest = await req.json();

    console.log("Sending login notification for user:", email);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const formattedTime = new Date(loginTime).toLocaleString("id-ID", {
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
          .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
          .info-table td:first-child { font-weight: bold; color: #666; width: 140px; }
          .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .badge-super-admin { background: #fee2e2; color: #dc2626; }
          .badge-moderator { background: #dbeafe; color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Notifikasi Login</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Forum Indonesia Muda - Admin Panel</p>
          </div>
          <div class="content">
            <p>Halo Admin,</p>
            <p>Ada login berhasil ke Admin Panel FIM dengan detail sebagai berikut:</p>
            
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
                <td>
                  <span class="badge ${role === 'super_admin' ? 'badge-super-admin' : 'badge-moderator'}">
                    ${role === 'super_admin' ? 'Super Admin' : 'Moderator'}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Waktu Login</td>
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

            <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
              ⚠️ <strong>Perhatian:</strong> Jika Anda tidak mengenali aktivitas login ini, segera hubungi tim IT untuk mengamankan akun.
            </p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Admin Panel FIM.</p>
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
        from: "FIM Admin <onboarding@resend.dev>",
        to: ["web@forumindonesiamuda.org"],
        subject: `[FIM Admin] Login Berhasil: ${username}`,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Login notification email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending login notification:", error);
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
