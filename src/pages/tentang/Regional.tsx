import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, Mail, Instagram } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Regional = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIsland, setSelectedIsland] = useState<string>("Semua");

  const { data: regions, isLoading } = useQuery({
    queryKey: ["public-fim-regionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_regionals")
        .select("*")
        .eq("is_active", true)
        .order("island", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const islands = ["Semua", "Bali & Nusa Tenggara", "Jawa", "Kalimantan", "Papua", "Sulawesi", "Sumatra"];

  const filteredRegions = regions?.filter((region) => {
    const matchesSearch = 
      region.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      region.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIsland = selectedIsland === "Semua" || region.island === selectedIsland;
    return matchesSearch && matchesIsland;
  });

  const uniqueProvinces = regions ? new Set(regions.map((r) => r.province)).size : 0;

  return (
    <Layout>
      <SEO 
        title="Regional FIM" 
        description="Regional Forum Indonesia Muda tersebar di seluruh Indonesia: Sumatra, Jawa, Kalimantan, Sulawesi, Bali & Nusa Tenggara, dan Papua. Temukan regional terdekat Anda."
      />
      <PageHero title="Regional FIM" subtitle="Jaringan alumni FIM yang tersebar di seluruh Indonesia" />
      
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary">{regions?.length || 0}</div>
              <div className="text-muted-foreground">Regional</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary">{uniqueProvinces}</div>
              <div className="text-muted-foreground">Provinsi</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Cari regional atau provinsi..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10" 
              />
            </div>
          </div>
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible">
            {islands.map((island) => (
              <button 
                key={island} 
                onClick={() => setSelectedIsland(island)} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-h-[40px] ${
                  selectedIsland === island 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-foreground hover:bg-muted border border-border"
                }`}
              >
                {island}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : filteredRegions?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRegions.map((region, index) => (
                <div 
                  key={region.id} 
                  className="bg-card rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in" 
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg border border-border bg-background overflow-hidden flex items-center justify-center">
                      {region.logo_url ? (
                        <img
                          src={region.logo_url}
                          alt={`Logo ${region.name}`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">FIM</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{region.name}</h3>
                      <p className="text-xs text-muted-foreground">{region.province}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {region.instagram && (
                          <a 
                            href={`https://instagram.com/${region.instagram}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Instagram className="h-3 w-3" />@{region.instagram}
                          </a>
                        )}
                        {region.email && (
                          <a 
                            href={`mailto:${region.email}`} 
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="h-3 w-3" />Email
                          </a>
                        )}
                      </div>
                      <Link to={`/blog?category=${encodeURIComponent(region.name)}`} className="mt-2 block">
                        <Button variant="ghost" size="sm" className="h-6 text-xs px-0">Info Kegiatan →</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || selectedIsland !== "Semua" 
                  ? "Tidak ada regional yang ditemukan." 
                  : "Belum ada data regional."
                }
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Regional;
