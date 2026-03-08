import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate } from "../_shared/notification-service.ts";

interface UnauthorizedAccessRequest {
  userId: string;
  username: string;
  email: string;
  attemptedPath: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
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
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    const {
      userId, username, email, attemptedPath, userRole, ipAddress, userAgent,
    }: UnauthorizedAccessRequest = await req.json();

    console.log("Recording unauthorized access attempt for user:", username);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from("unauthorized_access_attempts")
      .insert({
        user_id: userId, username, email,
        attempted_path: attemptedPath, user_role: userRole,
        ip_address: ipAddress, user_agent: userAgent,
      });

    if (insertError) console.error("Error inserting unauthorized access attempt:", insertError);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase
      .from("unauthorized_access_attempts")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    const attemptCount = recentAttempts?.length || 0;

    if (attemptCount >= 3 && attemptCount % 3 === 0) {
      const formattedTime = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const template = getEmailTemplate("unauthorized-access", {
        username,
        email,
        user_role: userRole,
        attempted_path: attemptedPath,
        timestamp: formattedTime,
        ip_address: ipAddress || "N/A",
        attempt_count: String(attemptCount),
      });

      await sendGmailEmail({
        to: "web@forumindonesiamuda.org",
        subject: template.subject,
        html: template.html,
      });

      return json({ success: true, emailSent: true, attemptCount });
    }

    return json({ success: true, emailSent: false, attemptCount });
  } catch (error: any) {
    console.error("Error in notify-unauthorized-access:", error);
    return json({ success: false, error: error.message }, 500);
  }
};

serve(handler);
