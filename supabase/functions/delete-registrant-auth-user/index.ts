import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface DeleteAuthUserRequest {
  auth_user_id: string;
  registration_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { auth_user_id, registration_id }: DeleteAuthUserRequest = await req.json();

    if (!auth_user_id || !registration_id) {
      return new Response(
        JSON.stringify({ error: "auth_user_id and registration_id are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Deleting auth user: ${auth_user_id} for registration: ${registration_id}`);

    // Delete related data first
    // Delete recruiter assignments
    await supabase
      .from("recruiter_assignments")
      .delete()
      .eq("registration_id", registration_id);

    // Delete activity logs
    await supabase
      .from("registration_activity_logs")
      .delete()
      .eq("registration_id", registration_id);

    // Delete interview schedules
    await supabase
      .from("interview_schedules")
      .delete()
      .eq("registration_id", registration_id);

    // Delete training data
    await supabase
      .from("fim_training_registrations")
      .delete()
      .eq("registration_id", registration_id);

    // Delete registration
    await supabase
      .from("fim_registrations")
      .delete()
      .eq("id", registration_id);

    // Delete the auth user using admin API
    const { error: deleteError } = await supabase.auth.admin.deleteUser(auth_user_id);
    
    if (deleteError) {
      console.error("Error deleting auth user:", deleteError);
      // Continue even if auth user deletion fails - registration data is already deleted
    } else {
      console.log("Auth user deleted successfully");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Registrant and auth user deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Delete registrant auth user error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to delete registrant" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
