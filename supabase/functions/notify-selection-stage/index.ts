import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SelectionStageRequest {
  registrantEmail: string;
  registrantName: string;
  stage: "administrasi" | "wawancara" | "pengumuman";
  passed: boolean;
  interviewDate?: string;
  note?: string;
  finalResult?: "lolos" | "tidak_lolos";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      registrantEmail, 
      registrantName, 
      stage, 
      passed, 
      interviewDate,
      note,
      finalResult 
    }: SelectionStageRequest = await req.json();

    if (!registrantEmail || !registrantName || !stage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let subject = "";
    let content = "";
    let statusColor = passed ? "#22c55e" : "#ef4444";
    let statusEmoji = passed ? "✅" : "❌";

    if (stage === "administrasi") {
      if (passed) {
        subject = "Selamat! Anda Lolos Seleksi Administrasi FIM";
        content = `
          <p>Selamat! Anda telah <strong style="color: #22c55e;">LOLOS SELEKSI ADMINISTRASI</strong> Forum Indonesia Muda.</p>
          <p>Tahap selanjutnya adalah <strong>Seleksi Wawancara</strong>.</p>
          ${interviewDate ? `
          <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Jadwal Wawancara:</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #166534;">${interviewDate}</p>
          </div>
          ` : '<p>Tim kami akan segera menghubungi Anda untuk jadwal wawancara.</p>'}
        `;
      } else {
        subject = "Informasi Seleksi Administrasi FIM";
        content = `
          <p>Terima kasih atas keikutsertaan Anda dalam seleksi Forum Indonesia Muda.</p>
          <p>Dengan berat hati, kami informasikan bahwa Anda <strong style="color: #ef4444;">belum lolos seleksi administrasi</strong> pada periode ini.</p>
          ${note ? `<p><strong>Catatan:</strong> ${note}</p>` : ''}
          <p>Jangan berkecil hati, Anda dapat mencoba kembali di periode pendaftaran berikutnya.</p>
        `;
      }
    } else if (stage === "wawancara") {
      if (interviewDate) {
        subject = "Undangan Wawancara Forum Indonesia Muda";
        statusColor = "#3b82f6";
        statusEmoji = "📅";
        content = `
          <p>Anda diundang untuk mengikuti <strong>Sesi Wawancara</strong> Forum Indonesia Muda.</p>
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Jadwal Wawancara:</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #1e40af;">${interviewDate}</p>
          </div>
          <p>Pastikan Anda hadir tepat waktu dan mempersiapkan diri dengan baik.</p>
          ${note ? `<p><strong>Catatan:</strong> ${note}</p>` : ''}
        `;
      }
    } else if (stage === "pengumuman") {
      if (finalResult === "lolos") {
        subject = "🎉 Selamat! Anda Diterima di Forum Indonesia Muda";
        content = `
          <p>Selamat! Anda telah resmi <strong style="color: #22c55e;">DITERIMA</strong> sebagai peserta Forum Indonesia Muda! 🎉</p>
          <p>Kami sangat senang menyambut Anda dalam komunitas kami.</p>
          <p>Tim FIM akan segera menghubungi Anda untuk informasi lebih lanjut mengenai program pelatihan.</p>
          ${note ? `<p><strong>Catatan:</strong> ${note}</p>` : ''}
        `;
      } else {
        subject = "Informasi Hasil Seleksi FIM";
        content = `
          <p>Terima kasih telah mengikuti seluruh rangkaian seleksi Forum Indonesia Muda.</p>
          <p>Dengan berat hati, kami informasikan bahwa Anda <strong style="color: #ef4444;">belum dapat diterima</strong> pada periode ini.</p>
          ${note ? `<p><strong>Catatan:</strong> ${note}</p>` : ''}
          <p>Kami mengapresiasi semangat dan usaha Anda. Jangan menyerah, terus kembangkan diri dan coba lagi di periode berikutnya!</p>
        `;
      }
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">FIM Indonesia</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Forum Indonesia Muda</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Halo, ${registrantName}! ${statusEmoji}</h2>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                © ${new Date().getFullYear()} Forum Indonesia Muda. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Email ini dikirim secara otomatis. Jika ada pertanyaan, silakan hubungi tim kami.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FIM Indonesia <noreply@resend.dev>",
        to: [registrantEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Email sending failed: ${errorData}`);
    }

    const emailData = await emailResponse.json();
    console.log("Selection stage email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, data: emailData }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-selection-stage function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);