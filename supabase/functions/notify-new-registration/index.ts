import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendGmailEmail(to: string | string[], subject: string, html: string) {
  const gmailUser = Deno.env.get("GMAIL_USER");
  const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD");
  
  if (!gmailUser || !gmailAppPassword) {
    throw new Error("Gmail credentials not configured");
  }

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: gmailUser,
        password: gmailAppPassword,
      },
    },
  });

  try {
    const recipients = Array.isArray(to) ? to : [to];
    for (const recipient of recipients) {
      await client.send({
        from: `Forum Indonesia Muda <${gmailUser}>`,
        to: recipient,
        subject: subject,
        content: "Please view this email in an HTML-compatible email client.",
        html: html,
      });
    }
    await client.close();
    return { success: true };
  } catch (error) {
    await client.close();
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    // Send email to super admins using Gmail SMTP
    const gmailUser = Deno.env.get("GMAIL_USER");
    if (gmailUser) {
      // Get super admin emails
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("email")
        .in("id", superAdmins.map((a) => a.user_id));

      if (!profilesError && profiles && profiles.length > 0) {
        const adminEmails = profiles.map((p) => p.email).filter(Boolean);
        
        if (adminEmails.length > 0) {
          try {
            const emailHtml = `
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
                  <a href="https://fim.lovable.app/admin/registrations" 
                     style="display: inline-block; padding: 10px 20px; background: #3182ce; color: white; text-decoration: none; border-radius: 5px;">
                    Lihat Detail Pendaftaran
                  </a>
                </p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 12px;">
                  Email ini dikirim otomatis oleh sistem FIM.
                </p>
              </div>
            `;

            await sendGmailEmail(
              adminEmails,
              `[FIM] Pendaftaran Baru: ${fullName}`,
              emailHtml
            );
            console.log("Email notification sent to super admins");
          } catch (emailErr) {
            console.error("Email send exception:", emailErr);
          }
        }
      }
    } else {
      console.log("GMAIL_USER not configured, skipping email notification");
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
