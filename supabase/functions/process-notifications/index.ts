import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendGmailEmail, getEmailTemplate, TemplateName } from "../_shared/notification-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    let processed = 0;
    let failed = 0;

    for (const notification of notifications || []) {
      // Mark as processing
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

          const result = await sendGmailEmail({
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
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
