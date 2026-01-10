import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token verifikasi tidak ditemukan");
        return;
      }

      try {
        // Find registration with this token and check expiration
        const { data: registration, error: fetchError } = await supabase
          .from("fim_registrations")
          .select("id, email, email_verified, email_verification_expires_at, verification_attempts")
          .eq("email_verification_token", token)
          .single();

        if (fetchError || !registration) {
          setStatus("error");
          setMessage("Token tidak valid atau sudah kedaluwarsa");
          return;
        }

        // Check if token has expired
        if (registration.email_verification_expires_at) {
          const expiresAt = new Date(registration.email_verification_expires_at);
          if (expiresAt < new Date()) {
            setStatus("error");
            setMessage("Token verifikasi sudah kedaluwarsa. Silakan minta email verifikasi baru.");
            return;
          }
        }

        // Check verification attempts (rate limiting)
        if (registration.verification_attempts && registration.verification_attempts >= 10) {
          setStatus("error");
          setMessage("Terlalu banyak percobaan verifikasi. Silakan minta email verifikasi baru.");
          return;
        }

        // Increment verification attempts
        await supabase
          .from("fim_registrations")
          .update({ verification_attempts: (registration.verification_attempts || 0) + 1 })
          .eq("id", registration.id);

        // Check if already verified
        if (registration.email_verified) {
          setStatus("success");
          setMessage("Email Anda sudah terverifikasi sebelumnya");
          return;
        }

        // Update verification status - clear token and expiration after use
        const { error: updateError } = await supabase
          .from("fim_registrations")
          .update({
            email_verified: true,
            email_verified_at: new Date().toISOString(),
            email_verification_token: null, // Clear token after use
            email_verification_expires_at: null, // Clear expiration
            verification_attempts: 0, // Reset attempts
          })
          .eq("id", registration.id);

        if (updateError) {
          console.error("Verification update error:", updateError);
          setStatus("error");
          setMessage("Gagal memverifikasi email. Silakan coba lagi.");
          return;
        }

        setStatus("success");
        setMessage("Email Anda berhasil diverifikasi!");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage("Terjadi kesalahan. Silakan coba lagi.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      <SEO 
        title="Verifikasi Email - FIM" 
        description="Verifikasi email pendaftaran Forum Indonesia Muda"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center pb-2">
              {status === "loading" && (
                <>
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <CardTitle className="text-xl">Memverifikasi Email...</CardTitle>
                  <CardDescription>Mohon tunggu sebentar</CardDescription>
                </>
              )}
              
              {status === "success" && (
                <>
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-xl text-green-700 dark:text-green-300">
                    Verifikasi Berhasil!
                  </CardTitle>
                  <CardDescription>{message}</CardDescription>
                </>
              )}
              
              {status === "error" && (
                <>
                  <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-xl text-red-700 dark:text-red-300">
                    Verifikasi Gagal
                  </CardTitle>
                  <CardDescription>{message}</CardDescription>
                </>
              )}
            </CardHeader>

            {status !== "loading" && (
              <CardContent className="text-center space-y-4">
                {status === "success" && (
                  <p className="text-sm text-muted-foreground">
                    Silakan login ke akun Anda untuk melanjutkan proses pendaftaran.
                  </p>
                )}
                {status === "error" && (
                  <p className="text-sm text-muted-foreground">
                    Jika masalah berlanjut, silakan hubungi tim FIM atau daftar ulang.
                  </p>
                )}
              </CardContent>
            )}

            {status !== "loading" && (
              <CardFooter className="flex flex-col gap-3">
                <Link to="/daftar" className="w-full">
                  <Button className="w-full" size="lg">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {status === "success" ? "Login Sekarang" : "Kembali ke Login"}
                  </Button>
                </Link>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  ← Kembali ke Beranda
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}