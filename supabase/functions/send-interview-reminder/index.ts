import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate, createServiceClient } from "../_shared/notification-service.ts";

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabase = createServiceClient();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking for interviews scheduled on: ${tomorrowStr}`);

    const { data: schedules, error: scheduleError } = await supabase
      .from("interview_schedules")
      .select(`
        id, scheduled_date, scheduled_time, meeting_link, location, notes, reminder_sent, registration_id,
        fim_registrations ( id, email, full_name )
      `)
      .eq("scheduled_date", tomorrowStr)
      .eq("reminder_sent", false)
      .eq("status", "scheduled");

    if (scheduleError) throw scheduleError;

    if (!schedules || schedules.length === 0) {
      return new Response(
        JSON.stringify({ message: "No interviews need reminders", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${schedules.length} interviews to remind`);

    let sentCount = 0;
    const errors: string[] = [];

    for (const schedule of schedules) {
      const registration = schedule.fim_registrations as any;
      if (!registration) continue;

      const interviewDate = new Date(`${schedule.scheduled_date}T${schedule.scheduled_time}`);
      const formattedDate = interviewDate.toLocaleDateString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });

      try {
        const template = getEmailTemplate("interview-reminder", {
          full_name: registration.full_name,
          date: formattedDate,
          time: schedule.scheduled_time,
          meeting_link: schedule.meeting_link || "",
          location: schedule.location || "",
        });

        const result = await sendGmailEmail({
          to: registration.email,
          subject: `⏰ Reminder: Wawancara FIM Besok (${formattedDate})`,
          html: template.html,
        });

        if (!result.success) throw new Error(result.error);

        await supabase
          .from("interview_schedules")
          .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
          .eq("id", schedule.id);

        sentCount++;
        console.log(`Reminder sent to ${registration.email}`);
      } catch (emailError) {
        console.error(`Failed to send reminder to ${registration.email}:`, emailError);
        errors.push(registration.email);
      }
    }

    return new Response(
      JSON.stringify({ message: "Interview reminders sent", sent: sentCount, total: schedules.length, errors: errors.length > 0 ? errors : undefined }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-interview-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
