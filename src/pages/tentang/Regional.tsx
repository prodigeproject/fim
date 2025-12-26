import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Instagram, Mail, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

const Regional = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const regions = [
    // Data dari xlsx - 60 Regional
    // Sumatera
    { name: "FIM Aceh", province: "Aceh", island: "Sumatera", contact: { instagram: "@fimaceh_", email: "fimaceh@forumindonesiamuda.org" } },
    { name: "FIM Medan", province: "Sumatera Utara", island: "Sumatera", contact: { instagram: "@fimmedan", email: "fimmedan@forumindonesiamuda.org" } },
    { name: "FIM Padang", province: "Sumatera Barat", island: "Sumatera", contact: { instagram: "@fimpadang", email: "fimpadang@forumindonesiamuda.org" } },
    { name: "FIM Pekanbaru", province: "Riau", island: "Sumatera", contact: { instagram: "@fimpekanbaru", email: "fimpekanbaru@forumindonesiamuda.org" } },
    { name: "FIM Jambi", province: "Jambi", island: "Sumatera", contact: { instagram: "@fimjambi_", email: "fimjambi@forumindonesiamuda.org" } },
    { name: "FIM Palembang", province: "Sumatera Selatan", island: "Sumatera", contact: { instagram: "@fimpalembang", email: "fimpalembang@forumindonesiamuda.org" } },
    { name: "FIM Bengkulu", province: "Bengkulu", island: "Sumatera", contact: { instagram: "@fimbengkulu", email: "fimbengkulu@forumindonesiamuda.org" } },
    { name: "FIM Lampung", province: "Lampung", island: "Sumatera", contact: { instagram: "@fimlampung", email: "fimlampung@forumindonesiamuda.org" } },
    { name: "FIM Batam", province: "Kepulauan Riau", island: "Sumatera", contact: { instagram: "@fimbatam", email: "fimbatam@forumindonesiamuda.org" } },
    { name: "FIM Bangka Belitung", province: "Bangka Belitung", island: "Sumatera", contact: { instagram: "@fimbabel", email: "fimbabel@forumindonesiamuda.org" } },
    // Jawa
    { name: "FIM Jakarta Pusat", province: "DKI Jakarta", island: "Jawa", contact: { instagram: "@fimjakartapusat", email: "fimjakartapusat@forumindonesiamuda.org" } },
    { name: "FIM Jakarta Utara", province: "DKI Jakarta", island: "Jawa", contact: { instagram: "@fimjakartautara", email: "fimjakartautara@forumindonesiamuda.org" } },
    { name: "FIM Jakarta Barat", province: "DKI Jakarta", island: "Jawa", contact: { instagram: "@fimjakartabarat", email: "fimjakartabarat@forumindonesiamuda.org" } },
    { name: "FIM Jakarta Selatan", province: "DKI Jakarta", island: "Jawa", contact: { instagram: "@fimjakartaselatan", email: "fimjakartaselatan@forumindonesiamuda.org" } },
    { name: "FIM Jakarta Timur", province: "DKI Jakarta", island: "Jawa", contact: { instagram: "@fimjakartatimur", email: "fimjakartatimur@forumindonesiamuda.org" } },
    { name: "FIM Bogor", province: "Jawa Barat", island: "Jawa", contact: { instagram: "@fimbogor", email: "fimbogor@forumindonesiamuda.org" } },
    { name: "FIM Bandung", province: "Jawa Barat", island: "Jawa", contact: { instagram: "@fimbandung", email: "fimbandung@forumindonesiamuda.org" } },
    { name: "FIM Depok", province: "Jawa Barat", island: "Jawa", contact: { instagram: "@fimdepok", email: "fimdepok@forumindonesiamuda.org" } },
    { name: "FIM Bekasi", province: "Jawa Barat", island: "Jawa", contact: { instagram: "@fimbekasi", email: "fimbekasi@forumindonesiamuda.org" } },
    { name: "FIM Karawang", province: "Jawa Barat", island: "Jawa", contact: { instagram: "@fimkarawang", email: "fimkarawang@forumindonesiamuda.org" } },
    { name: "FIM Cirebon", province: "Jawa Barat", island: "Jawa", contact: { instagram: "@fimcirebon", email: "fimcirebon@forumindonesiamuda.org" } },
    { name: "FIM Tangerang", province: "Banten", island: "Jawa", contact: { instagram: "@fimtangerang", email: "fimtangerang@forumindonesiamuda.org" } },
    { name: "FIM Tangerang Selatan", province: "Banten", island: "Jawa", contact: { instagram: "@fimtangsel", email: "fimtangsel@forumindonesiamuda.org" } },
    { name: "FIM Serang", province: "Banten", island: "Jawa", contact: { instagram: "@fimserang", email: "fimserang@forumindonesiamuda.org" } },
    { name: "FIM Semarang", province: "Jawa Tengah", island: "Jawa", contact: { instagram: "@fimsemarang", email: "fimsemarang@forumindonesiamuda.org" } },
    { name: "FIM Solo", province: "Jawa Tengah", island: "Jawa", contact: { instagram: "@fimsolo", email: "fimsolo@forumindonesiamuda.org" } },
    { name: "FIM Purwokerto", province: "Jawa Tengah", island: "Jawa", contact: { instagram: "@fimpurwokerto", email: "fimpurwokerto@forumindonesiamuda.org" } },
    { name: "FIM Yogyakarta", province: "DI Yogyakarta", island: "Jawa", contact: { instagram: "@fimjogja", email: "fimjogja@forumindonesiamuda.org" } },
    { name: "FIM Surabaya", province: "Jawa Timur", island: "Jawa", contact: { instagram: "@fimsurabaya", email: "fimsurabaya@forumindonesiamuda.org" } },
    { name: "FIM Malang", province: "Jawa Timur", island: "Jawa", contact: { instagram: "@fimmalang", email: "fimmalang@forumindonesiamuda.org" } },
    { name: "FIM Jember", province: "Jawa Timur", island: "Jawa", contact: { instagram: "@fimjember", email: "fimjember@forumindonesiamuda.org" } },
    { name: "FIM Kediri", province: "Jawa Timur", island: "Jawa", contact: { instagram: "@fimkediri", email: "fimkediri@forumindonesiamuda.org" } },
    { name: "FIM Madiun", province: "Jawa Timur", island: "Jawa", contact: { instagram: "@fimmadiun", email: "fimmadiun@forumindonesiamuda.org" } },
    // Kalimantan
    { name: "FIM Pontianak", province: "Kalimantan Barat", island: "Kalimantan", contact: { instagram: "@fimpontianak", email: "fimpontianak@forumindonesiamuda.org" } },
    { name: "FIM Banjarmasin", province: "Kalimantan Selatan", island: "Kalimantan", contact: { instagram: "@fimbanjarmasin", email: "fimbanjarmasin@forumindonesiamuda.org" } },
    { name: "FIM Samarinda", province: "Kalimantan Timur", island: "Kalimantan", contact: { instagram: "@fimsamarinda", email: "fimsamarinda@forumindonesiamuda.org" } },
    { name: "FIM Palangkaraya", province: "Kalimantan Tengah", island: "Kalimantan", contact: { instagram: "@fimpalangkaraya", email: "fimpalangkaraya@forumindonesiamuda.org" } },
    { name: "FIM Balikpapan", province: "Kalimantan Timur", island: "Kalimantan", contact: { instagram: "@fimbalikpapan", email: "fimbalikpapan@forumindonesiamuda.org" } },
    { name: "FIM Tarakan", province: "Kalimantan Utara", island: "Kalimantan", contact: { instagram: "@fimtarakan", email: "fimtarakan@forumindonesiamuda.org" } },
    // Sulawesi
    { name: "FIM Makassar", province: "Sulawesi Selatan", island: "Sulawesi", contact: { instagram: "@fimmakassar", email: "fimmakassar@forumindonesiamuda.org" } },
    { name: "FIM Manado", province: "Sulawesi Utara", island: "Sulawesi", contact: { instagram: "@fimmanado", email: "fimmanado@forumindonesiamuda.org" } },
    { name: "FIM Palu", province: "Sulawesi Tengah", island: "Sulawesi", contact: { instagram: "@fimpalu", email: "fimpalu@forumindonesiamuda.org" } },
    { name: "FIM Kendari", province: "Sulawesi Tenggara", island: "Sulawesi", contact: { instagram: "@fimkendari", email: "fimkendari@forumindonesiamuda.org" } },
    { name: "FIM Gorontalo", province: "Gorontalo", island: "Sulawesi", contact: { instagram: "@fimgorontalo", email: "fimgorontalo@forumindonesiamuda.org" } },
    // Bali & Nusa Tenggara
    { name: "FIM Bali", province: "Bali", island: "Bali & Nusa Tenggara", contact: { instagram: "@fimbali", email: "fimbali@forumindonesiamuda.org" } },
    { name: "FIM Mataram", province: "Nusa Tenggara Barat", island: "Bali & Nusa Tenggara", contact: { instagram: "@fimmataram", email: "fimmataram@forumindonesiamuda.org" } },
    { name: "FIM Kupang", province: "Nusa Tenggara Timur", island: "Bali & Nusa Tenggara", contact: { instagram: "@fimkupang", email: "fimkupang@forumindonesiamuda.org" } },
    // Papua & Maluku
    { name: "FIM Jayapura", province: "Papua", island: "Papua & Maluku", contact: { instagram: "@fimjayapura", email: "fimjayapura@forumindonesiamuda.org" } },
    { name: "FIM Ambon", province: "Maluku", island: "Papua & Maluku", contact: { instagram: "@fimambon", email: "fimambon@forumindonesiamuda.org" } },
    { name: "FIM Sorong", province: "Papua Barat", island: "Papua & Maluku", contact: { instagram: "@fimsorong", email: "fimsorong@forumindonesiamuda.org" } },
    { name: "FIM Ternate", province: "Maluku Utara", island: "Papua & Maluku", contact: { instagram: "@fimternate", email: "fimternate@forumindonesiamuda.org" } },
    { name: "FIM Merauke", province: "Papua Selatan", island: "Papua & Maluku", contact: { instagram: "@fimmerauke", email: "fimmerauke@forumindonesiamuda.org" } },
    { name: "FIM Timika", province: "Papua Tengah", island: "Papua & Maluku", contact: { instagram: "@fimtimika", email: "fimtimika@forumindonesiamuda.org" } },
    { name: "FIM Manokwari", province: "Papua Barat", island: "Papua & Maluku", contact: { instagram: "@fimmanokwari", email: "fimmanokwari@forumindonesiamuda.org" } },
    // Diaspora
    { name: "FIM Australia", province: "Australia", island: "Diaspora", contact: { instagram: "@fimaustralia", email: "fimaustralia@forumindonesiamuda.org" } },
    { name: "FIM Jerman", province: "Jerman", island: "Diaspora", contact: { instagram: "@fimjerman", email: "fimjerman@forumindonesiamuda.org" } },
    { name: "FIM Jepang", province: "Jepang", island: "Diaspora", contact: { instagram: "@fimjepang", email: "fimjepang@forumindonesiamuda.org" } },
    { name: "FIM Korea", province: "Korea Selatan", island: "Diaspora", contact: { instagram: "@fimkorea", email: "fimkorea@forumindonesiamuda.org" } },
    { name: "FIM Malaysia", province: "Malaysia", island: "Diaspora", contact: { instagram: "@fimmalaysia", email: "fimmalaysia@forumindonesiamuda.org" } },
    { name: "FIM Belanda", province: "Belanda", island: "Diaspora", contact: { instagram: "@fimbelanda", email: "fimbelanda@forumindonesiamuda.org" } },
  ];

  const islands = ["Semua", "Sumatera", "Jawa", "Kalimantan", "Sulawesi", "Bali & Nusa Tenggara", "Papua & Maluku", "Diaspora"];
  const [selectedIsland, setSelectedIsland] = useState("Semua");

  const filteredRegions = regions.filter((region) => {
    const matchesSearch = region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIsland = selectedIsland === "Semua" || region.island === selectedIsland;
    return matchesSearch && matchesIsland;
  });

  return (
    <Layout>
      <PageHero
        title="Regional FIM"
        subtitle="Jaringan pemuda dari Sabang sampai Merauke, tersebar di 60 regional + diaspora di seluruh Indonesia dan dunia"
      />

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">60+</div>
              <div className="text-sm text-muted-foreground">Regional + Diaspora</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-supporting mb-1">34</div>
              <div className="text-sm text-muted-foreground">Provinsi + Luar Negeri</div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/5 to-supporting/5 rounded-2xl p-8 lg:p-12 text-center">
            <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Peta Interaktif Regional FIM</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Peta interaktif dengan lokasi semua regional FIM di Indonesia akan segera hadir.
            </p>
          </div>
        </div>
      </section>

      {/* Regional List */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-8">
            Daftar Regional FIM
          </h2>

          {/* Search & Filter */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Cari regional atau provinsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {islands.map((island) => (
                  <button
                    key={island}
                    onClick={() => setSelectedIsland(island)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedIsland === island
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {island}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {filteredRegions.map((region, index) => (
              <div
                key={region.name}
                className="bg-card rounded-xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                {/* Logo Placeholder */}
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="font-bold text-foreground mb-1">{region.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{region.province}</p>
                
                {/* Contact Info */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <a
                    href={`https://instagram.com/${region.contact.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    <span>{region.contact.instagram}</span>
                  </a>
                  <a
                    href={`mailto:${region.contact.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{region.contact.email}</span>
                  </a>
                </div>

                {/* Info Kegiatan Button */}
                <div className="mt-4 pt-3 border-t border-border">
                  <Link to={`/blog?category=regional-${region.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Newspaper className="h-4 w-4" />
                      Info Kegiatan
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredRegions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Tidak ada regional yang ditemukan.</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Regional;