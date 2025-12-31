import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Quote, GraduationCap, Briefcase, Heart, Globe, Leaf, Code, User } from "lucide-react";

const CeritaAlumni = () => {
  const [selectedSector, setSelectedSector] = useState("Semua");

  const stories = [
    {
      name: "Andi Pratama",
      angkatan: "FIM 5",
      sector: "Pendidikan",
      role: "Founder Sekolah Inspirasi",
      location: "Yogyakarta",
      photo: null,
      quote: "FIM mengajarkan saya bahwa perubahan dimulai dari pendidikan. Kini saya mendirikan sekolah gratis untuk anak-anak kurang mampu.",
      impact: "500+ siswa terbantu",
    },
    {
      name: "Siti Rahayu",
      angkatan: "FIM 8",
      sector: "Sosial",
      role: "CEO Yayasan Peduli Desa",
      location: "Makassar",
      photo: null,
      quote: "Jaringan FIM membantu saya membangun program pemberdayaan di 50 desa tertinggal.",
      impact: "50 desa terdampak",
    },
    {
      name: "Budi Santoso",
      angkatan: "FIM 12",
      sector: "Teknologi",
      role: "CTO Startup Edutech",
      location: "Jakarta",
      photo: null,
      quote: "Dari workshop leadership FIM, saya belajar membangun tim. Sekarang startup kami sudah Series A.",
      impact: "1M+ pengguna aplikasi",
    },
    {
      name: "Maria Theresia",
      angkatan: "FIM 15",
      sector: "Kesehatan",
      role: "Dokter & Aktivis Kesehatan",
      location: "Flores",
      photo: null,
      quote: "FIM membuka mata saya tentang kesenjangan akses kesehatan. Saya memilih bertugas di daerah terpencil.",
      impact: "10.000+ pasien dilayani",
    },
    {
      name: "Ahmad Fauzi",
      angkatan: "FIM 10",
      sector: "Lingkungan",
      role: "Founder Green Movement ID",
      location: "Bandung",
      photo: null,
      quote: "Semangat kunang-kunang FIM yang menerangi kegelapan menginspirasi gerakan lingkungan kami.",
      impact: "100.000 pohon ditanam",
    },
    {
      name: "Dewi Lestari",
      angkatan: "FIM 18",
      sector: "Bisnis",
      role: "Founder Social Enterprise",
      location: "Surabaya",
      photo: null,
      quote: "FIM mengajarkan bahwa bisnis bisa berdampak sosial. Social enterprise kami memberdayakan 200 pengrajin lokal.",
      impact: "200 UMKM diberdayakan",
    },
    {
      name: "Rizky Ramadhan",
      angkatan: "FIM 20",
      sector: "Internasional",
      role: "Diplomat Muda RI",
      location: "Jenewa",
      photo: null,
      quote: "Public speaking dan diplomacy skills dari FIM sangat membantu karir saya di kancah internasional.",
      impact: "Perwakilan Indonesia di PBB",
    },
    {
      name: "Putri Handayani",
      angkatan: "FIM 7",
      sector: "Pendidikan",
      role: "Founder Gerakan Literasi",
      location: "Semarang",
      photo: null,
      quote: "Saya percaya setiap anak Indonesia berhak membaca. FIM memberi saya keberanian untuk memulai.",
      impact: "1.000+ perpustakaan desa",
    },
  ];

  // Alumni lainnya - hanya foto, nama, angkatan, dan track record
  const otherAlumni = [
    { name: "Raden Mas Haryanto", angkatan: "FIM 3", trackRecord: "Direktur Utama BUMN Strategis" },
    { name: "Kartini Sari Dewi", angkatan: "FIM 4", trackRecord: "Anggota DPR RI Komisi X" },
    { name: "Dr. Bambang Sutrisno", angkatan: "FIM 6", trackRecord: "Rektor Universitas Negeri" },
    { name: "Ratna Megawati", angkatan: "FIM 7", trackRecord: "CEO Perusahaan Teknologi" },
    { name: "Agus Prasetyo", angkatan: "FIM 9", trackRecord: "Direktur LSM Internasional" },
    { name: "Indah Permatasari", angkatan: "FIM 11", trackRecord: "Kepala Dinas Pendidikan Provinsi" },
    { name: "Hendra Wijaya", angkatan: "FIM 13", trackRecord: "Founder Unicorn Startup" },
    { name: "Siska Rahmawati", angkatan: "FIM 14", trackRecord: "Peneliti Senior Lembaga Think Tank" },
    { name: "Muhammad Rizal", angkatan: "FIM 16", trackRecord: "Kepala Kantor Perwakilan RI" },
    { name: "Dian Kusuma", angkatan: "FIM 17", trackRecord: "Pendiri Yayasan Pendidikan Nasional" },
    { name: "Eko Prasetio", angkatan: "FIM 19", trackRecord: "Dokter Spesialis di RS Rujukan" },
    { name: "Lina Marlina", angkatan: "FIM 21", trackRecord: "Aktivis Lingkungan Internasional" },
    { name: "Fajar Nugroho", angkatan: "FIM 22", trackRecord: "Produser Film Dokumenter Nasional" },
    { name: "Anita Susanti", angkatan: "FIM 23", trackRecord: "Konsultan Kebijakan Publik" },
    { name: "Bayu Adi Putra", angkatan: "FIM 24", trackRecord: "Kepala Divisi CSR Perusahaan Multinasional" },
    { name: "Citra Dewi", angkatan: "FIM 25", trackRecord: "Founder Platform Edtech" },
  ];

  const sectors = ["Semua", "Pendidikan", "Sosial", "Teknologi", "Kesehatan", "Lingkungan", "Bisnis", "Internasional"];

  const filteredStories = selectedSector === "Semua" 
    ? stories 
    : stories.filter((s) => s.sector === selectedSector);

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, any> = {
      Pendidikan: GraduationCap,
      Sosial: Heart,
      Teknologi: Code,
      Kesehatan: Heart,
      Lingkungan: Leaf,
      Bisnis: Briefcase,
      Internasional: Globe,
    };
    return icons[sector] || Heart;
  };

  return (
    <Layout>
      <PageHero
        title="Cerita Alumni"
        subtitle="Kisah inspiratif dari ribuan alumni FIM yang telah berkontribusi di berbagai sektor untuk kemajuan Indonesia"
      />

      {/* Quote Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-accent mx-auto mb-4" />
            <blockquote className="text-xl lg:text-2xl text-foreground italic mb-4">
              "Setiap alumni FIM adalah kunang-kunang yang menerangi sudut Indonesia dengan caranya masing-masing."
            </blockquote>
            <p className="text-muted-foreground">— Filosofi Alumni FIM</p>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            Kisah Mereka, Inspirasi Kita
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Dari Sabang sampai Merauke, alumni FIM telah memberikan dampak nyata di berbagai bidang.
          </p>

          {/* Sector Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSector === sector
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted border border-border"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>

          {/* Stories Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {filteredStories.map((story, index) => {
              const Icon = getSectorIcon(story.sector);
              return (
                <div
                  key={story.name}
                  className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">
                        {story.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{story.name}</h3>
                      <p className="text-sm text-primary">{story.angkatan}</p>
                      <p className="text-sm text-muted-foreground">{story.role}</p>
                      <p className="text-xs text-muted-foreground">{story.location}</p>
                    </div>
                    <div className="w-10 h-10 bg-supporting/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-supporting" />
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-muted-foreground italic mb-6 relative pl-4 border-l-2 border-accent">
                    "{story.quote}"
                  </blockquote>

                  {/* Impact */}
                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Dampak:</span>
                    <span className="text-sm font-semibold text-supporting">{story.impact}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada cerita di sektor ini.</p>
            </div>
          )}
        </div>
      </section>

      {/* Alumni FIM Lainnya Section */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">
            Alumni FIM Lainnya
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Ribuan alumni FIM telah berkontribusi di berbagai sektor dan jabatan strategis.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {otherAlumni.map((alumni, index) => (
              <div
                key={alumni.name}
                className="bg-card rounded-xl p-4 shadow-lg hover:shadow-xl transition-all animate-fade-in text-center"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Avatar Placeholder */}
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-8 w-8 text-primary/50" />
                </div>
                
                <h3 className="font-bold text-foreground text-sm mb-1">{alumni.name}</h3>
                <p className="text-xs text-primary font-medium mb-2">{alumni.angkatan}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{alumni.trackRecord}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Punya Cerita untuk Dibagikan?
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Jika Anda alumni FIM dan ingin berbagi cerita perjalanan Anda, hubungi kami.
          </p>
          <a
            href="mailto:alumni@forumindonesiamuda.org"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Kirim Cerita Anda
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default CeritaAlumni;