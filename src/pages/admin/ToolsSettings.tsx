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
import { DataExporter } from "@/components/admin/DataExporter";
import { 
  Settings, 
  Shield, 
  Search, 
  Loader2, 
  Save, 
  Globe,
  FileText,
  BarChart,
  Database,
  Download
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
        <TabsList>
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
          <BackupManager showGDriveOption={true} />
          <DataExporter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
