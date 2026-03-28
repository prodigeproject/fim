import { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

const PageHero = ({ title, subtitle, children }: PageHeroProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-12 sm:py-16 lg:py-24">
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-primary-foreground mb-3 sm:mb-4 animate-fade-in leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mx-auto animate-fade-in px-2" style={{ animationDelay: "0.1s" }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  );
};

export default PageHero;
