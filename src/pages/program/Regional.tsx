import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Calendar } from "lucide-react";

const Regional = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const regions = [
    // Sumatera
    { name: "FIM Aceh", province: "Aceh", island: "Sumatera", members: 120, founded: 2008 },
    { name: "FIM Medan", province: "Sumatera Utara", island: "Sumatera", members: 200, founded: 2005 },
    { name: "FIM Padang", province: "Sumatera Barat", island: "Sumatera", members: 150, founded: 2007 },
    { name: "FIM Pekanbaru", province: "Riau", island: "Sumatera", members: 130, founded: 2009 },
    { name: "FIM Jambi", province: "Jambi", island: "Sumatera", members: 100, founded: 2010 },
    { name: "FIM Palembang", province: "Sumatera Selatan", island: "Sumatera", members: 180, founded: 2006 },
    { name: "FIM Bengkulu", province: "Bengkulu", island: "Sumatera", members: 80, founded: 2012 },
    { name: "FIM Lampung", province: "Lampung", island: "Sumatera", members: 160, founded: 2007 },
    // Jawa
    { name: "FIM Jakarta", province: "DKI Jakarta", island: "Jawa", members: 500, founded: 2003 },
    { name: "FIM Bogor", province: "Jawa Barat", island: "Jawa", members: 200, founded: 2005 },
    { name: "FIM Bandung", province: "Jawa Barat", island: "Jawa", members: 350, founded: 2004 },
    { name: "FIM Semarang", province: "Jawa Tengah", island: "Jawa", members: 280, founded: 2005 },
    { name: "FIM Yogyakarta", province: "DI Yogyakarta", island: "Jawa", members: 320, founded: 2004 },
    { name: "FIM Solo", province: "Jawa Tengah", island: "Jawa", members: 220, founded: 2006 },
    { name: "FIM Surabaya", province: "Jawa Timur", island: "Jawa", members: 400, founded: 2004 },
    { name: "FIM Malang", province: "Jawa Timur", island: "Jawa", members: 250, founded: 2006 },
    // Kalimantan
    { name: "FIM Pontianak", province: "Kalimantan Barat", island: "Kalimantan", members: 120, founded: 2010 },
    { name: "FIM Banjarmasin", province: "Kalimantan Selatan", island: "Kalimantan", members: 140, founded: 2009 },
    { name: "FIM Samarinda", province: "Kalimantan Timur", island: "Kalimantan", members: 150, founded: 2008 },
    { name: "FIM Palangkaraya", province: "Kalimantan Tengah", island: "Kalimantan", members: 90, founded: 2012 },
    { name: "FIM Balikpapan", province: "Kalimantan Timur", island: "Kalimantan", members: 130, founded: 2010 },
    // Sulawesi
    { name: "FIM Makassar", province: "Sulawesi Selatan", island: "Sulawesi", members: 250, founded: 2006 },
    { name: "FIM Manado", province: "Sulawesi Utara", island: "Sulawesi", members: 140, founded: 2008 },
    { name: "FIM Palu", province: "Sulawesi Tengah", island: "Sulawesi", members: 100, founded: 2011 },
    { name: "FIM Kendari", province: "Sulawesi Tenggara", island: "Sulawesi", members: 80, founded: 2013 },
    // Bali & Nusa Tenggara
    { name: "FIM Bali", province: "Bali", island: "Bali & Nusa Tenggara", members: 200, founded: 2006 },
    { name: "FIM Mataram", province: "Nusa Tenggara Barat", island: "Bali & Nusa Tenggara", members: 120, founded: 2010 },
    { name: "FIM Kupang", province: "Nusa Tenggara Timur", island: "Bali & Nusa Tenggara", members: 100, founded: 2012 },
    // Papua & Maluku
    { name: "FIM Jayapura", province: "Papua", island: "Papua & Maluku", members: 80, founded: 2015 },
    { name: "FIM Ambon", province: "Maluku", island: "Papua & Maluku", members: 90, founded: 2013 },
    { name: "FIM Sorong", province: "Papua Barat", island: "Papua & Maluku", members: 60, founded: 2017 },
  ];

  const islands = ["Semua", "Sumatera", "Jawa", "Kalimantan", "Sulawesi", "Bali & Nusa Tenggara", "Papua & Maluku"];
  const [selectedIsland, setSelectedIsland] = useState("Semua");

  const filteredRegions = regions.filter((region) => {
    const matchesSearch = region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIsland = selectedIsland === "Semua" || region.island === selectedIsland;
    return matchesSearch && matchesIsland;
  });

  const totalMembers = regions.reduce((sum, r) => sum + r.members, 0);

  return (
    <Layout>
      <PageHero
        title="Regional FIM"
        subtitle="Jaringan pemuda dari Sabang sampai Merauke, tersebar di 60+ regional di seluruh Indonesia"
      />

      {/* Stats */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-1">60+</div>
              <div className="text-sm text-muted-foreground">Regional</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-supporting mb-1">34</div>
              <div className="text-sm text-muted-foreground">Provinsi</div>
            </div>
            <div className="bg-card rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl lg:text-4xl font-bold text-accent-foreground mb-1">{totalMembers.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Alumni Aktif</div>
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
                <h3 className="font-bold text-foreground mb-2">{region.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{region.province}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{region.members}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{region.founded}</span>
                  </div>
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
