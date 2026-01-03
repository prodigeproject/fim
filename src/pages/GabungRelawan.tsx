import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Users, CheckCircle, Calendar, Award, Shield, BookOpen, ArrowRight, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const GabungRelawan = () => {
  const volunteerInfo = [
    {
      icon: Users,
      title: "Siapa Relawan FIM?",
      description: "Relawan FIM adalah individu yang secara sukarela membantu FIM melalui kepengurusan regional dan/atau kegiatan tertentu.",
    },
    {
      icon: Calendar,
      title: "Masa Aktif Relawan",
      description: "Masa aktif relawan di regional bergantung pada masa kepengurusan, sementara relawan kegiatan hanya berlaku untuk kegiatan tertentu.",
    },
    {
      icon: Award,
      title: "Pengakuan Nasional",
      description: "Relawan FIM diakui secara nasional dan didata oleh pengurus FIM sebagai bagian dari ekosistem FIM.",
    },
    {
      icon: Shield,
      title: "Keterlibatan Regional",
      description: "Relawan FIM bisa terlibat sebagai pengurus regional, tetapi individu relawan tidak mewakili FIM secara keseluruhan.",
    },
    {
      icon: BookOpen,
      title: "Terikat Aturan FIM",
      description: "Relawan FIM terikat pada peraturan, norma, dan tata tertib yang sama dengan alumni FIM.",
    },
  ];

  const joinSteps = [
    {
      step: 1,
      title: "Rekrutmen Regional",
      description: "Ikuti kegiatan rekrutmen dan pelatihan volunteer yang diadakan oleh regional FIM di kotamu.",
    },
    {
      step: 2,
      title: "Rekrutmen FIM Pusat",
      description: "Atau ikuti rekrutmen yang diadakan oleh FIM Pusat untuk kegiatan nasional tertentu.",
    },
    {
      step: 3,
      title: "Pelatihan Volunteer",
      description: "Setelah diterima, kamu akan mengikuti pelatihan volunteer untuk memahami nilai-nilai dan cara kerja FIM.",
    },
    {
      step: 4,
      title: "Bergabung & Berkontribusi",
      description: "Mulai berkontribusi dalam kegiatan regional atau nasional bersama komunitas FIM.",
    },
  ];

  const benefits = [
    "Pengalaman organisasi dan kepemimpinan",
    "Jaringan luas dengan alumni FIM se-Indonesia",
    "Sertifikat pengakuan dari FIM",
    "Kesempatan mengikuti kegiatan nasional",
    "Pengembangan soft skill dan hard skill",
    "Dampak nyata bagi masyarakat",
  ];

  return (
    <Layout>
      <SEO 
        title="Gabung Relawan" 
        description="Jadilah relawan Forum Indonesia Muda dan berkontribusi untuk kemajuan bangsa. Dapatkan pengalaman organisasi, jaringan nasional, dan dampak nyata bagi masyarakat."
      />
      <PageHero
        title="Gabung Relawan FIM"
        subtitle="Jadilah bagian dari gerakan pemuda Indonesia yang berkontribusi untuk kemajuan bangsa"
      />

      {/* Intro */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Users className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Apa itu Relawan FIM?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Relawan FIM adalah individu yang dengan sukarela mendedikasikan waktu dan 
              tenaganya untuk membantu kegiatan FIM, baik di tingkat regional maupun nasional. 
              Menjadi relawan adalah langkah awal untuk mengenal dan berkontribusi dalam 
              ekosistem FIM sebelum atau tanpa mengikuti program kaderisasi.
            </p>
          </div>
        </div>
      </section>

      {/* About Volunteers */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">
            Tentang Relawan FIM
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {volunteerInfo.map((info, index) => (
              <div
                key={info.title}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <info.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{info.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            Cara Bergabung
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Ada dua jalur utama untuk menjadi relawan FIM
          </p>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {joinSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="bg-card rounded-2xl p-6 shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  Manfaat Menjadi Relawan
                </h2>
                <p className="text-muted-foreground mb-8">
                  Bergabung sebagai relawan FIM tidak hanya memberikan pengalaman berharga, 
                  tetapi juga membuka pintu untuk berbagai kesempatan pengembangan diri.
                </p>

                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li
                      key={benefit}
                      className="flex items-center gap-3 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CheckCircle className="h-5 w-5 text-supporting flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-supporting/10 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-2">500+</div>
                  <p className="text-muted-foreground mb-6">Relawan aktif di seluruh Indonesia</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-card rounded-xl p-4">
                      <div className="text-2xl font-bold text-foreground">60+</div>
                      <p className="text-xs text-muted-foreground">Regional</p>
                    </div>
                    <div className="bg-card rounded-xl p-4">
                      <div className="text-2xl font-bold text-foreground">100+</div>
                      <p className="text-xs text-muted-foreground">Kegiatan/Tahun</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Siap Bergabung?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Hubungi kami untuk informasi lebih lanjut tentang rekrutmen relawan 
            di regional terdekat atau kegiatan nasional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6285213580323?text=Halo,%20saya%20ingin%20bergabung%20menjadi%20relawan%20FIM"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="secondary" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Hubungi via WhatsApp
              </Button>
            </a>
            <a href="mailto:relawan@forumindonesiamuda.org">
              <Button size="lg" className="gap-2 bg-white text-primary hover:bg-white/90">
                <Mail className="h-5 w-5" />
                Email Kami
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GabungRelawan;