import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const gmailUser = Deno.env.get("GMAIL_USER")!;
const gmailAppPassword = Deno.env.get("GMAIL_APP_PASSWORD")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendGmailEmail(to: string, subject: string, html: string) {
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: {
        username: gmailUser,
        password: gmailAppPassword,
      },
    },
  });

  try {
    await client.send({
      from: gmailUser,
      to: to,
      subject: subject,
      content: "auto",
      html: html,
    });
    await client.close();
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    await client.close();
    return false;
  }
}

function generateAnnouncementEmail(name: string, stage: "administrasi" | "wawancara", passed: boolean, batchName: string): string {
  const statusText = passed ? "LOLOS" : "TIDAK LOLOS";
  const statusColor = passed ? "#22c55e" : "#ef4444";
  const stageText = stage === "administrasi" ? "Seleksi Administrasi" : "Seleksi Wawancara";
  
  const nextStepHtml = passed 
    ? stage === "administrasi"
      ? `<p>Selamat! Anda dinyatakan <strong>LOLOS</strong> tahap ${stageText}. Silakan pantau email dan dashboard pendaftaran Anda untuk informasi selanjutnya mengenai tahap wawancara.</p>`
      : `<p>Selamat! Anda dinyatakan <strong>LOLOS</strong> dan resmi menjadi peserta Forum Indonesia Muda ${batchName}! Tim kami akan segera menghubungi Anda untuk informasi selanjutnya.</p>`
    : `<p>Dengan berat hati kami sampaikan bahwa Anda dinyatakan <strong>TIDAK LOLOS</strong> pada tahap ${stageText}. Jangan berkecil hati, kami mendorong Anda untuk terus berkembang dan mencoba kembali di kesempatan berikutnya.</p>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pengumuman ${stageText}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Forum Indonesia Muda</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">${batchName}</p>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #1e40af; margin-top: 0;">Halo ${name}! 👋</h2>
      
      <p>Terima kasih telah mengikuti proses seleksi ${batchName}.</p>
      
      <div style="background: ${passed ? '#dcfce7' : '#fef2f2'}; border-left: 4px solid ${statusColor}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Hasil ${stageText}</p>
        <p style="margin: 10px 0 0; font-size: 28px; font-weight: bold; color: ${statusColor};">
          ${statusText}
        </p>
      </div>
      
      ${nextStepHtml}
      
      <p style="color: #6b7280;">
        Jika Anda memiliki pertanyaan, silakan hubungi tim kami melalui email atau media sosial resmi FIM.
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">
        © Forum Indonesia Muda. Semua hak dilindungi.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Parse request body for manual trigger
    let manualTrigger = false;
    let targetBatchId: string | null = null;
    let targetStage: "administrasi" | "wawancara" | null = null;

    try {
      const body = await req.json();
      manualTrigger = body.manual === true;
      targetBatchId = body.batch_id || null;
      targetStage = body.stage || null;
    } catch {
      // No body, proceed with automatic check
    }

    console.log("Processing batch announcements...", { manualTrigger, targetBatchId, targetStage });

    // Fetch batches with announcement dates
    let batchQuery = supabase
      .from("registration_settings")
      .select("*")
      .eq("is_active", true);

    if (targetBatchId) {
      batchQuery = batchQuery.eq("id", targetBatchId);
    }

    const { data: batches, error: batchError } = await batchQuery;

    if (batchError) {
      console.error("Error fetching batches:", batchError);
      throw batchError;
    }

    if (!batches || batches.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active batches found", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let totalSent = 0;
    const results: any[] = [];

    for (const batch of batches) {
      const batchName = batch.batch_name;
      
      // Check admin result announcement date
      const shouldAnnounceAdmin = manualTrigger 
        ? targetStage === "administrasi" || !targetStage
        : batch.admin_result_announcement_date && new Date(batch.admin_result_announcement_date) <= today;
      
      // Check final result announcement date
      const shouldAnnounceFinal = manualTrigger
        ? targetStage === "wawancara" || !targetStage
        : batch.final_result_announcement_date && new Date(batch.final_result_announcement_date) <= today;

      // Process administration results
      if (shouldAnnounceAdmin) {
        console.log(`Processing admin announcements for batch: ${batchName}`);
        
        // Get registrants who passed admin and are waiting for announcement
        const { data: adminPassedRegistrants, error: passedError } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name, selection_stage, selection_passed")
          .eq("batch_id", batch.id)
          .eq("selection_stage", "administrasi")
          .eq("selection_passed", true)
          .is("final_result", null);

        if (passedError) {
          console.error("Error fetching passed registrants:", passedError);
        } else if (adminPassedRegistrants && adminPassedRegistrants.length > 0) {
          for (const reg of adminPassedRegistrants) {
            const sent = await sendGmailEmail(
              reg.email,
              `🎉 Selamat! Anda Lolos ${batchName} - Seleksi Administrasi`,
              generateAnnouncementEmail(reg.full_name, "administrasi", true, batchName)
            );

            if (sent) {
              // Move to interview stage
              await supabase
                .from("fim_registrations")
                .update({ 
                  selection_stage: "wawancara",
                  selection_passed: null // Reset for interview stage
                })
                .eq("id", reg.id);
              
              totalSent++;
            }
          }
          results.push({ batch: batchName, stage: "admin_passed", count: adminPassedRegistrants.length });
        }

        // Get registrants who failed admin
        const { data: adminFailedRegistrants, error: failedError } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name, selection_stage, selection_passed")
          .eq("batch_id", batch.id)
          .eq("selection_stage", "administrasi")
          .eq("selection_passed", false)
          .is("final_result", null);

        if (failedError) {
          console.error("Error fetching failed registrants:", failedError);
        } else if (adminFailedRegistrants && adminFailedRegistrants.length > 0) {
          for (const reg of adminFailedRegistrants) {
            const sent = await sendGmailEmail(
              reg.email,
              `Hasil Seleksi ${batchName} - Seleksi Administrasi`,
              generateAnnouncementEmail(reg.full_name, "administrasi", false, batchName)
            );

            if (sent) {
              // Mark as final result
              await supabase
                .from("fim_registrations")
                .update({ 
                  final_result: "tidak_lolos",
                  selection_stage: "pengumuman"
                })
                .eq("id", reg.id);
              
              totalSent++;
            }
          }
          results.push({ batch: batchName, stage: "admin_failed", count: adminFailedRegistrants.length });
        }
      }

      // Process interview/final results
      if (shouldAnnounceFinal) {
        console.log(`Processing final announcements for batch: ${batchName}`);
        
        // Get registrants who passed interview
        const { data: interviewPassedRegistrants, error: interviewPassedError } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name, selection_stage, selection_passed")
          .eq("batch_id", batch.id)
          .eq("selection_stage", "wawancara")
          .eq("selection_passed", true)
          .is("final_result", null);

        if (interviewPassedError) {
          console.error("Error fetching interview passed:", interviewPassedError);
        } else if (interviewPassedRegistrants && interviewPassedRegistrants.length > 0) {
          for (const reg of interviewPassedRegistrants) {
            const sent = await sendGmailEmail(
              reg.email,
              `🎉 Selamat! Anda Resmi Bergabung dengan ${batchName}!`,
              generateAnnouncementEmail(reg.full_name, "wawancara", true, batchName)
            );

            if (sent) {
              await supabase
                .from("fim_registrations")
                .update({ 
                  final_result: "lolos",
                  selection_stage: "pengumuman"
                })
                .eq("id", reg.id);
              
              totalSent++;
            }
          }
          results.push({ batch: batchName, stage: "interview_passed", count: interviewPassedRegistrants.length });
        }

        // Get registrants who failed interview
        const { data: interviewFailedRegistrants, error: interviewFailedError } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name, selection_stage, selection_passed")
          .eq("batch_id", batch.id)
          .eq("selection_stage", "wawancara")
          .eq("selection_passed", false)
          .is("final_result", null);

        if (interviewFailedError) {
          console.error("Error fetching interview failed:", interviewFailedError);
        } else if (interviewFailedRegistrants && interviewFailedRegistrants.length > 0) {
          for (const reg of interviewFailedRegistrants) {
            const sent = await sendGmailEmail(
              reg.email,
              `Hasil Seleksi ${batchName} - Seleksi Wawancara`,
              generateAnnouncementEmail(reg.full_name, "wawancara", false, batchName)
            );

            if (sent) {
              await supabase
                .from("fim_registrations")
                .update({ 
                  final_result: "tidak_lolos",
                  selection_stage: "pengumuman"
                })
                .eq("id", reg.id);
              
              totalSent++;
            }
          }
          results.push({ batch: batchName, stage: "interview_failed", count: interviewFailedRegistrants.length });
        }
      }
    }

    console.log(`Batch announcements completed. Total emails sent: ${totalSent}`);

    return new Response(
      JSON.stringify({ 
        message: "Batch announcements processed", 
        sent: totalSent,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in process-batch-announcements:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
