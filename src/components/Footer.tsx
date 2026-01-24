import { useState, forwardRef } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import logoFim from "@/assets/logo-fim.png";

const Footer = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, ref) => {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Store in localStorage as placeholder (would connect to backend in production)
    const subscribers = JSON.parse(localStorage.getItem("fim-newsletter") || "[]");
    if (!subscribers.includes(email)) {
      subscribers.push(email);
      localStorage.setItem("fim-newsletter", JSON.stringify(subscribers));
    }
    
    toast({
      title: t("footer.subscribeSuccess"),
      description: t("footer.subscribeSuccessDesc"),
    });
    setEmail("");
  };

  const quickLinks = [
    { name: t("nav.about"), path: "/tentang" },
    { name: t("nav.regional"), path: "/tentang/regional" },
    { name: t("nav.fimClub"), path: "/tentang/fim-club" },
    { name: t("nav.training"), path: "/program/pelatihan" },
    { name: t("nav.volunteer"), path: "/gabung-relawan" },
    { name: t("nav.alumni"), path: "/cerita-alumni" },
    { name: t("nav.faq"), path: "/faq" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/fimnews", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/forumindonesiamuda", label: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com/company/forum-indonesia-muda", label: "LinkedIn" },
    { icon: Youtube, href: "https://www.youtube.com/ForumIndonesiaMuda", label: "YouTube" },
  ];

  return (
    <footer ref={ref} className="bg-foreground text-background" {...props}>
      {/* Newsletter Section */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold mb-2">{t("footer.newsletter")}</h3>
            <p className="text-background/70 text-sm mb-4">
              {t("footer.newsletterDesc")}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/10 border-background/20 text-background placeholder:text-background/50"
                required
              />
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="h-4 w-4 mr-2" />
                {t("footer.subscribe")}
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
              {t("footer.description")}
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
            <h3 className="font-semibold text-lg mb-4">{t("footer.navigation")}</h3>
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
            <h3 className="font-semibold text-lg mb-4">{t("footer.contact")}</h3>
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
                {t("footer.supportFim")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>{t("footer.copyright").replace("{year}", String(new Date().getFullYear()))}</p>
            <p className="flex items-center gap-1">
              {t("footer.madeWith")} <span className="text-primary">❤</span> {t("footer.forIndonesia")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
