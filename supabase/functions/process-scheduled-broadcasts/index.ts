import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailHtml(name: string | null, safeHtml: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:0 auto;padding:24px;">
        <p>Halo${name ? ` <strong>${escapeHtml(name)}</strong>` : ""},</p>
        <div style="margin-top:16px;">${safeHtml}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
        <p style="color:#666;font-size:12px;">
          Anda menerima email ini karena berlangganan newsletter Forum Indonesia Muda.
        </p>
      </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find pending broadcasts that are due
    const { data: pendingBroadcasts, error: fetchErr } = await supabase
      .from("scheduled_broadcasts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString());

    if (fetchErr) {
      console.error("Fetch pending broadcasts error:", fetchErr);
      return new Response(JSON.stringify({ error: "Fetch error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${pendingBroadcasts?.length || 0} pending broadcasts`);

    let processed = 0;

    for (const broadcast of pendingBroadcasts ?? []) {
      console.log(`Processing broadcast: ${broadcast.id} - ${broadcast.subject}`);

      const { data: subscribers, error: subErr } = await supabase
        .from("newsletter_subscribers")
        .select("email, name")
        .eq("is_active", true)
        .not("confirmed_at", "is", null);

      if (subErr) {
        console.error("Subscriber fetch error:", subErr);
        await supabase
          .from("scheduled_broadcasts")
          .update({ status: "failed", error_message: subErr.message })
          .eq("id", broadcast.id);
        continue;
      }

      const recipients = (subscribers ?? []).map((s) => ({
        email: (s.email as string).toLowerCase().trim(),
        name: (s.name as string | null) ?? null,
      }));

      const safeHtml = escapeHtml(broadcast.content).replace(/\n/g, "<br/>");
      const from = "Forum Indonesia Muda <onboarding@resend.dev>";

      let sent = 0;
      let failed = 0;

      for (const r of recipients) {
        try {
          const html = buildEmailHtml(r.name, safeHtml);
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from,
              to: [r.email],
              subject: broadcast.subject,
              html,
            }),
          });

          if (!res.ok) {
            failed++;
            const errData = await res.json().catch(() => ({}));
            console.error("Resend error:", r.email, errData);
          } else {
            sent++;
          }
        } catch (e) {
          failed++;
          console.error("Send failed:", r.email, e);
        }
      }

      await supabase
        .from("scheduled_broadcasts")
        .update({
          status: failed === recipients.length ? "failed" : "sent",
          sent_at: new Date().toISOString(),
          total_recipients: recipients.length,
          sent_count: sent,
          failed_count: failed,
        })
        .eq("id", broadcast.id);

      // Audit log
      void supabase
        .rpc("log_audit_event", {
          p_user_id: broadcast.created_by,
          p_action: "scheduled_broadcast_sent",
          p_resource_type: "scheduled_broadcast",
          p_resource_id: broadcast.id,
          p_details: { subject: broadcast.subject, total: recipients.length, sent, failed },
        })
        .then(({ error }) => {
          if (error) console.error("Audit log failed:", error);
        });

      processed++;
    }

    return new Response(
      JSON.stringify({ success: true, processed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("process-scheduled-broadcasts error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
