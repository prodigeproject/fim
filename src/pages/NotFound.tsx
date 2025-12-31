import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Home, BookOpen, Users, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoFim from "@/assets/logo-fim.png";

const NotFound = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?category=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickLinks = [
    { name: "Beranda", path: "/", icon: Home },
    { name: "Tentang FIM", path: "/tentang", icon: Users },
    { name: "Pelatihan", path: "/program/pelatihan", icon: BookOpen },
    { name: "Blog", path: "/blog", icon: MessageSquare },
    { name: "FAQ", path: "/faq", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full animate-float opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-2 h-2 bg-accent rounded-full animate-firefly-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 text-center">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <Link to="/">
            <img src={logoFim} alt="Forum Indonesia Muda" className="h-16 mx-auto" />
          </Link>
        </div>

        {/* Firefly Illustration */}
        <div className="relative mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <svg
            className="w-32 h-32 mx-auto"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Firefly body */}
            <ellipse cx="50" cy="55" rx="12" ry="18" className="fill-accent/80" />
            <ellipse cx="50" cy="35" rx="10" ry="10" className="fill-accent/90" />
            {/* Wings */}
            <ellipse cx="35" cy="50" rx="8" ry="15" className="fill-primary-foreground/30" transform="rotate(-20 35 50)" />
            <ellipse cx="65" cy="50" rx="8" ry="15" className="fill-primary-foreground/30" transform="rotate(20 65 50)" />
            {/* Eyes */}
            <circle cx="46" cy="33" r="2" className="fill-foreground" />
            <circle cx="54" cy="33" r="2" className="fill-foreground" />
            {/* Glow effect */}
            <circle cx="50" cy="70" r="10" className="fill-accent animate-firefly-glow" />
            <circle cx="50" cy="70" r="15" className="fill-accent/30 animate-firefly-glow" style={{ animationDelay: "0.5s" }} />
          </svg>
        </div>

        {/* 404 Text */}
        <h1
          className="text-8xl lg:text-9xl font-bold text-primary-foreground mb-4 tracking-wider animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          404
        </h1>

        {/* Message */}
        <h2
          className="text-2xl lg:text-3xl font-semibold text-primary-foreground mb-4 animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          Waduh, halaman tidak ditemukan!
        </h2>
        <p
          className="text-primary-foreground/80 max-w-md mx-auto mb-8 animate-fade-in"
          style={{ animationDelay: "0.4s" }}
        >
          Seperti kunang-kunang yang tersesat di malam gelap, halaman yang Anda cari tidak dapat ditemukan.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-md mx-auto mb-8 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari halaman yang Anda cari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 rounded-full bg-background/95 backdrop-blur-sm border-0 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </form>

        {/* Primary CTA */}
        <div
          className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <Button asChild size="lg" variant="secondary" className="rounded-full font-semibold">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="text-primary-foreground/70 text-sm mb-4 uppercase tracking-wide">
            Halaman Populer
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground text-sm font-medium transition-colors backdrop-blur-sm"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
