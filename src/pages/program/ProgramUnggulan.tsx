import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Star, Zap, Heart, Globe, BookOpen, ArrowRight, Image, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ProgramUnggulan = () => {
  const programs = [
    {
      icon: Star,
      title: "Leadership Camp",
      description: "Program pelatihan kepemimpinan intensif selama satu minggu dengan berbagai aktivitas outdoor dan indoor yang dirancang untuk membentuk karakter pemimpin.",
      details: [
        "Durasi: 5-7 hari intensif",
        "Lokasi: Berbagai lokasi di Indonesia",
        "Peserta: Kader terpilih dari seluruh regional",
        "Aktivitas: Outbound, workshop, diskusi kelompok, simulasi kepemimpinan",
      ],
      images: [
        "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=250&fit=crop",
      ],
    },
    {
      icon: Zap,
      title: "Social Project",
      description: "Program aksi nyata di masyarakat yang dirancang dan dilaksanakan oleh kader FIM. Setiap kader wajib menyelesaikan proyek sosial sebagai syarat kelulusan.",
      details: [
        "Durasi: 3-6 bulan pelaksanaan",
        "Cakupan: Pendidikan, kesehatan, lingkungan, ekonomi",
        "Mentoring: Didampingi mentor alumni berpengalaman",
        "Dampak: Ribuan penerima manfaat setiap tahun",
      ],
      images: [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop",
      ],
    },
    {
      icon: Heart,
      title: "Tanggap Bencana & Kemanusiaan",
      description: "Program respons cepat dan bantuan kemanusiaan untuk korban bencana alam. FIM berkoordinasi dengan berbagai lembaga untuk menyalurkan bantuan.",
      details: [
        "Respons: Dalam 24-48 jam setelah bencana",
        "Koordinasi: Bekerjasama dengan MER-C, TNI, BNPB",
        "Relawan: Jaringan alumni di seluruh Indonesia",
        "Bantuan: Logistik, medis, psikososial, rehabilitasi",
      ],
      images: [
        "https://images.unsplash.com/photo-1559223607-180d0c79a8db?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&h=250&fit=crop",
      ],
    },
    {
      icon: Globe,
      title: "FIM Goes International",
      description: "Program pertukaran dan kerjasama dengan organisasi pemuda internasional untuk memperluas wawasan global alumni FIM.",
      details: [
        "Kerjasama: Organisasi pemuda Asia Tenggara dan global",
        "Program: Exchange program, conference, joint project",
        "Networking: Membangun jaringan internasional",
        "Pengembangan: Skill bahasa dan budaya global",
      ],
      images: [
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=400&h=250&fit=crop",
      ],
    },
    {
      icon: BookOpen,
      title: "FIM Mengajar",
      description: "Program pengabdian di bidang pendidikan untuk anak-anak di daerah terpencil. Alumni FIM mengajar dan menginspirasi generasi muda Indonesia.",
      details: [
        "Lokasi: Daerah 3T (Terdepan, Terluar, Tertinggal)",
        "Durasi: Program reguler dan intensif",
        "Kurikulum: Soft skill, motivasi, literasi digital",
        "Impact: Ratusan sekolah dan ribuan siswa",
      ],
      images: [
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&h=250&fit=crop",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop",
      ],
    },
  ];

  return (
    <Layout>
      <SEO 
        title="Program Unggulan" 
        description="5 Program Unggulan Forum Indonesia Muda: Leadership Camp, Social Project, Tanggap Bencana, FIM Goes International, dan FIM Mengajar. Program andalan untuk membentuk pemimpin muda Indonesia."
      />
      <PageHero
        title="5 Program Unggulan FIM"
        subtitle="Program-program utama yang menjadi andalan Forum Indonesia Muda dalam membentuk pemimpin muda Indonesia"
      />

      {/* WA Channel Banner */}
      <section className="bg-gradient-to-r from-supporting/10 to-primary/10 border-y border-supporting/20">
        <div className="container mx-auto px-4 py-4">
          <a
            href="https://whatsapp.com/channel/0029VbAqbD78PgsCdYd6hK2T"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 text-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="h-5 w-5 text-supporting" />
            <span className="text-sm font-medium">
              📢 Ikuti Channel WA <strong>FIMers Update</strong> untuk info terbaru!
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Selain program kaderisasi tahunan, FIM memiliki 5 program unggulan yang 
              menjadi wadah bagi alumni untuk terus berkontribusi dan mengembangkan diri. 
              Program-program ini telah berjalan bertahun-tahun dan memberikan dampak nyata 
              bagi masyarakat Indonesia.
            </p>
          </div>
        </div>
      </section>

      {/* Programs Detail */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-16">
            {programs.map((program, index) => (
              <div
                key={program.title}
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <program.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-foreground">{program.title}</h2>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">{program.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {program.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary mt-1">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Images */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    {program.images.map((img, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative group rounded-xl overflow-hidden shadow-lg"
                      >
                        <img
                          src={img}
                          alt={`${program.title} ${imgIndex + 1}`}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Image className="h-8 w-8 text-background" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Tertarik Bergabung?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Ikuti program kaderisasi FIM dan jadilah bagian dari program-program unggulan ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/program/pelatihan">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Daftar Kaderisasi <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/donasi">
              <Button size="lg" variant="outline">
                Dukung Program FIM
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProgramUnggulan;