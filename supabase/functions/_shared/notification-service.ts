// =====================================================
// CENTRALIZED NOTIFICATION SERVICE
// Email sending via Gmail SMTP using denomailer
// Reads config from email_settings table with env fallback
// Unified email template system with FIM branding
// =====================================================

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ── Types ───────────────────────────────────────────────

export interface SmtpConfig {
  host: string;
  port: number;
  tls: boolean;
  username: string;
  password: string;
  fromAddress: string;
  fromName: string;
  replyTo?: string;
}

export interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ── SMTP Config ─────────────────────────────────────────

/**
 * Get SMTP config from email_settings table, fallback to env secrets.
 * NEVER stores passwords in DB — uses env secrets only.
 */
export async function getSmtpConfig(supabase?: any): Promise<SmtpConfig> {
  const envUser = Deno.env.get("GMAIL_USER") || "";
  const envPassword = Deno.env.get("GMAIL_APP_PASSWORD") || "";

  if (supabase) {
    try {
      const { data } = await supabase
        .from("email_settings")
        .select("mail_host, mail_port, mail_encryption, mail_from_address, mail_from_name, mail_username, reply_to_address")
        .limit(1)
        .maybeSingle();

      if (data) {
        return {
          host: data.mail_host || "smtp.gmail.com",
          port: data.mail_port || 465,
          tls: (data.mail_encryption || "TLS").toUpperCase() !== "NONE",
          username: data.mail_username || envUser,
          password: envPassword,
          fromAddress: data.mail_from_address || data.mail_username || envUser,
          fromName: data.mail_from_name || "Forum Indonesia Muda",
          replyTo: data.reply_to_address || undefined,
        };
      }
    } catch (e) {
      console.log("Could not fetch email_settings, using env fallback:", e);
    }
  }

  return {
    host: "smtp.gmail.com",
    port: 465,
    tls: true,
    username: envUser,
    password: envPassword,
    fromAddress: envUser,
    fromName: "Forum Indonesia Muda",
  };
}

// ── Rate Limiting ───────────────────────────────────────

export async function checkDailyRateLimit(supabase: any): Promise<{ allowed: boolean; sent: number; limit: number }> {
  let dailyLimit = 2000;
  try {
    const { data } = await supabase
      .from("email_settings")
      .select("daily_rate_limit")
      .limit(1)
      .maybeSingle();
    if (data?.daily_rate_limit) dailyLimit = data.daily_rate_limit;
  } catch { /* use default */ }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("notification_queue")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("processed_at", todayStart.toISOString());

  const sent = count || 0;
  return { allowed: sent < dailyLimit, sent, limit: dailyLimit };
}

// ── Email Sending ───────────────────────────────────────

