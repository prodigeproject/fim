import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface DeleteAuthUserRequest {
  auth_user_id: string;
  registration_id: string;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Auth check ──────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // ── Role check (admin or super_admin) ───────────────────
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: isAdmin, error: roleErr } = await supabaseAdmin.rpc("is_admin", {
      _user_id: user.id,
    });

    if (roleErr || !isAdmin) {
      return json({ error: "Forbidden" }, 403);
    }

    // ── Business logic ──────────────────────────────────────
    const { auth_user_id, registration_id }: DeleteAuthUserRequest = await req.json();

    if (!auth_user_id || !registration_id) {
      return json({ error: "auth_user_id and registration_id are required" }, 400);
    }

    console.log(`Deleting auth user: ${auth_user_id} for registration: ${registration_id} by admin: ${user.id}`);

    // Delete related data first
    await supabaseAdmin.from("recruiter_assignments").delete().eq("registration_id", registration_id);
    await supabaseAdmin.from("registration_activity_logs").delete().eq("registration_id", registration_id);
    await supabaseAdmin.from("interview_schedules").delete().eq("registration_id", registration_id);
    await supabaseAdmin.from("fim_training_registrations").delete().eq("registration_id", registration_id);
    await supabaseAdmin.from("fim_registrations").delete().eq("id", registration_id);

    // Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(auth_user_id);
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
    } else {
      console.log("Auth user deleted successfully");
    }

    // Audit log
    void supabaseAdmin.rpc("log_audit_event", {
      p_user_id: user.id,
      p_action: "delete_user",
      p_resource_type: "registration",
      p_resource_id: registration_id,
    }).catch((e: any) => console.error("Audit log error:", e));

    return json({ success: true, message: "Registrant and auth user deleted successfully" });
  } catch (error: any) {
    console.error("Delete registrant auth user error:", error);
    return json({ error: error.message || "Failed to delete registrant" }, 500);
  }
};

serve(handler);
