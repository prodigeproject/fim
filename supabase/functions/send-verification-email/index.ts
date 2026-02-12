import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  name?: string;
  token?: string;
}

// Get SMTP config from database or fallback to env
async function getSmtpConfig(supabase: any) {
  try {
    const { data } = await supabase
      .from("email_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (data && data.mail_username && data.mail_password_encrypted) {
      return {
        host: data.mail_host || "smtp.gmail.com",
        port: data.mail_port || 465,
        tls: (data.mail_encryption || "TLS").toUpperCase() !== "NONE",
        username: data.mail_username,
        password: data.mail_password_encrypted,
        fromAddress: data.mail_from_address || data.mail_username,
        fromName: data.mail_from_name || "Forum Indonesia Muda",
      };
    }
  } catch (e) {
    console.log("Could not fetch email_settings, using env fallback:", e);
  }

  // Fallback to environment variables
  return {
    host: "smtp.gmail.com",
    port: 465,
    tls: true,
    username: Deno.env.get("GMAIL_USER") || "",
    password: Deno.env.get("GMAIL_APP_PASSWORD") || "",
    fromAddress: Deno.env.get("GMAIL_USER") || "",
    fromName: "Forum Indonesia Muda",
  };
}

async function sendEmail(config: any, to: string, subject: string, html: string) {
  if (!config.username || !config.password) {
    throw new Error("Email service not configured");
  }

  const client = new SMTPClient({
    connection: {
      hostname: config.host,
      port: config.port,
      tls: config.tls,
      auth: {
        username: config.username,
        password: config.password,
      },
    },
  });

  try {
    await client.send({
      from: `${config.fromName} <${config.fromAddress}>`,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`Email sent successfully to ${to} from ${config.fromAddress}`);
  } finally {
    await client.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, token }: VerificationRequest = await req.json();
    console.log("Sending verification email to:", email);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let verificationToken = token;
    let registrantName = name;

    // If no token provided, fetch from database
    if (!verificationToken) {
      const { data: regData, error: regError } = await supabase
        .from("fim_registrations")
        .select("email_verification_token, full_name, email_verification_expires_at")
        .eq("email", email.toLowerCase())
        .single();

      if (regError || !regData) {
        console.error("Registration not found:", regError);
        return new Response(
          JSON.stringify({ error: "Email tidak terdaftar" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      verificationToken = regData.email_verification_token;
      registrantName = regData.full_name;

      // Always generate a new token and reset expiration on resend
      verificationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      await supabase
        .from("fim_registrations")
        .update({ 
          email_verification_token: verificationToken,
          email_verification_expires_at: expiresAt,
          verification_attempts: 0,
        })
        .eq("email", email.toLowerCase());
    }

    // Use the production domain
    const baseUrl = Deno.env.get("SITE_URL") || "https://forumindonesiamuda.org";
    const verificationLink = `${baseUrl}/portal/verify?token=${verificationToken}`;

    // Get SMTP config from database
    const smtpConfig = await getSmtpConfig(supabase);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Forum Indonesia Muda</h1>
        <h2>Verifikasi Email Anda</h2>
        <p>Halo ${registrantName || "Pendaftar"},</p>
        <p>Terima kasih telah mendaftar di Forum Indonesia Muda. Silakan verifikasi email Anda dengan mengklik tombol di bawah ini:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verifikasi Email
          </a>
        </div>
        <p>Atau salin link berikut ke browser Anda:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p>Link ini akan kedaluwarsa dalam 7 hari.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px;">
          Jika Anda tidak mendaftar di FIM, abaikan email ini.
        </p>
      </div>
    `;

    await sendEmail(
      smtpConfig,
      email,
      "Verifikasi Email Pendaftaran FIM",
      emailHtml
    );

    console.log("Verification email sent via SMTP");

    return new Response(
      JSON.stringify({ success: true, message: "Email verifikasi telah dikirim" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending verification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
