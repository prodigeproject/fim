import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyInterviewCompletedRequest {
  registrantEmail: string;
  registrantName: string;
  interviewDate?: string;
  interviewerName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const { registrantEmail, registrantName, interviewDate, interviewerName }: NotifyInterviewCompletedRequest = await req.json();

    console.log("Sending interview completed notification to:", registrantEmail);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wawancara Selesai - FIM</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Forum Indonesia Muda</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e40af; margin-top: 0;">Halo ${registrantName}! 👋</h2>
      
      <p>Terima kasih telah mengikuti sesi wawancara dengan Forum Indonesia Muda${interviewDate ? ` pada ${interviewDate}` : ''}${interviewerName ? ` bersama ${interviewerName}` : ''}.</p>
      
      <div style="background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #166534; font-size: 16px;">
          <strong>✅ Wawancara Anda telah selesai!</strong>
        </p>
      </div>
      
      <div style="background: #e0e7ff; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #3730a3; font-size: 14px;">
          <strong>📋 Langkah Selanjutnya:</strong>
        </p>
        <ol style="margin: 10px 0 0; padding-left: 20px; color: #3730a3;">
          <li>Tim FIM akan mengevaluasi hasil wawancara Anda</li>
          <li>Keputusan akhir akan diumumkan melalui email</li>
          <li>Pantau terus email Anda untuk informasi lebih lanjut</li>
        </ol>
      </div>
      
      <p style="color: #6b7280; font-size: 14px;">
        Kami menghargai waktu dan usaha Anda dalam mengikuti proses seleksi ini. Apapun hasilnya nanti, kami berharap pengalaman ini memberikan pembelajaran berharga bagi Anda.
      </p>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>💡 Tips:</strong> Anda dapat memantau status pendaftaran Anda melalui dashboard pendaftaran FIM.
        </p>
      </div>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">
        Jika Anda memiliki pertanyaan, silakan hubungi tim FIM.<br/>
        © Forum Indonesia Muda. Semua hak dilindungi.
      </p>
    </div>
  </div>
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
        subject: "✅ Wawancara FIM Anda Telah Selesai",
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResult = await emailResponse.json();
    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, message: "Interview completion notification sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-interview-completed function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
