import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, checkDailyRateLimit, createServiceClient } from "../_shared/notification-service.ts";

interface BroadcastRequest {
  subject: string;
  content: string;
  testEmail?: string;
  scheduled_id?: string;
}

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
      <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#111;max-width:640px;margin:0 auto;padding:24px;">
        <p>Halo${name ? ` <strong>${escapeHtml(name)}</strong>` : ""},</p>
        <div style="margin-top:16px;">${safeHtml}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
        <p style="color:#666;font-size:12px;">Anda menerima email ini karena berlangganan newsletter Forum Indonesia Muda.</p>
      </body>
    </html>`;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createServiceClient();

    const { data: isSuperAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id, _role: "super_admin",
    });

    if (!isSuperAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as Partial<BroadcastRequest>;
    const subject = body.subject?.trim() ?? "";
    const content = body.content?.trim() ?? "";
    const testEmail = body.testEmail?.toLowerCase().trim();
    const scheduledId = body.scheduled_id;

    if (!subject || !content) {
      return new Response(JSON.stringify({ error: "Subject dan konten wajib diisi" }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeHtml = escapeHtml(content).replace(/\n/g, "<br/>");

    // Test mode
    if (testEmail) {
      const html = buildEmailHtml("Admin", safeHtml);
      const result = await sendGmailEmail({
        to: testEmail,
        subject: `[TEST] ${subject}`,
        html,
      });

      if (!result.success) {
        return new Response(
          JSON.stringify({ error: "Gagal mengirim email test", details: result.error }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, test: true, email: testEmail }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check daily rate limit before broadcast
    const rateLimit = await checkDailyRateLimit(supabaseAdmin);

    // Full broadcast
    const { data: subscribers, error: subErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("is_active", true)
      .not("confirmed_at", "is", null);

    if (subErr) throw subErr;

    const recipients = (subscribers ?? []).map((s) => ({
      email: (s.email as string).toLowerCase().trim(),
      name: (s.name as string | null) ?? null,
    }));

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ error: `Daily rate limit reached (${rateLimit.sent}/${rateLimit.limit}). Coba lagi besok.` }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Cap sending to remaining daily allowance
    const maxToSend = Math.min(recipients.length, rateLimit.limit - rateLimit.sent);

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < maxToSend; i++) {
      const r = recipients[i];
      try {
        const html = buildEmailHtml(r.name, safeHtml);
        const result = await sendGmailEmail({ to: r.email, subject, html });

        if (!result.success) {
          failed++;
          console.error("Send failed:", r.email, result.error);
        } else {
          sent++;
        }
      } catch (e) {
        failed++;
        console.error("Send failed:", r.email, e);
      }
    }

    if (scheduledId) {
      await supabaseAdmin
        .from("scheduled_broadcasts")
        .update({
          status: failed === recipients.length ? "failed" : "sent",
          sent_at: new Date().toISOString(),
          total_recipients: recipients.length,
          sent_count: sent,
          failed_count: failed,
        })
        .eq("id", scheduledId);
    }

    void supabaseAdmin
      .rpc("log_audit_event", {
        p_user_id: user.id,
        p_action: "newsletter_broadcast",
        p_details: { subject, total: recipients.length, sent, failed },
      })
      .then(({ error }) => { if (error) console.error("Audit log failed:", error); });

    return new Response(
      JSON.stringify({ success: true, total: recipients.length, sent, failed }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("newsletter-broadcast error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
