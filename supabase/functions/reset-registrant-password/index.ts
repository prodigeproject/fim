import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

function randomPassword(length = 14) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  return Array.from(bytes).map((b) => alphabet[b % alphabet.length]).join("");
}

interface ResetPasswordRequest {
  registration_id: string;
  temporary_password?: string;
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const cors = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...cors },
    });

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: isAdmin } = await supabaseAdmin.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = (await req.json()) as Partial<ResetPasswordRequest>;
    if (!body.registration_id) return json({ error: "registration_id wajib diisi" }, 400);

    const { data: registration, error: regError } = await supabaseAdmin
      .from("fim_registrations")
      .select("id, auth_user_id, email, full_name")
      .eq("id", body.registration_id)
      .single();

    if (regError || !registration) return json({ error: "Pendaftar tidak ditemukan" }, 404);
    if (!registration.auth_user_id) return json({ error: "Pendaftar tidak memiliki akun terkait" }, 400);

    const tempPassword = (body.temporary_password?.trim() || randomPassword()) as string;

    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(registration.auth_user_id, {
      password: tempPassword,
      email_confirm: true,
    });

    if (updateErr) return json({ error: updateErr.message }, 400);

    await supabaseAdmin
      .from("fim_registrations")
      .update({ email_verified: true, email_verified_at: new Date().toISOString() })
      .eq("id", body.registration_id)
      .is("email_verified", false);

    // Audit (never log the password)
    void supabaseAdmin.rpc("log_audit_event", {
      p_user_id: user.id, p_action: "reset_user_password",
      p_resource_type: "registration", p_resource_id: body.registration_id,
    }).catch((e: any) => console.error("audit error:", e));

    return json({
      success: true,
      registration_id: body.registration_id,
      email: registration.email,
      full_name: registration.full_name,
      temporary_password: tempPassword,
    });
  } catch (error: any) {
    console.error("reset-registrant-password error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(req) } }
    );
  }
});
