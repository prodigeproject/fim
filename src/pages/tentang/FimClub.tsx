import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Mail, Instagram, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";


const FimClub = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clubs, isLoading } = useQuery({
    queryKey: ["public-fim-clubs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fim_clubs")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const categories = clubs 
    ? ["Semua", ...Array.from(new Set(clubs.map((club) => club.category)))]
    : ["Semua"];

  // Filter clubs by category and search query
  const filteredClubs = useMemo(() => {
    let result = clubs || [];
    
    if (selectedCategory !== "Semua") {
      result = result.filter((club) => club.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((club) => 
        club.name.toLowerCase().includes(query) ||
        club.description?.toLowerCase().includes(query) ||
        club.category.toLowerCase().includes(query) ||
        club.activities?.some((a: string) => a.toLowerCase().includes(query))
      );
    }
    
    return result;
  }, [clubs, selectedCategory, searchQuery]);

  return (
    <Layout>
      <SEO 
        title="FIM Club" 
        description="Komunitas minat dan bakat alumni Forum Indonesia Muda: Pendidikan, Teknologi, Olahraga, Politik, Lingkungan, dan lainnya. Bergabung dan berkontribusi sesuai passion Anda."
      />
      <PageHero title="FIM Club" subtitle="Komunitas minat dan bakat alumni FIM yang tersebar di berbagai bidang" />
      
      <section className="py-8 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary">{clubs?.length || 0}</div>
              <div className="text-muted-foreground">FIM Club Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary">{categories.length - 1}</div>
              <div className="text-muted-foreground">Kategori</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari FIM Club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center sm:overflow-visible">
            {categories.map((category) => (
              <button 
                key={category} 
                onClick={() => setSelectedCategory(category)} 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 min-h-[40px] ${
                  selectedCategory === category 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-foreground hover:bg-muted border border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : filteredClubs?.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club, index) => (
                <div
                  key={club.id}
                  className="bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl border border-border bg-background overflow-hidden flex items-center justify-center">
                      {club.logo_url ? (
                        <img
                          src={club.logo_url}
                          alt={`Logo ${club.name}`}
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
                    <div>
                      <h3 className="font-bold text-foreground">{club.name}</h3>
                      <span className="text-xs text-muted-foreground">{club.category}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{club.description}</p>
                  {club.activities?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-foreground mb-2">Kegiatan:</h4>
                      <div className="flex flex-wrap gap-1">
                        {club.activities.map((activity: string) => (
                          <span key={activity} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {club.instagram && (
                      <a
                        href={`https://instagram.com/${club.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="h-3 w-3" />@{club.instagram}
                      </a>
                    )}
                    {club.email && (
                      <a
                        href={`mailto:${club.email}`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="h-3 w-3" />Email
                      </a>
                    )}
                    <Link to={`/blog?category=${encodeURIComponent(club.name)}`}>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">Info Kegiatan</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada data FIM Club</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default FimClub;
