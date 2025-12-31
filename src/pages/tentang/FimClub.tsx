import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Palette, BookOpen, Gamepad2, Code, Heart, Baby, GraduationCap, UserCog, Vote, Languages, ScrollText, PersonStanding, Award, Waves, Compass, DollarSign, Leaf, Coffee, Mail, Instagram } from "lucide-react";
import { useState } from "react";

const FimClub = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const clubs = [
    { name: "Creator Community", category: "Kreativitas", icon: Palette, description: "Komunitas untuk para kreator konten dan digital creator", activities: ["Content creation", "Workshop design", "Collaboration projects"], instagram: "", email: "fccreatorcommunity@forumindonesiamuda.org" },
    { name: "Dongeng", category: "Pendidikan", icon: BookOpen, description: "Komunitas pecinta dongeng dan storytelling untuk anak-anak", activities: ["Storytelling session", "Kunjungan ke sekolah", "Buku dongeng"], instagram: "fc_dongeng", email: "fcdongeng@forumindonesiamuda.org" },
    { name: "Games", category: "Hiburan", icon: Gamepad2, description: "Komunitas gamers dan esports enthusiast", activities: ["Tournament", "Game night", "Streaming session"], instagram: "fcgamesindo", email: "fcgames@forumindonesiamuda.org" },
    { name: "IT DK Startup", category: "Teknologi", icon: Code, description: "Komunitas untuk pengembang IT, digital, dan startup enthusiast", activities: ["Hackathon", "Tech talks", "Startup mentoring"], instagram: "", email: "fcitdkstartup@forumindonesiamuda.org" },
    { name: "Liberal Arts", category: "Pendidikan", icon: BookOpen, description: "Komunitas pecinta seni liberal dan humanities", activities: ["Diskusi filsafat", "Book club", "Seminar humanities"], instagram: "liberalartsfimclub", email: "fcliberalarts@forumindonesiamuda.org" },
    { name: "Literasi", category: "Pendidikan", icon: BookOpen, description: "Komunitas untuk mengembangkan budaya literasi", activities: ["Book review", "Writing workshop", "Perpustakaan keliling"], instagram: "fcliterasi", email: "fcliterasi@forumindonesiamuda.org" },
    { name: "Mental Health", category: "Kesehatan", icon: Heart, description: "Komunitas untuk awareness kesehatan mental", activities: ["Support group", "Webinar kesehatan mental", "Kampanye awareness"], instagram: "", email: "fcmentalhealth@forumindonesiamuda.org" },
    { name: "Parenting", category: "Keluarga", icon: Baby, description: "Komunitas untuk berbagi ilmu parenting", activities: ["Parenting class", "Diskusi pengasuhan", "Family gathering"], instagram: "fimclubparenting", email: "fcparenting@forumindonesiamuda.org" },
    { name: "Pendidikan", category: "Pendidikan", icon: GraduationCap, description: "Komunitas untuk pengembangan sektor pendidikan", activities: ["Workshop guru", "Mentoring siswa", "Kampanye pendidikan"], instagram: "fc14_pendidikan", email: "fcpendidikan@forumindonesiamuda.org" },
    { name: "People & Organization Development", category: "Profesional", icon: UserCog, description: "Komunitas untuk pengembangan SDM dan organisasi", activities: ["HR workshop", "Leadership training", "Organization consulting"], instagram: "fim_pod", email: "fcpod@forumindonesiamuda.org" },
    { name: "Politics", category: "Politik", icon: Vote, description: "Komunitas untuk diskusi dan edukasi politik", activities: ["Diskusi politik", "Edukasi pemilu", "Policy analysis"], instagram: "fimclubpolitics", email: "fcpolitics@forumindonesiamuda.org" },
    { name: "Polyglot", category: "Bahasa", icon: Languages, description: "Komunitas pecinta bahasa dan penerjemahan", activities: ["Language exchange", "Translation project", "Culture sharing"], instagram: "fc5polyglot", email: "fcpolyglot@forumindonesiamuda.org" },
    { name: "Public Policy", category: "Politik", icon: ScrollText, description: "Komunitas untuk kajian kebijakan publik", activities: ["Policy brief", "Research collaboration", "Advocacy"], instagram: "", email: "fcpublicpolicy@forumindonesiamuda.org" },
    { name: "Run", category: "Olahraga", icon: PersonStanding, description: "Komunitas pelari dan running enthusiast", activities: ["Fun run", "Marathon training", "Running clinic"], instagram: "fim_run", email: "fcrun@forumindonesiamuda.org" },
    { name: "Scholarship", category: "Pendidikan", icon: Award, description: "Komunitas untuk sharing info dan mentoring beasiswa", activities: ["Scholarship mentoring", "Info beasiswa", "Essay review"], instagram: "", email: "fcscholarship@forumindonesiamuda.org" },
    { name: "Swim & Dive", category: "Olahraga", icon: Waves, description: "Komunitas pecinta renang dan menyelam", activities: ["Swimming session", "Diving trip", "Water sports"], instagram: "fc.swimdive", email: "fcswimdive@forumindonesiamuda.org" },
    { name: "Traventure", category: "Travel", icon: Compass, description: "Komunitas pecinta traveling dan adventure", activities: ["Trip bersama", "Travel sharing", "Adventure challenge"], instagram: "fctraventure", email: "fctraventure@forumindonesiamuda.org" },
    { name: "Finance Investment", category: "Finansial", icon: DollarSign, description: "Komunitas untuk edukasi keuangan dan investasi", activities: ["Investment class", "Financial planning", "Stock analysis"], instagram: "", email: "fcfinanceinvest@forumindonesiamuda.org" },
    { name: "Energi Lingkungan", category: "Lingkungan", icon: Leaf, description: "Komunitas untuk isu energi dan lingkungan", activities: ["Green campaign", "Energy talk", "Environmental action"], instagram: "fceneling", email: "fceneling@forumindonesiamuda.org" },
    { name: "Coffeinary", category: "Kuliner", icon: Coffee, description: "Komunitas pecinta kopi dan kuliner", activities: ["Coffee cupping", "Kuliner tour", "Barista class"], instagram: "fimkuliner", email: "fccoffeinary@forumindonesiamuda.org" },
    { name: "FIM Literasi", category: "Pendidikan", icon: BookOpen, description: "Komunitas literasi tingkat nasional FIM", activities: ["Gerakan literasi nasional", "Publikasi buku", "Kampanye membaca"], instagram: "fcliterasi", email: "fimliterasi@forumindonesiamuda.org" },
  ];

  const categories = ["Semua", ...Array.from(new Set(clubs.map((club) => club.category)))];
  const filteredClubs = selectedCategory === "Semua" ? clubs : clubs.filter((club) => club.category === selectedCategory);

  return (
    <Layout>
      <SEO 
        title="FIM Club" 
        description="21 komunitas minat dan bakat alumni Forum Indonesia Muda: Pendidikan, Teknologi, Olahraga, Politik, Lingkungan, dan lainnya. Bergabung dan berkontribusi sesuai passion Anda."
      />
      <PageHero title="FIM Club" subtitle="Komunitas minat dan bakat alumni FIM yang tersebar di berbagai bidang" />
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            <div className="text-center"><div className="text-3xl lg:text-4xl font-bold text-primary">{clubs.length}</div><div className="text-muted-foreground">FIM Club Aktif</div></div>
            <div className="text-center"><div className="text-3xl lg:text-4xl font-bold text-primary">{categories.length - 1}</div><div className="text-muted-foreground">Kategori</div></div>
          </div>
        </div>
      </section>
      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted border border-border"}`}>{category}</button>
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club, index) => (
              <div key={club.name} className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl"><club.icon className="h-6 w-6 text-primary" /></div>
                  <div><h3 className="font-bold text-foreground">{club.name}</h3><span className="text-xs text-muted-foreground">{club.category}</span></div>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{club.description}</p>
                <div className="mb-4"><h4 className="text-xs font-semibold text-foreground mb-2">Kegiatan:</h4><div className="flex flex-wrap gap-1">{club.activities.map((activity) => (<span key={activity} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">{activity}</span>))}</div></div>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {club.instagram && (<a href={`https://instagram.com/${club.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-3 w-3" />@{club.instagram}</a>)}
                  <a href={`mailto:${club.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><Mail className="h-3 w-3" />Email</a>
                  <Link to={`/blog?category=${encodeURIComponent(club.name)}`}><Button variant="ghost" size="sm" className="h-6 text-xs">Info Kegiatan</Button></Link>
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
