import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MapPin, Award, Quote, ChevronLeft, ChevronRight, Building2, Briefcase, GraduationCap, MessageSquare, Sparkles, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useAnimation } from "framer-motion";
import { useRef, useCallback, useEffect, useState } from "react";
import logoFim from "@/assets/logo-fim.png";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeaturedVideoSection from "@/components/FeaturedVideoSection";
import FIMJourneyTimeline from "@/components/FIMJourneyTimeline";
import { ScrollReveal, TextReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";
import { useCountUp } from "@/hooks/useCountUp";
import { useLanguage } from "@/contexts/LanguageContext";
import { FloatingShapes } from "@/components/FloatingShapes";
// Import partner logos
import logo1 from "@/assets/partners/logo-1.png";
import logo2 from "@/assets/partners/logo-2.png";
import logo3 from "@/assets/partners/logo-3.png";
import logo4 from "@/assets/partners/logo-4.png";
import logo5 from "@/assets/partners/logo-5.png";
import logo6 from "@/assets/partners/logo-6.jpg";
import logo7 from "@/assets/partners/logo-7.png";
import logo8 from "@/assets/partners/logo-8.png";
import logo9 from "@/assets/partners/logo-9.png";
import logo10 from "@/assets/partners/logo-10.png";
import logo11 from "@/assets/partners/logo-11.png";
import logo12 from "@/assets/partners/logo-12.png";
import logo13 from "@/assets/partners/logo-13.jpg";
import logo14 from "@/assets/partners/logo-14.jpg";
import logo15 from "@/assets/partners/logo-15.png";
import logo16 from "@/assets/partners/logo-16.png";
import logo17 from "@/assets/partners/logo-17.png";
import logo18 from "@/assets/partners/logo-18.jpg";
import logo19 from "@/assets/partners/logo-19.jpg";
import logo20 from "@/assets/partners/logo-20.jpg";
import logo21 from "@/assets/partners/logo-21.jpg";
import logo22 from "@/assets/partners/logo-22.png";
import logo23 from "@/assets/partners/logo-23.jpg";
import logo24 from "@/assets/partners/logo-24.jpg";
import logo25 from "@/assets/partners/logo-25.jpg";
import logo26 from "@/assets/partners/logo-26.png";
import logo27 from "@/assets/partners/logo-27.png";
import logo28 from "@/assets/partners/logo-28.png";
import logo29 from "@/assets/partners/logo-29.png";

const heroTitle = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const heroSubtitle = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3, ease: "easeOut" as const } },
};

