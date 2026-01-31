import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mail, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";

export default function RegistrationSuccess() {
  return (
    <>
      <SEO 
        title="Verifikasi Email Diperlukan - FIM" 
        description="Silakan verifikasi email Anda untuk melanjutkan pendaftaran FIM"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
          </div>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle className="text-2xl text-amber-700 dark:text-amber-300">
                Verifikasi Email Anda
              </CardTitle>
              <CardDescription className="text-base">
                Satu langkah lagi untuk melanjutkan pendaftaran
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                      Email verifikasi telah dikirim
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Cek inbox atau folder spam email Anda dan klik link verifikasi untuk mengaktifkan akun.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Langkah selanjutnya:</p>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Buka email Anda</p>
                    <p className="text-xs text-muted-foreground">
                      Cek inbox untuk email dari Forum Indonesia Muda
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Klik link verifikasi</p>
                    <p className="text-xs text-muted-foreground">
                      Verifikasi akun untuk mengaktifkan login
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Login & lengkapi data</p>
                    <p className="text-xs text-muted-foreground">
                      Setelah terverifikasi, login untuk mengisi formulir pendaftaran
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Kirim pendaftaran</p>
                    <p className="text-xs text-muted-foreground">
                      Setelah semua data terisi, kirim untuk diproses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Link to="/portal/login" className="w-full">
                <Button className="w-full" size="lg">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Ke Halaman Login
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Sudah verifikasi? Langsung login untuk melanjutkan pendaftaran.
              </p>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← Kembali ke Beranda
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
