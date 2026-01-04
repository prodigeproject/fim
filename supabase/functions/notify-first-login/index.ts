import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FirstLoginNotificationRequest {
  moderatorEmail: string;
  moderatorUsername: string;
  moderatorFullName: string;
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
      moderatorEmail, 
      moderatorUsername, 
      moderatorFullName,
      ipAddress, 
      userAgent, 
      loginTime 
    }: FirstLoginNotificationRequest = await req.json();

    console.log("Sending first login notification for moderator:", moderatorEmail);

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
          .header { background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }
          .info-table { width: 100%; border-collapse: collapse; }
          .info-table td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
          .info-table td:first-child { font-weight: bold; color: #666; width: 140px; }
          .footer { background: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; background: #dbeafe; color: #2563eb; }
          .highlight { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Login Pertama Moderator Baru!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Forum Indonesia Muda - Admin Panel</p>
          </div>
          <div class="content">
            <p>Halo Super Admin,</p>
            <p>Moderator baru telah <strong>berhasil login untuk pertama kalinya</strong> ke Admin Panel FIM:</p>
            
            <div class="highlight">
              <p style="margin: 0; font-size: 18px;"><strong>${moderatorFullName || moderatorUsername}</strong></p>
              <p style="margin: 5px 0 0 0; color: #666;">${moderatorEmail}</p>
            </div>
            
            <table class="info-table">
              <tr>
                <td>Username</td>
                <td><strong>${moderatorUsername}</strong></td>
              </tr>
              <tr>
                <td>Email</td>
                <td>${moderatorEmail}</td>
              </tr>
              <tr>
                <td>Role</td>
                <td><span class="badge">Moderator</span></td>
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

            <p style="margin-top: 20px;">
              ✅ Moderator ini telah mengganti password default dan sekarang aktif di sistem.
            </p>
          </div>
          <div class="footer">
            <p>Email ini dikirim secara otomatis ketika moderator baru login pertama kali.</p>
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
        subject: `[FIM Admin] 🎉 Moderator Baru Login: ${moderatorFullName || moderatorUsername}`,
        html: emailHtml,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("First login notification email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending first login notification:", error);
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
