import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Instagram, Mail, Phone, Globe } from "lucide-react";

const Regional = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const regions = [
    // Sumatera
    { name: "FIM Aceh", province: "Aceh", island: "Sumatera", founded: 2008, contact: { instagram: "@fim.aceh", email: "fim.aceh@fim.or.id" } },
    { name: "FIM Medan", province: "Sumatera Utara", island: "Sumatera", founded: 2005, contact: { instagram: "@fim.medan", email: "fim.medan@fim.or.id" } },
    { name: "FIM Padang", province: "Sumatera Barat", island: "Sumatera", founded: 2007, contact: { instagram: "@fim.padang", email: "fim.padang@fim.or.id" } },
    { name: "FIM Pekanbaru", province: "Riau", island: "Sumatera", founded: 2009, contact: { instagram: "@fim.pekanbaru", email: "fim.pekanbaru@fim.or.id" } },
    { name: "FIM Jambi", province: "Jambi", island: "Sumatera", founded: 2010, contact: { instagram: "@fim.jambi", email: "fim.jambi@fim.or.id" } },
    { name: "FIM Palembang", province: "Sumatera Selatan", island: "Sumatera", founded: 2006, contact: { instagram: "@fim.palembang", email: "fim.palembang@fim.or.id" } },
    { name: "FIM Bengkulu", province: "Bengkulu", island: "Sumatera", founded: 2012, contact: { instagram: "@fim.bengkulu", email: "fim.bengkulu@fim.or.id" } },
    { name: "FIM Lampung", province: "Lampung", island: "Sumatera", founded: 2007, contact: { instagram: "@fim.lampung", email: "fim.lampung@fim.or.id" } },
    { name: "FIM Batam", province: "Kepulauan Riau", island: "Sumatera", founded: 2011, contact: { instagram: "@fim.batam", email: "fim.batam@fim.or.id" } },
    // Jawa
    { name: "FIM Jakarta", province: "DKI Jakarta", island: "Jawa", founded: 2003, contact: { instagram: "@fim.jakarta", email: "fim.jakarta@fim.or.id" } },
    { name: "FIM Bogor", province: "Jawa Barat", island: "Jawa", founded: 2005, contact: { instagram: "@fim.bogor", email: "fim.bogor@fim.or.id" } },
    { name: "FIM Bandung", province: "Jawa Barat", island: "Jawa", founded: 2004, contact: { instagram: "@fim.bandung", email: "fim.bandung@fim.or.id" } },
    { name: "FIM Semarang", province: "Jawa Tengah", island: "Jawa", founded: 2005, contact: { instagram: "@fim.semarang", email: "fim.semarang@fim.or.id" } },
    { name: "FIM Yogyakarta", province: "DI Yogyakarta", island: "Jawa", founded: 2004, contact: { instagram: "@fim.jogja", email: "fim.jogja@fim.or.id" } },
    { name: "FIM Solo", province: "Jawa Tengah", island: "Jawa", founded: 2006, contact: { instagram: "@fim.solo", email: "fim.solo@fim.or.id" } },
    { name: "FIM Surabaya", province: "Jawa Timur", island: "Jawa", founded: 2004, contact: { instagram: "@fim.surabaya", email: "fim.surabaya@fim.or.id" } },
    { name: "FIM Malang", province: "Jawa Timur", island: "Jawa", founded: 2006, contact: { instagram: "@fim.malang", email: "fim.malang@fim.or.id" } },
    { name: "FIM Depok", province: "Jawa Barat", island: "Jawa", founded: 2007, contact: { instagram: "@fim.depok", email: "fim.depok@fim.or.id" } },
    { name: "FIM Tangerang", province: "Banten", island: "Jawa", founded: 2008, contact: { instagram: "@fim.tangerang", email: "fim.tangerang@fim.or.id" } },
    { name: "FIM Bekasi", province: "Jawa Barat", island: "Jawa", founded: 2009, contact: { instagram: "@fim.bekasi", email: "fim.bekasi@fim.or.id" } },
    // Kalimantan
    { name: "FIM Pontianak", province: "Kalimantan Barat", island: "Kalimantan", founded: 2010, contact: { instagram: "@fim.pontianak", email: "fim.pontianak@fim.or.id" } },
    { name: "FIM Banjarmasin", province: "Kalimantan Selatan", island: "Kalimantan", founded: 2009, contact: { instagram: "@fim.banjarmasin", email: "fim.banjarmasin@fim.or.id" } },
    { name: "FIM Samarinda", province: "Kalimantan Timur", island: "Kalimantan", founded: 2008, contact: { instagram: "@fim.samarinda", email: "fim.samarinda@fim.or.id" } },
    { name: "FIM Palangkaraya", province: "Kalimantan Tengah", island: "Kalimantan", founded: 2012, contact: { instagram: "@fim.palangkaraya", email: "fim.palangkaraya@fim.or.id" } },
    { name: "FIM Balikpapan", province: "Kalimantan Timur", island: "Kalimantan", founded: 2010, contact: { instagram: "@fim.balikpapan", email: "fim.balikpapan@fim.or.id" } },
    // Sulawesi
    { name: "FIM Makassar", province: "Sulawesi Selatan", island: "Sulawesi", founded: 2006, contact: { instagram: "@fim.makassar", email: "fim.makassar@fim.or.id" } },
    { name: "FIM Manado", province: "Sulawesi Utara", island: "Sulawesi", founded: 2008, contact: { instagram: "@fim.manado", email: "fim.manado@fim.or.id" } },
    { name: "FIM Palu", province: "Sulawesi Tengah", island: "Sulawesi", founded: 2011, contact: { instagram: "@fim.palu", email: "fim.palu@fim.or.id" } },
    { name: "FIM Kendari", province: "Sulawesi Tenggara", island: "Sulawesi", founded: 2013, contact: { instagram: "@fim.kendari", email: "fim.kendari@fim.or.id" } },
    // Bali & Nusa Tenggara
    { name: "FIM Bali", province: "Bali", island: "Bali & Nusa Tenggara", founded: 2006, contact: { instagram: "@fim.bali", email: "fim.bali@fim.or.id" } },
    { name: "FIM Mataram", province: "Nusa Tenggara Barat", island: "Bali & Nusa Tenggara", founded: 2010, contact: { instagram: "@fim.mataram", email: "fim.mataram@fim.or.id" } },
    { name: "FIM Kupang", province: "Nusa Tenggara Timur", island: "Bali & Nusa Tenggara", founded: 2012, contact: { instagram: "@fim.kupang", email: "fim.kupang@fim.or.id" } },
    // Papua & Maluku
    { name: "FIM Jayapura", province: "Papua", island: "Papua & Maluku", founded: 2015, contact: { instagram: "@fim.jayapura", email: "fim.jayapura@fim.or.id" } },
    { name: "FIM Ambon", province: "Maluku", island: "Papua & Maluku", founded: 2013, contact: { instagram: "@fim.ambon", email: "fim.ambon@fim.or.id" } },
    { name: "FIM Sorong", province: "Papua Barat", island: "Papua & Maluku", founded: 2017, contact: { instagram: "@fim.sorong", email: "fim.sorong@fim.or.id" } },
    // Diaspora
    { name: "FIM Diaspora", province: "Luar Negeri", island: "Diaspora", founded: 2018, contact: { instagram: "@fim.diaspora", email: "fim.diaspora@fim.or.id" } },
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
        subtitle="Jaringan pemuda dari Sabang sampai Merauke, tersebar di 60 regional + 1 diaspora di seluruh Indonesia"
      />

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">60 + 1</div>
              <div className="text-sm text-muted-foreground">Regional + Diaspora</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-supporting mb-1">34</div>
              <div className="text-sm text-muted-foreground">Provinsi</div>
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
