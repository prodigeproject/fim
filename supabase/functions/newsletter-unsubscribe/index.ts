import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Support both GET (from email link) and POST requests
    let email: string | null = null;

    if (req.method === "GET") {
      const url = new URL(req.url);
      email = url.searchParams.get("email");
    } else if (req.method === "POST") {
      const body = await req.json();
      email = body.email;
    }

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email tidak ditemukan" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`Processing unsubscribe request for: ${normalizedEmail}`);

    // Find and deactivate the subscriber
    const { data: subscriber, error: findError } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (findError) {
      console.error("Find error:", findError);
      throw findError;
    }

    if (!subscriber) {
      return new Response(
        JSON.stringify({ error: "Email tidak terdaftar sebagai subscriber" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscriber.is_active) {
      return new Response(
        JSON.stringify({ message: "Email sudah dihapus dari daftar langganan sebelumnya" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Deactivate the subscription
    const { error: updateError } = await supabase
      .from("newsletter_subscribers")
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    console.log(`Successfully unsubscribed: ${normalizedEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Berhasil berhenti berlangganan newsletter",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Newsletter unsubscribe error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
