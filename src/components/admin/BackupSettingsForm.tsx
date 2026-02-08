import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Key, FolderOpen, Clock, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

interface BackupSettings {
  id: string;
  gdrive_service_account_key: string | null;
  gdrive_folder_id: string | null;
  auto_backup_enabled: boolean;
  auto_backup_schedule: string;
  last_backup_at: string | null;
}

export function BackupSettingsForm() {
  const queryClient = useQueryClient();
  const [serviceAccountKey, setServiceAccountKey] = useState("");
  const [folderId, setFolderId] = useState("");
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [schedule, setSchedule] = useState("0 3 * * 0");
  const [showKey, setShowKey] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["backup-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data as BackupSettings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setServiceAccountKey(settings.gdrive_service_account_key ? "••••••••" : "");
      setFolderId(settings.gdrive_folder_id || "");
      setAutoBackupEnabled(settings.auto_backup_enabled || false);
      setSchedule(settings.auto_backup_schedule || "0 3 * * 0");
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData: Partial<BackupSettings> = {
        gdrive_folder_id: folderId || null,
        auto_backup_enabled: autoBackupEnabled,
        auto_backup_schedule: schedule,
      };

      // Only update key if changed (not masked)
      if (serviceAccountKey && !serviceAccountKey.includes("••")) {
        updateData.gdrive_service_account_key = serviceAccountKey;
      }

      if (settings?.id) {
        const { error } = await supabase
          .from("backup_settings")
          .update(updateData)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("backup_settings")
          .insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backup-settings"] });
      toast.success("Pengaturan backup berhasil disimpan");
    },
    onError: (error: Error) => {
      toast.error(`Gagal menyimpan: ${error.message}`);
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("backup-data", {
        body: {
          action: "test-connection",
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Koneksi gagal");
      return data;
    },
    onSuccess: () => {
      toast.success("Koneksi ke Google Drive berhasil!");
    },
    onError: (error: Error) => {
      toast.error(`Gagal terhubung: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Konfigurasi Google Drive
        </CardTitle>
        <CardDescription>
          Setup Service Account untuk backup otomatis ke Google Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions */}
        <div className="rounded-lg bg-muted/50 border p-4 space-y-3">
          <h4 className="font-medium text-sm">Cara Setup Service Account:</h4>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1.5">
            <li>
              Buka{" "}
              <a
                href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                Google Cloud Console
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Buat project baru atau pilih project yang ada</li>
            <li>Buat Service Account baru</li>
            <li>Download file JSON credentials</li>
            <li>Enable Google Drive API di project</li>
            <li>Share folder Google Drive ke email Service Account</li>
            <li>Copy-paste isi file JSON ke form di bawah</li>
          </ol>
        </div>

        {/* Service Account Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="service-account-key">Service Account Key (JSON)</Label>
            {settings?.gdrive_service_account_key && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKey(!showKey)}
                className="h-7 text-xs"
              >
                {showKey ? "Sembunyikan" : "Tampilkan"}
              </Button>
            )}
          </div>
          <Textarea
            id="service-account-key"
            value={showKey ? serviceAccountKey : serviceAccountKey.includes("••") ? serviceAccountKey : ""}
            onChange={(e) => setServiceAccountKey(e.target.value)}
            placeholder='{"type": "service_account", "project_id": "...", ...}'
            rows={6}
            className="font-mono text-xs"
          />
          <p className="text-xs text-muted-foreground">
            Paste seluruh isi file JSON credentials dari Google Cloud Console
          </p>
        </div>

        {/* Folder ID */}
        <div className="space-y-2">
          <Label htmlFor="folder-id" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Google Drive Folder ID
          </Label>
          <Input
            id="folder-id"
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            placeholder="1ABC123XYZ..."
          />
          <p className="text-xs text-muted-foreground">
            ID folder dari URL Google Drive. Contoh: drive.google.com/drive/folders/
            <span className="text-primary">1ABC123XYZ</span>
          </p>
        </div>

        {/* Auto Backup Settings */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Backup Otomatis
              </Label>
              <p className="text-xs text-muted-foreground">
                Jalankan backup secara terjadwal
              </p>
            </div>
            <Switch
              checked={autoBackupEnabled}
              onCheckedChange={setAutoBackupEnabled}
            />
          </div>

          {autoBackupEnabled && (
            <div className="space-y-2">
              <Label htmlFor="schedule">Jadwal (Cron Expression)</Label>
              <Input
                id="schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="0 3 * * 0"
              />
              <p className="text-xs text-muted-foreground">
                Default: <code className="bg-muted px-1 rounded">0 3 * * 0</code> (Setiap Minggu jam 3 pagi)
              </p>
            </div>
          )}

          {settings?.last_backup_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-supporting" />
              Backup terakhir:{" "}
              {new Date(settings.last_backup_at).toLocaleString("id-ID")}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="min-h-[44px]"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Simpan Pengaturan
          </Button>
          <Button
            variant="outline"
            onClick={() => testConnectionMutation.mutate()}
            disabled={testConnectionMutation.isPending || !settings?.gdrive_service_account_key}
            className="min-h-[44px]"
          >
            {testConnectionMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Test Koneksi
          </Button>
        </div>

        {!settings?.gdrive_service_account_key && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-sm">
              Service Account belum dikonfigurasi. Fitur backup ke Google Drive belum aktif.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
