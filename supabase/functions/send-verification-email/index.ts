import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendEmailWithConfig, getSmtpConfig, getEmailTemplate, createServiceClient } from "../_shared/notification-service.ts";

interface VerificationRequest {
  email: string;
  name?: string;
  token?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const { email, name, token }: VerificationRequest = await req.json();
    console.log("Sending verification email to:", email);

    const supabase = createServiceClient();

    let verificationToken = token;
    let registrantName = name;

    if (!verificationToken) {
      const { data: regData, error: regError } = await supabase
        .from("fim_registrations")
        .select("email_verification_token, full_name, email_verification_expires_at")
        .eq("email", email.toLowerCase())
        .single();

      if (regError || !regData) {
        return new Response(
          JSON.stringify({ error: "Email tidak terdaftar" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      registrantName = regData.full_name;

      // Always generate a new token and reset expiration on resend
      verificationToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("fim_registrations")
        .update({
          email_verification_token: verificationToken,
          email_verification_expires_at: expiresAt,
          verification_attempts: 0,
        })
        .eq("email", email.toLowerCase());
    }

    const baseUrl = Deno.env.get("SITE_URL") || "https://forumindonesiamuda.org";
    const verificationLink = `${baseUrl}/portal/verify?token=${verificationToken}`;

    // Use centralized SMTP config (reads DB config + env secrets)
    const smtpConfig = await getSmtpConfig(supabase);

    const template = getEmailTemplate("verification-email", {
      full_name: registrantName || "Pendaftar",
      verification_url: verificationLink,
    });

    const result = await sendEmailWithConfig(smtpConfig, {
      to: email,
      subject: "Verifikasi Email Pendaftaran FIM",
      html: template.html,
    });

    if (!result.success) {
      throw new Error(result.error || "Gagal mengirim email");
    }

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
