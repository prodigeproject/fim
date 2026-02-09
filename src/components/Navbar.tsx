import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchDialog } from "@/components/SearchDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logoFim from "@/assets/logo-fim.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tentangOpen, setTentangOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const isActiveParent = (paths: string[]) => paths.some(p => location.pathname.startsWith(p));

  const navLinks = [
    { name: "Beranda", path: "/" },
    {
      name: "Tentang",
      path: "/tentang",
      children: [
        { name: "Tentang FIM", path: "/tentang" },
        { name: "Regional FIM", path: "/tentang/regional" },
        { name: "FIM Club", path: "/tentang/fim-club" },
      ],
    },
    {
      name: "Program",
      path: "/program",
      children: [
        { name: "Pelatihan FIM", path: "/program/pelatihan" },
        { name: "Program Unggulan", path: "/program/program-unggulan" },
      ],
    },
    { name: "Alumni", path: "/cerita-alumni" },
    { name: "Blog", path: "/blog" },
    { name: "FAQ", path: "/faq" },
    { name: "Relawan", path: "/gabung-relawan" },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoFim}
              alt="Forum Indonesia Muda"
              className="h-10 lg:h-12 transition-transform group-hover:scale-105"
            />
            <span className="font-bold text-lg text-foreground hidden sm:block">
              Forum Indonesia Muda
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.children ? (
                  <button
                    className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      link.children.some((c) => isActive(c.path)) || (link.path === "/tentang" && isActiveParent(["/tentang"]))
                        ? "text-primary bg-primary/5"
                        : "text-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.name}
                    <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
                  </button>
                ) : (
                  <Link
                    to={link.path}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.path)
                        ? "text-primary bg-primary/5"
                        : "text-foreground hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.name}
                  </Link>
                )}

                {/* Dropdown */}
                {link.children && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-card rounded-lg shadow-xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive(child.path)
                              ? "text-primary bg-primary/5"
                              : "text-foreground hover:text-primary hover:bg-primary/5"
                          }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            <SearchDialog />
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/portal">
              <Button variant="outline" className="font-semibold">
                Daftar
              </Button>
            </Link>
            <Link to="/donasi">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                Donasi
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <SearchDialog />
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            {navLinks.map((link) => (
              <div key={link.name}>
                {link.children ? (
                  <>
                    <button
                      onClick={() => {
                        if (link.name === "Tentang") setTentangOpen(!tentangOpen);
                        if (link.name === "Program") setProgramOpen(!programOpen);
                      }}
                      className="flex items-center justify-between w-full px-4 py-3 text-foreground font-medium"
                    >
                      {link.name}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          (link.name === "Tentang" && tentangOpen) || (link.name === "Program" && programOpen) ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {((link.name === "Tentang" && tentangOpen) || (link.name === "Program" && programOpen)) && (
                      <div className="pl-4 bg-muted/50">
                        {link.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setIsOpen(false)}
                            className={`block px-4 py-2 text-sm ${
                              isActive(child.path)
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 font-medium ${
                      isActive(link.path) ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
            <div className="px-4 pt-4 space-y-2">
              <Link to="/portal" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Daftar
                </Button>
              </Link>
              <Link to="/donasi" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground">
                  Donasi
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
