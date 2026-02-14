import { useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import logoFim from "@/assets/logo-fim.png";
import { Link } from "react-router-dom";

interface TurnstileGuardProps {
  children: ReactNode;
  title: string;
  description: string;
}

export default function TurnstileGuard({ children, title, description }: TurnstileGuardProps) {
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (token: string) => {
    setVerifying(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("verify-turnstile", {
        body: { token },
      });
      if (fnError || !data?.success) {
        setError("Verifikasi gagal. Silakan coba lagi.");
        setVerifying(false);
        return;
      }
      setVerified(true);
    } catch {
      setError("Terjadi kesalahan saat verifikasi.");
      setVerifying(false);
    }
  };

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logoFim} alt="Forum Indonesia Muda" className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Forum Indonesia Muda</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {verifying ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Memverifikasi...</span>
              </div>
            ) : (
              <TurnstileWidget
                onVerify={handleVerify}
                onError={() => setError("Widget error. Silakan muat ulang halaman.")}
                onExpire={() => setError("Verifikasi kedaluwarsa. Silakan coba lagi.")}
              />
            )}
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <p className="text-xs text-muted-foreground text-center mt-2">
              Verifikasi ini memastikan Anda bukan bot. Data Anda aman.
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
