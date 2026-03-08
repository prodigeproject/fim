import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate } from "../_shared/notification-service.ts";

interface RevisionNotificationRequest {
  moderator_email: string;
  moderator_name: string;
  article_title: string;
  revision_notes: string;
  admin_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const {
      moderator_email, moderator_name, article_title, revision_notes, admin_name,
    }: RevisionNotificationRequest = await req.json();

    console.log("Sending revision notification to:", moderator_email);

    const template = getEmailTemplate("revision-request", {
      author_name: moderator_name,
      title: article_title,
      revision_notes,
      admin_name,
    });

    const result = await sendGmailEmail({
      to: moderator_email,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    console.log("Revision notification sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in notify-revision function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
