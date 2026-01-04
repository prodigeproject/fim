import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ArticleStatusNotificationRequest {
  moderator_email: string;
  moderator_name: string;
  article_title: string;
  status: "approved" | "rejected";
  rejection_reason?: string;
  admin_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      moderator_email, 
      moderator_name, 
      article_title, 
      status,
      rejection_reason,
      admin_name 
    }: ArticleStatusNotificationRequest = await req.json();

    console.log(`Sending ${status} notification to:`, moderator_email);

    const isApproved = status === "approved";
    const statusText = isApproved ? "Disetujui" : "Ditolak";
    const statusColor = isApproved ? "#4CAF50" : "#f44336";
    const statusEmoji = isApproved ? "✅" : "❌";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, ${statusColor} 0%, ${isApproved ? '#388E3C' : '#c62828'} 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">${statusEmoji} Artikel ${statusText}</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
          <p style="margin-top: 0;">Halo <strong>${moderator_name}</strong>,</p>
          
          <p>Artikel Anda telah di-review oleh Super Admin:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #333;">📄 ${article_title}</h3>
            <p style="margin: 0; color: ${statusColor}; font-weight: bold;">Status: ${statusText}</p>
          </div>
          
          ${!isApproved && rejection_reason ? `
          <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #c62828;">📝 Alasan Penolakan:</strong>
            <p style="margin: 10px 0 0 0; color: #c62828;">${rejection_reason}</p>
          </div>
          ` : ''}
          
          ${isApproved ? `
          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;">🎉 Selamat! Artikel Anda sudah dapat dipublikasikan.</p>
          </div>
          ` : `
          <p>Silakan login ke panel admin untuk mengedit artikel Anda dan submit ulang.</p>
          `}
          
          <p style="color: #666; font-size: 14px; margin-bottom: 0;">
            Di-review oleh: <strong>${admin_name}</strong><br><br>
            Terima kasih,<br>
            <strong>Tim Forum Indonesia Muda</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
          <p style="margin: 0;">Email ini dikirim otomatis. Jangan membalas email ini.</p>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FIM Admin <onboarding@resend.dev>",
        to: [moderator_email],
        subject: `Artikel ${statusText}: ${article_title}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-article-status function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
