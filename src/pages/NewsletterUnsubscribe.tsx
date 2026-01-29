import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, Mail, Home } from "lucide-react";
import { SEO } from "@/components/SEO";

type UnsubscribeStatus = "loading" | "success" | "already" | "not_found" | "error";

export default function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const [message, setMessage] = useState("");

  const email = searchParams.get("email");

  useEffect(() => {
    const processUnsubscribe = async () => {
      if (!email) {
        setStatus("error");
        setMessage("Link tidak valid. Email tidak ditemukan.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("newsletter-unsubscribe", {
          body: { email },
        });

        if (error) throw error;

        if (data?.success) {
          setStatus("success");
          setMessage(data.message || "Anda berhasil berhenti berlangganan newsletter FIM.");
        } else if (data?.message?.includes("sudah dihapus")) {
          setStatus("already");
          setMessage(data.message);
        } else if (data?.error?.includes("tidak terdaftar")) {
          setStatus("not_found");
          setMessage("Email ini tidak terdaftar sebagai subscriber newsletter.");
        } else {
          setStatus("error");
          setMessage(data?.error || "Terjadi kesalahan saat memproses permintaan.");
        }
      } catch (err: any) {
        console.error("Unsubscribe error:", err);
        setStatus("error");
        setMessage(err?.message || "Terjadi kesalahan. Silakan coba lagi nanti.");
      }
    };

    processUnsubscribe();
  }, [email]);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
      case "success":
      case "already":
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case "not_found":
        return <Mail className="h-16 w-16 text-yellow-600" />;
      case "error":
        return <XCircle className="h-16 w-16 text-destructive" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Memproses...";
      case "success":
        return "Berhasil Berhenti Berlangganan";
      case "already":
        return "Sudah Tidak Berlangganan";
      case "not_found":
        return "Email Tidak Ditemukan";
      case "error":
        return "Terjadi Kesalahan";
    }
  };

  return (
    <>
      <SEO
        title="Berhenti Berlangganan Newsletter | Forum Indonesia Muda"
        description="Halaman berhenti berlangganan newsletter Forum Indonesia Muda"
      />
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">{getStatusIcon()}</div>
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <CardDescription className="text-base">{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "success" && (
              <p className="text-sm text-muted-foreground">
                Kami menyesal melihat Anda pergi. Jika Anda berubah pikiran, Anda selalu dapat berlangganan kembali di website kami.
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
