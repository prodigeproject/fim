import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { MapPin, Search, Mail, Instagram } from "lucide-react";
import { useState } from "react";

const Regional = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<string>("Semua");

  const regions = [
    { name: "FIM Denpasar", province: "Bali", island: "Bali & Nusa Tenggara", instagram: "fimdenpasar", email: "fimdenpasar@forumindonesiamuda.org" },
    { name: "FIM Rote", province: "Nusa Tenggara Timur", island: "Bali & Nusa Tenggara", instagram: "fimrote", email: "fimrote@forumindonesiamuda.org" },
    { name: "FIM Kupang", province: "Nusa Tenggara Timur", island: "Bali & Nusa Tenggara", instagram: "", email: "fimkupang@forumindonesiamuda.org" },
    { name: "FIM Ambon", province: "Maluku", island: "Bali & Nusa Tenggara", instagram: "fimambon", email: "fimambon@forumindonesiamuda.org" },
    { name: "FIM Sumbawa", province: "Nusa Tenggara Barat", island: "Bali & Nusa Tenggara", instagram: "", email: "fimsumbawa@forumindonesiamuda.org" },
    { name: "FIM Mataram", province: "Nusa Tenggara Barat", island: "Bali & Nusa Tenggara", instagram: "", email: "fimmataram@forumindonesiamuda.org" },
    { name: "FIM Bandung", province: "Jawa Barat", island: "Jawa", instagram: "fimbandung", email: "fimbandung@forumindonesiamuda.org" },
    { name: "FIM Banten", province: "Banten", island: "Jawa", instagram: "", email: "fimbanten@forumindonesiamuda.org" },
    { name: "FIM Bekasi", province: "Jawa Barat", island: "Jawa", instagram: "fim_bekasi", email: "fimbekasi@forumindonesiamuda.org" },
    { name: "FIM Bogor", province: "Jawa Barat", island: "Jawa", instagram: "fimbogor", email: "fimbogor@forumindonesiamuda.org" },
    { name: "FIM Cilegon Serang", province: "Banten", island: "Jawa", instagram: "", email: "fimcilegonserang@forumindonesiamuda.org" },
    { name: "FIM Cirebon", province: "Jawa Barat", island: "Jawa", instagram: "fimcirebon", email: "fimcirebon@forumindonesiamuda.org" },
    { name: "FIM Depok", province: "Jawa Barat", island: "Jawa", instagram: "", email: "fimdepok@forumindonesiamuda.org" },
    { name: "FIM Jakarta", province: "DKI Jakarta", island: "Jawa", instagram: "fimjakarta", email: "fimjakarta@forumindonesiamuda.org" },
    { name: "FIM Malang", province: "Jawa Timur", island: "Jawa", instagram: "fimmalang", email: "fimmalang@forumindonesiamuda.org" },
    { name: "FIM Probolinggo", province: "Jawa Timur", island: "Jawa", instagram: "", email: "fimprobolinggo@forumindonesiamuda.org" },
    { name: "FIM Purwokerto", province: "Jawa Tengah", island: "Jawa", instagram: "fimpurwokerto", email: "fimpurwokerto@forumindonesiamuda.org" },
    { name: "FIM Semarang", province: "Jawa Tengah", island: "Jawa", instagram: "fimsemarang", email: "fimsemarang@forumindonesiamuda.org" },
    { name: "FIM Sidoarjo", province: "Jawa Timur", island: "Jawa", instagram: "", email: "fimsidoarjo@forumindonesiamuda.org" },
    { name: "FIM Solo Raya", province: "Jawa Tengah", island: "Jawa", instagram: "fimsoloraya", email: "fimsoloraya@forumindonesiamuda.org" },
    { name: "FIM Sukabumi", province: "Jawa Barat", island: "Jawa", instagram: "", email: "fimsukabumi@forumindonesiamuda.org" },
    { name: "FIM Surabaya", province: "Jawa Timur", island: "Jawa", instagram: "fimsurabaya", email: "fimsurabaya@forumindonesiamuda.org" },
    { name: "FIM Tangerang", province: "Banten", island: "Jawa", instagram: "fimtangerang", email: "fimtangerang@forumindonesiamuda.org" },
    { name: "FIM Madura", province: "Jawa Timur", island: "Jawa", instagram: "", email: "fimmadura@forumindonesiamuda.org" },
    { name: "FIM Yogyakarta", province: "DI Yogyakarta", island: "Jawa", instagram: "fimyogyakarta", email: "fimyogyakarta@forumindonesiamuda.org" },
    { name: "FIM Balikpapan", province: "Kalimantan Timur", island: "Kalimantan", instagram: "fimbalikpapan", email: "fimbalikpapan@forumindonesiamuda.org" },
    { name: "FIM Banjarbaru", province: "Kalimantan Selatan", island: "Kalimantan", instagram: "", email: "fimbanjarbaru@forumindonesiamuda.org" },
    { name: "FIM Banjarmasin", province: "Kalimantan Selatan", island: "Kalimantan", instagram: "fimbanjarmasin", email: "fimbanjarmasin@forumindonesiamuda.org" },
    { name: "FIM Nunukan", province: "Kalimantan Utara", island: "Kalimantan", instagram: "", email: "fimnunukan@forumindonesiamuda.org" },
    { name: "FIM Palangkaraya", province: "Kalimantan Tengah", island: "Kalimantan", instagram: "", email: "fimpalangkaraya@forumindonesiamuda.org" },
    { name: "FIM Pontianak", province: "Kalimantan Barat", island: "Kalimantan", instagram: "fimpontianak", email: "fimpontianak@forumindonesiamuda.org" },
    { name: "FIM Samarinda", province: "Kalimantan Timur", island: "Kalimantan", instagram: "fimsamarinda", email: "fimsamarinda@forumindonesiamuda.org" },
    { name: "FIM Berau", province: "Kalimantan Timur", island: "Kalimantan", instagram: "", email: "fimberau@forumindonesiamuda.org" },
    { name: "FIM Tarakan", province: "Kalimantan Utara", island: "Kalimantan", instagram: "fimtarakan", email: "fimtarakan@forumindonesiamuda.org" },
    { name: "FIM Jayapura", province: "Papua", island: "Papua", instagram: "", email: "fimjayapura@forumindonesiamuda.org" },
    { name: "FIM Manokwari", province: "Papua Barat", island: "Papua", instagram: "", email: "fimmanokwari@forumindonesiamuda.org" },
    { name: "FIM Atambua", province: "Nusa Tenggara Timur", island: "Papua", instagram: "", email: "fimatambua@forumindonesiamuda.org" },
    { name: "FIM Timor Tengah Utara", province: "Nusa Tenggara Timur", island: "Papua", instagram: "", email: "fimtimortengahutara@forumindonesiamuda.org" },
    { name: "FIM Gorontalo", province: "Gorontalo", island: "Sulawesi", instagram: "", email: "fimgorontalo@forumindonesiamuda.org" },
    { name: "FIM Kendari", province: "Sulawesi Tenggara", island: "Sulawesi", instagram: "", email: "fimkendari@forumindonesiamuda.org" },
    { name: "FIM Majene", province: "Sulawesi Barat", island: "Sulawesi", instagram: "", email: "fimmajene@forumindonesiamuda.org" },
    { name: "FIM Palu", province: "Sulawesi Tengah", island: "Sulawesi", instagram: "fimpalu", email: "fimpalu@forumindonesiamuda.org" },
    { name: "FIM Makassar", province: "Sulawesi Selatan", island: "Sulawesi", instagram: "fimmakassar", email: "fimmakassar@forumindonesiamuda.org" },
    { name: "FIM Manado", province: "Sulawesi Utara", island: "Sulawesi", instagram: "fimmanado", email: "fimmanado@forumindonesiamuda.org" },
    { name: "FIM Bandar Lampung", province: "Lampung", island: "Sumatra", instagram: "fimbandarlampung", email: "fimbandarlampung@forumindonesiamuda.org" },
    { name: "FIM Batam", province: "Kepulauan Riau", island: "Sumatra", instagram: "fimbatam", email: "fimbatam@forumindonesiamuda.org" },
    { name: "FIM Bengkulu", province: "Bengkulu", island: "Sumatra", instagram: "", email: "fimbengkulu@forumindonesiamuda.org" },
    { name: "FIM Bukittinggi", province: "Sumatera Barat", island: "Sumatra", instagram: "", email: "fimbukittinggi@forumindonesiamuda.org" },
    { name: "FIM Deli Serdang", province: "Sumatera Utara", island: "Sumatra", instagram: "", email: "fimdeliserdang@forumindonesiamuda.org" },
    { name: "FIM Jambi", province: "Jambi", island: "Sumatra", instagram: "fimjambi", email: "fimjambi@forumindonesiamuda.org" },
    { name: "FIM Medan", province: "Sumatera Utara", island: "Sumatra", instagram: "fimmedan", email: "fimmedan@forumindonesiamuda.org" },
    { name: "FIM Padang", province: "Sumatera Barat", island: "Sumatra", instagram: "fimpadang", email: "fimpadang@forumindonesiamuda.org" },
    { name: "FIM Palembang", province: "Sumatera Selatan", island: "Sumatra", instagram: "fimpalembang", email: "fimpalembang@forumindonesiamuda.org" },
    { name: "FIM Pekanbaru", province: "Riau", island: "Sumatra", instagram: "fimpekanbaru", email: "fimpekanbaru@forumindonesiamuda.org" },
    { name: "FIM Banda Aceh", province: "Aceh", island: "Sumatra", instagram: "fimbandaaceh", email: "fimbandaaceh@forumindonesiamuda.org" },
    { name: "FIM Lhokseumawe", province: "Aceh", island: "Sumatra", instagram: "", email: "fimlhokseumawe@forumindonesiamuda.org" },
    { name: "FIM Aceh Selatan", province: "Aceh", island: "Sumatra", instagram: "", email: "fimacehselatan@forumindonesiamuda.org" },
    { name: "FIM Baturaja", province: "Sumatera Selatan", island: "Sumatra", instagram: "", email: "fimbaturaja@forumindonesiamuda.org" },
    { name: "FIM Pangkal Pinang", province: "Bangka Belitung", island: "Sumatra", instagram: "", email: "fimpangkalpinang@forumindonesiamuda.org" },
    { name: "FIM Lampung Selatan", province: "Lampung", island: "Sumatra", instagram: "", email: "fimlampungselatan@forumindonesiamuda.org" },
  ];

  const islands = ["Semua", "Bali & Nusa Tenggara", "Jawa", "Kalimantan", "Papua", "Sulawesi", "Sumatra"];
  const filteredRegions = regions.filter((region) => {
    const matchesSearch = region.name.toLowerCase().includes(searchQuery.toLowerCase()) || region.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIsland = selectedIsland === "Semua" || region.island === selectedIsland;
    return matchesSearch && matchesIsland;
  });

  return (
    <Layout>
      <SEO 
        title="Regional FIM" 
        description="60 regional Forum Indonesia Muda tersebar di seluruh Indonesia: Sumatra, Jawa, Kalimantan, Sulawesi, Bali & Nusa Tenggara, dan Papua. Temukan regional terdekat Anda."
      />
      <PageHero title="Regional FIM" subtitle="Jaringan alumni FIM yang tersebar di seluruh Indonesia" />
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            <div className="text-center"><div className="text-3xl lg:text-4xl font-bold text-primary">{regions.length}</div><div className="text-muted-foreground">Regional</div></div>
            <div className="text-center"><div className="text-3xl lg:text-4xl font-bold text-primary">{new Set(regions.map((r) => r.province)).size}</div><div className="text-muted-foreground">Provinsi</div></div>
          </div>
        </div>
      </section>
      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto mb-6">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="text" placeholder="Cari regional atau provinsi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {islands.map((island) => (<button key={island} onClick={() => setSelectedIsland(island)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedIsland === island ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted border border-border"}`}>{island}</button>))}
          </div>
        </div>
      </section>
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          {filteredRegions.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRegions.map((region, index) => (
                <div key={region.name} className="bg-card rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.03}s` }}>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><MapPin className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{region.name}</h3>
                      <p className="text-xs text-muted-foreground">{region.province}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {region.instagram && (<a href={`https://instagram.com/${region.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><Instagram className="h-3 w-3" />@{region.instagram}</a>)}
                        <a href={`mailto:${region.email}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"><Mail className="h-3 w-3" />Email</a>
                      </div>
                      <Link to={`/blog?category=${encodeURIComponent(region.name)}`} className="mt-2 block"><Button variant="ghost" size="sm" className="h-6 text-xs px-0">Info Kegiatan →</Button></Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (<div className="text-center py-12"><p className="text-muted-foreground">Tidak ada regional yang ditemukan.</p></div>)}
        </div>
      </section>
    </Layout>
  );
};

export default Regional;
