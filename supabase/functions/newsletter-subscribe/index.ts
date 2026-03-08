import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate } from "../_shared/notification-service.ts";

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

    // Send welcome email using centralized template
    const siteUrl = Deno.env.get("SITE_URL") || "https://fim.lovable.app";
    const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}`;

    try {
      const template = getEmailTemplate("newsletter-welcome", {
        name: name?.trim() || "",
        unsubscribe_url: unsubscribeUrl,
      });

      await sendGmailEmail({
        to: normalizedEmail,
        subject: template.subject,
        html: template.html,
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
