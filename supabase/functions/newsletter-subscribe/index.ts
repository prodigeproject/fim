import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SubscribeRequest {
  email: string;
  name?: string;
}

// Send email using Gmail SMTP
async function sendGmailEmail(to: string, subject: string, html: string) {
  const gmailUser = Deno.env.get("GMAIL_USER");
  const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

  if (!gmailUser || !gmailPassword) {
    console.error("Gmail credentials not configured");
    throw new Error("Email service not configured");
  }

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: gmailUser,
        password: gmailPassword,
      },
    },
  });

  try {
    await client.send({
      from: gmailUser,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(`Email sent successfully to ${to}`);
  } finally {
    await client.close();
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get IP address for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
               req.headers.get("x-real-ip") ||
               req.headers.get("cf-connecting-ip") ||
               "unknown";

    // Rate limiting: Check attempts in last hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: attemptCount } = await supabase
      .from("newsletter_subscription_attempts")
      .select("*", { count: "exact", head: true })
      .eq("ip_address", ip)
      .gte("attempted_at", oneHourAgo);

    if (attemptCount && attemptCount >= 5) {
      console.log(`Rate limit exceeded for IP: ${ip}`);
      return new Response(
        JSON.stringify({ error: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, name }: SubscribeRequest = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Email tidak valid" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`Processing newsletter subscription for: ${normalizedEmail} from IP: ${ip}`);

    // Log the attempt for rate limiting
    await supabase
      .from("newsletter_subscription_attempts")
      .insert({ ip_address: ip, email: normalizedEmail });

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

    // Send welcome email using Gmail SMTP
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

      await sendGmailEmail(
        normalizedEmail,
        "Selamat Datang di Newsletter FIM! 🎉",
        emailHtml
      );
      console.log(`Welcome email sent to: ${normalizedEmail}`);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the subscription if email fails
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
