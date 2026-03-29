import { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  waveColor?: string;
}

const PageHero = ({ title, subtitle, children, waveColor = "hsl(var(--background))" }: PageHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero-enhanced py-14 sm:py-20 lg:py-28">
      {/* Bottom wave — same as homepage, color matches next section */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill={waveColor} opacity="1"/>
        </svg>
        {/* 2px strip to cover sub-pixel SVG anti-aliasing gap during SPA transitions */}
        <div style={{ height: "2px", backgroundColor: waveColor, marginTop: "-1px" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center">
        <motion.h1
          className="text-2xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-base sm:text-lg lg:text-xl text-white/85 max-w-2xl mx-auto px-2 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
