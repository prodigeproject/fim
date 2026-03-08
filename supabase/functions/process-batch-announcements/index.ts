import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { sendGmailEmail, createServiceClient } from "../_shared/notification-service.ts";

function generateAnnouncementEmail(name: string, stage: "administrasi" | "wawancara", passed: boolean, batchName: string): string {
  const statusText = passed ? "LOLOS" : "TIDAK LOLOS";
  const statusColor = passed ? "#22c55e" : "#ef4444";
  const stageText = stage === "administrasi" ? "Seleksi Administrasi" : "Seleksi Wawancara";

  const nextStepHtml = passed
    ? stage === "administrasi"
      ? `<p>Selamat! Anda dinyatakan <strong>LOLOS</strong> tahap ${stageText}. Silakan pantau email dan dashboard pendaftaran Anda untuk informasi selanjutnya.</p>`
      : `<p>Selamat! Anda dinyatakan <strong>LOLOS</strong> dan resmi menjadi peserta Forum Indonesia Muda ${batchName}!</p>`
    : `<p>Dengan berat hati kami sampaikan bahwa Anda dinyatakan <strong>TIDAK LOLOS</strong> pada tahap ${stageText}. Jangan berkecil hati, terus kembangkan diri!</p>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
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
        <p style="margin: 10px 0 0; font-size: 28px; font-weight: bold; color: ${statusColor};">${statusText}</p>
      </div>
      ${nextStepHtml}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
      <p style="color: #9ca3af; font-size: 12px; margin-bottom: 0; text-align: center;">© Forum Indonesia Muda.</p>
    </div>
  </div>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  try {
    const supabase = createServiceClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let manualTrigger = false;
    let targetBatchId: string | null = null;
    let targetStage: "administrasi" | "wawancara" | null = null;

    try {
      const body = await req.json();
      manualTrigger = body.manual === true;
      targetBatchId = body.batch_id || null;
      targetStage = body.stage || null;
    } catch { /* no body */ }

    console.log("Processing batch announcements...", { manualTrigger, targetBatchId, targetStage });

    let batchQuery = supabase.from("registration_settings").select("*").eq("is_active", true);
    if (targetBatchId) batchQuery = batchQuery.eq("id", targetBatchId);

    const { data: batches, error: batchError } = await batchQuery;
    if (batchError) throw batchError;

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

      const shouldAnnounceAdmin = manualTrigger
        ? targetStage === "administrasi" || !targetStage
        : batch.admin_result_announcement_date && new Date(batch.admin_result_announcement_date) <= today;

      const shouldAnnounceFinal = manualTrigger
        ? targetStage === "wawancara" || !targetStage
        : batch.final_result_announcement_date && new Date(batch.final_result_announcement_date) <= today;

      if (shouldAnnounceAdmin) {
        // Passed admin
        const { data: passed } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name")
          .eq("batch_id", batch.id).eq("selection_stage", "administrasi").eq("selection_passed", true).is("final_result", null);

        for (const reg of passed || []) {
          const r = await sendGmailEmail({
            to: reg.email,
            subject: `🎉 Selamat! Anda Lolos ${batchName} - Seleksi Administrasi`,
            html: generateAnnouncementEmail(reg.full_name, "administrasi", true, batchName),
          });
          if (r.success) {
            await supabase.from("fim_registrations").update({ selection_stage: "wawancara", selection_passed: null }).eq("id", reg.id);
            totalSent++;
          }
        }
        if (passed?.length) results.push({ batch: batchName, stage: "admin_passed", count: passed.length });

        // Failed admin
        const { data: failed } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name")
          .eq("batch_id", batch.id).eq("selection_stage", "administrasi").eq("selection_passed", false).is("final_result", null);

        for (const reg of failed || []) {
          const r = await sendGmailEmail({
            to: reg.email,
            subject: `Hasil Seleksi ${batchName} - Seleksi Administrasi`,
            html: generateAnnouncementEmail(reg.full_name, "administrasi", false, batchName),
          });
          if (r.success) {
            await supabase.from("fim_registrations").update({ final_result: "tidak_lolos", selection_stage: "pengumuman" }).eq("id", reg.id);
            totalSent++;
          }
        }
        if (failed?.length) results.push({ batch: batchName, stage: "admin_failed", count: failed.length });
      }

      if (shouldAnnounceFinal) {
        const { data: passed } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name")
          .eq("batch_id", batch.id).eq("selection_stage", "wawancara").eq("selection_passed", true).is("final_result", null);

        for (const reg of passed || []) {
          const r = await sendGmailEmail({
            to: reg.email,
            subject: `🎉 Selamat! Anda Resmi Bergabung dengan ${batchName}!`,
            html: generateAnnouncementEmail(reg.full_name, "wawancara", true, batchName),
          });
          if (r.success) {
            await supabase.from("fim_registrations").update({ final_result: "lolos", selection_stage: "pengumuman" }).eq("id", reg.id);
            totalSent++;
          }
        }
        if (passed?.length) results.push({ batch: batchName, stage: "interview_passed", count: passed.length });

        const { data: failed } = await supabase
          .from("fim_registrations")
          .select("id, email, full_name")
          .eq("batch_id", batch.id).eq("selection_stage", "wawancara").eq("selection_passed", false).is("final_result", null);

        for (const reg of failed || []) {
          const r = await sendGmailEmail({
            to: reg.email,
            subject: `Hasil Seleksi ${batchName} - Seleksi Wawancara`,
            html: generateAnnouncementEmail(reg.full_name, "wawancara", false, batchName),
          });
          if (r.success) {
            await supabase.from("fim_registrations").update({ final_result: "tidak_lolos", selection_stage: "pengumuman" }).eq("id", reg.id);
            totalSent++;
          }
        }
        if (failed?.length) results.push({ batch: batchName, stage: "interview_failed", count: failed.length });
      }
    }

    console.log(`Batch announcements completed. Total: ${totalSent}`);

    return new Response(
      JSON.stringify({ message: "Batch announcements processed", sent: totalSent, results }),
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
