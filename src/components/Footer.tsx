import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import logoFim from "@/assets/logo-fim.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      toast({
        title: "Email tidak valid",
        description: "Masukkan alamat email yang benar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: normalizedEmail },
      });

      if (error) throw error;

      toast({
        title: "Berhasil berlangganan!",
        description: data?.message || "Terima kasih telah berlangganan newsletter FIM.",
      });
      setEmail("");
    } catch (err: any) {
      console.error("Footer newsletter subscribe error:", err);
      toast({
        title: "Gagal berlangganan",
        description: err?.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLinks = [
    { name: t("nav.aboutFim", "Tentang FIM"), path: "/tentang" },
    { name: t("nav.regionalFim", "Regional FIM"), path: "/tentang/regional" },
    { name: t("nav.fimClub", "FIM Club"), path: "/tentang/fim-club" },
    { name: t("nav.training", "Pelatihan FIM"), path: "/program/pelatihan" },
    { name: t("nav.volunteer", "Relawan"), path: "/gabung-relawan" },
    { name: t("nav.alumni", "Alumni"), path: "/cerita-alumni" },
    { name: t("nav.faq", "FAQ"), path: "/faq" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/fimnews", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/forumindonesiamuda", label: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com/company/forum-indonesia-muda", label: "LinkedIn" },
    { icon: Youtube, href: "https://www.youtube.com/ForumIndonesiaMuda", label: "YouTube" },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-2">{t("footer.getUpdates", "Dapatkan Update Terbaru")}</h3>
            <p className="text-background/70 text-sm mb-4">
              {t("footer.getUpdatesDesc", "Berlangganan newsletter untuk info kegiatan, pendaftaran, dan berita terbaru dari FIM.")}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("home.newsletter.placeholder", "Masukkan email Anda")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="bg-accent text-accent-foreground hover:bg-accent/90 min-w-[120px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isLoading ? t("footer.processing", "Memproses...") : t("footer.subscribe", "Langganan")}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={logoFim} alt="FIM" className="h-12" />
              <span className="font-bold text-xl">Forum Indonesia Muda</span>
            </Link>
            <p className="text-background/70 mb-6 max-w-md">
              Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi cahaya kunang-kunang yang menerangi masa depan bangsa. Berdiri sejak 2003.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.navigation", "Navigasi")}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.contactUs", "Hubungi Kami")}</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:halo@forumindonesiamuda.org"
                  className="flex items-center gap-2 text-background/70 hover:text-accent transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  halo@forumindonesiamuda.org
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/6285213580323"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 hover:text-accent transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +62 852-1358-0323 (WA)
                </a>
              </li>
            </ul>
            
            {/* CTA */}
            <div className="mt-6">
              <Link
                to="/donasi"
                className="inline-block bg-accent text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                {t("footer.supportFim", "Dukung FIM")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© {new Date().getFullYear()} Forum Indonesia Muda. {t("footer.allRightsReserved", "Hak cipta dilindungi.")}</p>
            <p className="flex items-center gap-1">
              {t("footer.madeWith", "Dibuat dengan")} <span className="text-primary">❤</span> {t("footer.forIndonesia", "untuk Indonesia")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
