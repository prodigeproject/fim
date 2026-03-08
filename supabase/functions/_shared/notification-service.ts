// =====================================================
// CENTRALIZED NOTIFICATION SERVICE
// Email sending via Gmail SMTP using denomailer
// Reads config from email_settings table with env fallback
// =====================================================

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface SmtpConfig {
  host: string;
  port: number;
  tls: boolean;
  username: string;
  password: string;
  fromAddress: string;
  fromName: string;
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

/**
 * Get SMTP config from email_settings table, fallback to env secrets.
 * NEVER stores passwords in DB — uses env secrets only.
 */
export async function getSmtpConfig(supabase?: any): Promise<SmtpConfig> {
  const envUser = Deno.env.get("GMAIL_USER") || "";
  const envPassword = Deno.env.get("GMAIL_APP_PASSWORD") || "";

  // Try reading non-sensitive config from DB (host, port, from name, etc.)
  if (supabase) {
    try {
      const { data } = await supabase
        .from("email_settings")
        .select("mail_host, mail_port, mail_encryption, mail_from_address, mail_from_name, mail_username")
        .limit(1)
        .maybeSingle();

      if (data) {
        return {
          host: data.mail_host || "smtp.gmail.com",
          port: data.mail_port || 465,
          tls: (data.mail_encryption || "TLS").toUpperCase() !== "NONE",
          username: data.mail_username || envUser,
          password: envPassword, // Always from env secret, never from DB
          fromAddress: data.mail_from_address || data.mail_username || envUser,
          fromName: data.mail_from_name || "Forum Indonesia Muda",
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

/**
 * Check daily email rate limit. Returns true if allowed.
 */
export async function checkDailyRateLimit(supabase: any): Promise<{ allowed: boolean; sent: number; limit: number }> {
  // Get configured limit
  let dailyLimit = 2000;
  try {
    const { data } = await supabase
      .from("email_settings")
      .select("daily_rate_limit")
      .limit(1)
      .maybeSingle();
    if (data?.daily_rate_limit) dailyLimit = data.daily_rate_limit;
  } catch { /* use default */ }

  // Count emails sent today via notification_queue
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

/**
 * Send email via SMTP with provided config.
 * Connection is always closed in finally block to prevent leaks.
 */
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

/**
 * Send email using default Gmail SMTP (env secrets).
 * Convenience wrapper around sendEmailWithConfig.
 */
export async function sendGmailEmail(params: EmailParams): Promise<NotificationResult> {
  const config = await getSmtpConfig();
  return sendEmailWithConfig(config, params);
}

/**
 * Create a service-role Supabase client for use in edge functions.
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// =====================================================
// EMAIL TEMPLATES
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
  | "unauthorized-access";

export function getEmailTemplate(
  templateName: TemplateName,
  variables: Record<string, string>
): { subject: string; html: string } {
  const templates: Record<TemplateName, { subject: string; html: string }> = {
    "selection-stage-change": {
      subject: `Status Seleksi FIM: ${variables.new_stage}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Status Seleksi Diperbarui</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.full_name}</strong>,</p>
            <p>Status seleksi Anda telah diperbarui:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #e53935; margin: 20px 0;">
              <p style="margin: 0;"><strong>Tahap Sebelumnya:</strong> ${variables.old_stage}</p>
              <p style="margin: 10px 0 0;"><strong>Tahap Saat Ini:</strong> ${variables.new_stage}</p>
            </div>
            <p>Silakan login ke portal untuk melihat detail lebih lanjut.</p>
            <p style="color: #666; font-size: 14px;">Terima kasih,<br><strong>Tim Forum Indonesia Muda</strong></p>
          </div>
        </body>
        </html>
      `,
    },
    "final-result": {
      subject: variables.result === "lolos" ? "🎉 Selamat! Anda Diterima di FIM" : "Pengumuman Hasil Seleksi FIM",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${variables.result === "lolos" ? "linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)"}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">${variables.result === "lolos" ? "🎉 Selamat!" : "Pengumuman Hasil"}</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.full_name}</strong>,</p>
            ${variables.result === "lolos" 
              ? `<p>Dengan bangga kami sampaikan bahwa Anda <strong>DITERIMA</strong> sebagai peserta Forum Indonesia Muda!</p>
                 <p>Tim kami akan segera menghubungi Anda untuk informasi lebih lanjut mengenai program.</p>`
              : `<p>Terima kasih telah mengikuti seleksi Forum Indonesia Muda.</p>
                 <p>Sayangnya, Anda belum lolos pada periode seleksi ini. Jangan berkecil hati, terus kembangkan diri dan ikuti seleksi berikutnya!</p>`
            }
            <p style="color: #666; font-size: 14px; margin-top: 30px;">Salam hangat,<br><strong>Tim Forum Indonesia Muda</strong></p>
          </div>
        </body>
        </html>
      `,
    },
    "interview-scheduled": {
      subject: "Jadwal Wawancara FIM",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">📅 Jadwal Wawancara</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.full_name}</strong>,</p>
            <p>Jadwal wawancara Anda telah ditentukan:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #e53935; margin: 20px 0;">
              <p style="margin: 0;"><strong>📆 Tanggal:</strong> ${variables.date}</p>
              <p style="margin: 10px 0;"><strong>🕐 Waktu:</strong> ${variables.time}</p>
              ${variables.location ? `<p style="margin: 10px 0;"><strong>📍 Lokasi:</strong> ${variables.location}</p>` : ""}
              ${variables.meeting_link ? `<p style="margin: 10px 0;"><strong>🔗 Link:</strong> <a href="${variables.meeting_link}">${variables.meeting_link}</a></p>` : ""}
            </div>
            <p>Pastikan Anda hadir tepat waktu. Semoga sukses!</p>
            <p style="color: #666; font-size: 14px;">Terima kasih,<br><strong>Tim Forum Indonesia Muda</strong></p>
          </div>
        </body>
        </html>
      `,
    },
    "interview-reminder": {
      subject: "⏰ Pengingat: Wawancara FIM Besok",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">⏰ Pengingat Wawancara</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.full_name}</strong>,</p>
            <p>Ini adalah pengingat untuk wawancara Anda <strong>besok</strong>:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF9800; margin: 20px 0;">
              <p style="margin: 0;"><strong>📆 Tanggal:</strong> ${variables.date}</p>
              <p style="margin: 10px 0;"><strong>🕐 Waktu:</strong> ${variables.time}</p>
              ${variables.meeting_link ? `<p style="margin: 10px 0;"><strong>🔗 Link:</strong> <a href="${variables.meeting_link}">${variables.meeting_link}</a></p>` : ""}
            </div>
            <p>Persiapkan diri Anda dengan baik. Semoga sukses!</p>
            <p style="color: #666; font-size: 14px;">Terima kasih,<br><strong>Tim Forum Indonesia Muda</strong></p>
          </div>
        </body>
        </html>
      `,
    },
    "verification-email": {
      subject: "Verifikasi Email - Forum Indonesia Muda",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Verifikasi Email</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.full_name}</strong>,</p>
            <p>Terima kasih telah mendaftar di Forum Indonesia Muda. Silakan klik tombol di bawah untuk memverifikasi email Anda:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${variables.verification_url}" style="background: #e53935; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verifikasi Email</a>
            </div>
            <p>Atau salin link berikut ke browser Anda:</p>
            <p style="word-break: break-all; color: #666;">${variables.verification_url}</p>
            <p style="color: #666; font-size: 14px;">Link ini akan kadaluarsa dalam 7 hari.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
            <p style="color: #666; font-size: 12px;">Jika Anda tidak mendaftar di FIM, abaikan email ini.</p>
          </div>
        </body>
        </html>
      `,
    },
    "password-reset": {
      subject: "Reset Password - Forum Indonesia Muda",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Reset Password</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.full_name}</strong>,</p>
            <p>Anda meminta untuk mereset password. Klik tombol di bawah untuk membuat password baru:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${variables.reset_url}" style="background: #e53935; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #666; font-size: 14px;">Jika Anda tidak meminta reset password, abaikan email ini.</p>
            <p style="color: #666; font-size: 14px;">Terima kasih,<br><strong>Tim Forum Indonesia Muda</strong></p>
          </div>
        </body>
        </html>
      `,
    },
    "new-registration": {
      subject: "Pendaftar Baru - FIM Admin",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">📝 Pendaftar Baru</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Ada pendaftar baru di sistem FIM:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              <p style="margin: 0;"><strong>Nama:</strong> ${variables.full_name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${variables.email}</p>
              <p style="margin: 10px 0;"><strong>Waktu:</strong> ${variables.timestamp}</p>
            </div>
            <p>Login ke admin panel untuk melihat detail.</p>
          </div>
        </body>
        </html>
      `,
    },
    "article-status": {
      subject: `Status Artikel: ${variables.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #e53935 0%, #c62828 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Status Artikel</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.author_name}</strong>,</p>
            <p>Status artikel Anda telah diperbarui:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #e53935; margin: 20px 0;">
              <p style="margin: 0;"><strong>Judul:</strong> ${variables.title}</p>
              <p style="margin: 10px 0;"><strong>Status:</strong> ${variables.status}</p>
            </div>
            ${variables.notes ? `<p><strong>Catatan:</strong> ${variables.notes}</p>` : ""}
            <p style="color: #666; font-size: 14px;">Terima kasih,<br><strong>Tim Forum Indonesia Muda</strong></p>
          </div>
        </body>
        </html>
      `,
    },
    "revision-request": {
      subject: `Revisi Diperlukan: ${variables.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Revisi Diperlukan</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Halo <strong>${variables.author_name}</strong>,</p>
            <p>Artikel Anda memerlukan revisi:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #FF9800; margin: 20px 0;">
              <p style="margin: 0;"><strong>Judul:</strong> ${variables.title}</p>
            </div>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <strong>Catatan Revisi dari ${variables.admin_name}:</strong>
              <p style="margin: 10px 0 0;">${variables.revision_notes}</p>
            </div>
            <p>Silakan login untuk melakukan revisi.</p>
            <p style="color: #666; font-size: 14px;">Terima kasih,<br><strong>Tim Forum Indonesia Muda</strong></p>
          </div>
        </body>
        </html>
      `,
    },
    "login-notification": {
      subject: "Login Baru Terdeteksi - FIM Admin",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🔐 Login Baru</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Login baru terdeteksi pada akun admin:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin: 20px 0;">
              <p style="margin: 0;"><strong>User:</strong> ${variables.username}</p>
              <p style="margin: 10px 0;"><strong>Waktu:</strong> ${variables.timestamp}</p>
              <p style="margin: 10px 0;"><strong>IP:</strong> ${variables.ip_address || "Unknown"}</p>
            </div>
            <p style="color: #666; font-size: 14px;">Jika ini bukan Anda, segera hubungi admin.</p>
          </div>
        </body>
        </html>
      `,
    },
    "unauthorized-access": {
      subject: "⚠️ Percobaan Akses Tidak Sah - FIM Admin",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">⚠️ Peringatan Keamanan</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-top: none;">
            <p>Percobaan akses tidak sah terdeteksi:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336; margin: 20px 0;">
              <p style="margin: 0;"><strong>User:</strong> ${variables.username}</p>
              <p style="margin: 10px 0;"><strong>Path:</strong> ${variables.attempted_path}</p>
              <p style="margin: 10px 0;"><strong>Waktu:</strong> ${variables.timestamp}</p>
              <p style="margin: 10px 0;"><strong>IP:</strong> ${variables.ip_address || "Unknown"}</p>
            </div>
            <p style="color: #666; font-size: 14px;">Tinjau log keamanan untuk detail lebih lanjut.</p>
          </div>
        </body>
        </html>
      `,
    },
  };

  return templates[templateName];
}
