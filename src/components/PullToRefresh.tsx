import { useState, useRef, useCallback, ReactNode } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { RefreshCw, Loader2 } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className = "",
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useMotionValue(0);
  
  const pullProgress = useTransform(currentY, [0, threshold], [0, 1]);
  const rotation = useTransform(currentY, [0, threshold], [0, 360]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (container && container.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      // Apply resistance
      const resistance = 0.5;
      const pullDistance = Math.min(deltaY * resistance, threshold * 1.5);
      currentY.set(pullDistance);
    }
  }, [isPulling, disabled, isRefreshing, threshold, currentY]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled || isRefreshing) return;
    
    const pullDistance = currentY.get();
    setIsPulling(false);
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    currentY.set(0);
  }, [isPulling, disabled, isRefreshing, threshold, currentY, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: isRefreshing ? 60 : Math.min(currentY.get(), threshold) 
            }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center bg-muted/50"
          >
            {isRefreshing ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <motion.div style={{ rotate: rotation }}>
                <RefreshCw className="h-6 w-6 text-muted-foreground" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {children}
    </div>
  );
}