const heroCTA = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" as const } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const Index = () => {
  const { data: regionalCount } = useQuery({
    queryKey: ["regional-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("fim_regionals")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      if (error) throw error;
      return count || 61;
    },
  });

  const { t } = useLanguage();

  const { data: featuredArticles } = useQuery({
    queryKey: ["homepage-pinned-articles"],
    queryFn: async () => {
      const { data: pinned, error: pinnedError } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, published_at, category, is_pinned")
        .eq("status", "published")
        .eq("is_pinned", true)
        .order("pinned_at", { ascending: false })
        .limit(3);
      if (pinnedError) throw pinnedError;
      if (pinned && pinned.length >= 3) return pinned.slice(0, 3);
      const needed = 3 - (pinned?.length || 0);
      const pinnedIds = pinned?.map(a => a.id) || [];
      const { data: latest, error: latestError } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, published_at, category, is_pinned")
        .eq("status", "published")
        .not("id", "in", `(${pinnedIds.length ? pinnedIds.join(",") : "00000000-0000-0000-0000-000000000000"})`)
        .order("published_at", { ascending: false })
        .limit(needed);
      if (latestError) throw latestError;
      return [...(pinned || []), ...(latest || [])].slice(0, 3);
    },
  });

  const { data: partners } = useQuery({
    queryKey: ["homepage-partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_logos")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    { icon: Calendar, value: 2003, prefix: "", suffix: "", label: t("home.stats.foundedSince", "Berdiri Sejak") },
    { icon: Users, value: 34, prefix: "> ", suffix: "", label: t("home.stats.batches", "Angkatan") },
    { icon: MapPin, value: regionalCount || 61, prefix: "", suffix: "", label: t("home.stats.regional", "Regional") },
    { icon: Award, value: 4000, prefix: "", suffix: "+", label: t("home.stats.alumni", "Alumni") },
  ];

  const alumniTestimonials = [
    {
      name: "Ahmad Rizky", batch: "Angkatan 28", position: "Policy Analyst",
      company: "Kementerian Keuangan RI", icon: Building2,
      quote: "FIM mengajarkan saya tentang kepemimpinan yang berintegritas. Pengalaman di FIM menjadi bekal berharga dalam karir saya di pemerintahan."
    },
    {
      name: "Siti Nurhaliza", batch: "Angkatan 30", position: "Co-Founder",
      company: "EduTech Startup", icon: Briefcase,
      quote: "Jaringan alumni FIM sangat kuat. Banyak kolaborasi bisnis dan proyek sosial yang lahir dari pertemanan di FIM."
    },
    {
      name: "Budi Santoso", batch: "Angkatan 25", position: "Program Director",
      company: "NGO Pendidikan Nasional", icon: GraduationCap,
      quote: "Nilai-nilai FIM tentang pelayanan dan kebersahajaan membentuk cara saya memimpin organisasi hingga hari ini."
    },
  ];

  const programUnggulan = [
    { title: t("home.programs.leadership", "Pelatihan Kepemimpinan"), description: t("home.programs.leadershipDesc", "Program kaderisasi intensif untuk membentuk karakter dan jiwa kepemimpinan pemuda Indonesia."), icon: GraduationCap, link: "/program/pelatihan" },
    { title: t("home.programs.mentoring", "Mentoring Alumni"), description: t("home.programs.mentoringDesc", "Bimbingan langsung dari alumni FIM yang sukses di berbagai bidang karir dan profesi."), icon: Users, link: "/program/program-unggulan" },
    { title: t("home.programs.discussion", "Diskusi Publik"), description: t("home.programs.discussionDesc", "Forum diskusi untuk membahas isu-isu strategis dan solusi bagi permasalahan bangsa."), icon: MessageSquare, link: "/program/program-unggulan" },
  ];

  const partnerLogos = [
    logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9, logo10,
    logo11, logo12, logo13, logo14, logo15, logo16, logo17, logo18, logo19, logo20,
    logo21, logo22, logo23, logo24, logo25, logo26, logo27, logo28, logo29
  ];

  const bannerImages = [
    { src: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&h=400&fit=crop", alt: "Kegiatan Pelatihan FIM" },
    { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&h=400&fit=crop", alt: "Kaderisasi Nasional" },
    { src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=400&fit=crop", alt: "Alumni FIM" },
    { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop", alt: "Workshop Kepemimpinan" },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const dotControls = useAnimation();

  const handleScrollIndicatorClick = async () => {
    // Animate dot surge to bottom
    await dotControls.start({
      y: [0, 20],
      opacity: [1, 0],
      transition: { duration: 0.4, ease: "easeIn" }
    });
    
    // Trigger scroll
    document.getElementById('featured-video')?.scrollIntoView({ behavior: 'smooth' });
    
    // Reset dot position
    dotControls.set({ y: 0, opacity: 1 });
  };

  return (
    <Layout>
      <SEO
        title="Forum Indonesia Muda - Membangun Pemimpin Masa Depan Indonesia"
        description="Forum Indonesia Muda adalah komunitas pemuda yang berkomitmen untuk berkontribusi pada pembangunan bangsa melalui kepemimpinan, inovasi, dan aksi nyata."
      />
      {/* Hero Section - Enhanced 3D with Parallax */}
      <section ref={heroRef} className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background gradient layers */}
        <motion.div
          className="absolute inset-0 bg-gradient-hero-enhanced"
          style={{ y: heroY }}
        />
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          }}
        />

        {/* 3D Floating Shapes */}
        <FloatingShapes variant="hero" />

        {/* Radial glow - center */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(255,215,0,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="hsl(var(--background))" opacity="1"/>
          </svg>
          {/* 2px strip to cover sub-pixel SVG anti-aliasing gap during SPA transitions */}
          <div style={{ height: "2px", backgroundColor: "hsl(var(--background))", marginTop: "-1px" }} />
        </div>

        <motion.div
          className="relative z-10 container mx-auto px-4 sm:px-6 pt-16 pb-32 sm:pt-20 sm:pb-36 lg:py-36"
          style={{ opacity: heroOpacity }}
        >
          <div className="flex flex-col items-center text-center">
            {/* Logo with glow */}
            <motion.div
              variants={heroTitle}
              initial="hidden"
              animate="visible"
              className="relative mb-6 sm:mb-8"
            >
              <motion.div
                className="absolute inset-0 blur-2xl bg-white/20 rounded-full scale-150"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <img
                src={logoFim}
                alt="Forum Indonesia Muda"
                className="h-16 sm:h-24 lg:h-32 relative z-10 brightness-0 invert drop-shadow-2xl"
              />
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5 sm:mb-6 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs sm:text-sm text-accent font-semibold">
                {t("home.hero.trusted", "Dipercaya lebih dari 4000+ alumni di 60+ regional Indonesia")}
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={heroTitle}
              initial="hidden"
              animate="visible"
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-3 sm:mb-5 leading-[1.1] tracking-tight"
            >
              {t("home.hero.title", "Forum Indonesia Muda")}
              <br />
              <motion.span
                className="text-accent inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                style={{ textShadow: "0 0 40px rgba(255,215,0,0.4)" }}
              >
                Membangun Pemimpin Masa Depan
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={heroSubtitle}
              initial="hidden"
              animate="visible"
              className="text-base sm:text-lg lg:text-xl text-white/85 max-w-2xl mb-6 sm:mb-8 px-2 leading-relaxed"
            >
              {t("home.hero.subtitle", "Komunitas anak muda Indonesia yang berkomitmen untuk berkontribusi pada pembangunan bangsa melalui kepemimpinan, inovasi, dan aksi nyata.")}
            </motion.p>

            {/* Announcement badge */}
            <motion.div
              variants={heroCTA}
              initial="hidden"
              animate="visible"
              className="mb-6 sm:mb-8"
            >
              <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/40 rounded-full px-4 py-2 backdrop-blur-sm">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🔥
                </motion.span>
                <p className="text-xs sm:text-sm text-accent font-semibold">
                  {t("home.hero.announcement", "Pendaftaran Angkatan Baru Segera Dibuka!")}
                </p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={heroCTA}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/tentang">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:-translate-y-0.5"
                >
                  {t("home.hero.learnMore", "Pelajari Lebih Lanjut")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/portal">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold px-8"
                >
                  Daftar Sekarang
                </Button>
              </Link>
            </motion.div>

          </div>
        </motion.div>

        {/* Scroll indicator - clickable to scroll to featured video */}
        <motion.div
          className="absolute bottom-6 md:bottom-10 inset-x-0 mx-auto w-fit cursor-pointer z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.div
            className="flex flex-col items-center group"
            onClick={handleScrollIndicatorClick}
            role="button"
            aria-label="Scroll ke video inspiratif"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              className="w-8 h-12 border-2 border-white/30 rounded-full flex flex-col items-center pt-2 glass-dark"
              animate={{ borderColor: ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.5)", "rgba(255,255,255,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                animate={{ 
                  y: [0, 8, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronDown className="h-5 w-5 text-accent" />
              </motion.div>
            </motion.div>
            <motion.span 
              className="mt-2 text-[10px] font-bold text-white/50 tracking-widest uppercase group-hover:text-accent transition-colors"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Scroll
            </motion.span>
          </motion.div>
        </motion.div>
      </section>

      <FeaturedVideoSection />

      {/* Banner Carousel */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {bannerImages.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0">
                    <img src={image.src} alt={image.alt} className="w-full h-48 md:h-64 lg:h-80 object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg" aria-label="Slide sebelumnya">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg" aria-label="Slide selanjutnya">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="flex justify-center gap-3 mt-4">
              {bannerImages.map((_, index) => (
                <button key={index} className="relative w-6 h-6 flex items-center justify-center" onClick={() => emblaApi?.scrollTo(index)} aria-label={`Go to slide ${index + 1}`}>
                  <span className={`w-2.5 h-2.5 rounded-full transition-colors ${index === selectedIndex ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced 3D */}
      <section className="py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-secondary/50 to-background" />
        <FloatingShapes variant="section" />
        <div className="relative container mx-auto px-4 sm:px-6">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {stats.map((stat, index) => (
              <HomeStatItem key={stat.label} stat={stat} index={index} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Kunang-kunang Quote */}
      <section className="py-10 sm:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <ScrollReveal type="scale">
              <Quote className="h-12 w-12 text-accent mx-auto mb-4" />
            </ScrollReveal>
            <TextReveal
              as="p"
              text={`"${t("home.quote", "Seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, kami percaya setiap pemuda memiliki cahaya untuk menerangi Indonesia.")}"`}
              className="text-lg sm:text-xl lg:text-2xl text-foreground italic mb-4 px-2"
              delay={0.2}
            />
            <ScrollReveal type="fade-up" delay={0.6}>
              <div className="w-16 h-1 bg-accent mx-auto" />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FIM Journey Timeline */}
      <FIMJourneyTimeline />

      {/* Alumni Testimonials */}
      <section className="py-12 sm:py-20 bg-background" aria-labelledby="alumni-section-heading">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal type="fade-up">
            <h2 id="alumni-section-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground mb-3 sm:mb-4">{t("home.alumniSection.title", "Jejak Alumni FIM")}</h2>
          </ScrollReveal>
          <ScrollReveal type="fade-up" delay={0.1}>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              {t("home.alumniSection.subtitle", "Ribuan alumni telah berkontribusi di berbagai sektor strategis Indonesia")}
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 max-w-5xl mx-auto" staggerDelay={0.15}>
            {alumniTestimonials.map((testimonial) => (
              <StaggerItem key={testimonial.name}>
                <motion.div
                  className="bg-card rounded-xl p-6 shadow-[var(--shadow-sm)] border border-border/40 relative group cursor-default h-full"
                  whileHover={{ y: -6, boxShadow: "var(--shadow-xl)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Quote className="h-8 w-8 text-accent/30 absolute top-4 right-4 group-hover:text-accent/60 transition-colors" />
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <testimonial.icon className="h-6 w-6 text-primary" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-foreground">{testimonial.name}</h3>
                      <p className="text-xs text-muted-foreground">{testimonial.batch}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-foreground">{testimonial.position}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <div className="text-center mt-8">
            <Link to="/cerita-alumni"><Button variant="outline">Lihat Semua Alumni <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Program Unggulan */}
      <section className="py-12 sm:py-20 bg-secondary/50" aria-labelledby="program-section-heading">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollReveal type="fade-up">
            <h2 id="program-section-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-foreground mb-3 sm:mb-4">{t("home.programs.title", "Program Unggulan")}</h2>
          </ScrollReveal>
          <ScrollReveal type="fade-up" delay={0.1}>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">{t("home.programs.subtitle", "Berbagai program untuk mengembangkan potensi pemuda Indonesia")}</p>
          </ScrollReveal>
          <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto" staggerDelay={0.12}>
            {programUnggulan.map((program) => (
              <StaggerItem key={program.title}>
                <Link to={program.link} className="group block h-full">
                  <motion.article
                    className="bg-card rounded-xl p-6 shadow-[var(--shadow-sm)] h-full border border-border/40 group-hover:border-primary/20 transition-colors"
                    whileHover={{ y: -6, boxShadow: "var(--shadow-xl)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <motion.div
                      className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
                      whileHover={{ rotate: -5, scale: 1.1 }}
                    >
                      <program.icon className="h-7 w-7 text-primary" />
                    </motion.div>
                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{program.title}</h3>
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                    <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Selengkapnya <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </motion.article>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <div className="text-center mt-8">
            <Link to="/program/program-unggulan"><Button variant="outline">{t("home.programs.viewAll", "Lihat Semua Program")} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Kabar FIM */}
      <section className="py-20 bg-background" aria-labelledby="news-section-heading">
        <div className="container mx-auto px-4">
          <motion.h2 id="news-section-heading" className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>{t("home.news.title", "Kabar FIM")}</motion.h2>
          <motion.p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>{t("home.news.subtitle", "Berita dan kegiatan terbaru dari Forum Indonesia Muda")}</motion.p>
          <motion.div 
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {featuredArticles?.length ? featuredArticles.map((article) => (
              <motion.div key={article.id} variants={fadeUp}>
                <Link to={`/blog/${article.slug}`} className="group">
                  <div className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-sm)] border border-border/40 hover:shadow-[var(--shadow-lg)] transition-all duration-300 hover:-translate-y-1 relative">
                    {article.is_pinned && (
                      <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium z-10">{t("home.news.featured", "Unggulan")}</div>
                    )}
                    <img src={article.featured_image_url || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=250&fit=crop"} alt={article.title} className="w-full h-40 object-cover" loading="lazy" />
                    <div className="p-5">
                      <span className="text-xs text-muted-foreground">
                        {article.published_at ? new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </span>
                      <h3 className="font-bold text-foreground mb-2 mt-1 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt || ""}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )) : (
              [1, 2, 3].map((_, index) => (
                <div key={index} className="bg-card rounded-xl overflow-hidden shadow-lg">
                  <div className="w-full h-40 bg-muted" />
                  <div className="p-5">
                    <div className="h-3 w-20 bg-muted rounded mb-2" />
                    <div className="h-5 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              ))
            )}
          </motion.div>
          <div className="text-center mt-8">
            <Link to="/blog"><Button variant="outline">{t("home.news.viewAll", "Lihat Semua Berita")} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Mitra & Kolaborator - 3D hover effect */}
      <section className="py-12 bg-background overflow-hidden" aria-labelledby="partners-section-heading">
        <div className="container mx-auto px-4">
          <motion.h2 id="partners-section-heading" className="text-2xl lg:text-3xl font-bold text-center text-foreground mb-2" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>{t("home.partners.title", "Mitra & Kolaborator")}</motion.h2>
          <motion.p className="text-muted-foreground text-center text-sm mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>{t("home.partners.subtitle", "Bersama membangun Indonesia yang lebih baik")}</motion.p>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex animate-scroll-x hover:pause-animation">
            {partners?.length ? (
              <>
                {[...partners, ...partners, ...partners].map((partner, index) => {
                  const hasUrl = partner.website_url && partner.website_url !== "#";
                  const Wrapper = hasUrl ? "a" : "span";
                  const wrapperProps = hasUrl ? { href: partner.website_url!, target: "_blank" as const, rel: "noopener noreferrer" } : {};
                  return (
                    <Wrapper key={`${partner.id}-${index}`} {...wrapperProps} className="flex-shrink-0 mx-4 md:mx-6 group cursor-pointer" title={partner.name}>
                      <motion.div 
                        className="h-14 w-28 md:h-16 md:w-32 bg-card rounded-lg shadow-sm flex items-center justify-center p-3"
                        style={{ perspective: 800 }}
                        whileHover={{ scale: 1.25, y: -10, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <img src={partner.logo_url} alt={partner.name} loading="lazy" className="max-h-full max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </motion.div>
                    </Wrapper>
                  );
                })}
              </>
            ) : (
              <>
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 mx-4 md:mx-6">
                    <div className="h-14 w-28 md:h-16 md:w-32 bg-card rounded-lg shadow-sm flex items-center justify-center p-3 animate-pulse">
                      <div className="h-8 w-20 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced with 3D depth */}
      <motion.section
        className="py-24 relative overflow-hidden"
        aria-labelledby="cta-section-heading"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-hero-enhanced" />
        <FloatingShapes variant="hero" />
        {/* Mesh gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,215,0,0.1) 0%, transparent 60%)",
          }}
        />
        {/* Top wave */}
        <div className="absolute top-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0,40 C240,0 480,80 720,40 C960,0 1200,80 1440,40 L1440,0 L0,0 Z" fill="hsl(var(--background))" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm"
          >
            <span className="text-accent text-sm font-semibold">🚀 Bergabunglah Bersama Kami</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            id="cta-section-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          >
            {t("home.cta.title", "Siap Bergabung dengan FIM?")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-white/80 max-w-xl mx-auto mb-10 text-lg"
          >
            {t("home.cta.subtitle", "Jadilah bagian dari komunitas pemuda Indonesia yang berpengaruh dan berkontribusi")}
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/portal">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 font-bold text-accent-foreground px-10 shadow-lg shadow-accent/30 hover:shadow-accent/50 hover:-translate-y-0.5 transition-all"
              >
                {t("home.cta.register", "Daftar Sekarang")} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/donasi">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm font-semibold px-10"
              >
                {t("home.cta.support", "Dukung FIM")}
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
};

function HomeStatItem({ stat, index }: { stat: { icon: React.ComponentType<{ className?: string }>; value: number; prefix: string; suffix: string; label: string }; index: number }) {
  const { ref, formattedCount } = useCountUp({
    end: stat.value,
    duration: 2000,
    prefix: stat.prefix,
    suffix: stat.suffix,
  });

  return (
    <motion.div
      ref={ref}
      className="bg-card rounded-2xl p-6 text-center border border-border/50 relative overflow-hidden group cursor-default"
      variants={fadeUp}
      custom={index}
      whileHover={{
        y: -8,
        rotateX: 3,
        rotateY: -3,
        boxShadow: "0 30px 60px -10px rgba(230, 0, 18, 0.12), 0 0 0 1px rgba(230, 0, 18, 0.05)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d", perspective: "800px" }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
      />
      {/* Animated background glow */}
      <motion.div
        className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="relative z-10">
        <motion.div
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10"
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <stat.icon className="h-7 w-7 text-primary" />
        </motion.div>
        <div className="text-3xl lg:text-4xl font-bold mb-1 tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          {formattedCount}
        </div>
        <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
      </div>
    </motion.div>
  );
}

export default Index;
