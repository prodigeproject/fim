import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import SocialShare from "@/components/SocialShare";
import { Calendar, User, ArrowRight, Pin, Search, X, Filter } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogGridSkeleton } from "@/components/skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";

const categories = ["Semua", "Pengumuman", "Prestasi", "Kegiatan", "Sosial", "Opini", "Tips"];

const categoryLabels: Record<string, string> = {
  pengumuman: "Pengumuman",
  prestasi: "Prestasi",
  kegiatan: "Kegiatan",
  sosial: "Sosial",
  opini: "Opini",
  tips: "Tips",
};

const Blog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch articles from database
  const { data: dbArticles, isLoading, error } = useQuery({
    queryKey: ['articles-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          id,
          slug,
          title,
          excerpt,
          content,
          category,
          featured_image_url,
          published_at,
          is_pinned,
          tags,
          author_id
        `)
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch author profiles separately
  const { data: profiles } = useQuery({
    queryKey: ['article-profiles', dbArticles?.map(a => a.author_id)],
    queryFn: async () => {
      if (!dbArticles?.length) return {};
      const authorIds = [...new Set(dbArticles.map(a => a.author_id))];
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', authorIds);
      
      const profileMap: Record<string, { username: string; full_name: string | null }> = {};
      data?.forEach(p => {
        profileMap[p.id] = { username: p.username, full_name: p.full_name };
      });
      return profileMap;
    },
    enabled: !!dbArticles?.length,
  });

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const searchFromUrl = searchParams.get("q");
    const tagsFromUrl = searchParams.get("tags");
    
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
      setDebouncedSearch(searchFromUrl);
    }
    if (tagsFromUrl) {
      setSelectedTags(tagsFromUrl.split(","));
    }
  }, []);

  // Extract all unique tags from articles
  const allTags = useMemo(() => {
    if (!dbArticles) return [];
    const tagSet = new Set<string>();
    dbArticles.forEach(article => {
      if (article.tags && Array.isArray(article.tags)) {
        article.tags.forEach((tag: string) => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [dbArticles]);

  // Map articles with author info
  const posts = useMemo(() => {
    if (!dbArticles?.length) return [];
    return dbArticles.map(article => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      category: article.category,
      author_name: profiles?.[article.author_id]?.full_name || 
                   profiles?.[article.author_id]?.username || 
                   'Tim FIM',
      published_at: article.published_at,
      featured_image_url: article.featured_image_url,
      is_pinned: article.is_pinned,
      tags: article.tags || [],
    }));
  }, [dbArticles, profiles]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateSearchParams({ category: category === "Semua" ? null : category });
  };

  // Handle tag toggle
  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    updateSearchParams({ tags: newTags.length > 0 ? newTags.join(",") : null });
  };

  // Update search params
  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateSearchParams({ q: value || null });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory("Semua");
    setSearchQuery("");
    setDebouncedSearch("");
    setSelectedTags([]);
    setDateRange(undefined);
    setSearchParams({});
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Category filter
    if (selectedCategory !== "Semua") {
      const categoryKey = selectedCategory.toLowerCase();
      result = result.filter(post => post.category === categoryKey);
    }

    // Search filter (full-text search on title and content)
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      result = result.filter(post =>
        selectedTags.some(tag => post.tags.includes(tag))
      );
    }

    // Date range filter
    if (dateRange?.from) {
      result = result.filter(post => {
        if (!post.published_at) return false;
        const pubDate = new Date(post.published_at);
        if (dateRange.from && pubDate < dateRange.from) return false;
        if (dateRange.to && pubDate > dateRange.to) return false;
        return true;
      });
    }

    return result;
  }, [posts, selectedCategory, debouncedSearch, selectedTags, dateRange]);

  const hasActiveFilters = selectedCategory !== "Semua" || debouncedSearch || selectedTags.length > 0 || dateRange?.from;

  return (
    <Layout>
      <SEO 
        title="Blog & Berita" 
        description="Informasi terbaru seputar kegiatan, prestasi, dan inspirasi dari Forum Indonesia Muda. Berita, artikel, dan update dari komunitas FIM."
      />
      <PageHero
        title="Blog & Berita FIM"
        subtitle="Informasi terbaru seputar kegiatan, prestasi, dan inspirasi dari Forum Indonesia Muda"
      />

      {/* Blog Grid */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg rounded-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => handleSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Sembunyikan Filter" : "Filter Lanjutan"}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="max-w-4xl mx-auto mb-8 p-4 bg-card rounded-xl border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tags Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Filter Tags</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.length > 0 ? (
                      allTags.map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          #{tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Tidak ada tags</p>
                    )}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Rentang Tanggal</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "d MMM yyyy", { locale: id })} -{" "}
                              {format(dateRange.to, "d MMM yyyy", { locale: id })}
                            </>
                          ) : (
                            format(dateRange.from, "d MMM yyyy", { locale: id })
                          )
                        ) : (
                          "Pilih tanggal"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Hapus Semua Filter
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Active filter indicator */}
          {hasActiveFilters && (
            <div className="text-center mb-8">
              <p className="text-muted-foreground text-sm">
                Menampilkan {filteredPosts.length} dari {posts.length} artikel
                {selectedCategory !== "Semua" && (
                  <> dalam kategori <span className="font-semibold text-foreground">{selectedCategory}</span></>
                )}
                {debouncedSearch && (
                  <> untuk "<span className="font-semibold text-foreground">{debouncedSearch}</span>"</>
                )}
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <BlogGridSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Gagal memuat artikel. Silakan coba lagi nanti.
              </p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in relative"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Pinned indicator */}
                  {post.is_pinned && (
                    <div className="absolute top-3 right-3 z-10 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </div>
                  )}

                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                    {post.featured_image_url ? (
                      <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">📰</span>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Category */}
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
                      {categoryLabels[post.category] || post.category}
                    </span>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-foreground mb-2 line-clamp-2">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{post.published_at ? new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : '-'}</span>
                      </div>
                    </div>

                    {/* Read More */}
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-primary text-sm font-semibold hover:underline"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Tidak ada artikel yang ditemukan.
              </p>
              {hasActiveFilters && (
                <Button 
                  variant="link"
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Hapus filter dan lihat semua artikel
                </Button>
              )}
            </div>
          )}

          {/* Results count */}
          {!isLoading && filteredPosts.length > 0 && !hasActiveFilters && (
            <div className="flex justify-center mt-12">
              <p className="text-muted-foreground text-sm">
                Menampilkan {filteredPosts.length} artikel
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Dapatkan Update Terbaru
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Ikuti media sosial resmi FIM untuk informasi terbaru seputar kegiatan dan pendaftaran.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="https://instagram.com/forumindonesiamuda"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Follow Instagram
            </a>
            <SocialShare title="Blog & Berita Forum Indonesia Muda" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