export async function sendEmailWithConfig(config: SmtpConfig, params: EmailParams): Promise<NotificationResult> {
  if (!config.username || !config.password) {
    return { success: false, error: "Email service not configured (missing credentials)" };
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
    const recipients = Array.isArray(params.to) ? params.to : [params.to];

    await client.send({
      from: `${config.fromName} <${config.fromAddress}>`,
      to: recipients,
      subject: params.subject,
      content: params.text || "",
      html: params.html,
      replyTo: params.replyTo,
    });

    return {
      success: true,
      messageId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    try { await client.close(); } catch { /* already closed */ }
  }
}

export async function sendGmailEmail(params: EmailParams): Promise<NotificationResult> {
  const config = await getSmtpConfig();
  return sendEmailWithConfig(config, params);
}

export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// =====================================================
// UNIFIED EMAIL LAYOUT SYSTEM
// Professional table-based layout for all email clients
// FIM Red branding (#DC2626 primary)
// =====================================================

const FIM_COLORS = {
  primary: "#DC2626",       // FIM Red
  primaryDark: "#B91C1C",   // Darker red for gradients
  success: "#16A34A",
  successLight: "#F0FDF4",
  successBorder: "#22C55E",
  warning: "#D97706",
  warningLight: "#FFFBEB",
  warningBorder: "#F59E0B",
  info: "#2563EB",
  infoLight: "#EFF6FF",
  infoBorder: "#3B82F6",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  dangerBorder: "#EF4444",
  textPrimary: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#9CA3AF",
  bgBody: "#F3F4F6",
  bgCard: "#FFFFFF",
  bgFooter: "#F9FAFB",
  border: "#E5E7EB",
};

/**
 * Wraps email content in a consistent, professional FIM-branded layout.
 * Uses table-based structure for maximum email client compatibility.
 */
export function wrapEmailLayout(options: {
  title: string;
  headerColor?: string;
  headerGradientEnd?: string;
  preheader?: string;
  body: string;
  footerText?: string;
}): string {
  const {
    title,
    headerColor = FIM_COLORS.primary,
    headerGradientEnd = FIM_COLORS.primaryDark,
    preheader = "",
    body,
    footerText = "Email ini dikirim secara otomatis. Jika ada pertanyaan, silakan hubungi tim kami.",
  } = options;

  return `<!DOCTYPE html>
<html lang="id" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml>
    <o:OfficeDocumentSettings>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml></noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${FIM_COLORS.bgBody}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  ${preheader ? `<div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ""}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${FIM_COLORS.bgBody};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: ${FIM_COLORS.bgCard}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${headerColor} 0%, ${headerGradientEnd} 100%); padding: 36px 32px; text-align: center;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="width: 48px; height: 48px; background-color: rgba(255,255,255,0.2); border-radius: 12px; text-align: center; vertical-align: middle; font-size: 24px; line-height: 48px;">
                          🇮🇩
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">${title}</h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 6px;">
                    <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 13px; font-weight: 500;">Forum Indonesia Muda</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              ${body}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: ${FIM_COLORS.bgFooter}; padding: 24px 32px; text-align: center; border-top: 1px solid ${FIM_COLORS.border};">
              <p style="color: ${FIM_COLORS.textMuted}; font-size: 13px; line-height: 1.5; margin: 0 0 8px 0;">${footerText}</p>
              <p style="color: ${FIM_COLORS.textMuted}; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Forum Indonesia Muda. Seluruh hak dilindungi.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Creates a colored info/alert box for email content.
 */
export function emailInfoBox(options: {
  color: string;
  bgColor: string;
  content: string;
}): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
    <tr>
      <td style="background-color: ${options.bgColor}; border-left: 4px solid ${options.color}; padding: 16px 20px; border-radius: 0 10px 10px 0;">
        ${options.content}
      </td>
    </tr>
  </table>`;
}

/**
 * Creates a CTA button for emails.
 */
export function emailButton(options: {
  href: string;
  label: string;
  color?: string;
}): string {
  const color = options.color || FIM_COLORS.primary;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="background-color: ${color}; border-radius: 10px;">
              <a href="${options.href}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; letter-spacing: 0.2px;">${options.label}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

/**
 * Creates a key-value detail row for emails.
 */
export function emailDetailRow(label: string, value: string, icon?: string): string {
  return `<tr>
    <td style="padding: 10px 12px; color: ${FIM_COLORS.textMuted}; font-size: 13px; font-weight: 600; white-space: nowrap; vertical-align: top; width: 140px;">${icon ? icon + " " : ""}${label}</td>
    <td style="padding: 10px 12px; color: ${FIM_COLORS.textPrimary}; font-size: 14px; vertical-align: top;">${value}</td>
  </tr>`;
}

/**
 * Wraps detail rows in a styled table.
 */
export function emailDetailsTable(rows: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F9FAFB; border-radius: 12px; margin: 20px 0; overflow: hidden;">
    ${rows}
  </table>`;
}

// ── Greeting helper ─────────────────────────────────────

