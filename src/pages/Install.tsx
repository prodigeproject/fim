import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useInstallPrompt, useIsStandalone } from "@/hooks/usePWA";
import { Download, CheckCircle, Smartphone, Share, Plus } from "lucide-react";
import logoFim from "@/assets/logo-fim.png";
import Layout from "@/components/Layout";

export default function Install() {
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();
  const isStandalone = useIsStandalone();
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));
  }, []);

  const alreadyInstalled = isInstalled || isStandalone;

  return (
    <Layout>
      <SEO title="Install Aplikasi - Forum Indonesia Muda" description="Install aplikasi Forum Indonesia Muda di perangkat Anda." />
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <img src={logoFim} alt="FIM" className="h-20 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">Install Aplikasi FIM</h1>

        {alreadyInstalled ? (
          <div className="flex flex-col items-center gap-3 text-supporting">
            <CheckCircle className="h-12 w-12" />
            <p className="text-lg font-semibold">Aplikasi sudah terinstall!</p>
            <p className="text-muted-foreground text-sm">
              Anda sudah menggunakan aplikasi FIM di perangkat ini.
            </p>
          </div>
        ) : canInstall ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Install aplikasi FIM untuk pengalaman terbaik — akses cepat, notifikasi, dan dukungan offline.
            </p>
            <Button size="lg" onClick={promptInstall} className="w-full min-h-[48px]">
              <Download className="mr-2 h-5 w-5" />
              Install Sekarang
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Install aplikasi FIM untuk akses cepat langsung dari home screen.
            </p>

            {isIOS && (
              <div className="bg-card rounded-2xl p-6 text-left space-y-4 shadow-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Petunjuk untuk iPhone / iPad
                </h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                    <span>Ketuk tombol <Share className="inline h-4 w-4" /> <strong>Share</strong> di toolbar Safari</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                    <span>Scroll ke bawah dan ketuk <Plus className="inline h-4 w-4" /> <strong>Add to Home Screen</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                    <span>Ketuk <strong>Add</strong> untuk mengonfirmasi</span>
                  </li>
                </ol>
              </div>
            )}

            {isAndroid && (
              <div className="bg-card rounded-2xl p-6 text-left space-y-4 shadow-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                  Petunjuk untuk Android
                </h3>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">1</span>
                    <span>Ketuk menu <strong>⋮</strong> (tiga titik) di Chrome</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">2</span>
                    <span>Ketuk <strong>Install app</strong> atau <strong>Add to Home Screen</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">3</span>
                    <span>Ketuk <strong>Install</strong> untuk mengonfirmasi</span>
                  </li>
                </ol>
              </div>
            )}

            {!isIOS && !isAndroid && (
              <p className="text-sm text-muted-foreground">
                Buka halaman ini di browser mobile (Chrome untuk Android atau Safari untuk iOS) untuk instruksi instalasi.
              </p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
