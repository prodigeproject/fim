import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { GraduationCap, Briefcase, Heart, Palette, Globe, Leaf, Code, Music } from "lucide-react";

const FimClub = () => {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const clubs = [
    {
      name: "FIM Pendidikan",
      category: "Pendidikan",
      icon: GraduationCap,
      description: "Komunitas alumni yang bergerak di bidang pendidikan dan pengajaran",
      members: 450,
      activities: ["Workshop guru", "Beasiswa", "Mentoring siswa"],
    },
    {
      name: "FIM Bisnis & Entrepreneurship",
      category: "Bisnis",
      icon: Briefcase,
      description: "Wadah alumni wirausahawan dan profesional bisnis",
      members: 380,
      activities: ["Business networking", "Startup mentoring", "Investment club"],
    },
    {
      name: "FIM Sosial & Kemanusiaan",
      category: "Sosial",
      icon: Heart,
      description: "Gerakan kemanusiaan dan kepedulian sosial",
      members: 520,
      activities: ["Aksi sosial", "Tanggap bencana", "Volunteer program"],
    },
    {
      name: "FIM Kreatif & Media",
      category: "Kreatif",
      icon: Palette,
      description: "Komunitas kreator konten dan industri kreatif",
      members: 290,
      activities: ["Content creation", "Film making", "Design workshop"],
    },
    {
      name: "FIM Hubungan Internasional",
      category: "Internasional",
      icon: Globe,
      description: "Jaringan alumni di luar negeri dan diplomasi publik",
      members: 180,
      activities: ["Cultural exchange", "Study abroad", "International forum"],
    },
    {
      name: "FIM Lingkungan",
      category: "Lingkungan",
      icon: Leaf,
      description: "Gerakan peduli lingkungan dan sustainability",
      members: 240,
      activities: ["Tree planting", "Beach cleanup", "Eco education"],
    },
    {
      name: "FIM Teknologi",
      category: "Teknologi",
      icon: Code,
      description: "Komunitas tech enthusiast dan developer",
      members: 320,
      activities: ["Hackathon", "Tech talks", "Coding bootcamp"],
    },
    {
      name: "FIM Seni & Budaya",
      category: "Budaya",
      icon: Music,
      description: "Pelestarian dan promosi seni budaya Indonesia",
      members: 210,
      activities: ["Cultural festival", "Art exhibition", "Traditional dance"],
    },
    {
      name: "FIM Kesehatan",
      category: "Kesehatan",
      icon: Heart,
      description: "Komunitas tenaga kesehatan dan advokasi kesehatan masyarakat",
      members: 280,
      activities: ["Medical mission", "Health education", "Blood donation"],
    },
    {
      name: "FIM Hukum & Advokasi",
      category: "Hukum",
      icon: Briefcase,
      description: "Jaringan praktisi hukum dan advokasi kebijakan publik",
      members: 150,
      activities: ["Legal aid", "Policy advocacy", "Public law education"],
    },
    {
      name: "FIM Olahraga",
      category: "Olahraga",
      icon: Heart,
      description: "Komunitas pecinta olahraga dan gaya hidup sehat",
      members: 260,
      activities: ["Sports tournament", "Fitness challenge", "Outdoor adventure"],
    },
    {
      name: "FIM Pertanian & Pangan",
      category: "Pertanian",
      icon: Leaf,
      description: "Gerakan ketahanan pangan dan pertanian berkelanjutan",
      members: 140,
      activities: ["Urban farming", "Food security", "Agritech"],
    },
    {
      name: "FIM Pariwisata",
      category: "Pariwisata",
      icon: Globe,
      description: "Promosi pariwisata Indonesia dan sustainable tourism",
      members: 170,
      activities: ["Travel community", "Local tourism", "Eco tourism"],
    },
    {
      name: "FIM Keuangan",
      category: "Keuangan",
      icon: Briefcase,
      description: "Literasi keuangan dan investasi",
      members: 200,
      activities: ["Financial literacy", "Investment club", "Fintech"],
    },
    {
      name: "FIM Komunikasi",
      category: "Komunikasi",
      icon: Palette,
      description: "Komunitas media dan public relations",
      members: 230,
      activities: ["Media training", "PR workshop", "Journalism"],
    },
    {
      name: "FIM Psikologi",
      category: "Psikologi",
      icon: Heart,
      description: "Kesehatan mental dan pengembangan diri",
      members: 190,
      activities: ["Mental health", "Counseling", "Self development"],
    },
    {
      name: "FIM Maritim",
      category: "Maritim",
      icon: Globe,
      description: "Gerakan kelautan dan maritim Indonesia",
      members: 100,
      activities: ["Marine conservation", "Fishery", "Maritime awareness"],
    },
    {
      name: "FIM Pemerintahan",
      category: "Pemerintahan",
      icon: Briefcase,
      description: "Alumni di sektor publik dan pemerintahan",
      members: 160,
      activities: ["Policy making", "Public service", "Governance"],
    },
  ];

  const categories = ["Semua", ...Array.from(new Set(clubs.map((c) => c.category)))];

  const filteredClubs = selectedCategory === "Semua" 
    ? clubs 
    : clubs.filter((c) => c.category === selectedCategory);

  const totalMembers = clubs.reduce((sum, c) => sum + c.members, 0);

  return (
    <Layout>
      <PageHero
        title="FIM Club"
        subtitle="Komunitas alumni FIM berdasarkan bidang minat dan keahlian. 18 klub dengan ribuan anggota aktif."
      />

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">18</div>
              <div className="text-sm text-muted-foreground">FIM Club</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-supporting mb-1">{totalMembers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Anggota Aktif</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-accent-foreground mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Kegiatan/Tahun</div>
            </div>
          </div>
        </div>
      </section>

      {/* About FIM Club */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              Apa itu FIM Club?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              FIM Club adalah komunitas alumni FIM yang dikelompokkan berdasarkan bidang 
              minat dan keahlian. Setelah lulus dari program kaderisasi, alumni dapat 
              bergabung dengan satu atau lebih klub untuk terus berkontribusi, 
              mengembangkan diri, dan memperluas jaringan sesuai passion mereka.
            </p>
          </div>
        </div>
      </section>

      {/* Club List */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-8">
            Daftar FIM Club
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredClubs.map((club, index) => (
              <div
                key={club.name}
                className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <club.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{club.name}</h3>
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {club.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">{club.description}</p>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {club.activities.map((activity) => (
                    <span
                      key={activity}
                      className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{club.members}</span> anggota aktif
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FimClub;
