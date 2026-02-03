import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmRequest {
  registration_id?: string;
  email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registration_id, email }: ConfirmRequest = await req.json();

    if (!registration_id && !email) {
      return new Response(
        JSON.stringify({ error: "registration_id or email required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get registration data (by id or email)
    const regQuery = supabase
      .from("fim_registrations")
      .select("auth_user_id, email")
      .limit(1);

    const { data: registration, error: regError } = await (registration_id
      ? regQuery.eq("id", registration_id).maybeSingle()
      : regQuery.eq("email", normalizedEmail!).maybeSingle());

    if (regError || !registration) {
      console.error("Registration not found:", regError);
      return new Response(
        JSON.stringify({ error: "Registration not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!registration.auth_user_id) {
      return new Response(
        JSON.stringify({ error: "No auth user linked to this registration" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update auth user to confirm email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      registration.auth_user_id,
      { 
        email_confirm: true,
        user_metadata: { email_verified: true }
      }
    );

    if (updateError) {
      console.error("Failed to confirm auth user:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to confirm email in auth system", details: updateError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Successfully confirmed auth email for user ${registration.auth_user_id}`);

    return new Response(
      JSON.stringify({ success: true, message: "Email confirmed in auth system" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error confirming auth email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);