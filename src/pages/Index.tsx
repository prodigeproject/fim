import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MapPin, Award, Quote, Heart, Shield, MessageSquare, BookOpen, Brain, Clipboard, Network, Star, Handshake, Target, Scale, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import logoFim from "@/assets/logo-fim.png";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
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
  const stats = [
    { icon: Calendar, value: "2003", label: "Berdiri Sejak" },
    { icon: Users, value: "> 34", label: "Angkatan" },
    { icon: MapPin, value: "61", label: "Regional" },
    { icon: Award, value: "4000+", label: "Alumni" },
  ];

  const pilarKarakter = [
    { icon: Heart, name: "Cinta Kasih", desc: "Mencintai sesama dan berbagi kebaikan" },
    { icon: Shield, name: "Integritas", desc: "Konsisten dalam nilai dan tindakan" },
    { icon: Star, name: "Kebersahajaan", desc: "Sederhana namun bermakna" },
    { icon: Target, name: "Totalitas", desc: "Memberikan yang terbaik dalam segala hal" },
    { icon: Handshake, name: "Solidaritas", desc: "Bersatu dan saling mendukung" },
    { icon: Scale, name: "Keadilan", desc: "Menegakkan kebenaran dan kesetaraan" },
    { icon: UserCheck, name: "Keteladanan", desc: "Menjadi contoh yang baik bagi sesama" },
  ];

  const pilarKepemimpinan = [
    { icon: Users, name: "Mengenal Diri", desc: "Memahami kekuatan dan kelemahan diri" },
    { icon: MessageSquare, name: "Komunikasi", desc: "Menyampaikan pesan dengan efektif" },
    { icon: Heart, name: "Akhlak", desc: "Berperilaku mulia dalam setiap tindakan" },
    { icon: BookOpen, name: "Kekuatan Belajar", desc: "Terus mengembangkan ilmu dan wawasan" },
    { icon: Brain, name: "Proses Pengambilan Keputusan", desc: "Membuat keputusan yang bijak" },
    { icon: Clipboard, name: "Manajerial", desc: "Mengelola sumber daya dengan efisien" },
    { icon: Network, name: "Pengorganisasian", desc: "Membangun tim dan sistem yang solid" },
  ];

  // Placeholder news data - will be replaced with actual data from backend
  const kabarTerkini = [
    {
      id: 1,
      title: "FIM Batch 34 Sukses Dilaksanakan",
      excerpt: "Lebih dari 200 peserta dari seluruh Indonesia mengikuti program kaderisasi FIM angkatan ke-34.",
      date: "20 Desember 2025",
      image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=250&fit=crop",
    },
    {
      id: 2,
      title: "Kolaborasi FIM dengan Nalar Institute",
      excerpt: "FIM menjalin kerjasama dengan Nalar Institute untuk pelatihan kebijakan publik.",
      date: "15 Desember 2025",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    },
    {
      id: 3,
      title: "Alumni FIM Raih Penghargaan Nasional",
      excerpt: "Beberapa alumni FIM mendapatkan penghargaan dari berbagai lembaga atas kontribusinya.",
      date: "10 Desember 2025",
      image: "https://images.unsplash.com/photo-1559223607-180d0c79a8db?w=400&h=250&fit=crop",
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
        title="Beranda" 
        description="Forum Indonesia Muda - Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi cahaya kunang-kunang. Organisasi kaderisasi pemuda sejak 2003 dengan 4000+ alumni dari 61 regional."
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute top-20 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl animate-glow" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col items-center text-center">
            <img 
              src={logoFim} 
              alt="Forum Indonesia Muda" 
              className="h-24 lg:h-32 mb-8 animate-fade-in brightness-0 invert" 
            />
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              Forum Indonesia Muda
            </h1>
            <p className="text-lg lg:text-xl text-primary-foreground/90 max-w-2xl mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Wadah bagi pemuda Indonesia untuk bertumbuh, berkolaborasi, dan menjadi 
              <span className="text-accent font-semibold"> cahaya kunang-kunang </span>
              yang menerangi masa depan bangsa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Link to="/program/pelatihan">
                <Button size="lg" className="bg-accent hover:bg-accent/90 font-semibold text-accent-foreground">
                  Bergabung Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/tentang">
                <Button size="lg" variant="outline" className="border-primary-foreground/50 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20">
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      {/* 7 Pilar Section - 2 Columns */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 7 Pilar Karakter */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 text-center lg:text-left">7 Pilar Karakter FIM</h2>
              <p className="text-muted-foreground text-center lg:text-left mb-6 text-sm">Fondasi karakter yang ditanamkan kepada setiap kader FIM</p>
              <div className="space-y-3">
                {pilarKarakter.map((item, index) => (
                  <div key={item.name} className="bg-card rounded-lg p-4 shadow-md hover:shadow-lg transition-all flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7 Pilar Kepemimpinan */}
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 text-center lg:text-left">7 Pilar Kepemimpinan FIM</h2>
              <p className="text-muted-foreground text-center lg:text-left mb-6 text-sm">Prinsip kepemimpinan yang menjadi panduan alumni FIM</p>
              <div className="space-y-3">
                {pilarKepemimpinan.map((item, index) => (
                  <div key={item.name} className="bg-card rounded-lg p-4 shadow-md hover:shadow-lg transition-all flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="w-10 h-10 bg-supporting/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-supporting" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kabar Terkini (News) Section - Replaced Programs */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Kabar Terkini</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Berita dan informasi terbaru dari Forum Indonesia Muda</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {kabarTerkini.map((news, index) => (
              <Link key={news.id} to="/blog" className="group">
                <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <img src={news.image} alt={news.title} className="w-full h-40 object-cover" />
                  <div className="p-5">
                    <span className="text-xs text-muted-foreground">{news.date}</span>
                    <h3 className="font-bold text-foreground mb-2 mt-1 group-hover:text-primary transition-colors line-clamp-2">{news.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{news.excerpt}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/blog">
              <Button variant="outline">Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section - Logo Only */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Mitra Kami</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Kolaborator yang telah bekerjasama dengan FIM</p>
          <div className="flex flex-wrap justify-center items-center gap-6 max-w-5xl mx-auto">
            {partnerLogos.map((logo, index) => (
              <div key={index} className="bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-center animate-fade-in" style={{ animationDelay: `${index * 0.02}s` }}>
                <img 
                  src={logo} 
                  alt={`Partner ${index + 1}`} 
                  className="h-12 w-auto max-w-[100px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">Siap Menjadi Bagian dari Perubahan?</h2>
          <p className="text-primary-foreground/90 max-w-xl mx-auto mb-8">Bergabunglah dengan ribuan pemuda Indonesia dalam membangun masa depan yang lebih baik.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/program/pelatihan">
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
