import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendEmailWithConfig, getSmtpConfig, getEmailTemplate, createServiceClient } from "../_shared/notification-service.ts";
import type { TemplateName } from "../_shared/notification-service.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabase = createServiceClient();

    // Fetch pending notifications
    const { data: notifications, error: fetchError } = await supabase
      .from("notification_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(50);

    if (fetchError) throw fetchError;

    console.log(`Processing ${notifications?.length || 0} notifications`);

    // Get SMTP config once for all emails (reads DB config + env secrets)
    const smtpConfig = await getSmtpConfig(supabase);

    let processed = 0;
    let failed = 0;

    for (const notification of notifications || []) {
      await supabase
        .from("notification_queue")
        .update({ status: "processing" })
        .eq("id", notification.id);

      try {
        if (notification.notification_type === "email" && notification.recipient_email) {
          const template = getEmailTemplate(
            notification.template_name as TemplateName,
            notification.payload as Record<string, string>
          );

          const result = await sendEmailWithConfig(smtpConfig, {
            to: notification.recipient_email,
            subject: template.subject,
            html: template.html,
          });

          if (result.success) {
            await supabase
              .from("notification_queue")
              .update({ status: "sent", processed_at: new Date().toISOString() })
              .eq("id", notification.id);
            processed++;
          } else {
            throw new Error(result.error);
          }
        }
      } catch (error) {
        const retryCount = notification.retry_count + 1;
        const maxRetries = notification.max_retries || 3;

        await supabase
          .from("notification_queue")
          .update({
            status: retryCount >= maxRetries ? "failed" : "pending",
            retry_count: retryCount,
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", notification.id);
        failed++;
      }
    }

    return new Response(JSON.stringify({ processed, failed }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