export function emailGreeting(name: string): string {
  return `<p style="color: ${FIM_COLORS.textPrimary}; font-size: 17px; font-weight: 600; margin: 0 0 6px 0;">Halo, ${name}! 👋</p>`;
}

export function emailParagraph(text: string): string {
  return `<p style="color: ${FIM_COLORS.textSecondary}; font-size: 15px; line-height: 1.7; margin: 0 0 16px 0;">${text}</p>`;
}

export function emailDivider(): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0;"><tr><td style="border-top: 1px solid ${FIM_COLORS.border};"></td></tr></table>`;
}

// =====================================================
// EMAIL TEMPLATES
// All templates use the unified layout system
// =====================================================

export type TemplateName =
  | "selection-stage-change"
  | "final-result"
  | "interview-scheduled"
  | "interview-reminder"
  | "verification-email"
  | "password-reset"
  | "new-registration"
  | "article-status"
  | "revision-request"
  | "login-notification"
  | "unauthorized-access"
  | "interview-completed"
  | "registration-status"
  | "newsletter-welcome"
  | "reminder-incomplete";

export function getEmailTemplate(
  templateName: TemplateName,
  variables: Record<string, string>
): { subject: string; html: string } {
  switch (templateName) {
    case "selection-stage-change":
      return {
        subject: `Status Seleksi FIM: ${variables.new_stage}`,
        html: wrapEmailLayout({
          title: "Status Seleksi Diperbarui",
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph("Status seleksi Anda di Forum Indonesia Muda telah diperbarui.")}
            ${emailInfoBox({
              color: FIM_COLORS.info,
              bgColor: FIM_COLORS.infoLight,
              content: `
                <p style="margin: 0 0 4px; font-size: 13px; color: ${FIM_COLORS.textMuted};">Tahap Sebelumnya</p>
                <p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: ${FIM_COLORS.textPrimary};">${variables.old_stage}</p>
                <p style="margin: 0 0 4px; font-size: 13px; color: ${FIM_COLORS.textMuted};">Tahap Saat Ini</p>
                <p style="margin: 0; font-size: 17px; font-weight: 700; color: ${FIM_COLORS.info};">${variables.new_stage}</p>
              `,
            })}
            ${emailParagraph("Silakan login ke portal pendaftaran untuk melihat detail lebih lanjut.")}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Salam hangat,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    case "final-result": {
      const isLolos = variables.result === "lolos";
      return {
        subject: isLolos ? "🎉 Selamat! Anda Diterima di FIM" : "Pengumuman Hasil Seleksi FIM",
        html: wrapEmailLayout({
          title: isLolos ? "🎉 Selamat!" : "Pengumuman Hasil Seleksi",
          headerColor: isLolos ? FIM_COLORS.success : FIM_COLORS.primary,
          headerGradientEnd: isLolos ? "#15803D" : FIM_COLORS.primaryDark,
          preheader: isLolos ? "Selamat! Anda resmi diterima sebagai peserta FIM." : "Pengumuman hasil seleksi Forum Indonesia Muda.",
          body: `
            ${emailGreeting(variables.full_name)}
            ${isLolos
              ? `${emailInfoBox({
                  color: FIM_COLORS.success,
                  bgColor: FIM_COLORS.successLight,
                  content: `<p style="margin: 0; font-size: 17px; font-weight: 700; color: ${FIM_COLORS.success};">✅ Anda DITERIMA sebagai Peserta FIM!</p>`,
                })}
                ${emailParagraph("Dengan bangga kami sampaikan bahwa Anda telah resmi diterima sebagai peserta Forum Indonesia Muda. Kami sangat senang menyambut Anda dalam komunitas kami.")}
                ${emailParagraph("Tim FIM akan segera menghubungi Anda untuk informasi lebih lanjut mengenai program pelatihan.")}`
              : `${emailParagraph("Terima kasih telah mengikuti seluruh rangkaian seleksi Forum Indonesia Muda.")}
                ${emailInfoBox({
                  color: FIM_COLORS.danger,
                  bgColor: FIM_COLORS.dangerLight,
                  content: `<p style="margin: 0; font-size: 15px; color: ${FIM_COLORS.danger};">Dengan berat hati, kami informasikan bahwa Anda <strong>belum dapat diterima</strong> pada periode ini.</p>`,
                })}
                ${emailParagraph("Kami mengapresiasi semangat dan usaha Anda. Jangan menyerah — terus kembangkan diri dan coba lagi di periode berikutnya!")}`
            }
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Salam hangat,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };
    }

    case "interview-scheduled":
      return {
        subject: "📅 Jadwal Wawancara FIM",
        html: wrapEmailLayout({
          title: "📅 Jadwal Wawancara",
          preheader: `Wawancara Anda dijadwalkan pada ${variables.date}`,
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph("Jadwal wawancara Anda di Forum Indonesia Muda telah ditentukan.")}
            ${emailDetailsTable(`
              ${emailDetailRow("Tanggal", `<strong>${variables.date}</strong>`, "📆")}
              ${emailDetailRow("Waktu", `<strong>${variables.time} WIB</strong>`, "🕐")}
              ${variables.location ? emailDetailRow("Lokasi", variables.location, "📍") : ""}
              ${variables.meeting_link ? emailDetailRow("Link Meeting", `<a href="${variables.meeting_link}" style="color: ${FIM_COLORS.info}; word-break: break-all;">${variables.meeting_link}</a>`, "🔗") : ""}
            `)}
            ${emailParagraph("Pastikan Anda hadir tepat waktu dan mempersiapkan diri dengan baik. Semoga sukses!")}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Salam hangat,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    case "interview-reminder":
      return {
        subject: `⏰ Reminder: Wawancara FIM Besok`,
        html: wrapEmailLayout({
          title: "⏰ Pengingat Wawancara",
          headerColor: FIM_COLORS.warning,
          headerGradientEnd: "#B45309",
          preheader: "Wawancara Anda dijadwalkan besok. Pastikan Anda siap!",
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph("Ini adalah pengingat bahwa wawancara Anda akan dilaksanakan <strong>BESOK</strong>.")}
            ${emailInfoBox({
              color: FIM_COLORS.warningBorder,
              bgColor: FIM_COLORS.warningLight,
              content: `
                <p style="margin: 0 0 4px; font-size: 13px; color: ${FIM_COLORS.textMuted};">Jadwal Wawancara</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${FIM_COLORS.warning};">📅 ${variables.date}</p>
                <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: ${FIM_COLORS.warning};">🕐 ${variables.time} WIB</p>
              `,
            })}
            ${variables.meeting_link ? emailInfoBox({
              color: FIM_COLORS.successBorder,
              bgColor: FIM_COLORS.successLight,
              content: `<p style="margin: 0;"><strong style="color: ${FIM_COLORS.success};">🔗 Link Meeting:</strong></p><a href="${variables.meeting_link}" style="color: ${FIM_COLORS.info}; word-break: break-all; font-size: 14px;">${variables.meeting_link}</a>`,
            }) : ""}
            ${emailParagraph("<strong>Tips untuk wawancara:</strong>")}
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 16px 8px;">
              <tr><td style="padding: 4px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">• Pastikan koneksi internet stabil</td></tr>
              <tr><td style="padding: 4px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">• Siapkan diri 10-15 menit sebelumnya</td></tr>
              <tr><td style="padding: 4px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">• Siapkan dokumen pendukung</td></tr>
              <tr><td style="padding: 4px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">• Berpakaian rapi dan sopan</td></tr>
            </table>
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Semoga sukses! 🙌<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    case "interview-completed":
      return {
        subject: "✅ Wawancara FIM Anda Telah Selesai",
        html: wrapEmailLayout({
          title: "✅ Wawancara Selesai",
          headerColor: FIM_COLORS.success,
          headerGradientEnd: "#15803D",
          preheader: "Terima kasih telah mengikuti sesi wawancara Forum Indonesia Muda.",
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph(`Terima kasih telah mengikuti sesi wawancara dengan Forum Indonesia Muda${variables.interview_date ? ` pada ${variables.interview_date}` : ""}${variables.interviewer_name ? ` bersama ${variables.interviewer_name}` : ""}.`)}
            ${emailInfoBox({
              color: FIM_COLORS.successBorder,
              bgColor: FIM_COLORS.successLight,
              content: `<p style="margin: 0; font-size: 16px; font-weight: 700; color: ${FIM_COLORS.success};">✅ Wawancara Anda telah selesai!</p>`,
            })}
            ${emailInfoBox({
              color: FIM_COLORS.infoBorder,
              bgColor: FIM_COLORS.infoLight,
              content: `
                <p style="margin: 0 0 8px; font-weight: 700; color: ${FIM_COLORS.info};">📋 Langkah Selanjutnya:</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 0 4px;">
                  <tr><td style="padding: 3px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">1. Tim FIM akan mengevaluasi hasil wawancara Anda</td></tr>
                  <tr><td style="padding: 3px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">2. Keputusan akhir akan diumumkan melalui email</td></tr>
                  <tr><td style="padding: 3px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">3. Pantau terus email Anda untuk informasi lebih lanjut</td></tr>
                </table>
              `,
            })}
            ${emailParagraph("Kami menghargai waktu dan usaha Anda dalam mengikuti proses seleksi ini. Apapun hasilnya, kami berharap pengalaman ini memberikan pembelajaran berharga.")}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Salam hangat,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    case "verification-email":
      return {
        subject: "Verifikasi Email - Forum Indonesia Muda",
        html: wrapEmailLayout({
          title: "Verifikasi Email Anda",
          preheader: "Verifikasi email Anda untuk melanjutkan pendaftaran FIM.",
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph("Terima kasih telah mendaftar di Forum Indonesia Muda. Silakan klik tombol di bawah untuk memverifikasi email Anda.")}
            ${emailButton({ href: variables.verification_url, label: "Verifikasi Email Saya →" })}
            ${emailParagraph("Atau salin link berikut ke browser Anda:")}
            <p style="word-break: break-all; color: ${FIM_COLORS.textMuted}; font-size: 13px; background: #F9FAFB; padding: 12px 16px; border-radius: 8px; margin: 0 0 16px;">${variables.verification_url}</p>
            ${emailInfoBox({
              color: FIM_COLORS.warningBorder,
              bgColor: FIM_COLORS.warningLight,
              content: `<p style="margin: 0; color: ${FIM_COLORS.warning}; font-size: 13px;">⏳ Link ini akan kadaluarsa dalam <strong>7 hari</strong>.</p>`,
            })}
            ${emailDivider()}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 12px; margin: 0;">Jika Anda tidak mendaftar di FIM, abaikan email ini.</p>
          `,
        }),
      };

    case "password-reset":
      return {
        subject: "Reset Password - Forum Indonesia Muda",
        html: wrapEmailLayout({
          title: "Reset Password",
          preheader: "Anda meminta untuk mereset password akun FIM.",
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph("Anda meminta untuk mereset password. Klik tombol di bawah untuk membuat password baru.")}
            ${emailButton({ href: variables.reset_url, label: "Reset Password Saya →" })}
            ${emailInfoBox({
              color: FIM_COLORS.warningBorder,
              bgColor: FIM_COLORS.warningLight,
              content: `<p style="margin: 0; color: ${FIM_COLORS.warning}; font-size: 13px;">⚠️ Jika Anda tidak meminta reset password, <strong>abaikan email ini</strong>.</p>`,
            })}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Terima kasih,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    case "new-registration":
      return {
        subject: `[FIM Admin] Pendaftar Baru: ${variables.full_name}`,
        html: wrapEmailLayout({
          title: "📝 Pendaftar Baru",
          headerColor: FIM_COLORS.success,
          headerGradientEnd: "#15803D",
          preheader: `Pendaftar baru: ${variables.full_name} (${variables.email})`,
          body: `
            ${emailParagraph("Ada pendaftar baru di sistem registrasi Forum Indonesia Muda.")}
            ${emailDetailsTable(`
              ${emailDetailRow("Nama", `<strong>${variables.full_name}</strong>`, "👤")}
              ${emailDetailRow("Email", variables.email, "✉️")}
              ${emailDetailRow("Waktu", variables.timestamp, "🕐")}
            `)}
            ${emailParagraph("Login ke admin panel untuk melihat detail pendaftaran.")}
          `,
        }),
      };

    case "registration-status": {
      const isApproved = variables.status === "approved";
      return {
        subject: `Status Pendaftaran FIM: ${isApproved ? "Disetujui" : "Ditolak"}`,
        html: wrapEmailLayout({
          title: isApproved ? "✅ Pendaftaran Disetujui" : "❌ Pendaftaran Ditolak",
          headerColor: isApproved ? FIM_COLORS.success : FIM_COLORS.primary,
          headerGradientEnd: isApproved ? "#15803D" : FIM_COLORS.primaryDark,
          preheader: `Status pendaftaran Anda: ${isApproved ? "Disetujui" : "Ditolak"}`,
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph("Kami ingin menginformasikan bahwa status pendaftaran Anda di Forum Indonesia Muda telah diperbarui.")}
            ${emailInfoBox({
              color: isApproved ? FIM_COLORS.successBorder : FIM_COLORS.dangerBorder,
              bgColor: isApproved ? FIM_COLORS.successLight : FIM_COLORS.dangerLight,
              content: `
                <p style="margin: 0 0 4px; font-size: 13px; color: ${FIM_COLORS.textMuted};">Status Pendaftaran</p>
                <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${isApproved ? FIM_COLORS.success : FIM_COLORS.danger};">${isApproved ? "✅ Disetujui" : "❌ Ditolak"}</p>
              `,
            })}
            ${variables.reviewer_note ? emailInfoBox({
              color: FIM_COLORS.border,
              bgColor: "#F9FAFB",
              content: `<p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: ${FIM_COLORS.textPrimary};">Catatan dari Reviewer:</p><p style="margin: 0; font-size: 14px; color: ${FIM_COLORS.textSecondary}; line-height: 1.6;">${variables.reviewer_note}</p>`,
            }) : ""}
            ${isApproved
              ? emailParagraph("Selamat! Anda telah diterima sebagai peserta FIM Indonesia. Tim kami akan segera menghubungi Anda untuk informasi selanjutnya.")
              : emailParagraph("Terima kasih atas minat Anda. Meskipun saat ini kami belum dapat menerima pendaftaran Anda, kami mengapresiasi semangat Anda dan berharap dapat melihat Anda kembali di kesempatan berikutnya.")}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Salam hangat,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };
    }

    case "article-status":
      return {
        subject: `Status Artikel: ${variables.title}`,
        html: wrapEmailLayout({
          title: "Status Artikel Diperbarui",
          body: `
            ${emailGreeting(variables.author_name)}
            ${emailParagraph("Status artikel Anda telah di-review.")}
            ${emailDetailsTable(`
              ${emailDetailRow("Judul", `<strong>${variables.title}</strong>`, "📄")}
              ${emailDetailRow("Status", `<strong>${variables.status}</strong>`, "📋")}
            `)}
            ${variables.notes ? emailInfoBox({
              color: FIM_COLORS.warningBorder,
              bgColor: FIM_COLORS.warningLight,
              content: `<p style="margin: 0 0 4px; font-weight: 600; color: ${FIM_COLORS.textPrimary};">📝 Catatan:</p><p style="margin: 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">${variables.notes}</p>`,
            }) : ""}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Terima kasih,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    case "revision-request":
      return {
        subject: `Revisi Diperlukan: ${variables.title}`,
        html: wrapEmailLayout({
          title: "📝 Revisi Diperlukan",
          headerColor: FIM_COLORS.warning,
          headerGradientEnd: "#B45309",
          body: `
            ${emailGreeting(variables.author_name)}
            ${emailParagraph("Artikel Anda memerlukan revisi sebelum dapat dipublikasikan.")}
            ${emailDetailsTable(`
              ${emailDetailRow("Judul Artikel", `<strong>${variables.title}</strong>`, "📄")}
              ${emailDetailRow("Di-review oleh", variables.admin_name, "👤")}
            `)}
            ${emailInfoBox({
              color: FIM_COLORS.warningBorder,
              bgColor: FIM_COLORS.warningLight,
              content: `<p style="margin: 0 0 8px; font-weight: 700; color: ${FIM_COLORS.warning};">📝 Catatan Revisi:</p><p style="margin: 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px; line-height: 1.6;">${variables.revision_notes}</p>`,
            })}
            ${emailParagraph("Silakan login ke panel admin untuk melakukan revisi dan submit ulang.")}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Terima kasih,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    case "login-notification":
      return {
        subject: `[FIM Admin] Login Berhasil: ${variables.username}`,
        html: wrapEmailLayout({
          title: "🔐 Notifikasi Login",
          headerColor: FIM_COLORS.info,
          headerGradientEnd: "#1D4ED8",
          body: `
            ${emailParagraph("Ada login berhasil ke Admin Panel FIM dengan detail sebagai berikut:")}
            ${emailDetailsTable(`
              ${emailDetailRow("Username", `<strong>${variables.username}</strong>`, "👤")}
              ${emailDetailRow("Email", variables.email, "✉️")}
              ${emailDetailRow("Role", `<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;background:${variables.role === "super_admin" ? "#FEE2E2;color:#DC2626" : "#DBEAFE;color:#2563EB"}">${variables.role === "super_admin" ? "Super Admin" : variables.role === "admin" ? "Admin" : "Moderator"}</span>`, "🛡️")}
              ${emailDetailRow("Waktu", `${variables.login_time} WIB`, "🕐")}
              ${emailDetailRow("IP Address", `<code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:13px;">${variables.ip_address || "Tidak tersedia"}</code>`, "🌐")}
            `)}
            ${emailInfoBox({
              color: FIM_COLORS.warningBorder,
              bgColor: FIM_COLORS.warningLight,
              content: `<p style="margin: 0; color: ${FIM_COLORS.warning}; font-size: 13px;">⚠️ <strong>Perhatian:</strong> Jika Anda tidak mengenali aktivitas login ini, segera hubungi tim IT untuk mengamankan akun.</p>`,
            })}
          `,
        }),
      };

    case "unauthorized-access":
      return {
        subject: `🚨 [SECURITY] Akses Tidak Sah: ${variables.username}`,
        html: wrapEmailLayout({
          title: "🚨 Peringatan Keamanan",
          headerColor: "#991B1B",
          headerGradientEnd: "#7F1D1D",
          preheader: `Percobaan akses tidak sah terdeteksi dari ${variables.username}`,
          body: `
            ${emailInfoBox({
              color: FIM_COLORS.dangerBorder,
              bgColor: FIM_COLORS.dangerLight,
              content: `<p style="margin: 0; font-size: 14px; color: ${FIM_COLORS.danger};"><strong>⚠️ Perhatian!</strong> Pengguna berikut telah mencoba mengakses halaman yang tidak diizinkan sebanyak <strong>${variables.attempt_count} kali</strong> dalam 1 jam terakhir.</p>`,
            })}
            ${emailDetailsTable(`
              ${emailDetailRow("Username", `<strong>${variables.username}</strong>`, "👤")}
              ${emailDetailRow("Email", variables.email, "✉️")}
              ${emailDetailRow("Role", variables.user_role, "🛡️")}
              ${emailDetailRow("Halaman Dituju", `<code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:13px;">${variables.attempted_path}</code>`, "📍")}
              ${emailDetailRow("Waktu", `${variables.timestamp} WIB`, "🕐")}
              ${emailDetailRow("IP Address", `<code style="background:#F3F4F6;padding:2px 6px;border-radius:4px;font-size:13px;">${variables.ip_address || "N/A"}</code>`, "🌐")}
            `)}
            ${emailParagraph("Tinjau log keamanan untuk detail lebih lanjut dan pertimbangkan tindakan yang diperlukan.")}
          `,
          footerText: "Email peringatan keamanan otomatis dari sistem Admin Panel FIM.",
        }),
      };

    case "newsletter-welcome":
      return {
        subject: "Selamat Datang di Newsletter FIM! 🎉",
        html: wrapEmailLayout({
          title: "Selamat Datang! 🎉",
          preheader: "Terima kasih telah berlangganan newsletter Forum Indonesia Muda.",
          body: `
            ${emailGreeting(variables.name || "Subscriber")}
            ${emailParagraph("Terima kasih telah berlangganan newsletter <strong>Forum Indonesia Muda</strong>!")}
            ${emailParagraph("Anda akan menerima update terbaru seputar:")}
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px 8px;">
              <tr><td style="padding: 5px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">🎯 Program dan kegiatan FIM</td></tr>
              <tr><td style="padding: 5px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">🏆 Prestasi alumni dan peserta</td></tr>
              <tr><td style="padding: 5px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">📢 Pengumuman penting</td></tr>
              <tr><td style="padding: 5px 0; color: ${FIM_COLORS.textSecondary}; font-size: 14px;">💡 Tips dan inspirasi dari komunitas</td></tr>
            </table>
            ${emailDivider()}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 12px; margin: 0;">Jika tidak ingin menerima email lagi, <a href="${variables.unsubscribe_url}" style="color: ${FIM_COLORS.textMuted};">klik di sini untuk berhenti berlangganan</a>.</p>
          `,
        }),
      };

    case "reminder-incomplete":
      return {
        subject: "Reminder: Lengkapi Formulir Pendaftaran FIM Anda",
        html: wrapEmailLayout({
          title: "📋 Lengkapi Pendaftaran",
          preheader: "Pendaftaran FIM Anda belum selesai. Yuk lanjutkan!",
          body: `
            ${emailGreeting(variables.full_name)}
            ${emailParagraph("Kami melihat bahwa pendaftaran Anda di Forum Indonesia Muda <strong>belum selesai</strong>.")}
            ${emailInfoBox({
              color: FIM_COLORS.warningBorder,
              bgColor: FIM_COLORS.warningLight,
              content: `<p style="margin: 0; color: ${FIM_COLORS.warning}; font-size: 15px;"><strong>📊 Progress saat ini: ${variables.progress}%</strong></p>`,
            })}
            ${emailParagraph("Jangan lewatkan kesempatan untuk menjadi bagian dari jaringan pemuda terbaik Indonesia!")}
            ${emailButton({ href: variables.registration_url || "https://fim.lovable.app/daftar", label: "Lanjutkan Pendaftaran →" })}
            <p style="color: ${FIM_COLORS.textMuted}; font-size: 14px; margin-top: 24px;">Salam hangat,<br><strong style="color: ${FIM_COLORS.textPrimary};">Tim Forum Indonesia Muda</strong></p>
          `,
        }),
      };

    default:
      return {
        subject: "Notifikasi Forum Indonesia Muda",
        html: wrapEmailLayout({
          title: "Notifikasi",
          body: emailParagraph("Anda memiliki notifikasi baru dari Forum Indonesia Muda."),
        }),
      };
  }
}
