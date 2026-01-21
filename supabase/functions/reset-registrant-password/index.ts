import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function randomPassword(length = 14) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
}

interface ResetPasswordRequest {
  registration_id: string;
  temporary_password?: string;
}

serve(async (req: Request) => {
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

    const authHeader = req.headers.get("Authorization") ?? "";

    // Client bound to caller JWT
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await supabaseUser.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if caller is admin
    const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });

    if (roleErr) {
      console.error("reset-registrant-password: role check error", roleErr);
      return new Response(JSON.stringify({ error: "Gagal memverifikasi role" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = (await req.json()) as Partial<ResetPasswordRequest>;
    const registrationId = body.registration_id;

    if (!registrationId) {
      return new Response(JSON.stringify({ error: "registration_id wajib diisi" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get the registration to find auth_user_id
    const { data: registration, error: regError } = await supabaseAdmin
      .from("fim_registrations")
      .select("id, auth_user_id, email, full_name")
      .eq("id", registrationId)
      .single();

    if (regError || !registration) {
      return new Response(JSON.stringify({ error: "Pendaftar tidak ditemukan" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!registration.auth_user_id) {
      return new Response(JSON.stringify({ error: "Pendaftar tidak memiliki akun terkait" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const tempPassword = (body.temporary_password?.trim() || randomPassword()) as string;

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(registration.auth_user_id, {
      password: tempPassword,
    });

    if (updateErr) {
      console.error("reset-registrant-password: update auth user error", updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Audit (best effort) - never log the password
    void supabaseAdmin
      .rpc("log_audit_event", {
        p_user_id: user.id,
        p_action: "reset_user_password",
        p_resource_type: "registration",
        p_resource_id: registrationId,
      })
      .then(({ error }) => {
        if (error) console.error("reset-registrant-password: audit log error", error);
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        registration_id: registrationId, 
        email: registration.email,
        full_name: registration.full_name,
        temporary_password: tempPassword 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("reset-registrant-password error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Terjadi kesalahan" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
