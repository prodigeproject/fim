import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Briefcase, BookOpen, Plane, GraduationCap, Pen, Award, Gamepad2, Languages, Code, Palette, Dumbbell, Users, Heart, Coffee, Flag, DollarSign, Waves, Brain, Instagram, Mail, Newspaper, Music, Camera } from "lucide-react";
import { Link } from "react-router-dom";

const FimClub = () => {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Data dari xlsx - 21 FIM Club
  const clubs = [
    {
      name: "FC Policy",
      category: "Kebijakan",
      icon: Briefcase,
      description: "Komunitas alumni yang fokus pada kajian kebijakan publik dan advokasi",
      activities: ["Policy research", "Public forum", "Advocacy"],
      instagram: "@fcpolicy",
      email: "fcpolicy@forumindonesiamuda.org",
    },
    {
      name: "FC Dongeng",
      category: "Literasi",
      icon: BookOpen,
      description: "Komunitas pendongeng untuk membangun literasi dan imajinasi anak-anak Indonesia",
      activities: ["Storytelling", "Book reading", "Children education"],
      instagram: "@fcdongeng",
      email: "fcdongeng@forumindonesiamuda.org",
    },
    {
      name: "FC Traventure",
      category: "Travel",
      icon: Plane,
      description: "Komunitas pecinta traveling dan petualangan yang menjelajahi Indonesia",
      activities: ["Travel exploration", "Adventure trips", "Cultural visits"],
      instagram: "@fctraventure",
      email: "fctraventure@forumindonesiamuda.org",
    },
    {
      name: "FC Pendidikan",
      category: "Pendidikan",
      icon: GraduationCap,
      description: "Komunitas alumni yang bergerak di bidang pendidikan dan pengajaran",
      activities: ["Teaching", "Education advocacy", "Mentoring"],
      instagram: "@fcpendidikan",
      email: "fcpendidikan@forumindonesiamuda.org",
    },
    {
      name: "FC Literatur",
      category: "Literasi",
      icon: Pen,
      description: "Komunitas penulis dan pecinta sastra Indonesia",
      activities: ["Writing workshop", "Book club", "Literary events"],
      instagram: "@fcliteratur",
      email: "fcliteratur@forumindonesiamuda.org",
    },
    {
      name: "FC Scholarship",
      category: "Beasiswa",
      icon: Award,
      description: "Komunitas yang membantu persiapan dan informasi beasiswa",
      activities: ["Scholarship info", "Application mentoring", "Study abroad prep"],
      instagram: "@fcscholarship",
      email: "fcscholarship@forumindonesiamuda.org",
    },
    {
      name: "FC Games",
      category: "Gaming",
      icon: Gamepad2,
      description: "Komunitas gamers dan esports enthusiast FIM",
      activities: ["Gaming tournament", "Esports", "Game development"],
      instagram: "@fcgames",
      email: "fcgames@forumindonesiamuda.org",
    },
    {
      name: "FC Polyglot",
      category: "Bahasa",
      icon: Languages,
      description: "Komunitas pecinta bahasa dan pembelajar multibahasa",
      activities: ["Language exchange", "Translation", "Cultural learning"],
      instagram: "@fcpolyglot",
      email: "fcpolyglot@forumindonesiamuda.org",
    },
    {
      name: "FC IT-Desain Kreatif-Startup",
      category: "Teknologi",
      icon: Code,
      description: "Komunitas tech enthusiast, designer, dan startup founder",
      activities: ["Tech talks", "Design workshop", "Startup mentoring"],
      instagram: "@fcitdesain",
      email: "fcitdesain@forumindonesiamuda.org",
    },
    {
      name: "FC Liberal Arts",
      category: "Seni & Budaya",
      icon: Palette,
      description: "Komunitas pecinta seni, humaniora, dan budaya",
      activities: ["Art exhibition", "Cultural discussion", "Creative projects"],
      instagram: "@fcliberalarts",
      email: "fcliberalarts@forumindonesiamuda.org",
    },
    {
      name: "FC Tennis",
      category: "Olahraga",
      icon: Dumbbell,
      description: "Komunitas pecinta olahraga tenis",
      activities: ["Tennis practice", "Friendly matches", "Tennis tournament"],
      instagram: "@fctennis",
      email: "fctennis@forumindonesiamuda.org",
    },
    {
      name: "FC People & Organization Development",
      category: "HR & Development",
      icon: Users,
      description: "Komunitas praktisi pengembangan SDM dan organisasi",
      activities: ["HR training", "Organization development", "Leadership coaching"],
      instagram: "@fcpod",
      email: "fcpod@forumindonesiamuda.org",
    },
    {
      name: "FC Run",
      category: "Olahraga",
      icon: Dumbbell,
      description: "Komunitas pelari dan pecinta olahraga lari",
      activities: ["Running events", "Marathon prep", "Fun run"],
      instagram: "@fcrun",
      email: "fcrun@forumindonesiamuda.org",
    },
    {
      name: "FC Swim & Dive",
      category: "Olahraga",
      icon: Waves,
      description: "Komunitas pecinta renang dan diving",
      activities: ["Swimming practice", "Diving trips", "Water sports"],
      instagram: "@fcswimdive",
      email: "fcswimdive@forumindonesiamuda.org",
    },
    {
      name: "FC Mental Health",
      category: "Kesehatan",
      icon: Brain,
      description: "Komunitas peduli kesehatan mental dan well-being",
      activities: ["Mental health awareness", "Support group", "Wellness workshop"],
      instagram: "@fcmentalhealth",
      email: "fcmentalhealth@forumindonesiamuda.org",
    },
    {
      name: "FC Coffeinary",
      category: "Lifestyle",
      icon: Coffee,
      description: "Komunitas pecinta kopi dan kuliner nusantara",
      activities: ["Coffee tasting", "Culinary exploration", "Barista workshop"],
      instagram: "@fccoffeinary",
      email: "fccoffeinary@forumindonesiamuda.org",
    },
    {
      name: "FC Politics",
      category: "Politik",
      icon: Flag,
      description: "Komunitas yang tertarik dengan politik dan pemerintahan",
      activities: ["Political discussion", "Civic education", "Election watch"],
      instagram: "@fcpolitics",
      email: "fcpolitics@forumindonesiamuda.org",
    },
    {
      name: "FC Finance Investment",
      category: "Keuangan",
      icon: DollarSign,
      description: "Komunitas literasi keuangan dan investasi",
      activities: ["Financial literacy", "Investment club", "Stock analysis"],
      instagram: "@fcfinance",
      email: "fcfinance@forumindonesiamuda.org",
    },
    {
      name: "FC Music",
      category: "Seni & Budaya",
      icon: Music,
      description: "Komunitas pecinta musik dan musisi FIM",
      activities: ["Jam session", "Music performance", "Music production"],
      instagram: "@fcmusic",
      email: "fcmusic@forumindonesiamuda.org",
    },
    {
      name: "FC Photography",
      category: "Seni & Budaya",
      icon: Camera,
      description: "Komunitas pecinta fotografi dan videografi",
      activities: ["Photo walk", "Photography workshop", "Exhibition"],
      instagram: "@fcphotography",
      email: "fcphotography@forumindonesiamuda.org",
    },
    {
      name: "FC Social Enterprise",
      category: "Bisnis",
      icon: Heart,
      description: "Komunitas praktisi social enterprise dan bisnis berdampak",
      activities: ["Social business", "Impact investing", "Startup mentoring"],
      instagram: "@fcsocialenterprise",
      email: "fcsocialenterprise@forumindonesiamuda.org",
    },
  ];

  const categories = ["Semua", ...Array.from(new Set(clubs.map((c) => c.category)))];

  const filteredClubs = selectedCategory === "Semua" 
    ? clubs 
    : clubs.filter((c) => c.category === selectedCategory);

  return (
    <Layout>
      <PageHero
        title="FIM Club"
        subtitle="21 komunitas alumni FIM berdasarkan bidang minat dan keahlian"
      />

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">21</div>
              <div className="text-sm text-muted-foreground">FIM Club</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-supporting mb-1">50+</div>
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
            Daftar 21 FIM Club
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

                {/* Contact Info */}
                <div className="pt-4 border-t border-border space-y-2">
                  <a
                    href={`https://instagram.com/${club.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>{club.instagram}</span>
                  </a>
                  <a
                    href={`mailto:${club.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{club.email}</span>
                  </a>
                </div>

                {/* Info Kegiatan Button */}
                <div className="mt-4 pt-3 border-t border-border">
                  <Link to={`/blog?category=fimclub-${club.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Newspaper className="h-4 w-4" />
                      Info Kegiatan
                    </Button>
                  </Link>
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