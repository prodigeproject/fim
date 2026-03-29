import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";

interface FloatingShapesProps {
  variant?: "hero" | "section" | "minimal";
  className?: string;
}

export function FloatingShapes({ variant = "hero", className = "" }: FloatingShapesProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return null;

  if (variant === "minimal") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <motion.div
          className="absolute top-10 right-10 w-24 h-24 rounded-full bg-accent/10 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
    );
  }

  if (variant === "section") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        {/* Blob 1 */}
        <motion.div
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-primary/15 to-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Blob 2 */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
      </div>
    );
  }

  // Full hero variant
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Large ambient orb - center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-accent/8 via-accent/4 to-transparent rounded-full blur-[80px]"
        animate={{ scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating geometric shape 1 - top right */}
      <motion.div
        className="absolute top-16 right-[10%] w-20 h-20 opacity-20"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 45, 0],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-full h-full border-2 border-accent/70 rotate-45" />
      </motion.div>

      {/* Floating geometric shape 2 - top left */}
      <motion.div
        className="absolute top-32 left-[8%] w-12 h-12 opacity-15"
        animate={{
          y: [0, -18, 0],
          rotate: [0, -30, 0],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-full h-full border-2 border-white/60 rounded-sm rotate-12" />
      </motion.div>

      {/* Floating circle 1 */}
      <motion.div
        className="absolute top-20 right-[30%] w-8 h-8 rounded-full bg-accent/30"
        animate={{
          y: [0, -30, 0],
          x: [0, 10, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Floating circle 2 */}
      <motion.div
        className="absolute bottom-24 left-[20%] w-5 h-5 rounded-full bg-white/20"
        animate={{
          y: [0, -20, 0],
          x: [0, -8, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* 3D floating hexagon - left side */}
      <motion.div
        className="absolute left-[5%] top-1/2 -translate-y-1/2 w-16 h-16 opacity-10"
        animate={{
          y: [0, -20, 0],
          rotateX: [0, 20, 0],
          rotateY: [0, 30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
      </motion.div>

      {/* Glowing orb - top right */}
      <motion.div
        className="absolute top-8 right-[15%] w-32 h-32 bg-accent/15 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glowing orb - bottom left */}
      <motion.div
        className="absolute bottom-16 left-[15%] w-40 h-40 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Tiny stars/dots */}
      {[
        { top: "15%", left: "25%", delay: 0 },
        { top: "35%", right: "20%", delay: 0.8 },
        { top: "65%", left: "45%", delay: 1.6 },
        { top: "80%", right: "35%", delay: 2.4 },
        { top: "25%", left: "60%", delay: 3.2 },
      ].map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-white"
          style={pos as CSSProperties}
          animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, delay: pos.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Diagonal lines - decorative */}
      <motion.div
        className="absolute bottom-10 right-[10%] opacity-10"
        animate={{ opacity: [0.1, 0.2, 0.1], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <line x1="0" y1="80" x2="80" y2="0" stroke="white" strokeWidth="1.5"/>
          <line x1="20" y1="80" x2="80" y2="20" stroke="white" strokeWidth="1"/>
          <line x1="40" y1="80" x2="80" y2="40" stroke="white" strokeWidth="0.5"/>
        </svg>
      </motion.div>
    </div>
  );
}

export default FloatingShapes;
