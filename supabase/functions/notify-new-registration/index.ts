import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { registrationId, fullName, email } = await req.json();

    console.log(`New registration notification for: ${fullName} (${email})`);

    // Get all super admins
    const { data: superAdmins, error: adminsError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "super_admin");

    if (adminsError) {
      console.error("Error fetching super admins:", adminsError);
      throw adminsError;
    }

    if (!superAdmins || superAdmins.length === 0) {
      console.log("No super admins found");
      return new Response(
        JSON.stringify({ success: true, message: "No super admins to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notifications for each super admin
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

    if (notifError) {
      console.error("Error creating notifications:", notifError);
    } else {
      console.log(`Created ${notifications.length} notifications for super admins`);
    }

    // Send email to super admins if RESEND_API_KEY is configured
    if (resendApiKey) {
      // Get super admin emails
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email")
        .in("id", superAdmins.map((a) => a.user_id));

      if (!profilesError && profiles && profiles.length > 0) {
        const adminEmails = profiles.map((p) => p.email).filter(Boolean);
        
        if (adminEmails.length > 0) {
          try {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "FIM Notification <noreply@fim.or.id>",
                to: adminEmails,
                subject: `[FIM] Pendaftaran Baru: ${fullName}`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1a365d;">Pendaftaran Baru FIM</h2>
                    <p>Ada pendaftar baru di sistem registrasi FIM:</p>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                      <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Nama:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${fullName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Waktu:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</td>
                      </tr>
                    </table>
                    <p>
                      <a href="${supabaseUrl.replace('.supabase.co', '')}/admin/registrations" 
                         style="display: inline-block; padding: 10px 20px; background: #3182ce; color: white; text-decoration: none; border-radius: 5px;">
                        Lihat Detail Pendaftaran
                      </a>
                    </p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">
                      Email ini dikirim otomatis oleh sistem FIM.
                    </p>
                  </div>
                `,
              }),
            });

            if (emailResponse.ok) {
              console.log("Email notification sent to super admins");
            } else {
              const emailError = await emailResponse.text();
              console.error("Email send error:", emailError);
            }
          } catch (emailErr) {
            console.error("Email send exception:", emailErr);
          }
        }
      }
    } else {
      console.log("RESEND_API_KEY not configured, skipping email notification");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${superAdmins.length} super admins` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in notify-new-registration:", error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
