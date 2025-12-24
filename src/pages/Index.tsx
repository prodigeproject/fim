import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, MapPin, Award, Quote, Heart, Shield, MessageSquare, BookOpen, Brain, Clipboard, Network, Star, Handshake, Target, Scale, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import logoFim from "@/assets/logo-fim.png";
import Layout from "@/components/Layout";

const Index = () => {
  const stats = [
    { icon: Calendar, value: "2003", label: "Berdiri Sejak" },
    { icon: Users, value: "30+", label: "Angkatan" },
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

  const programs = [
    {
      title: "Pelatihan Kaderisasi",
      desc: "Program tahunan untuk membentuk pemimpin muda berkarakter",
      link: "/program/pelatihan",
    },
    {
      title: "Regional FIM",
      desc: "60 regional + 1 diaspora dari Sabang sampai Merauke",
      link: "/program/regional",
    },
    {
      title: "FIM Club",
      desc: "18 komunitas alumni berdasarkan bidang minat",
      link: "/program/fim-club",
    },
  ];

  const partners = [
    { name: "Kemenpora", desc: "Kementerian Pemuda dan Olahraga" },
    { name: "Paragon", desc: "Paragon Technology and Innovation" },
    { name: "Flip", desc: "Flip Indonesia" },
    { name: "Transjakarta", desc: "PT Transportasi Jakarta" },
  ];

  return (
    <Layout>
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
                <Button size="lg" className="bg-accent hover:bg-accent/90 font-semibold text-foreground">
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

      {/* 7 Pilar Karakter Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">7 Pilar Karakter FIM</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Fondasi karakter yang kami tanamkan kepada setiap kader FIM</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilarKarakter.map((item, index) => (
              <div key={item.name} className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 Pilar Kepemimpinan Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">7 Pilar Kepemimpinan FIM</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Prinsip kepemimpinan yang menjadi panduan bagi alumni FIM</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pilarKepemimpinan.map((item, index) => (
              <div key={item.name} className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="w-12 h-12 bg-supporting/10 rounded-lg flex items-center justify-center mb-4">
                  <item.icon className="h-6 w-6 text-supporting" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Program Kami</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Berbagai program untuk mengembangkan potensi pemuda Indonesia</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {programs.map((program, index) => (
              <Link key={program.title} to={program.link} className="group">
                <div className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{program.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{program.desc}</p>
                  <span className="text-primary text-sm font-semibold flex items-center">Selengkapnya <ArrowRight className="h-4 w-4 ml-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Mitra Kami</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Lembaga dan perusahaan yang telah bekerjasama dengan FIM</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {partners.map((partner, index) => (
              <div key={partner.name} className="bg-card rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Handshake className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{partner.name}</h3>
                <p className="text-xs text-muted-foreground">{partner.desc}</p>
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
              <Button size="lg" className="bg-accent hover:bg-accent/90 font-semibold text-foreground">
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
