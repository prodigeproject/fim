import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate, createServiceClient } from "../_shared/notification-service.ts";

interface NotifyInterviewCompletedRequest {
  registrantEmail: string;
  registrantName: string;
  interviewDate?: string;
  interviewerName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const { registrantEmail, registrantName, interviewDate, interviewerName }: NotifyInterviewCompletedRequest = await req.json();

    console.log("Sending interview completed notification to:", registrantEmail);

    const supabase = createServiceClient();

    // Try to get customizable email template from DB
    const { data: dbTemplate } = await supabase
      .from("email_templates")
      .select("subject, html_content")
      .eq("name", "interview_completed")
      .eq("is_active", true)
      .single();

    let subject: string;
    let html: string;

    if (dbTemplate) {
      subject = dbTemplate.subject;
      html = dbTemplate.html_content
        .replace(/\{\{registrantName\}\}/g, registrantName)
        .replace(/\{\{interviewDate\}\}/g, interviewDate ? ` pada ${interviewDate}` : "")
        .replace(/\{\{interviewerName\}\}/g, interviewerName ? ` bersama ${interviewerName}` : "");
    } else {
      const template = getEmailTemplate("interview-completed", {
        full_name: registrantName,
        interview_date: interviewDate || "",
        interviewer_name: interviewerName || "",
      });
      subject = template.subject;
      html = template.html;
    }

    const result = await sendGmailEmail({
      to: registrantEmail,
      subject,
      html,
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    console.log("Interview completed notification sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Interview completion notification sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-interview-completed:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
