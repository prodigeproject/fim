import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  name?: string;
  token?: string;
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
        .select("email_verification_token, full_name")
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

      // Generate new token if not exists
      if (!verificationToken) {
        verificationToken = crypto.randomUUID();
        await supabase
          .from("fim_registrations")
          .update({ email_verification_token: verificationToken })
          .eq("email", email.toLowerCase());
      }
    }

    const baseUrl = Deno.env.get("SITE_URL") || "https://fim-indonesia.lovable.app";
    const verificationLink = `${baseUrl}/daftar/verify?token=${verificationToken}`;

    const emailResponse = await resend.emails.send({
      from: "Forum Indonesia Muda <noreply@resend.dev>",
      to: [email],
      subject: "Verifikasi Email Pendaftaran FIM",
      html: `
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
          <p>Link ini akan kedaluwarsa dalam 24 jam.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #666; font-size: 12px;">
            Jika Anda tidak mendaftar di FIM, abaikan email ini.
          </p>
        </div>
      `,
    });

    console.log("Verification email sent:", emailResponse);

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
