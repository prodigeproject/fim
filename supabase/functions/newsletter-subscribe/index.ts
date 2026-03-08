import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail } from "../_shared/notification-service.ts";

interface SubscribeRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("x-real-ip") ||
               req.headers.get("cf-connecting-ip") ||
               "unknown";

    // Rate limiting
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: attemptCount } = await supabase
      .from("newsletter_subscription_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("attempted_at", oneHourAgo);

    if (attemptCount && attemptCount >= 5) {
      return new Response(
        JSON.stringify({ error: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name }: SubscribeRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email tidak valid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await supabase
      .from("newsletter_subscription_attempts")
      .insert({ ip_address: ip, email: normalizedEmail });

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ message: "Email sudah terdaftar sebagai subscriber" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      await supabase
        .from("newsletter_subscribers")
        .update({ is_active: true, subscribed_at: new Date().toISOString(), unsubscribed_at: null })
        .eq("id", existing.id);
    } else {
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: normalizedEmail, name: name?.trim() || null, confirmed_at: new Date().toISOString() });
      if (insertError) throw insertError;
    }

    // Send welcome email via centralized Gmail SMTP
    const siteUrl = Deno.env.get("SITE_URL") || "https://fim.lovable.app";
    const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}`;

    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Selamat Datang! 🎉</h1>
          </div>
          <p>Halo${name ? ` <strong>${name}</strong>` : ""},</p>
          <p>Terima kasih telah berlangganan newsletter <strong>Forum Indonesia Muda</strong>!</p>
          <p>Anda akan menerima update terbaru seputar:</p>
          <ul>
            <li>🎯 Program dan kegiatan FIM</li>
            <li>🏆 Prestasi alumni dan peserta</li>
            <li>📢 Pengumuman penting</li>
            <li>💡 Tips dan inspirasi dari komunitas</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Jika tidak ingin menerima email lagi, <a href="${unsubscribeUrl}" style="color: #666;">klik di sini untuk berhenti berlangganan</a>.
          </p>
          <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Forum Indonesia Muda</p>
        </body>
        </html>`;

      await sendGmailEmail({
        to: normalizedEmail,
        subject: "Selamat Datang di Newsletter FIM! 🎉",
        html: emailHtml,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Berhasil berlangganan newsletter!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
