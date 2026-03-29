import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders } from "../_shared/cors.ts";

type AppRole = "super_admin" | "admin" | "moderator";

interface CreateAdminUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: AppRole;
}

function isValidRole(role: unknown): role is AppRole {
  return role === "super_admin" || role === "admin" || role === "moderator";
}

function usernameFromEmail(email: string) {
  const base = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_\-\.]/g, "") || "user";
  return base.slice(0, 24) || "user";
}

const handler = async (req: Request): Promise<Response> => {
  console.log("admin-create-user: Request received");
  const corsHeaders = getCorsHeaders(req);

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    console.log("admin-create-user: Auth header present:", !!authHeader);

    // Client bound to the caller JWT (RLS applies)
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      console.error("admin-create-user: Auth error:", userError?.message);
      return new Response(JSON.stringify({ error: "Unauthorized - Please login again" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Mask user ID in logs to avoid exposing identifiers in Supabase Logs Dashboard
    const maskedId = user.id.slice(0, 8) + "****";
    console.log("admin-create-user: User authenticated:", maskedId);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Server-side role check
    const { data: isSuperAdmin, error: roleErr } = await supabaseAdmin.rpc(
      "has_role",
      {
        _user_id: user.id,
        _role: "super_admin",
      }
    );

    if (roleErr) {
      console.error("admin-create-user: Role check error:", roleErr.message);
      return new Response(JSON.stringify({ error: "Gagal memverifikasi role" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("admin-create-user: Is super admin:", isSuperAdmin);

    if (!isSuperAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden - Super Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let body: Partial<CreateAdminUserRequest>;
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("admin-create-user: JSON parse error:", parseErr);
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const email = body.email?.toLowerCase().trim() ?? "";
    const password = body.password ?? "";
    const fullName = body.full_name?.trim() ?? "";
    const role = body.role;

    console.log("admin-create-user: Creating user with email:", email, "role:", role);

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Email tidak valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password minimal 8 karakter" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!fullName) {
      return new Response(JSON.stringify({ error: "Nama lengkap wajib diisi" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!isValidRole(role)) {
      return new Response(JSON.stringify({ error: "Role tidak valid" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const username = usernameFromEmail(email);

    // Create auth user
    console.log("admin-create-user: Creating auth user...");
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        username,
      },
    });

    if (createErr || !created.user) {
      console.error("admin-create-user: Create user error:", createErr?.message);
      return new Response(
        JSON.stringify({ error: createErr?.message || "Gagal membuat user" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const newUserId = created.user.id;
    console.log("admin-create-user: Auth user created:", newUserId);

    // Create profile row
    console.log("admin-create-user: Creating profile...");
    const { error: profileErr } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      username,
      email,
      full_name: fullName,
      must_change_password: true,
      is_active: true,
    });

    if (profileErr) {
      console.error("admin-create-user: Profile insert error:", profileErr.message);
      // Attempt rollback auth user to avoid dangling accounts
      try {
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        console.log("admin-create-user: Rolled back auth user");
      } catch (rollbackErr) {
        console.error("admin-create-user: Rollback deleteUser failed:", rollbackErr);
      }
      return new Response(
        JSON.stringify({ error: "Gagal membuat profil pengguna: " + profileErr.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("admin-create-user: Profile created");

    // Assign role
    console.log("admin-create-user: Assigning role...");
    const { error: roleAssignErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUserId,
      role,
      assigned_by: user.id,
    });

    if (roleAssignErr) {
      console.error("admin-create-user: Role insert error:", roleAssignErr.message);
      // Best-effort rollback
      try {
        await supabaseAdmin.from("profiles").delete().eq("id", newUserId);
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        console.log("admin-create-user: Rolled back profile and auth user");
      } catch (rollbackErr) {
        console.error("admin-create-user: Rollback failed:", rollbackErr);
      }
      return new Response(JSON.stringify({ error: "Gagal menetapkan role: " + roleAssignErr.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("admin-create-user: Role assigned successfully");

    // Audit log (best effort) - use supabaseUser client for auth.uid()
    supabaseUser
      .rpc("log_audit_event", {
        p_action: "create_admin_user",
        p_resource_type: "user",
        p_resource_id: newUserId,
        p_details: { email, role },
      })
      .then(({ error }) => {
        if (error) console.error("admin-create-user: Audit log failed:", error.message);
        else console.log("admin-create-user: Audit log created");
      });

    console.log("admin-create-user: Success!");
    return new Response(
      JSON.stringify({ success: true, user_id: newUserId }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("admin-create-user error:", error?.message || error);
    return new Response(
      JSON.stringify({ error: error?.message || "Terjadi kesalahan" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
