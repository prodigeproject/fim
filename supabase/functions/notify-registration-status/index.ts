import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate } from "../_shared/notification-service.ts";

interface StatusUpdateRequest {
  registrantEmail: string;
  registrantName: string;
  status: "approved" | "rejected";
  reviewerNote?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const { registrantEmail, registrantName, status, reviewerNote }: StatusUpdateRequest = await req.json();

    if (!registrantEmail || !registrantName || !status) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending ${status} notification to:`, registrantEmail);

    const template = getEmailTemplate("registration-status", {
      full_name: registrantName,
      status,
      reviewer_note: reviewerNote || "",
    });

    const result = await sendGmailEmail({
      to: registrantEmail,
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    console.log("Registration status email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-registration-status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
