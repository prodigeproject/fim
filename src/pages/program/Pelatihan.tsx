import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Calendar, Users, MapPin, Award, Play, Image, MessageSquare, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Lightbox } from "@/components/Lightbox";

const Pelatihan = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const tahapan = [
    { phase: "Tahap 1", title: "Seleksi Nasional", duration: "2 bulan", description: "Proses seleksi ketat untuk menemukan calon kader terbaik dari seluruh Indonesia", activities: ["Pendaftaran online", "Seleksi administrasi", "Wawancara", "Pengumuman"] },
    { phase: "Tahap 2", title: "Pelatihan FIM 27: Kebijakan Publik", duration: "3 hari", description: "Pelatihan intensif untuk membangun keterampilan dan jaringan", activities: ["Seminar", "Workshop", "FGD", "Networking"] },
    { phase: "Tahap 3", title: "Mentorship", duration: null, description: "Program mentoring berkelanjutan untuk pengembangan diri", activities: ["Networking dengan tokoh", "Workshop lanjutan", "Training", "Coaching", "Mentoring"] },
    { phase: "Tahap 4", title: "Aksi Nyata", duration: null, description: "Implementasi dan kontribusi masing-masing alumni melalui instansi tempat bekerja dan/atau ekosistem FIM", activities: ["Kontribusi di instansi", "Proyek ekosistem FIM", "Kolaborasi alumni", "Dampak sosial"] },
  ];

  const stats = [
    { icon: Calendar, value: "> 34", label: "Angkatan" },
    { icon: Users, value: "4000+", label: "Alumni" },
    { icon: MapPin, value: "61", label: "Regional" },
    { icon: Award, value: "100+", label: "Proyek Sosial/Tahun" },
  ];

  const recentTimeline = [
    { date: "Desember", event: "Pelaksanaan pelatihan intensif di Jakarta", status: "ongoing" },
    { date: "November", event: "Seleksi dilakukan oleh pengurus FIM", status: "completed" },
    { date: "Oktober", event: "Pendaftaran FIM 27: Kebijakan Publik dibuka", status: "completed" },
    { date: "Juli-Agustus", event: "Persiapan", status: "completed" },
  ];

  const dokumentasi = [
    { type: "image", title: "Leadership Camp 2025", thumbnail: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=600&fit=crop" },
    { type: "image", title: "Outbound Training", thumbnail: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=600&fit=crop" },
    { type: "image", title: "Workshop Kepemimpinan", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop" },
    { type: "image", title: "Diskusi Kelompok", thumbnail: "https://images.unsplash.com/photo-1559223607-180d0c79a8db?w=800&h=600&fit=crop" },
    { type: "image", title: "Proyek Sosial Alumni", thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop" },
    { type: "image", title: "Networking Session", thumbnail: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop" },
  ];

  // Prepare images for Lightbox
  const lightboxImages = dokumentasi.map(item => ({
    src: item.thumbnail.replace('w=400&h=300', 'w=1200&h=900').replace('w=800&h=600', 'w=1200&h=900'),
    alt: item.title
  }));

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Layout>
      <SEO 
        title="Program Pelatihan" 
        description="Program kaderisasi tahunan Forum Indonesia Muda untuk membentuk pemimpin muda Indonesia. FIM 27: Kebijakan Publik - Seleksi, Pelatihan, Mentorship, dan Aksi Nyata."
      />
      <PageHero title="Program Pelatihan FIM" subtitle="Program kaderisasi tahunan untuk membentuk pemimpin muda Indonesia yang berkarakter dan berdampak" />

      {/* WA Channel Banner */}
      <section className="bg-gradient-to-r from-supporting/10 to-primary/10 border-y border-supporting/20">
        <div className="container mx-auto px-4 py-4">
          <a href="https://whatsapp.com/channel/0029VbAqbD78PgsCdYd6hK2T" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors">
            <MessageSquare className="h-5 w-5 text-supporting" />
            <span className="text-sm font-medium">📢 Ikuti Channel WA <strong>FIMers Update</strong> untuk info terbaru!</span>
            <ExternalLink className="h-4 w-4" />
          </a>
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

      {/* About Program */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">Apa itu Kaderisasi FIM?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">Program Kaderisasi FIM adalah program pelatihan kepemimpinan tahunan yang telah berjalan sejak 2003. Program ini dirancang untuk membentuk karakter, mengembangkan potensi, dan membangun jaringan pemuda Indonesia dari berbagai latar belakang. Setiap tahun, FIM merekrut dan melatih ratusan pemuda terpilih melalui serangkaian tahapan intensif.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { title: "Pengembangan Karakter", desc: "Membangun integritas, kepedulian, dan nilai-nilai kepemimpinan" },
              { title: "Pengembangan Kompetensi", desc: "Meningkatkan kompetensi kepemimpinan, kebijakan publik, manajerial, dan soft skills lainnya" },
              { title: "Jaringan Nasional", desc: "Terhubung dengan ribuan alumni dari 61 regional di Indonesia" },
              { title: "Dampak Nyata", desc: "Kesempatan untuk berkontribusi melalui proyek sosial" },
            ].map((benefit, index) => (
              <div key={benefit.title} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
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

      {/* Tahapan Program */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-12">Tahapan Program Kaderisasi</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {tahapan.map((tahap, index) => (
              <div key={tahap.phase} className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center">
                      <span className="text-xs uppercase tracking-wide">Tahap</span>
                      <span className="text-2xl font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-foreground">{tahap.title}</h3>
                      {tahap.duration && <span className="px-3 py-1 bg-accent/20 text-accent-foreground text-sm rounded-full">{tahap.duration}</span>}
                    </div>
                    <p className="text-muted-foreground mb-4">{tahap.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {tahap.activities.map((activity) => <span key={activity} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-lg">{activity}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Timeline FIM 27: Kebijakan Publik</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Jadwal dan update kegiatan pelatihan FIM terbaru</p>
          <div className="max-w-3xl mx-auto">
            {recentTimeline.map((item, index) => (
              <div key={item.event} className="flex gap-4 mb-6 last:mb-0 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 ${item.status === "ongoing" ? "bg-supporting animate-pulse" : "bg-primary"}`} />
                  {index < recentTimeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <span className={`text-sm font-medium ${item.status === "ongoing" ? "text-supporting" : "text-muted-foreground"}`}>
                    {item.date}
                    {item.status === "ongoing" && <span className="ml-2 px-2 py-0.5 bg-supporting/20 text-supporting text-xs rounded-full">Sedang Berlangsung</span>}
                  </span>
                  <p className="text-foreground mt-1">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dokumentasi with Lightbox */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Dokumentasi Kegiatan</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-4">Momen-momen berharga dari program pelatihan FIM</p>
          <p className="text-sm text-center text-muted-foreground mb-12">Klik gambar untuk melihat lebih besar</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {dokumentasi.map((item, index) => (
              <div
                key={item.title}
                onClick={() => openLightbox(index)}
                className="relative group rounded-xl overflow-hidden shadow-lg animate-fade-in cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img src={item.thumbnail} alt={item.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 group-hover:from-black/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-white" />
                    <span className="text-white font-medium text-sm">{item.title}</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Component */}
      <Lightbox images={lightboxImages} initialIndex={lightboxIndex} isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} />

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Siap Menjadi Bagian dari FIM?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">Pendaftaran dibuka setiap tahun. Jangan lewatkan kesempatan untuk mengembangkan diri dan berkontribusi bagi Indonesia.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/daftar">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Daftar Sekarang<ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/program/program-unggulan"><Button size="lg" variant="outline">Lihat Program Unggulan</Button></Link>
            <Link to="/faq"><Button size="lg" variant="outline">Lihat FAQ</Button></Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Pelatihan;
