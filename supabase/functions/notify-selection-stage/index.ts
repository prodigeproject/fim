import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, getEmailTemplate, wrapEmailLayout, emailGreeting, emailParagraph, emailInfoBox } from "../_shared/notification-service.ts";

interface SelectionStageRequest {
  registrantEmail: string;
  registrantName: string;
  stage: "administrasi" | "lolos_administrasi" | "wawancara" | "pengumuman" | "interview_reminder" | "interview_reschedule";
  passed?: boolean;
  interviewDate?: string;
  note?: string;
  finalResult?: "lolos" | "tidak_lolos";
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const {
      registrantEmail, registrantName, stage, passed, interviewDate, note, finalResult,
    }: SelectionStageRequest = await req.json();

    if (!registrantEmail || !registrantName || !stage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let subject = "";
    let emailHtml = "";
    const isPassed = passed === true || stage === "lolos_administrasi";

    if (stage === "administrasi" || stage === "lolos_administrasi") {
      if (isPassed) {
        subject = "✅ Selamat! Anda Lolos Seleksi Administrasi FIM";
        emailHtml = wrapEmailLayout({
          title: "✅ Lolos Seleksi Administrasi",
          headerColor: "#16A34A",
          headerGradientEnd: "#15803D",
          preheader: "Selamat! Anda lolos seleksi administrasi Forum Indonesia Muda.",
          body: `
            ${emailGreeting(registrantName)}
            ${emailInfoBox({
              color: "#22C55E", bgColor: "#F0FDF4",
              content: `<p style="margin:0;font-size:17px;font-weight:700;color:#16A34A;">✅ Anda LOLOS Seleksi Administrasi!</p>`,
            })}
            ${emailParagraph("Tahap selanjutnya adalah <strong>Seleksi Wawancara</strong>.")}
            ${interviewDate ? emailInfoBox({
              color: "#3B82F6", bgColor: "#EFF6FF",
              content: `<p style="margin:0 0 4px;font-size:13px;color:#9CA3AF;">Jadwal Wawancara</p><p style="margin:0;font-size:18px;font-weight:700;color:#2563EB;">${interviewDate}</p>`,
            }) : emailParagraph("Tim kami akan segera menghubungi Anda untuk jadwal wawancara.")}
            ${note ? emailParagraph(`<strong>Catatan:</strong> ${note}`) : ""}
            <p style="color:#9CA3AF;font-size:14px;margin-top:24px;">Salam hangat,<br><strong style="color:#111827;">Tim Forum Indonesia Muda</strong></p>
          `,
        });
      } else {
        subject = "Informasi Seleksi Administrasi FIM";
        emailHtml = wrapEmailLayout({
          title: "Hasil Seleksi Administrasi",
          preheader: "Informasi hasil seleksi administrasi Forum Indonesia Muda.",
          body: `
            ${emailGreeting(registrantName)}
            ${emailParagraph("Terima kasih atas keikutsertaan Anda dalam seleksi Forum Indonesia Muda.")}
            ${emailInfoBox({
              color: "#EF4444", bgColor: "#FEF2F2",
              content: `<p style="margin:0;font-size:15px;color:#DC2626;">Dengan berat hati, kami informasikan bahwa Anda <strong>belum lolos seleksi administrasi</strong> pada periode ini.</p>`,
            })}
            ${note ? emailParagraph(`<strong>Catatan:</strong> ${note}`) : ""}
            ${emailParagraph("Jangan berkecil hati — Anda dapat mencoba kembali di periode pendaftaran berikutnya.")}
            <p style="color:#9CA3AF;font-size:14px;margin-top:24px;">Salam hangat,<br><strong style="color:#111827;">Tim Forum Indonesia Muda</strong></p>
          `,
        });
      }
    } else if (stage === "wawancara" && interviewDate) {
      // Use the centralized template for interview-scheduled
      const template = getEmailTemplate("interview-scheduled", {
        full_name: registrantName,
        date: interviewDate,
        time: "",
        location: "",
        meeting_link: "",
      });
      subject = template.subject;
      emailHtml = template.html;
    } else if (stage === "interview_reschedule") {
      subject = "📅 Perubahan Jadwal Wawancara FIM";
      emailHtml = wrapEmailLayout({
        title: "🔄 Jadwal Diubah",
        headerColor: "#D97706",
        headerGradientEnd: "#B45309",
        body: `
          ${emailGreeting(registrantName)}
          ${emailParagraph("Kami menginformasikan bahwa jadwal wawancara Anda telah <strong>diubah</strong>.")}
          ${emailInfoBox({
            color: "#F59E0B", bgColor: "#FFFBEB",
            content: `<p style="margin:0 0 4px;font-size:13px;color:#9CA3AF;">Jadwal Baru</p><p style="margin:0;font-size:18px;font-weight:700;color:#D97706;">${interviewDate || "Akan dikonfirmasi"}</p>`,
          })}
          ${note ? emailParagraph(`<strong>Catatan:</strong> ${note}`) : ""}
          ${emailParagraph("Mohon pastikan Anda hadir sesuai jadwal baru yang telah ditetapkan.")}
          <p style="color:#9CA3AF;font-size:14px;margin-top:24px;">Salam hangat,<br><strong style="color:#111827;">Tim Forum Indonesia Muda</strong></p>
        `,
      });
    } else if (stage === "interview_reminder") {
      const template = getEmailTemplate("interview-reminder", {
        full_name: registrantName,
        date: interviewDate || "",
        time: "",
        meeting_link: "",
      });
      subject = template.subject;
      emailHtml = template.html;
    } else if (stage === "pengumuman") {
      const template = getEmailTemplate("final-result", {
        full_name: registrantName,
        result: finalResult || "tidak_lolos",
      });
      subject = template.subject;
      emailHtml = template.html;
    }

    if (!subject || !emailHtml) {
      return new Response(
        JSON.stringify({ error: "Invalid stage or missing data" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const result = await sendGmailEmail({
      to: registrantEmail,
      subject,
      html: emailHtml,
    });

    if (!result.success) throw new Error(result.error || "Failed to send email");

    console.log("Selection stage email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-selection-stage:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
