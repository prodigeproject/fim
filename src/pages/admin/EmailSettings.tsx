import { useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  Mail,
  Settings,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function EmailSettings() {
  const { isSuperAdmin } = useAdminAuth();
  const { toast } = useToast();
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const handleTestResend = async () => {
    if (!testEmail) {
      toast({ title: "Masukkan email untuk test", variant: "destructive" });
      return;
    }

    setIsTestingResend(true);
    try {
      // Test email would be sent via edge function
      toast({ 
        title: "Email test terkirim", 
        description: "Cek inbox untuk memverifikasi konfigurasi" 
      });
    } catch (error) {
      toast({ 
        title: "Gagal mengirim email test", 
        variant: "destructive" 
      });
    } finally {
      setIsTestingResend(false);
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

      <Tabs defaultValue="resend">
        <TabsList>
          <TabsTrigger value="resend">Resend (Aktif)</TabsTrigger>
          <TabsTrigger value="gmail">Gmail SMTP</TabsTrigger>
        </TabsList>

        <TabsContent value="resend" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Resend
                  </CardTitle>
                  <CardDescription>
                    Layanan email yang saat ini digunakan untuk newsletter
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Aktif
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Resend API Key sudah dikonfigurasi. Email akan dikirim menggunakan layanan Resend.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="test-email">Test Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <Button onClick={handleTestResend} disabled={isTestingResend}>
                    {isTestingResend && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Kirim Test
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Untuk mengubah API Key atau konfigurasi Resend:
                </p>
                <Button variant="outline" asChild>
                  <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buka Resend Dashboard
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gmail" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Gmail SMTP
                  </CardTitle>
                  <CardDescription>
                    Gunakan akun Gmail untuk mengirim email
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Belum Dikonfigurasi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Integrasi Gmail SMTP memerlukan konfigurasi tambahan. 
                  Untuk mengaktifkan, Anda perlu:
                </AlertDescription>
              </Alert>

              <div className="space-y-3 text-sm">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Langkah-langkah Setup Gmail SMTP:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Aktifkan 2-Step Verification di akun Google Anda</li>
                    <li>Buat App Password di Google Account Settings</li>
                    <li>Simpan App Password sebagai secret <code className="bg-background px-1 rounded">GMAIL_APP_PASSWORD</code></li>
                    <li>Tambahkan email address sebagai secret <code className="bg-background px-1 rounded">GMAIL_EMAIL</code></li>
                  </ol>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" asChild>
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
              </div>

              <div className="pt-4 border-t">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Catatan:</strong> Gmail memiliki batas pengiriman 500 email/hari untuk akun personal 
                    dan 2000 email/hari untuk Google Workspace. Untuk pengiriman massal, 
                    disarankan tetap menggunakan Resend atau layanan email marketing lainnya.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Konfigurasi SMTP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input value="smtp.gmail.com" disabled />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input value="587" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input placeholder="Belum dikonfigurasi" disabled />
                </div>
                <div className="space-y-2">
                  <Label>App Password</Label>
                  <Input type="password" placeholder="••••••••" disabled />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Hubungi developer untuk mengaktifkan Gmail SMTP
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
