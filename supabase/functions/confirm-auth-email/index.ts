import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface ConfirmRequest {
  registration_id?: string;
  email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const cors = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...cors },
    });

  try {
    const { registration_id, email }: ConfirmRequest = await req.json();

    if (!registration_id && !email) {
      return json({ error: "registration_id or email required" }, 400);
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get registration data
    const regQuery = supabase
      .from("fim_registrations")
      .select("auth_user_id, email, email_verified")
      .limit(1);

    const { data: registration, error: regError } = await (registration_id
      ? regQuery.eq("id", registration_id).maybeSingle()
      : regQuery.eq("email", normalizedEmail!).maybeSingle());

    if (regError || !registration) {
      console.error("Registration not found:", regError);
      return json({ error: "Registration not found" }, 404);
    }

    // ── Security: Only confirm if email_verified is true in fim_registrations ──
    // This prevents bypassing the email verification flow
    if (!registration.email_verified) {
      console.warn(`Blocked confirm-auth-email: email_verified=false for ${registration.email}`);
      return json({ error: "Email has not been verified yet" }, 403);
    }

    if (!registration.auth_user_id) {
      return json({ error: "No auth user linked to this registration" }, 400);
    }

    // Update auth user to confirm email
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      registration.auth_user_id,
      {
        email_confirm: true,
        user_metadata: { email_verified: true },
      }
    );

    if (updateError) {
      console.error("Failed to confirm auth user:", updateError);
      return json({ error: "Failed to confirm email in auth system", details: updateError.message }, 500);
    }

    console.log(`Successfully confirmed auth email for user ${registration.auth_user_id}`);

    return json({ success: true, message: "Email confirmed in auth system" });
  } catch (error: any) {
    console.error("Error confirming auth email:", error);
    return json({ error: error.message }, 500);
  }
};

serve(handler);
