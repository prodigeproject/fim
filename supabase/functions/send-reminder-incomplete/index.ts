import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate, createServiceClient } from "../_shared/notification-service.ts";

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabase = createServiceClient();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: registrations, error: regError } = await supabase
      .from("fim_registrations")
      .select("id, email, full_name, created_at, registration_status")
      .eq("registration_status", "pending")
      .lte("created_at", sevenDaysAgo.toISOString());

    if (regError) throw regError;

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({ message: "No registrations need reminders", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const regIds = registrations.map(r => r.id);
    const { data: trainingData, error: trainingError } = await supabase
      .from("fim_training_registrations")
      .select("registration_id, is_submitted, completion_percentage")
      .in("registration_id", regIds);

    if (trainingError) throw trainingError;

    const incompleteRegistrations = registrations.filter(reg => {
      const training = trainingData?.find(t => t.registration_id === reg.id);
      return !training || !training.is_submitted;
    });

    console.log(`Found ${incompleteRegistrations.length} incomplete registrations`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const reg of incompleteRegistrations) {
      const training = trainingData?.find(t => t.registration_id === reg.id);
      const progress = training?.completion_percentage || 0;

      try {
        const template = getEmailTemplate("reminder-incomplete", {
          full_name: reg.full_name,
          progress: String(progress),
          registration_url: "https://fim.lovable.app/daftar",
        });

        const result = await sendGmailEmail({
          to: reg.email,
          subject: template.subject,
          html: template.html,
        });

        if (!result.success) throw new Error(result.error);

        sentCount++;
        console.log(`Reminder sent to ${reg.email}`);
      } catch (emailError) {
        console.error(`Failed to send reminder to ${reg.email}:`, emailError);
        errors.push(reg.email);
      }
    }

    return new Response(
      JSON.stringify({ message: "Reminders sent", sent: sentCount, total: incompleteRegistrations.length, errors: errors.length > 0 ? errors : undefined }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-incomplete:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
