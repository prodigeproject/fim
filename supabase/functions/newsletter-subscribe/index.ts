import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, name }: SubscribeRequest = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email tidak valid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`Processing newsletter subscription for: ${normalizedEmail}`);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ message: "Email sudah terdaftar sebagai subscriber" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        // Reactivate subscription
        await supabase
          .from("newsletter_subscribers")
          .update({ 
            is_active: true, 
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null 
          })
          .eq("id", existing.id);

        console.log(`Reactivated subscription for: ${normalizedEmail}`);
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: normalizedEmail,
          name: name?.trim() || null,
          confirmed_at: new Date().toISOString(), // Auto-confirm for now
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      console.log(`New subscription created for: ${normalizedEmail}`);
    }

    // Send welcome email if Resend is configured
    if (resendApiKey) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin-bottom: 10px;">Selamat Datang! 🎉</h1>
            </div>
            
            <p>Halo${name ? ` <strong>${name}</strong>` : ""},</p>
            
            <p>Terima kasih telah berlangganan newsletter <strong>Forum Indonesia Muda</strong>!</p>
            
            <p>Anda akan menerima update terbaru seputar:</p>
            <ul>
              <li>🎯 Program dan kegiatan FIM</li>
              <li>🏆 Prestasi alumni dan peserta</li>
              <li>📢 Pengumuman penting</li>
              <li>💡 Tips dan inspirasi dari komunitas</li>
            </ul>
            
            <p>Ikuti juga media sosial kami untuk update harian:</p>
            <p>
              <a href="https://instagram.com/forumindonesiamuda" style="color: #2563eb; text-decoration: none;">📷 Instagram</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px;">
              Anda menerima email ini karena mendaftar newsletter FIM. 
              Jika tidak ingin menerima email lagi, silakan hubungi kami.
            </p>
            
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Forum Indonesia Muda
            </p>
          </body>
          </html>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Forum Indonesia Muda <onboarding@resend.dev>",
            to: [normalizedEmail],
            subject: "Selamat Datang di Newsletter FIM! 🎉",
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          console.error("Resend API error:", errorData);
        } else {
          console.log(`Welcome email sent to: ${normalizedEmail}`);
        }
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail the subscription if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Berhasil berlangganan newsletter! Cek email Anda untuk konfirmasi." 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Terjadi kesalahan" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
