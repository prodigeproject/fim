import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  
  // Motion values for follow behavior
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring configuration
  const springConfig = { damping: 30, stiffness: 200 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check scroll position for visibility
    const toggleVisibility = () => {
      // Use both window.scrollY and documentElement.scrollTop for maximum compatibility
      const scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
      setIsVisible(scrollPos > 200); // Lower threshold to make it easier to see
    };

    // Track mouse on desktop only
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMobile) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    // Initial position for desktop if mouse hasn't moved yet
    if (typeof window !== "undefined") {
      mouseX.set(window.innerWidth - 100);
      mouseY.set(window.innerHeight - 100);
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }
    
    // Immediate check
    toggleVisibility();
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile, mouseX, mouseY]);

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
          style={isMobile ? {
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
          } : {
            position: "fixed",
            left: 0,
            top: 0,
            x: springX,
            y: springY,
            zIndex: 9999,
            pointerEvents: "none",
            transform: "translate(-50%, -50%)", // Center on cursor
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className={`
              rounded-full bg-primary text-primary-foreground shadow-2xl 
              hover:bg-primary/90 pointer-events-auto transition-transform
              border-2 border-white/40 ring-4 ring-primary/20
              ${isMobile ? "h-14 w-14" : "h-12 w-12 hover:scale-110 active:scale-95"}
            `}
            aria-label="Scroll ke atas"
          >
            <ArrowUp className={`${isMobile ? "h-7 w-7" : "h-5 w-5"} stroke-[3]`} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
