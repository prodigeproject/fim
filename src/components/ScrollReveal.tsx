import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

type RevealType = "fade-up" | "fade-left" | "fade-right" | "scale" | "blur" | "slide-up";

interface ScrollRevealProps {
  children: ReactNode;
  type?: RevealType;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const variants: Record<RevealType, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  blur: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 60, rotateX: 10 },
    visible: { opacity: 1, y: 0, rotateX: 0 },
  },
};

export function ScrollReveal({
  children,
  type = "fade-up",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[type]}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Text reveal word by word
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function TextReveal({ text, className, delay = 0, as: Tag = "p" }: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.4,
            delay: delay + i * 0.05,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

// Staggered children container
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
