import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Eye, EyeOff, Save, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecaptchaSettingsData {
  id: string;
  site_key: string | null;
  secret_key_encrypted: string | null;
  enabled_signup: boolean;
  enabled_login: boolean;
  enabled_forgot_password: boolean;
  enabled_admin_login: boolean;
}

export default function RecaptchaSettings() {
  const { isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [siteKey, setSiteKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [enabledSignup, setEnabledSignup] = useState(false);
  const [enabledLogin, setEnabledLogin] = useState(false);
  const [enabledForgotPassword, setEnabledForgotPassword] = useState(false);
  const [enabledAdminLogin, setEnabledAdminLogin] = useState(false);
  const [hasSecretKey, setHasSecretKey] = useState(false);

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["recaptcha-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recaptcha_settings")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data as RecaptchaSettingsData | null;
    },
    enabled: isSuperAdmin,
  });

  // Populate form when data loads
  useEffect(() => {
    if (settings) {
      setSiteKey(settings.site_key || "");
      setEnabledSignup(settings.enabled_signup || false);
      setEnabledLogin(settings.enabled_login || false);
      setEnabledForgotPassword(settings.enabled_forgot_password || false);
      setEnabledAdminLogin(settings.enabled_admin_login || false);
      setHasSecretKey(!!settings.secret_key_encrypted);
      // Don't populate secret key - it's encrypted
      setSecretKey("");
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData: Record<string, unknown> = {
        site_key: siteKey.trim(),
        enabled_signup: enabledSignup,
        enabled_login: enabledLogin,
        enabled_forgot_password: enabledForgotPassword,
        enabled_admin_login: enabledAdminLogin,
      };

      // Only update secret key if provided (user wants to change it)
      if (secretKey.trim()) {
        updateData.secret_key_encrypted = secretKey.trim();
      }

      if (settings?.id) {
        const { error } = await supabase
          .from("recaptcha_settings")
          .update(updateData)
          .eq("id", settings.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from("recaptcha_settings")
          .insert(updateData);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recaptcha-settings"] });
      queryClient.invalidateQueries({ queryKey: ["recaptcha-public-config"] });
      toast({ title: "Pengaturan reCAPTCHA berhasil disimpan" });
      setSecretKey(""); // Clear secret key field after save
      setHasSecretKey(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menyimpan pengaturan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Anda tidak memiliki akses ke halaman ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan reCAPTCHA</h1>
          <p className="text-muted-foreground">
            Konfigurasi Google reCAPTCHA v2 untuk proteksi form
          </p>
        </div>
        <a
          href="https://www.google.com/recaptcha/admin"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Buat key di Google reCAPTCHA
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Konfigurasi Key
          </CardTitle>
          <CardDescription>
            Masukkan Site Key dan Secret Key dari Google reCAPTCHA Admin Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteKey">Site Key (Public)</Label>
            <Input
              id="siteKey"
              value={siteKey}
              onChange={(e) => setSiteKey(e.target.value)}
              placeholder="6Lc..."
            />
            <p className="text-xs text-muted-foreground">
              Site key akan digunakan di frontend untuk menampilkan widget reCAPTCHA
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">
              Secret Key (Private)
              {hasSecretKey && (
                <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                  ✓ Sudah dikonfigurasi
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? "text" : "password"}
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder={hasSecretKey ? "••••••••••••••••" : "6Lc..."}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {hasSecretKey
                ? "Kosongkan jika tidak ingin mengubah secret key yang ada"
                : "Secret key akan disimpan terenkripsi dan digunakan untuk verifikasi di backend"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aktifkan per Halaman</CardTitle>
          <CardDescription>
            Pilih halaman mana yang memerlukan verifikasi reCAPTCHA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Pendaftaran Peserta (/portal/signup)</Label>
              <p className="text-xs text-muted-foreground">
                Form registrasi akun baru untuk pendaftar FIM
              </p>
            </div>
            <Switch
              checked={enabledSignup}
              onCheckedChange={setEnabledSignup}
              disabled={!siteKey}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Login Peserta (/portal/login)</Label>
              <p className="text-xs text-muted-foreground">
                Form login untuk pendaftar FIM
              </p>
            </div>
            <Switch
              checked={enabledLogin}
              onCheckedChange={setEnabledLogin}
              disabled={!siteKey}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Lupa Password Peserta (/portal/forgot-password)</Label>
              <p className="text-xs text-muted-foreground">
                Form reset password untuk pendaftar
              </p>
            </div>
            <Switch
              checked={enabledForgotPassword}
              onCheckedChange={setEnabledForgotPassword}
              disabled={!siteKey}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Login Admin (/admin)</Label>
              <p className="text-xs text-muted-foreground">
                Form login untuk administrator
              </p>
            </div>
            <Switch
              checked={enabledAdminLogin}
              onCheckedChange={setEnabledAdminLogin}
              disabled={!siteKey}
            />
          </div>

          {!siteKey && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Masukkan Site Key terlebih dahulu untuk mengaktifkan reCAPTCHA
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
