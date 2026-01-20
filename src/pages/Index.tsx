import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MapPin, Award, Quote, ChevronLeft, ChevronRight, Building2, Briefcase, GraduationCap, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import logoFim from "@/assets/logo-fim.png";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import FeaturedVideoSection from "@/components/FeaturedVideoSection";
import { useTranslation } from "@/hooks/useTranslation";
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

const Index = () => {
  const { t } = useTranslation();
  
  // Fetch regional count from database
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

  // Fetch pinned articles for Kabar FIM (prioritize pinned, then latest)
  const { data: featuredArticles } = useQuery({
    queryKey: ["homepage-pinned-articles"],
    queryFn: async () => {
      // First try to get pinned articles
      const { data: pinned, error: pinnedError } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, featured_image_url, published_at, category, is_pinned")
        .eq("status", "published")
        .eq("is_pinned", true)
        .order("pinned_at", { ascending: false })
        .limit(3);
      
      if (pinnedError) throw pinnedError;
      
      // If we have 3 pinned articles, use them
      if (pinned && pinned.length >= 3) {
        return pinned.slice(0, 3);
      }
      
      // Otherwise, fill with latest articles
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

  // Fetch partner logos from database
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
    { icon: Calendar, value: "2003", label: "Berdiri Sejak" },
    { icon: Users, value: "> 34", label: "Angkatan" },
    { icon: MapPin, value: regionalCount?.toString() || "61", label: "Regional" },
    { icon: Award, value: "4000+", label: "Alumni" },
  ];

  // Alumni testimonials with concrete data
  const alumniTestimonials = [
    {
      name: "Ahmad Rizky",
      batch: "Angkatan 28",
      position: "Policy Analyst",
      company: "Kementerian Keuangan RI",
      icon: Building2,
      quote: "FIM mengajarkan saya tentang kepemimpinan yang berintegritas. Pengalaman di FIM menjadi bekal berharga dalam karir saya di pemerintahan."
    },
    {
      name: "Siti Nurhaliza",
      batch: "Angkatan 30",
      position: "Co-Founder",
      company: "EduTech Startup",
      icon: Briefcase,
      quote: "Jaringan alumni FIM sangat kuat. Banyak kolaborasi bisnis dan proyek sosial yang lahir dari pertemanan di FIM."
    },
    {
      name: "Budi Santoso",
      batch: "Angkatan 25",
      position: "Program Director",
      company: "NGO Pendidikan Nasional",
      icon: GraduationCap,
      quote: "Nilai-nilai FIM tentang pelayanan dan kebersahajaan membentuk cara saya memimpin organisasi hingga hari ini."
    },
  ];

  // Program unggulan data
  const programUnggulan = [
    {
      title: "Pelatihan",
      description: "Program kaderisasi kepemimpinan intensif dengan kurikulum 7 pilar karakter dan 7 pilar kepemimpinan.",
      icon: GraduationCap,
      link: "/program/pelatihan",
    },
    {
      title: "Mentoring",
      description: "Bimbingan langsung dari alumni FIM yang telah berkarir di berbagai bidang.",
      icon: Users,
      link: "/program/program-unggulan",
    },
    {
      title: "Series Discussion",
      description: "Diskusi rutin membahas isu-isu aktual bersama pakar dan praktisi.",
      icon: MessageSquare,
      link: "/program/program-unggulan",
    },
  ];

  const partnerLogos = [
    logo1, logo2, logo3, logo4, logo5, logo6, logo7, logo8, logo9, logo10,
    logo11, logo12, logo13, logo14, logo15, logo16, logo17, logo18, logo19, logo20,
    logo21, logo22, logo23, logo24, logo25, logo26, logo27, logo28, logo29
  ];

  // Banner carousel
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

  return (
    <Layout>
      <SEO 
        title={t("home.title")} 
        description={t("home.description")}
      />
      {/* Hero Section - Optimized for mobile to show content peek below */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute top-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
        
        <div className="relative container mx-auto px-4 py-12 lg:py-28">
          <div className="flex flex-col items-center text-center">
            <img 
              src={logoFim} 
              alt="Forum Indonesia Muda" 
              className="h-24 lg:h-32 mb-8 animate-fade-in brightness-0 invert" 
            />
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {t("home.hero.heading")}
              <br />
              <span className="text-accent">{t("home.hero.subheading")}</span>
            </h1>
            {/* Social Proof Subheadline */}
            <p className="text-sm lg:text-base text-accent font-semibold mb-4 animate-fade-in" style={{ animationDelay: "0.15s" }}>
              {t("home.hero.socialProof")}
            </p>
            <p className="text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {t("home.hero.description")}
            </p>
            {/* Urgency Banner */}
            <div className="bg-accent/20 border border-accent/50 rounded-lg px-4 py-2 mb-6 animate-fade-in inline-block" style={{ animationDelay: "0.25s" }}>
              <p className="text-sm lg:text-base text-accent font-semibold flex items-center gap-2">
                <span className="animate-pulse">🔥</span> {t("home.hero.urgency")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/tentang">
                <Button size="lg" className="bg-accent hover:bg-accent/90 font-semibold text-accent-foreground">
                  {t("home.hero.cta")} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      <FeaturedVideoSection />

      {/* Banner Carousel */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {bannerImages.map((image, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-48 md:h-64 lg:h-80 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <button
              onClick={scrollPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center hover:bg-background transition-colors shadow-lg"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {bannerImages.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === selectedIndex ? "bg-primary" : "bg-muted"
                  }`}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={stat.label} className="bg-card rounded-xl p-6 text-center shadow-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kunang-kunang Quote */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-accent mx-auto mb-4" />
            <blockquote className="text-xl lg:text-2xl text-foreground italic mb-4">
              "Seperti kunang-kunang yang kecil namun mampu menerangi kegelapan, setiap pemuda Indonesia memiliki cahaya yang dapat menerangi jalan bagi sesama dan bangsa."
            </blockquote>
            <div className="w-16 h-1 bg-accent mx-auto" />
          </div>
        </div>
      </section>

      {/* Alumni Testimonials - Social Proof */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Kata Alumni</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Dengarkan pengalaman langsung dari alumni FIM yang kini berkarya di berbagai bidang
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {alumniTestimonials.map((testimonial, index) => (
              <div 
                key={testimonial.name} 
                className="bg-card rounded-xl p-6 shadow-lg animate-fade-in relative" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Quote className="h-8 w-8 text-accent/30 absolute top-4 right-4" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <testimonial.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.batch}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-foreground">{testimonial.position}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/cerita-alumni">
              <Button variant="outline">
                Lihat Semua Cerita Alumni <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Program Unggulan Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Program Unggulan</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Program pengembangan kepemimpinan dan karakter untuk generasi muda Indonesia</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {programUnggulan.map((program, index) => (
              <Link key={program.title} to={program.link} className="group">
                <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in h-full" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <program.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{program.title}</h3>
                  <p className="text-sm text-muted-foreground">{program.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/program/program-unggulan">
              <Button variant="outline">Lihat Semua Program <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Kabar FIM Section - Pinned Articles */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Kabar FIM</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Berita pilihan dan informasi penting dari Forum Indonesia Muda</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {featuredArticles?.length ? featuredArticles.map((article, index) => (
              <Link key={article.id} to={`/blog/${article.slug}`} className="group">
                <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in relative" style={{ animationDelay: `${index * 0.1}s` }}>
                  {article.is_pinned && (
                    <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium z-10">
                      Pilihan
                    </div>
                  )}
                  <img 
                    src={article.featured_image_url || "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=250&fit=crop"} 
                    alt={article.title} 
                    className="w-full h-40 object-cover" 
                  />
                  <div className="p-5">
                    <span className="text-xs text-muted-foreground">
                      {article.published_at ? new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : ""}
                    </span>
                    <h3 className="font-bold text-foreground mb-2 mt-1 group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt || ""}</p>
                  </div>
                </div>
              </Link>
            )) : (
              // Placeholder if no articles yet
              [1, 2, 3].map((_, index) => (
                <div key={index} className="bg-card rounded-xl overflow-hidden shadow-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="w-full h-40 bg-muted" />
                  <div className="p-5">
                    <div className="h-3 w-20 bg-muted rounded mb-2" />
                    <div className="h-5 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-8">
            <Link to="/blog">
              <Button variant="outline">Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mitra Kami Section - Infinite Scroll Animation */}
      <section className="py-12 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-foreground mb-2">Mitra Kami</h2>
          <p className="text-muted-foreground text-center text-sm mb-8">Kolaborator yang telah bekerjasama dengan FIM</p>
        </div>
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex animate-scroll-x hover:pause-animation">
            {/* Use database partners if available, otherwise fallback to static logos */}
            {partners?.length ? (
              <>
                {[...partners, ...partners, ...partners].map((partner, index) => (
                  <a 
                    key={`${partner.id}-${index}`} 
                    href={partner.website_url || "#"} 
                    target={partner.website_url ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex-shrink-0 mx-4 md:mx-6 group"
                    title={partner.name}
                  >
                    <div className="h-14 w-28 md:h-16 md:w-32 bg-card rounded-lg shadow-sm flex items-center justify-center p-3 group-hover:shadow-md transition-all">
                      <img 
                        src={partner.logo_url} 
                        alt={partner.name} 
                        loading="lazy"
                        className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </a>
                ))}
              </>
            ) : (
              <>
                {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, index) => (
                  <div key={index} className="flex-shrink-0 mx-4 md:mx-6">
                    <div className="h-14 w-28 md:h-16 md:w-32 bg-card rounded-lg shadow-sm flex items-center justify-center p-3">
                      <img 
                        src={logo} 
                        alt={`Partner ${(index % partnerLogos.length) + 1}`} 
                        loading="lazy"
                        className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all" 
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">Siap Menjadi Bagian dari Perubahan?</h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto mb-8">Bergabunglah dengan ribuan pemuda Indonesia dalam membangun masa depan yang lebih baik.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/daftar">
              <Button size="lg" className="bg-accent hover:bg-accent/90 font-semibold text-accent-foreground">
                Daftar Sekarang <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/donasi">
              <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-semibold">
                Dukung FIM
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
