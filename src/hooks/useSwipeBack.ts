import { useRef, useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsStandalone, haptic } from "./usePWA";

interface UseSwipeBackOptions {
  edgeThreshold?: number;   // px from left edge to start
  distanceThreshold?: number; // px swipe distance to trigger
  disabledPaths?: string[]; // root paths where back is disabled
}

export function useSwipeBack({
  edgeThreshold = 20,
  distanceThreshold = 100,
  disabledPaths = ["/portal", "/"],
}: UseSwipeBackOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = useIsStandalone();
  const startX = useRef(0);
  const startY = useRef(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const isEdgeSwipe = useRef(false);

  const isDisabled = disabledPaths.includes(location.pathname);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isStandalone || isDisabled) return;
      const touch = e.touches[0];
      if (touch.clientX < edgeThreshold) {
        startX.current = touch.clientX;
        startY.current = touch.clientY;
        isEdgeSwipe.current = true;
      }
    },
    [isStandalone, isDisabled, edgeThreshold]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isEdgeSwipe.current) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = Math.abs(e.touches[0].clientY - startY.current);
      // If vertical movement is greater, cancel swipe
      if (dy > dx * 0.5 && dx < 30) {
        isEdgeSwipe.current = false;
        setIsSwiping(false);
        setSwipeProgress(0);
        return;
      }
      if (dx > 10) {
        setIsSwiping(true);
        setSwipeProgress(Math.min(dx / distanceThreshold, 1));
      }
    },
    [distanceThreshold]
  );

  const onTouchEnd = useCallback(() => {
    if (!isEdgeSwipe.current) return;
    if (swipeProgress >= 1) {
      haptic();
      navigate(-1);
    }
    setIsSwiping(false);
    setSwipeProgress(0);
    isEdgeSwipe.current = false;
  }, [swipeProgress, navigate]);

  return {
    swipeHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    isSwiping,
    swipeProgress,
  };
}
