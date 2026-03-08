import { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Mail,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Save,
  Send,
  Bell,
  Newspaper,
} from "lucide-react";

export default function EmailSettings() {
  const { isSuperAdmin } = useAdminAuth();
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailAppPassword, setGmailAppPassword] = useState("");
  const [replyToAddress, setReplyToAddress] = useState("");
  const [fromName, setFromName] = useState("Forum Indonesia Muda");
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("email_settings")
        .select("mail_from_name, mail_from_address, reply_to_address")
        .limit(1)
        .maybeSingle();
      if (data) {
        setFromName(data.mail_from_name || "Forum Indonesia Muda");
        setGmailEmail(data.mail_from_address || "");
        setReplyToAddress((data as any).reply_to_address || "");
      }
    };
    loadSettings();
  }, []);
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    registrationStatus: true,
    selectionStage: true,
    interviewSchedule: true,
    interviewReminder: true,
    finalResult: true,
  });
  
  // Newsletter settings
  const [newsletterSettings, setNewsletterSettings] = useState({
    welcomeEmail: true,
    confirmationEmail: true,
    broadcastEnabled: true,
  });

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Masukkan email untuk test");
      return;
    }

    setIsTesting(true);
    try {
      const { error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: {
          email: testEmail,
          name: "Test User",
          testMode: true,
        },
      });
      
      if (error) throw error;
      
      toast.success("Email test berhasil dikirim! Cek inbox Anda.");
    } catch (error: any) {
      toast.error(`Gagal mengirim email: ${error.message || "Unknown error"}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("email_settings")
        .update({
          mail_from_name: fromName,
          mail_from_address: gmailEmail || undefined,
          reply_to_address: replyToAddress || null,
        } as any)
        .not("id", "is", null); // update all rows

      if (error) throw error;
      toast.success("Pengaturan berhasil disimpan");
    } catch (error: any) {
      toast.error("Gagal menyimpan: " + (error.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
        <p className="text-muted-foreground">
          Hanya Super Admin yang dapat mengakses halaman ini
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Email</h1>
        <p className="text-muted-foreground">
          Konfigurasi layanan email untuk newsletter dan notifikasi
        </p>
      </div>

      <Tabs defaultValue="provider">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="provider">Provider Email</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
        </TabsList>

        {/* Provider Configuration Tab */}
        <TabsContent value="provider" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pilih Provider Email</CardTitle>
              <CardDescription>
                Pilih layanan yang akan digunakan untuk mengirim email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Resend Option */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    emailProvider === "resend"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setEmailProvider("resend")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Resend</h4>
                    {emailProvider === "resend" && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Layanan email modern dengan API yang mudah digunakan
                  </p>
                </div>

                {/* Gmail SMTP Option */}
                <div
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    emailProvider === "gmail"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setEmailProvider("gmail")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Gmail SMTP</h4>
                    {emailProvider === "gmail" && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Aktif
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gunakan akun Gmail untuk mengirim email
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resend Configuration */}
          {emailProvider === "resend" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Konfigurasi Resend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Resend API Key sudah dikonfigurasi melalui environment variables.
                    Untuk mengubah, update secret RESEND_API_KEY.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="resend-key">API Key (opsional - override)</Label>
                  <Input
                    id="resend-key"
                    type="password"
                    placeholder="re_xxxxxxxxxx"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kosongkan untuk menggunakan API key dari environment
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" asChild>
                    <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Buka Resend Dashboard
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gmail SMTP Configuration */}
          {emailProvider === "gmail" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Konfigurasi Gmail SMTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Gmail memiliki batas pengiriman 500 email/hari untuk akun personal.
                    Untuk pengiriman massal, gunakan Resend.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">Nama Pengirim</Label>
                    <Input
                      id="from-name"
                      type="text"
                      placeholder="Forum Indonesia Muda"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Nama yang muncul sebagai pengirim email
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmail-email">Email Pengirim (From)</Label>
                    <Input
                      id="gmail-email"
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={gmailEmail}
                      onChange={(e) => setGmailEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reply-to">Reply-To Address</Label>
                    <Input
                      id="reply-to"
                      type="email"
                      placeholder="info@forumindonesiamuda.org"
                      value={replyToAddress}
                      onChange={(e) => setReplyToAddress(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alamat email tujuan balasan. Kosongkan jika sama dengan email pengirim.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="gmail-password">App Password</Label>
                    <Input
                      id="gmail-password"
                      type="password"
                      placeholder="xxxx xxxx xxxx xxxx"
                      value={gmailAppPassword}
                      onChange={(e) => setGmailAppPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Kredensial disimpan sebagai secret dan tidak ditampilkan. Kosongkan jika tidak ingin mengubah.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Langkah Setup:</p>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                    <li>Aktifkan 2-Step Verification di akun Google</li>
                    <li>Buat App Password di Google Account Settings</li>
                    <li>Masukkan email dan App Password di form di atas</li>
                    <li>Simpan pengaturan</li>
                  </ol>
                  <Button variant="outline" asChild className="mt-2">
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Buat App Password
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle>Test Email</CardTitle>
              <CardDescription>
                Kirim email test untuk memverifikasi konfigurasi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button onClick={handleTestEmail} disabled={isTestingResend}>
                  {isTestingResend ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Kirim Test
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Simpan Pengaturan Provider
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifikasi Email Pendaftaran
              </CardTitle>
              <CardDescription>
                Konfigurasi email otomatis yang dikirim ke pendaftar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "registrationStatus",
                  label: "Status Pendaftaran",
                  description: "Email saat pendaftaran disetujui atau ditolak",
                },
                {
                  key: "selectionStage",
                  label: "Tahap Seleksi",
                  description: "Email saat tahap seleksi berubah (lolos/tidak lolos)",
                },
                {
                  key: "interviewSchedule",
                  label: "Jadwal Wawancara",
                  description: "Email undangan wawancara dengan jadwal",
                },
                {
                  key: "interviewReminder",
                  label: "Reminder Wawancara",
                  description: "Email pengingat H-1 sebelum wawancara",
                },
                {
                  key: "finalResult",
                  label: "Hasil Akhir",
                  description: "Email pengumuman hasil akhir seleksi",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({
                        ...prev,
                        [item.key]: checked,
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan Notifikasi
            </Button>
          </div>
        </TabsContent>

        {/* Newsletter Tab */}
        <TabsContent value="newsletter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Pengaturan Newsletter
              </CardTitle>
              <CardDescription>
                Konfigurasi email newsletter dan broadcast
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  key: "welcomeEmail",
                  label: "Email Selamat Datang",
                  description: "Kirim email selamat datang ke subscriber baru",
                },
                {
                  key: "confirmationEmail",
                  label: "Email Konfirmasi",
                  description: "Kirim email konfirmasi langganan (double opt-in)",
                },
                {
                  key: "broadcastEnabled",
                  label: "Broadcast Email",
                  description: "Aktifkan fitur broadcast email ke semua subscriber",
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={newsletterSettings[item.key as keyof typeof newsletterSettings]}
                    onCheckedChange={(checked) =>
                      setNewsletterSettings((prev) => ({
                        ...prev,
                        [item.key]: checked,
                      }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Simpan Pengaturan Newsletter
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
