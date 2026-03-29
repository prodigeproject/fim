import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MobileStickyCTA() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  // Only show on public pages, not portal/admin
  const isPublicPage = !location.pathname.startsWith("/portal") && !location.pathname.startsWith("/admin");

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 400);
  });

  // Disabled as per user request to remove bottom register action on mobile
  return null;

  if (!isPublicPage) return null;


  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden safe-area-bottom"
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-background/95 backdrop-blur-lg border-t border-border px-4 py-3">
        <Link to="/portal" className="block">
          <Button className="w-full bg-primary text-primary-foreground font-semibold gap-2">
            {t("nav.register", "Daftar Sekarang")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
