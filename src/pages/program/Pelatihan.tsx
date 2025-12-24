import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Calendar, Users, MapPin, Award, Star, Zap, Heart, Globe, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Pelatihan = () => {
  const tahapan = [
    {
      phase: "Tahap 1",
      title: "Seleksi Nasional",
      duration: "2 bulan",
      description: "Proses seleksi ketat untuk menemukan calon kader terbaik dari seluruh Indonesia",
      activities: ["Pendaftaran online", "Seleksi administrasi", "Tes tertulis", "Wawancara regional"],
    },
    {
      phase: "Tahap 2",
      title: "Pelatihan Dasar",
      duration: "1 bulan",
      description: "Pembentukan fondasi karakter dan nilai-nilai kepemimpinan",
      activities: ["Outbound training", "Workshop kepemimpinan", "Diskusi kelompok", "Mentoring"],
    },
    {
      phase: "Tahap 3",
      title: "Pelatihan Intensif",
      duration: "2 minggu",
      description: "Pelatihan intensif untuk membangun keterampilan dan jaringan",
      activities: ["Leadership camp", "Project-based learning", "Guest speakers", "Networking session"],
    },
    {
      phase: "Tahap 4",
      title: "Aksi Nyata",
      duration: "6 bulan",
      description: "Implementasi proyek sosial di komunitas masing-masing",
      activities: ["Perencanaan proyek", "Eksekusi program", "Monitoring & evaluasi", "Presentasi hasil"],
    },
  ];

  const stats = [
    { icon: Calendar, value: "30+", label: "Angkatan" },
    { icon: Users, value: "4000+", label: "Alumni" },
    { icon: MapPin, value: "61", label: "Regional" },
    { icon: Award, value: "100+", label: "Proyek Sosial/Tahun" },
  ];

  const programUnggulan = [
    {
      icon: Star,
      title: "Leadership Camp",
      description: "Program pelatihan kepemimpinan intensif selama satu minggu dengan berbagai aktivitas outdoor dan indoor",
    },
    {
      icon: Zap,
      title: "Social Project",
      description: "Program aksi nyata di masyarakat yang dirancang dan dilaksanakan oleh kader FIM",
    },
    {
      icon: Heart,
      title: "Tanggap Bencana",
      description: "Program respons cepat dan bantuan kemanusiaan untuk korban bencana alam",
    },
    {
      icon: Globe,
      title: "FIM Goes International",
      description: "Program pertukaran dan kerjasama dengan organisasi pemuda internasional",
    },
    {
      icon: BookOpen,
      title: "FIM Mengajar",
      description: "Program pengabdian di bidang pendidikan untuk anak-anak di daerah terpencil",
    },
  ];

  return (
    <Layout>
      <PageHero
        title="Program Pelatihan FIM"
        subtitle="Program kaderisasi tahunan untuk membentuk pemimpin muda Indonesia yang berkarakter dan berdampak"
      />

      {/* Stats Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-6 text-center shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Program */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Apa itu Kaderisasi FIM?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Program Kaderisasi FIM adalah program pelatihan kepemimpinan tahunan yang 
              telah berjalan sejak 2003. Program ini dirancang untuk membentuk karakter, 
              mengembangkan potensi, dan membangun jaringan pemuda Indonesia dari berbagai 
              latar belakang. Setiap tahun, FIM merekrut dan melatih ratusan pemuda terpilih 
              melalui serangkaian tahapan intensif.
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Pengembangan Karakter", desc: "Membangun integritas, kepedulian, dan nilai-nilai kepemimpinan" },
              { title: "Jaringan Nasional", desc: "Terhubung dengan ribuan alumni dari 61 regional di Indonesia" },
              { title: "Dampak Nyata", desc: "Kesempatan untuk berkontribusi melalui proyek sosial" },
            ].map((benefit, index) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle className="h-6 w-6 text-supporting flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 Program Unggulan */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            5 Program Unggulan FIM
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Program-program utama yang menjadi andalan Forum Indonesia Muda
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {programUnggulan.map((program, index) => (
              <div
                key={program.title}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <program.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2">{program.title}</h3>
                <p className="text-muted-foreground text-sm">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tahapan Program */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">
            Tahapan Program Kaderisasi
          </h2>

          <div className="max-w-4xl mx-auto space-y-8">
            {tahapan.map((tahap, index) => (
              <div
                key={tahap.phase}
                className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  {/* Phase Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center">
                      <span className="text-xs uppercase tracking-wide">Tahap</span>
                      <span className="text-2xl font-bold">{index + 1}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-foreground">{tahap.title}</h3>
                      <span className="px-3 py-1 bg-accent/20 text-accent-foreground text-sm rounded-full">
                        {tahap.duration}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{tahap.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {tahap.activities.map((activity) => (
                        <span
                          key={activity}
                          className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-lg"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Siap Menjadi Bagian dari FIM?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Pendaftaran dibuka setiap tahun. Jangan lewatkan kesempatan untuk 
            mengembangkan diri dan berkontribusi bagi Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Daftar Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/faq">
              <Button size="lg" variant="outline">
                Lihat FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pelatihan;
