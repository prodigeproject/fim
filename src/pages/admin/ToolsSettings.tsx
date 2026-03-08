import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BackupManager } from "@/components/admin/BackupManager";
import { BackupSettingsForm } from "@/components/admin/BackupSettingsForm";
import { DataExporter } from "@/components/admin/DataExporter";
import { 
  Settings, 
  Shield, 
  Search, 
  Loader2, 
  Save, 
  Globe,
  FileText,
  Database,
} from "lucide-react";

interface RecaptchaSettings {
  id: string;
  site_key: string | null;
  secret_key_encrypted: string | null;
  enabled_signup: boolean;
  enabled_login: boolean;
  enabled_forgot_password: boolean;
  enabled_admin_login: boolean;
}

interface SEOSettings {
  id: string;
  google_site_verification: string | null;
  google_analytics_id: string | null;
  default_og_image: string | null;
  default_twitter_card: string | null;
  robots_txt_content: string | null;
  sitemap_enabled: boolean;
  structured_data_enabled: boolean;
}

export default function ToolsSettings() {
  const { isSuperAdmin } = useAdminAuth();
  const queryClient = useQueryClient();
  
  // reCAPTCHA state
  const [siteKey, setSiteKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [enabledSignup, setEnabledSignup] = useState(false);
  const [enabledLogin, setEnabledLogin] = useState(false);
  const [enabledForgotPassword, setEnabledForgotPassword] = useState(false);
  const [enabledAdminLogin, setEnabledAdminLogin] = useState(false);
  
  // SEO state
  const [googleVerification, setGoogleVerification] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [defaultOgImage, setDefaultOgImage] = useState("");
  const [robotsTxt, setRobotsTxt] = useState("");
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [structuredDataEnabled, setStructuredDataEnabled] = useState(true);

  // Fetch reCAPTCHA settings
  const { data: recaptchaSettings, isLoading: loadingRecaptcha } = useQuery({
    queryKey: ["recaptcha-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recaptcha_settings")
        .select("*")
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setSiteKey(data.site_key || "");
        setEnabledSignup(data.enabled_signup || false);
        setEnabledLogin(data.enabled_login || false);
        setEnabledForgotPassword(data.enabled_forgot_password || false);
        setEnabledAdminLogin(data.enabled_admin_login || false);
      }
      
      return data as RecaptchaSettings | null;
    },
    enabled: isSuperAdmin,
  });

  // Fetch SEO settings
  const { data: seoSettings, isLoading: loadingSEO } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setGoogleVerification(data.google_site_verification || "");
        setGoogleAnalyticsId(data.google_analytics_id || "");
        setDefaultOgImage(data.default_og_image || "");
        setRobotsTxt(data.robots_txt_content || "");
        setSitemapEnabled(data.sitemap_enabled ?? true);
        setStructuredDataEnabled(data.structured_data_enabled ?? true);
      }
      
      return data as SEOSettings | null;
    },
    enabled: isSuperAdmin,
  });

  // Save reCAPTCHA mutation
  const saveRecaptchaMutation = useMutation({
    mutationFn: async () => {
      const updateData: any = {
        site_key: siteKey || null,
        enabled_signup: enabledSignup,
        enabled_login: enabledLogin,
        enabled_forgot_password: enabledForgotPassword,
        enabled_admin_login: enabledAdminLogin,
        updated_at: new Date().toISOString(),
      };
      
      // Only update secret key if changed
      if (secretKey && secretKey !== "••••••••") {
        updateData.secret_key_encrypted = secretKey;
      }

      if (recaptchaSettings?.id) {
        const { error } = await supabase
          .from("recaptcha_settings")
          .update(updateData)
          .eq("id", recaptchaSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("recaptcha_settings")
          .insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recaptcha-settings"] });
      toast.success("Pengaturan reCAPTCHA berhasil disimpan");
    },
    onError: (error: any) => {
      toast.error(`Gagal menyimpan: ${error.message}`);
    },
  });

  // Save SEO mutation
  const saveSEOMutation = useMutation({
    mutationFn: async () => {
      const updateData = {
        google_site_verification: googleVerification || null,
        google_analytics_id: googleAnalyticsId || null,
        default_og_image: defaultOgImage || null,
        robots_txt_content: robotsTxt || null,
        sitemap_enabled: sitemapEnabled,
        structured_data_enabled: structuredDataEnabled,
        updated_at: new Date().toISOString(),
      };

      if (seoSettings?.id) {
        const { error } = await supabase
          .from("seo_settings")
          .update(updateData)
          .eq("id", seoSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("seo_settings")
          .insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      toast.success("Pengaturan SEO berhasil disimpan");
    },
    onError: (error: any) => {
      toast.error(`Gagal menyimpan: ${error.message}`);
    },
  });

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">Hanya Super Admin yang dapat mengakses halaman ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Pengaturan Tools
        </h1>
        <p className="text-muted-foreground">
          Konfigurasi SEO, reCAPTCHA, dan tools lainnya
        </p>
      </div>

      <Tabs defaultValue="seo" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO Google
          </TabsTrigger>
          <TabsTrigger value="recaptcha" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            reCAPTCHA
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup Data
          </TabsTrigger>
        </TabsList>

        {/* SEO Settings Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Google Search Console
              </CardTitle>
              <CardDescription>
                Verifikasi kepemilikan situs dan integrasi Google
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSEO ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="google-verification">Google Site Verification</Label>
                    <Input
                      id="google-verification"
                      value={googleVerification}
                      onChange={(e) => setGoogleVerification(e.target.value)}
                      placeholder="google-site-verification=..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Meta tag verifikasi dari Google Search Console
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-analytics">Google Analytics ID</Label>
                    <Input
                      id="google-analytics"
                      value={googleAnalyticsId}
                      onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-sm text-muted-foreground">
                      Measurement ID dari Google Analytics 4
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="og-image">Default OG Image URL</Label>
                    <Input
                      id="og-image"
                      value={defaultOgImage}
                      onChange={(e) => setDefaultOgImage(e.target.value)}
                      placeholder="https://example.com/og-image.jpg"
                    />
                    <p className="text-sm text-muted-foreground">
                      Gambar default untuk share di social media (1200x630px)
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Robots & Sitemap
              </CardTitle>
              <CardDescription>
                Konfigurasi pengindeksan mesin pencari
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sitemap Otomatis</Label>
                  <p className="text-sm text-muted-foreground">
                    Generate sitemap.xml otomatis dari artikel
                  </p>
                </div>
                <Switch
                  checked={sitemapEnabled}
                  onCheckedChange={setSitemapEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Structured Data (JSON-LD)</Label>
                  <p className="text-sm text-muted-foreground">
                    Tambahkan rich snippets untuk artikel
                  </p>
                </div>
                <Switch
                  checked={structuredDataEnabled}
                  onCheckedChange={setStructuredDataEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots-txt">Custom Robots.txt</Label>
                <Textarea
                  id="robots-txt"
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  placeholder="User-agent: *&#10;Allow: /"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={() => saveSEOMutation.mutate()}
                disabled={saveSEOMutation.isPending}
              >
                {saveSEOMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Simpan Pengaturan SEO
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* reCAPTCHA Settings Tab */}
        <TabsContent value="recaptcha" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Google reCAPTCHA v2
              </CardTitle>
              <CardDescription>
                Lindungi form dari spam dan bot dengan reCAPTCHA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingRecaptcha ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="site-key">Site Key</Label>
                      <Input
                        id="site-key"
                        value={siteKey}
                        onChange={(e) => setSiteKey(e.target.value)}
                        placeholder="6Le..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secret-key">Secret Key</Label>
                      <Input
                        id="secret-key"
                        type="password"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder={recaptchaSettings?.secret_key_encrypted ? "••••••••" : "Masukkan secret key"}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h4 className="font-medium">Aktifkan di Halaman</h4>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Signup Peserta</p>
                          <p className="text-sm text-muted-foreground">/portal/signup</p>
                        </div>
                        <Switch
                          checked={enabledSignup}
                          onCheckedChange={setEnabledSignup}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Login Peserta</p>
                          <p className="text-sm text-muted-foreground">/portal/login</p>
                        </div>
                        <Switch
                          checked={enabledLogin}
                          onCheckedChange={setEnabledLogin}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Lupa Password</p>
                          <p className="text-sm text-muted-foreground">/portal/forgot-password</p>
                        </div>
                        <Switch
                          checked={enabledForgotPassword}
                          onCheckedChange={setEnabledForgotPassword}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">Login Admin</p>
                          <p className="text-sm text-muted-foreground">/admin</p>
                        </div>
                        <Switch
                          checked={enabledAdminLogin}
                          onCheckedChange={setEnabledAdminLogin}
                        />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => saveRecaptchaMutation.mutate()}
                    disabled={saveRecaptchaMutation.isPending}
                  >
                    {saveRecaptchaMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Simpan Pengaturan reCAPTCHA
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        {/* Backup Data Tab */}
        <TabsContent value="backup" className="space-y-6">
          <BackupSettingsForm />
          <BackupManager showGDriveOption={true} />
          <DataExporter />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmailQueueSettings() {
  const queryClient = useQueryClient();
  const [mailHost, setMailHost] = useState("smtp.gmail.com");
  const [mailPort, setMailPort] = useState(587);
  const [mailUsername, setMailUsername] = useState("");
  const [mailPassword, setMailPassword] = useState("");
  const [mailEncryption, setMailEncryption] = useState("TLS");
  const [mailFromAddress, setMailFromAddress] = useState("");
  const [mailFromName, setMailFromName] = useState("Forum Indonesia Muda");
  const [dailyRateLimit, setDailyRateLimit] = useState(2000);
  const [retryMaxAttempts, setRetryMaxAttempts] = useState(3);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState(60);
  const [queueEnabled, setQueueEnabled] = useState(true);

  const { data: emailSettings, isLoading } = useQuery({
    queryKey: ["email-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setMailHost(data.mail_host || "smtp.gmail.com");
        setMailPort(data.mail_port || 587);
        setMailUsername(data.mail_username || "");
        setMailEncryption(data.mail_encryption || "TLS");
        setMailFromAddress(data.mail_from_address || "");
        setMailFromName(data.mail_from_name || "Forum Indonesia Muda");
        setDailyRateLimit(data.daily_rate_limit || 2000);
        setRetryMaxAttempts(data.retry_max_attempts || 3);
        setRetryDelaySeconds(data.retry_delay_seconds || 60);
        setQueueEnabled(data.queue_enabled ?? true);
      }
      return data;
    },
  });

  // Queue stats
  const { data: queueStats } = useQuery({
    queryKey: ["queue-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_queue")
        .select("status")
      if (error) throw error;
      const stats = { pending: 0, processing: 0, sent: 0, failed: 0 };
      data?.forEach((n: any) => {
        if (stats[n.status as keyof typeof stats] !== undefined) {
          stats[n.status as keyof typeof stats]++;
        }
      });
      return stats;
    },
    refetchInterval: 10000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updateData: any = {
        mail_host: mailHost,
        mail_port: mailPort,
        mail_username: mailUsername || null,
        mail_encryption: mailEncryption,
        mail_from_address: mailFromAddress || null,
        mail_from_name: mailFromName,
        daily_rate_limit: dailyRateLimit,
        retry_max_attempts: retryMaxAttempts,
        retry_delay_seconds: retryDelaySeconds,
        queue_enabled: queueEnabled,
        updated_at: new Date().toISOString(),
      };
      if (mailPassword && mailPassword !== "••••••••") {
        updateData.mail_password_encrypted = mailPassword;
      }
      if (emailSettings?.id) {
        const { error } = await supabase.from("email_settings").update(updateData).eq("id", emailSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("email_settings").insert(updateData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-settings"] });
      toast.success("Pengaturan email berhasil disimpan");
    },
    onError: (error: any) => toast.error(`Gagal menyimpan: ${error.message}`),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <>
      {/* Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status Queue Email
          </CardTitle>
          <CardDescription>Monitor antrian pengiriman email real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pending", value: queueStats?.pending || 0, color: "text-yellow-600" },
              { label: "Processing", value: queueStats?.processing || 0, color: "text-blue-600" },
              { label: "Sent", value: queueStats?.sent || 0, color: "text-green-600" },
              { label: "Failed", value: queueStats?.failed || 0, color: "text-red-600" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SMTP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi SMTP</CardTitle>
          <CardDescription>Pengaturan Gmail SMTP untuk pengiriman email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SMTP Host</Label>
              <Input value={mailHost} onChange={e => setMailHost(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input type="number" value={mailPort} onChange={e => setMailPort(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Username (Email)</Label>
              <Input value={mailUsername} onChange={e => setMailUsername(e.target.value)} placeholder="noreply@domain.com" />
            </div>
            <div className="space-y-2">
              <Label>App Password</Label>
              <Input type="password" value={mailPassword} onChange={e => setMailPassword(e.target.value)} placeholder={emailSettings?.mail_password_encrypted ? "••••••••" : "App Password"} />
            </div>
            <div className="space-y-2">
              <Label>Encryption</Label>
              <Input value={mailEncryption} onChange={e => setMailEncryption(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>From Address</Label>
              <Input value={mailFromAddress} onChange={e => setMailFromAddress(e.target.value)} placeholder="noreply@domain.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>From Name</Label>
              <Input value={mailFromName} onChange={e => setMailFromName(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Queue Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasi Queue</CardTitle>
          <CardDescription>Pengaturan antrian dan rate limiting email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">Queue Aktif</p>
              <p className="text-sm text-muted-foreground">Aktifkan sistem antrian email</p>
            </div>
            <Switch checked={queueEnabled} onCheckedChange={setQueueEnabled} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Rate Limit (email/hari)</Label>
              <Input type="number" value={dailyRateLimit} onChange={e => setDailyRateLimit(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Max Retry Attempts</Label>
              <Input type="number" value={retryMaxAttempts} onChange={e => setRetryMaxAttempts(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Retry Delay (detik)</Label>
              <Input type="number" value={retryDelaySeconds} onChange={e => setRetryDelaySeconds(Number(e.target.value))} />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Email Flow & Delay</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Jenis Email</th>
                    <th className="text-center py-2">Queue</th>
                    <th className="text-center py-2">Delay</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: "Verifikasi Email", delay: "0–10 detik" },
                    { type: "Reset Password", delay: "0 detik" },
                    { type: "Notifikasi Status", delay: "5–30 detik" },
                    { type: "Reminder", delay: "Scheduled" },
                    { type: "Login Notifikasi", delay: "0–5 detik" },
                  ].map(item => (
                    <tr key={item.type} className="border-b last:border-0">
                      <td className="py-2">{item.type}</td>
                      <td className="text-center py-2">✅</td>
                      <td className="text-center py-2 text-muted-foreground">{item.delay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan Pengaturan Email
        </Button>
      </div>
    </>
  );
}
