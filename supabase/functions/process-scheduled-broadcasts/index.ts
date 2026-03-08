import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  getSmtpConfig,
  sendEmailWithConfig,
  wrapEmailLayout,
  emailParagraph,
} from "../_shared/notification-service.ts";

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailHtml(name: string | null, safeHtml: string) {
  return wrapEmailLayout({
    title: "Newsletter",
    body: `
      ${emailParagraph(`Halo${name ? ` <strong>${escapeHtml(name)}</strong>` : ""},`)}
      <div style="margin-top:16px;">${safeHtml}</div>
    `,
    footerText: "Anda menerima email ini karena berlangganan newsletter Forum Indonesia Muda.",
  });
}

const handler = async (req: Request): Promise<Response> => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const isServiceRole = authHeader === `Bearer ${supabaseServiceKey}`;

  if (!isServiceRole) {
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error("Unauthorized access attempt to process-scheduled-broadcasts");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: isSuperAdmin, error: roleError } = await supabase.rpc(
      "has_role",
      { _user_id: user.id, _role: "super_admin" }
    );
    if (roleError || !isSuperAdmin) {
      console.error(`Forbidden: User ${user.id} attempted to trigger broadcasts without super_admin role`);
      return new Response(JSON.stringify({ error: "Forbidden - Super admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const smtpConfig = await getSmtpConfig(supabase);

    const { data: pendingBroadcasts, error: fetchErr } = await supabase
      .from("scheduled_broadcasts")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString());

    if (fetchErr) {
      console.error("Fetch pending broadcasts error:", fetchErr);
      return new Response(JSON.stringify({ error: "Fetch error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
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

      let sent = 0;
      let failed = 0;

      for (const r of recipients) {
        try {
          const html = buildEmailHtml(r.name, safeHtml);
          const result = await sendEmailWithConfig(smtpConfig, {
            to: r.email,
            subject: broadcast.subject,
            html,
          });

          if (result.success) {
            sent++;
          } else {
            failed++;
            console.error("Send error:", r.email, result.error);
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
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("process-scheduled-broadcasts error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
