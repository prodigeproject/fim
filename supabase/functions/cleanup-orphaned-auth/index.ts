import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

/**
 * Cleanup orphaned auth users whose fim_registrations record was deleted
 * but the auth.users entry was not properly removed.
 * This allows those emails to re-register.
 *
 * Only callable by super_admin.
 */
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

    // ── Auth & role check ───────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) return json({ error: "Unauthorized" }, 401);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: isSuperAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: user.id,
      _role: "super_admin",
    });
    if (!isSuperAdmin) return json({ error: "Forbidden" }, 403);

    // ── Find orphaned registrant auth users ─────────────
    // Get all auth_user_ids from fim_registrations
    const { data: registrations, error: regErr } = await supabaseAdmin
      .from("fim_registrations")
      .select("auth_user_id")
      .not("auth_user_id", "is", null);

    if (regErr) {
      console.error("Error fetching registrations:", regErr);
      return json({ error: "Failed to fetch registrations" }, 500);
    }

    const validAuthUserIds = new Set(
      (registrations ?? []).map((r) => r.auth_user_id).filter(Boolean)
    );

    // Get all admin user IDs (profiles table = admin users)
    const { data: adminProfiles } = await supabaseAdmin
      .from("profiles")
      .select("id");
    const adminUserIds = new Set((adminProfiles ?? []).map((p) => p.id));

    // List auth users (paginated, up to 1000)
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authErr) {
      console.error("Error listing auth users:", authErr);
      return json({ error: "Failed to list auth users" }, 500);
    }

    const allAuthUsers = authData?.users ?? [];

    // Orphaned = exists in auth but NOT in fim_registrations AND NOT in profiles (admin)
    const orphanedUsers = allAuthUsers.filter(
      (authUser) =>
        !validAuthUserIds.has(authUser.id) &&
        !adminUserIds.has(authUser.id)
    );

    // ── Check if dry run ────────────────────────────────
    let body: { dryRun?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // no body = default to dry run
    }
    const dryRun = body.dryRun !== false; // default true

    const results: Array<{ id: string; email: string; deleted: boolean; error?: string }> = [];

    for (const orphan of orphanedUsers) {
      if (dryRun) {
        results.push({ id: orphan.id, email: orphan.email || "", deleted: false });
      } else {
        // Also check blocked_registrations - don't delete blocked users
        const { data: isBlocked } = await supabaseAdmin
          .from("blocked_registrations")
          .select("id")
          .eq("email", orphan.email || "")
          .limit(1)
          .maybeSingle();

        if (isBlocked) {
          results.push({ id: orphan.id, email: orphan.email || "", deleted: false, error: "blocked" });
          continue;
        }

        // Also clean up any leftover training data
        const { data: regRecord } = await supabaseAdmin
          .from("fim_training_registrations")
          .select("id, registration_id")
          .eq("registration_id", orphan.id)
          .maybeSingle();

        if (regRecord) {
          await supabaseAdmin.from("fim_training_registrations").delete().eq("id", regRecord.id);
        }

        const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(orphan.id);
        if (deleteErr) {
          results.push({ id: orphan.id, email: orphan.email || "", deleted: false, error: deleteErr.message });
        } else {
          results.push({ id: orphan.id, email: orphan.email || "", deleted: true });
        }
      }
    }

    // Audit log
    if (!dryRun && results.some((r) => r.deleted)) {
      void supabaseAdmin
        .rpc("log_audit_event", {
          p_user_id: user.id,
          p_action: "delete_user",
          p_resource_type: "orphan_cleanup",
          p_details: {
            total_orphans: orphanedUsers.length,
            deleted: results.filter((r) => r.deleted).length,
            skipped: results.filter((r) => !r.deleted).length,
          },
        })
        .catch((e: any) => console.error("Audit log error:", e));
    }

    return json({
      success: true,
      dryRun,
      totalAuthUsers: allAuthUsers.length,
      totalOrphaned: orphanedUsers.length,
      results,
    });
  } catch (error: any) {
    console.error("cleanup-orphaned-auth error:", error);
    return json({ error: error.message || "Internal error" }, 500);
  }
};

serve(handler);
