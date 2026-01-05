import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  registrantEmail: string;
  registrantName: string;
  status: "approved" | "rejected";
  reviewerNote?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registrantEmail, registrantName, status, reviewerNote }: StatusUpdateRequest = await req.json();

    if (!registrantEmail || !registrantName || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const isApproved = status === "approved";
    const statusLabel = isApproved ? "Disetujui" : "Ditolak";
    const statusColor = isApproved ? "#22c55e" : "#ef4444";
    const statusEmoji = isApproved ? "✅" : "❌";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Status Pendaftaran FIM</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">FIM Indonesia</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Forum Indonesia Muda</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Halo, ${registrantName}! ${statusEmoji}</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Kami ingin menginformasikan bahwa status pendaftaran Anda di FIM Indonesia telah diperbarui.
              </p>

              <!-- Status Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                <tr>
                  <td style="background-color: ${isApproved ? '#f0fdf4' : '#fef2f2'}; border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Status Pendaftaran:</p>
                    <p style="margin: 0; font-size: 20px; font-weight: bold; color: ${statusColor};">
                      ${statusLabel}
                    </p>
                  </td>
                </tr>
              </table>

              ${reviewerNote ? `
              <!-- Reviewer Note -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #374151;">Catatan dari Reviewer:</p>
                    <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                      ${reviewerNote}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              ${isApproved ? `
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Selamat! Anda telah diterima sebagai peserta FIM Indonesia. Tim kami akan segera menghubungi Anda untuk informasi selanjutnya mengenai program pelatihan.
              </p>
              ` : `
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">
                Terima kasih atas minat Anda untuk bergabung dengan FIM Indonesia. Meskipun saat ini kami belum dapat menerima pendaftaran Anda, kami mengapresiasi semangat Anda dan berharap dapat melihat Anda kembali di kesempatan berikutnya.
              </p>
              `}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Forum Indonesia Muda. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Email ini dikirim secara otomatis. Jika ada pertanyaan, silakan hubungi tim kami.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FIM Indonesia <noreply@resend.dev>",
        to: [registrantEmail],
        subject: `Status Pendaftaran FIM: ${statusLabel}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Email sending failed: ${errorData}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-registration-status function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
