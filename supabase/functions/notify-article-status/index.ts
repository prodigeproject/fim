import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate } from "../_shared/notification-service.ts";

interface ArticleStatusNotificationRequest {
  moderator_email: string;
  moderator_name: string;
  article_title: string;
  status: "approved" | "rejected";
  rejection_reason?: string;
  admin_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const {
      moderator_email, moderator_name, article_title, status, rejection_reason, admin_name,
    }: ArticleStatusNotificationRequest = await req.json();

    console.log(`Sending ${status} notification to:`, moderator_email);

    const isApproved = status === "approved";
    const statusText = isApproved ? "Disetujui ✅" : "Ditolak ❌";

    const template = getEmailTemplate("article-status", {
      author_name: moderator_name,
      title: article_title,
      status: statusText,
      notes: isApproved
        ? "Selamat! Artikel Anda sudah dapat dipublikasikan."
        : rejection_reason || "Silakan login ke panel admin untuk mengedit dan submit ulang.",
    });

    const result = await sendGmailEmail({
      to: moderator_email,
      subject: `Artikel ${isApproved ? "Disetujui" : "Ditolak"}: ${article_title}`,
      html: template.html,
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-article-status function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
