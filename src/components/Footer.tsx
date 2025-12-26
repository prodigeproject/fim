import { Link } from "react-router-dom";
import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone } from "lucide-react";
import logoFim from "@/assets/logo-fim.png";

const Footer = () => {
  const quickLinks = [
    { name: "Tentang Kami", path: "/tentang" },
    { name: "Regional FIM", path: "/tentang/regional" },
    { name: "FIM Club", path: "/tentang/fim-club" },
    { name: "Program Pelatihan", path: "/program/pelatihan" },
    { name: "Gabung Relawan", path: "/gabung-relawan" },
    { name: "Cerita Alumni", path: "/cerita-alumni" },
    { name: "FAQ", path: "/faq" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/fimnews", label: "Instagram" },
    { icon: Facebook, href: "https://facebook.com/forumindonesiamuda", label: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com/company/forum-indonesia-muda", label: "LinkedIn" },
    { icon: Youtube, href: "https://www.youtube.com/ForumIndonesiaMuda", label: "YouTube" },
  ];

  return (
    <footer className="bg-foreground text-background">
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
              Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi 
              cahaya kunang-kunang yang menerangi masa depan bangsa. Berdiri sejak 2003.
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
            <h3 className="font-semibold text-lg mb-4">Navigasi</h3>
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
            <h3 className="font-semibold text-lg mb-4">Hubungi Kami</h3>
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
                Dukung FIM
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-background/60">
            <p>© {new Date().getFullYear()} Forum Indonesia Muda. Hak cipta dilindungi.</p>
            <p className="flex items-center gap-1">
              Dibuat dengan <span className="text-primary">❤</span> untuk Indonesia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
