import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, createServiceClient } from "../_shared/notification-service.ts";

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
      <h2 style="color: #1e40af; margin-top: 0;">Halo ${reg.full_name}! 👋</h2>
      <p>Kami melihat bahwa pendaftaran Anda di Forum Indonesia Muda belum selesai.</p>
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #92400e;"><strong>Progress saat ini: ${progress}%</strong></p>
      </div>
      <p>Jangan lewatkan kesempatan untuk menjadi bagian dari jaringan pemuda terbaik Indonesia!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://fim.lovable.app/daftar" style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">Lanjutkan Pendaftaran →</a>
      </div>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda.</p>
    </div>
  </div>
</body>
</html>`;

        const result = await sendGmailEmail({
          to: reg.email,
          subject: "Reminder: Lengkapi Formulir Pendaftaran FIM Anda",
          html: emailHtml,
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
