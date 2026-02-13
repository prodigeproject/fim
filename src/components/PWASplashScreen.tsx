import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsStandalone } from "@/hooks/usePWA";
import logoFim from "@/assets/logo-fim.png";

export function PWASplashScreen() {
  const isStandalone = useIsStandalone();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show splash in standalone mode on first load
    if (isStandalone && !sessionStorage.getItem("pwa_splash_shown")) {
      setShow(true);
      sessionStorage.setItem("pwa_splash_shown", "1");
    }
  }, [isStandalone]);

  // Auto-dismiss when app is ready (after initial render + small buffer)
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary"
        >
          <motion.img
            src={logoFim}
            alt="FIM"
            className="h-24 w-24 mb-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary-foreground font-semibold text-lg"
          >
            Forum Indonesia Muda
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
