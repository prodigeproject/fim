import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check scroll position for visibility
    const toggleVisibility = () => {
      // Use both window.scrollY and documentElement.scrollTop for maximum compatibility
      const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      setIsVisible(scrollPos > 200); // Threshold to show button
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    // Immediate check
    toggleVisibility();
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-[9999]"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="
              rounded-full bg-primary text-primary-foreground shadow-2xl 
              hover:bg-primary/90 transition-all duration-300
              border-2 border-white/40 ring-4 ring-primary/20
              h-12 w-12 sm:h-14 sm:w-14 hover:scale-110 active:scale-95
            "
            aria-label="Scroll ke atas"
          >
            <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6 stroke-[3]" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
