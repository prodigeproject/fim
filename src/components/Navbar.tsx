import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchDialog } from "@/components/SearchDialog";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import logoFim from "@/assets/logo-fim.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tentangOpen, setTentangOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setTentangOpen(false);
    setProgramOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const isActiveParent = (paths: string[]) => paths.some(p => location.pathname.startsWith(p));

  const navLinks = [
    { name: t("nav.home", "Beranda"), path: "/" },
    {
      name: t("nav.about", "Tentang"),
      path: "/tentang",
      children: [
        { name: t("nav.aboutFim", "Tentang FIM"), path: "/tentang" },
        { name: t("nav.regionalFim", "Regional FIM"), path: "/tentang/regional" },
        { name: t("nav.fimClub", "FIM Club"), path: "/tentang/fim-club" },
      ],
    },
    {
      name: t("nav.program", "Program"),
      path: "/program",
      children: [
        { name: t("nav.training", "Pelatihan FIM"), path: "/program/pelatihan" },
        { name: t("nav.flagship", "Program Unggulan"), path: "/program/program-unggulan" },
      ],
    },
    { name: t("nav.alumni", "Alumni"), path: "/cerita-alumni" },
    { name: t("nav.blog", "Blog"), path: "/blog" },
    { name: t("nav.faq", "FAQ"), path: "/faq" },
    { name: t("nav.volunteer", "Relawan"), path: "/gabung-relawan" },
  ];

  return (
    <motion.nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-2xl border-b border-border/60 shadow-lg shadow-black/5"
          : "bg-background/80 backdrop-blur-xl border-b border-border/40"
      }`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.img
              src={logoFim}
              alt="Forum Indonesia Muda"
              className="h-10 lg:h-12"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
            <motion.span
              className="font-bold text-lg text-foreground hidden sm:block"
              whileHover={{ color: "hsl(var(--primary))" }}
              transition={{ duration: 0.2 }}
            >
              Forum Indonesia Muda
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                className="relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.2 }}
              >
                {link.children ? (
                  <button
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      link.children.some((c) => isActive(c.path)) || (link.path === "/tentang" && isActiveParent(["/tentang"]))
                        ? "text-primary bg-primary/8"
                        : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.name}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                ) : (
                  <Link
                    to={link.path}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors relative ${
                      isActive(link.path)
                        ? "text-primary"
                        : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                    }`}
                  >
                    {link.name}
                    {isActive(link.path) && (
                      <motion.div
                        className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-primary rounded-full"
                        layoutId="activeNav"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                )}

                {/* Dropdown - Enhanced */}
                {link.children && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-card/98 backdrop-blur-2xl rounded-xl shadow-xl border border-border/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 overflow-hidden">
                    {/* Dropdown accent */}
                    <div className="h-0.5 bg-gradient-to-r from-primary via-accent to-primary/50" />
                    <div className="py-1.5">
                      {link.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                            isActive(child.path)
                              ? "text-primary bg-primary/8 font-medium"
                              : "text-foreground/80 hover:text-primary hover:bg-primary/5"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <motion.div
            className="hidden lg:flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SearchDialog />
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/portal">
              <Button variant="outline" size="sm" className="font-semibold border-border/60 hover:border-primary/40 hover:text-primary">
                {t("nav.register", "Daftar")}
              </Button>
            </Link>
            <Link to="/donasi">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-sm shadow-primary/20">
                {t("nav.donate", "Donasi")}
              </Button>
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <SearchDialog />
            <LanguageSwitcher />
            <ThemeToggle />
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isOpen ? "Tutup menu" : "Buka menu"}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="lg:hidden border-t border-border/50 overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="py-3">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.children ? (
                      <>
                        <button
                          onClick={() => {
                            if (link.path === "/tentang") setTentangOpen(!tentangOpen);
                            if (link.path === "/program") setProgramOpen(!programOpen);
                          }}
                          className="flex items-center justify-between w-full px-4 py-3 text-foreground font-medium hover:text-primary transition-colors"
                        >
                          {link.name}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              (link.path === "/tentang" && tentangOpen) || (link.path === "/program" && programOpen) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {((link.path === "/tentang" && tentangOpen) || (link.path === "/program" && programOpen)) && (
                            <motion.div
                              className="pl-4 bg-muted/40 border-l-2 border-primary/30 ml-4"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {link.children.map((child) => (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  onClick={() => setIsOpen(false)}
                                  className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                    isActive(child.path) ? "text-primary" : "text-muted-foreground hover:text-primary"
                                  }`}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3 font-medium transition-colors ${
                          isActive(link.path) ? "text-primary" : "text-foreground hover:text-primary"
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </motion.div>
                ))}
                <motion.div
                  className="px-4 pt-4 pb-2 space-y-2 border-t border-border/50 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link to="/portal" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full font-semibold">
                      {t("nav.register", "Daftar")}
                    </Button>
                  </Link>
                  <Link to="/donasi" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground font-semibold">
                      {t("nav.donate", "Donasi")}
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
