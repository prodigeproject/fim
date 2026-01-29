import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  token: string;
  context: "signup" | "login" | "forgot_password" | "admin_login";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, context }: VerifyRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Token reCAPTCHA diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get secret key from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings, error: settingsError } = await supabase
      .from("recaptcha_settings")
      .select("secret_key_encrypted, enabled_signup, enabled_login, enabled_forgot_password, enabled_admin_login")
      .limit(1)
      .single();

    if (settingsError || !settings) {
      console.log("No reCAPTCHA settings found, skipping verification");
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if reCAPTCHA is enabled for this context
    let isEnabled = false;
    switch (context) {
      case "signup":
        isEnabled = settings.enabled_signup;
        break;
      case "login":
        isEnabled = settings.enabled_login;
        break;
      case "forgot_password":
        isEnabled = settings.enabled_forgot_password;
        break;
      case "admin_login":
        isEnabled = settings.enabled_admin_login;
        break;
    }

    if (!isEnabled) {
      console.log(`reCAPTCHA not enabled for context: ${context}`);
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const secretKey = settings.secret_key_encrypted;
    if (!secretKey) {
      console.log("No secret key configured");
      return new Response(
        JSON.stringify({ success: true, skipped: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify with Google
    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const verifyResponse = await fetch(verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      console.log("reCAPTCHA verification failed:", verifyData["error-codes"]);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Verifikasi reCAPTCHA gagal. Silakan coba lagi.",
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Verify reCAPTCHA error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
