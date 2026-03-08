import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate } from "../_shared/notification-service.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { registrationId, fullName, email } = await req.json();
    console.log(`New registration notification for: ${fullName} (${email})`);

    // Get all super admins
    const { data: superAdmins, error: adminsError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin");

    if (adminsError) throw adminsError;

    if (!superAdmins || superAdmins.length === 0) {
      return json({ success: true, message: "No super admins to notify" });
    }

    // Create in-app notifications
    const notifications = superAdmins.map((admin) => ({
      user_id: admin.user_id,
      title: "Pendaftaran Baru",
      message: `${fullName} (${email}) baru saja mendaftar sebagai peserta FIM.`,
      type: "registration",
      link: "/admin/registrations",
    }));

    const { error: notifError } = await supabase
      .from("admin_notifications")
      .insert(notifications);

    if (notifError) console.error("Error creating notifications:", notifError);
    else console.log(`Created ${notifications.length} notifications`);

    // Send email to super admins via Gmail SMTP
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email")
      .in("id", superAdmins.map((a) => a.user_id));

    if (profiles && profiles.length > 0) {
      const adminEmails = profiles.map((p) => p.email).filter(Boolean);

      if (adminEmails.length > 0) {
        const timestamp = new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const template = getEmailTemplate("new-registration", {
          full_name: fullName,
          email,
          timestamp: `${timestamp} WIB`,
        });

        try {
          const result = await sendGmailEmail({
            to: adminEmails,
            subject: template.subject,
            html: template.html,
          });
          if (result.success) {
            console.log("Email notification sent to super admins");
          } else {
            console.error("Email send error:", result.error);
          }
        } catch (emailErr) {
          console.error("Email send exception:", emailErr);
        }
      }
    }

    return json({ success: true, message: `Notifications sent to ${superAdmins.length} super admins` });
  } catch (error: any) {
    console.error("Error in notify-new-registration:", error);
    return json({ success: false, error: error?.message || "Unknown error" }, 500);
  }
});
