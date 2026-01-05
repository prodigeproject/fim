import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Mail, User } from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";

export default function RegistrationSuccess() {
  return (
    <>
      <SEO 
        title="Pendaftaran Berhasil - FIM" 
        description="Akun pendaftaran FIM Anda berhasil dibuat"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
          </div>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-700 dark:text-green-300">
                Pendaftaran Berhasil!
              </CardTitle>
              <CardDescription className="text-base">
                Akun Anda berhasil dibuat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Login ke akun Anda</p>
                    <p className="text-xs text-muted-foreground">
                      Gunakan email dan password yang baru saja Anda daftarkan
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Lengkapi data pelatihan</p>
                    <p className="text-xs text-muted-foreground">
                      Isi formulir biodata, pengalaman, motivasi, dan lainnya
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Kirim pendaftaran</p>
                    <p className="text-xs text-muted-foreground">
                      Setelah semua data terisi, kirim pendaftaran Anda
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Link to="/daftar" className="w-full">
                <Button className="w-full" size="lg">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Login Sekarang
                </Button>
              </Link>
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
