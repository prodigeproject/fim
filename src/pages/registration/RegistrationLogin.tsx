import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegistrationAuth } from "@/contexts/RegistrationAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import logoFim from "@/assets/logo-fim.png";

export default function RegistrationLogin() {
  const navigate = useNavigate();
  const { signIn, isLoading, registration, user } = useRegistrationAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && registration) {
      navigate("/daftar/dashboard", { replace: true });
    }
  }, [user, registration, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setIsSubmitting(true);
    setNeedsVerification(false);

    const { error } = await signIn(email, password);
    
    if (error) {
      // Check for unverified email error
      if (error.message === "UNVERIFIED_EMAIL") {
        setNeedsVerification(true);
        setIsSubmitting(false);
        return;
      }
      toast.error("Login gagal: " + error.message);
      setIsSubmitting(false);
    } else {
      toast.success("Login berhasil!");
      navigate("/daftar/dashboard");
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Masukkan email terlebih dahulu");
      return;
    }

    setIsResendingVerification(true);

    try {
      const response = await supabase.functions.invoke("send-verification-email", {
        body: { email: email.toLowerCase().trim() },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.");
    } catch (error: any) {
      toast.error("Gagal mengirim ulang email verifikasi: " + error.message);
    } finally {
      setIsResendingVerification(false);
    }
  };

  return (
    <>
      <SEO 
        title="Login Pendaftaran FIM" 
        description="Login untuk melanjutkan pendaftaran Forum Indonesia Muda"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img src={logoFim} alt="FIM Logo" className="h-16 mx-auto mb-4" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Pendaftaran Forum Indonesia Muda
            </h1>
            <p className="text-muted-foreground mt-2">
              Masuk untuk melanjutkan pendaftaran
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Masukkan email dan password yang telah didaftarkan
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {needsVerification && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="ml-2 text-amber-800 dark:text-amber-200">
                      <strong>Akun Belum Terverifikasi</strong>
                      <p className="mt-1 text-sm">
                        Email Anda sudah terdaftar, namun belum diverifikasi. 
                        Silakan cek inbox email Anda (termasuk folder spam) untuk link verifikasi.
                      </p>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-amber-700 dark:text-amber-300 underline mt-1"
                        onClick={handleResendVerification}
                        disabled={isResendingVerification}
                      >
                        {isResendingVerification ? "Mengirim..." : "Kirim ulang email verifikasi"}
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/daftar/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Masuk
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Belum punya akun? </span>
                  <Link 
                    to="/daftar/signup" 
                    className="text-primary hover:underline font-medium"
                  >
                    Daftar sekarang
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
