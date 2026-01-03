import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import SocialShare from "@/components/SocialShare";
import { Calendar, User, ArrowRight, Pin } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BlogGridSkeleton, BlogCategorySkeleton } from "@/components/skeletons";

// Fallback placeholder posts when database has no articles
const fallbackPosts = [
  {
    id: "1",
    slug: "pembukaan-pendaftaran-fim-27",
    title: "Pembukaan Pendaftaran FIM 27: Kebijakan Publik",
    excerpt: "Pendaftaran FIM Angkatan 27 dengan tema Kebijakan Publik resmi dibuka! Ayo daftarkan dirimu dan jadilah bagian dari generasi pemimpin muda Indonesia.",
    category: "pengumuman",
    author_name: "Tim FIM",
    published_at: "2024-10-01",
    featured_image_url: null,
    is_pinned: false,
  },
  {
    id: "2",
    slug: "alumni-fim-raih-penghargaan",
    title: "Alumni FIM Raih Penghargaan Pemuda Inspiratif",
    excerpt: "Dua alumni FIM meraih penghargaan Pemuda Inspiratif dari Kementerian Pemuda dan Olahraga atas kontribusinya di bidang pendidikan.",
    category: "prestasi",
    author_name: "Tim FIM",
    published_at: "2024-01-10",
    featured_image_url: null,
    is_pinned: true,
  },
  {
    id: "3",
    slug: "fim-club-teknologi-hackathon",
    title: "FIM Club Teknologi Gelar Hackathon Nasional",
    excerpt: "FIM Club Teknologi berhasil menyelenggarakan hackathon nasional dengan peserta dari 30 kota di Indonesia.",
    category: "kegiatan",
    author_name: "FIM Club Teknologi",
    published_at: "2024-01-05",
    featured_image_url: null,
    is_pinned: false,
  },
  {
    id: "4",
    slug: "refleksi-21-tahun-fim",
    title: "Refleksi 21 Tahun Perjalanan FIM",
    excerpt: "Melihat kembali perjalanan panjang FIM dari 2003 hingga sekarang, dan visi ke depan untuk Indonesia.",
    category: "opini",
    author_name: "Ketua Umum FIM",
    published_at: "2023-12-20",
    featured_image_url: null,
    is_pinned: false,
  },
  {
    id: "5",
    slug: "tanggap-bencana-cianjur",
    title: "FIM Bergerak Cepat Bantu Korban Gempa Cianjur",
    excerpt: "Jaringan alumni FIM dari berbagai regional bergerak cepat menghimpun bantuan untuk korban gempa Cianjur.",
    category: "sosial",
    author_name: "Tim Tanggap Bencana",
    published_at: "2023-12-15",
    featured_image_url: null,
    is_pinned: false,
  },
  {
    id: "6",
    slug: "tips-leadership-dari-alumni",
    title: "5 Tips Leadership dari Alumni FIM Sukses",
    excerpt: "Pelajari rahasia kepemimpinan dari lima alumni FIM yang kini menjadi pemimpin di berbagai sektor.",
    category: "tips",
    author_name: "Redaksi FIM",
    published_at: "2023-12-10",
    featured_image_url: null,
    is_pinned: false,
  },
];

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
          category,
          featured_image_url,
          published_at,
          is_pinned,
          author_id,
          profiles!articles_author_id_fkey(username, full_name)
        `)
        .eq('status', 'published')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  // Read category from URL on mount
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  // Use database data if available, otherwise fallback
  const posts = useMemo(() => {
    if (!dbArticles?.length) {
      return fallbackPosts;
    }
    return dbArticles.map((article: any) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt || '',
      category: article.category,
      author_name: article.profiles?.full_name || article.profiles?.username || 'Tim FIM',
      published_at: article.published_at,
      featured_image_url: article.featured_image_url,
      is_pinned: article.is_pinned,
    }));
  }, [dbArticles]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === "Semua") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    if (selectedCategory === "Semua") return posts;
    const categoryKey = selectedCategory.toLowerCase();
    return posts.filter(post =>
      post.category === categoryKey ||
      post.title.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }, [posts, selectedCategory]);

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
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
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

          {/* Active filter indicator */}
          {selectedCategory !== "Semua" && (
            <div className="text-center mb-8">
              <p className="text-muted-foreground text-sm">
                Menampilkan hasil untuk: <span className="font-semibold text-foreground">{selectedCategory}</span>
                <button 
                  onClick={() => handleCategoryChange("Semua")}
                  className="ml-2 text-primary hover:underline"
                >
                  Hapus filter
                </button>
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
                Tidak ada artikel yang ditemukan untuk kategori "{selectedCategory}".
              </p>
              <button 
                onClick={() => handleCategoryChange("Semua")}
                className="mt-4 text-primary hover:underline"
              >
                Lihat semua artikel
              </button>
            </div>
          )}

          {/* Results count */}
          {!isLoading && filteredPosts.length > 0 && (
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