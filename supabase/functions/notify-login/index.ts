import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate } from "../_shared/notification-service.ts";

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
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const { userId, email, username, role, ipAddress, userAgent, loginTime }: LoginNotificationRequest = await req.json();

    console.log("Sending login notification for user:", email);

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

    const template = getEmailTemplate("login-notification", {
      username,
      email,
      role,
      login_time: formattedTime,
      ip_address: ipAddress || "Tidak tersedia",
    });

    const result = await sendGmailEmail({
      to: "web@forumindonesiamuda.org",
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    console.log("Login notification email sent successfully");

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending login notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
