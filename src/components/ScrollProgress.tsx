import { useState, useEffect, useRef, useCallback } from "react";

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const rafRef = useRef<number | null>(null);

  const updateProgress = useCallback(() => {
    // Cancel any pending RAF to avoid stacking
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(scrollPercent);
    });
  }, []);

  useEffect(() => {
    // Defer mounting to avoid forced reflow during initial render
    const timeoutId = setTimeout(() => {
      setIsReady(true);
      updateProgress();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [updateProgress]);

  useEffect(() => {
    if (!isReady) return;

    window.addEventListener("scroll", updateProgress, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isReady, updateProgress]);

  if (!isReady) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-border z-50 print:hidden">
      <div
        className="h-full bg-primary will-change-transform"
        style={{ 
          width: `${progress}%`,
          transition: 'width 150ms ease-out'
        }}
      />
    </div>
  );
};

export default ScrollProgress;
