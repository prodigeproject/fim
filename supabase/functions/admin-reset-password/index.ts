import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function randomPassword(length = 14) {
  // generates base64url-ish password without special chars that can confuse copy/paste
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
}

interface ResetPasswordRequest {
  user_id: string;
  // optional: allow super admin to set a specific temporary password
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

    const { data: isSuperAdmin, error: roleErr } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "super_admin",
    });

    if (roleErr) {
      console.error("admin-reset-password: role check error", roleErr);
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

    const body = (await req.json()) as Partial<ResetPasswordRequest>;
    const targetUserId = body.user_id;

    if (!targetUserId) {
      return new Response(JSON.stringify({ error: "user_id wajib diisi" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const tempPassword = (body.temporary_password?.trim() || randomPassword()) as string;

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: tempPassword,
    });

    if (updateErr) {
      console.error("admin-reset-password: update auth user error", updateErr);
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Force password change on next login
    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("id", targetUserId);

    if (profileErr) {
      console.error("admin-reset-password: profile update error", profileErr);
    }

    // Audit (best effort) - never log the password
    void supabaseAdmin
      .rpc("log_audit_event", {
        p_user_id: user.id,
        p_action: "reset_user_password",
        p_resource_type: "user",
        p_resource_id: targetUserId,
      })
      .then(({ error }) => {
        if (error) console.error("admin-reset-password: audit log error", error);
      });

    return new Response(
      JSON.stringify({ success: true, user_id: targetUserId, temporary_password: tempPassword }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("admin-reset-password error:", error);
    return new Response(JSON.stringify({ error: error?.message || "Terjadi kesalahan" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
