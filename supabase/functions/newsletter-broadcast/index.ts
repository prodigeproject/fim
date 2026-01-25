import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  subject: string;
  content: string;
  testEmail?: string; // If provided, only send to this email as test
  scheduled_id?: string; // If triggered by scheduler
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

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: isSuperAdmin, error: roleErr } = await supabaseAdmin.rpc(
      "has_role",
      { _user_id: user.id, _role: "super_admin" }
    );

    if (roleErr) {
      console.error("Role check error:", roleErr);
      return new Response(JSON.stringify({ error: "Gagal memverifikasi role" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isSuperAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as Partial<BroadcastRequest>;
    const subject = body.subject?.trim() ?? "";
    const content = body.content?.trim() ?? "";
    const testEmail = body.testEmail?.toLowerCase().trim();
    const scheduledId = body.scheduled_id;

    if (!subject) {
      return new Response(JSON.stringify({ error: "Subject wajib diisi" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!content) {
      return new Response(JSON.stringify({ error: "Konten wajib diisi" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const safeHtml = escapeHtml(content).replace(/\n/g, "<br/>");
    const from = "Forum Indonesia Muda <onboarding@resend.dev>";

    // Test mode: only send to testEmail
    if (testEmail) {
      console.log(`Sending test email to: ${testEmail}`);

      const html = buildEmailHtml("Admin", safeHtml);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [testEmail],
          subject: `[TEST] ${subject}`,
          html,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Resend test error:", errData);
        return new Response(
          JSON.stringify({ error: "Gagal mengirim email test", details: errData }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, test: true, email: testEmail }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Full broadcast mode
    const { data: subscribers, error: subErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("is_active", true)
      .not("confirmed_at", "is", null);

    if (subErr) {
      console.error("Subscriber select error:", subErr);
      return new Response(JSON.stringify({ error: "Gagal mengambil subscriber" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const recipients = (subscribers ?? []).map((s) => ({
      email: (s.email as string).toLowerCase().trim(),
      name: (s.name as string | null) ?? null,
    }));

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
          body: JSON.stringify({ from, to: [r.email], subject, html }),
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

    // Update scheduled_broadcasts row if applicable
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
      .then(({ error }) => {
        if (error) console.error("Audit log failed:", error);
      });

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
