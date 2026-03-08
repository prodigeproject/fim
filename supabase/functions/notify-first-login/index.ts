import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, wrapEmailLayout, emailGreeting, emailParagraph, emailDetailsTable, emailDetailRow, emailInfoBox } from "../_shared/notification-service.ts";

interface FirstLoginNotificationRequest {
  moderatorEmail: string;
  moderatorUsername: string;
  moderatorFullName: string;
  ipAddress?: string;
  userAgent?: string;
  loginTime: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const {
      moderatorEmail, moderatorUsername, moderatorFullName, ipAddress, userAgent, loginTime,
    }: FirstLoginNotificationRequest = await req.json();

    console.log("Sending first login notification for moderator:", moderatorEmail);

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

    const displayName = moderatorFullName || moderatorUsername;

    const emailHtml = wrapEmailLayout({
      title: "🎉 Moderator Baru Login!",
      headerColor: "#2563EB",
      headerGradientEnd: "#1D4ED8",
      preheader: `${displayName} telah berhasil login untuk pertama kalinya.`,
      body: `
        ${emailParagraph("Halo Super Admin,")}
        ${emailParagraph(`Moderator baru telah <strong>berhasil login untuk pertama kalinya</strong> ke Admin Panel FIM.`)}
        ${emailInfoBox({
          color: "#10B981",
          bgColor: "#ECFDF5",
          content: `<p style="margin:0;font-size:18px;font-weight:700;color:#059669;">${displayName}</p><p style="margin:4px 0 0;font-size:14px;color:#6B7280;">${moderatorEmail}</p>`,
        })}
        ${emailDetailsTable(`
          ${emailDetailRow("Username", `<strong>${moderatorUsername}</strong>`, "👤")}
          ${emailDetailRow("Email", moderatorEmail, "✉️")}
          ${emailDetailRow("Role", `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:#DBEAFE;color:#2563EB;">Moderator</span>`, "🛡️")}
          ${emailDetailRow("Waktu Login", `${formattedTime} WIB`, "🕐")}
          ${emailDetailRow("IP Address", `<code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:13px;">${ipAddress || "Tidak tersedia"}</code>`, "🌐")}
        `)}
        ${emailParagraph("✅ Moderator ini telah mengganti password default dan sekarang aktif di sistem.")}
      `,
      footerText: "Email ini dikirim otomatis ketika moderator baru login pertama kali.",
    });

    const result = await sendGmailEmail({
      to: "web@forumindonesiamuda.org",
      subject: `[FIM Admin] 🎉 Moderator Baru Login: ${displayName}`,
      html: emailHtml,
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    console.log("First login notification email sent successfully");

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending first login notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
