import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, createServiceClient } from "../_shared/notification-service.ts";

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
        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Forum Indonesia Muda</h1>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e40af; margin-top: 0;">Halo ${registration.full_name}! 👋</h2>
      <p>Ini adalah pengingat bahwa wawancara Anda akan dilaksanakan <strong>BESOK</strong>.</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #92400e; font-size: 18px;"><strong>📅 ${formattedDate}</strong></p>
        <p style="margin: 5px 0 0; color: #92400e; font-size: 18px;"><strong>🕐 Pukul ${schedule.scheduled_time} WIB</strong></p>
      </div>
      ${schedule.meeting_link ? `<div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; color: #166534;"><strong>📍 Link Meeting:</strong></p><a href="${schedule.meeting_link}" style="color: #1e40af; word-break: break-all;">${schedule.meeting_link}</a></div>` : ''}
      ${schedule.location ? `<div style="background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0; color: #3730a3;"><strong>📍 Lokasi:</strong> ${schedule.location}</p></div>` : ''}
      ${schedule.notes ? `<div style="background: #f3f4f6; padding: 15px; margin: 20px 0; border-radius: 8px;"><p style="margin: 0; color: #374151;"><strong>Catatan:</strong> ${schedule.notes}</p></div>` : ''}
      <p><strong>Tips untuk wawancara:</strong></p>
      <ul style="color: #4b5563;"><li>Pastikan koneksi internet stabil</li><li>Siapkan diri 10-15 menit sebelumnya</li><li>Siapkan dokumen pendukung</li><li>Berpakaian rapi dan sopan</li></ul>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda.</p>
    </div>
  </div>
</body>
</html>`;

        const result = await sendGmailEmail({
          to: registration.email,
          subject: `⏰ Reminder: Wawancara FIM Besok (${formattedDate})`,
          html: emailHtml,
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
