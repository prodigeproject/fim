import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  // Placeholder blog posts - will be replaced with Supabase data
  const posts = [
    {
      id: 1,
      slug: "pembukaan-pendaftaran-fim-25",
      title: "Pembukaan Pendaftaran FIM Angkatan 25",
      excerpt: "Pendaftaran FIM Angkatan 25 resmi dibuka! Ayo daftarkan dirimu dan jadilah bagian dari generasi pemimpin muda Indonesia.",
      category: "Pengumuman",
      author: "Tim FIM",
      date: "2024-01-15",
      image: null,
    },
    {
      id: 2,
      slug: "alumni-fim-raih-penghargaan",
      title: "Alumni FIM Raih Penghargaan Pemuda Inspiratif",
      excerpt: "Dua alumni FIM meraih penghargaan Pemuda Inspiratif dari Kementerian Pemuda dan Olahraga atas kontribusinya di bidang pendidikan.",
      category: "Prestasi",
      author: "Tim FIM",
      date: "2024-01-10",
      image: null,
    },
    {
      id: 3,
      slug: "fim-club-teknologi-hackathon",
      title: "FIM Club Teknologi Gelar Hackathon Nasional",
      excerpt: "FIM Club Teknologi berhasil menyelenggarakan hackathon nasional dengan peserta dari 30 kota di Indonesia.",
      category: "Kegiatan",
      author: "FIM Club Teknologi",
      date: "2024-01-05",
      image: null,
    },
    {
      id: 4,
      slug: "refleksi-21-tahun-fim",
      title: "Refleksi 21 Tahun Perjalanan FIM",
      excerpt: "Melihat kembali perjalanan panjang FIM dari 2003 hingga sekarang, dan visi ke depan untuk Indonesia.",
      category: "Opini",
      author: "Ketua Umum FIM",
      date: "2023-12-20",
      image: null,
    },
    {
      id: 5,
      slug: "tanggap-bencana-cianjur",
      title: "FIM Bergerak Cepat Bantu Korban Gempa Cianjur",
      excerpt: "Jaringan alumni FIM dari berbagai regional bergerak cepat menghimpun bantuan untuk korban gempa Cianjur.",
      category: "Sosial",
      author: "Tim Tanggap Bencana",
      date: "2023-12-15",
      image: null,
    },
    {
      id: 6,
      slug: "tips-leadership-dari-alumni",
      title: "5 Tips Leadership dari Alumni FIM Sukses",
      excerpt: "Pelajari rahasia kepemimpinan dari lima alumni FIM yang kini menjadi pemimpin di berbagai sektor.",
      category: "Tips",
      author: "Redaksi FIM",
      date: "2023-12-10",
      image: null,
    },
  ];

  const categories = ["Semua", "Pengumuman", "Prestasi", "Kegiatan", "Sosial", "Opini", "Tips"];

  return (
    <Layout>
      <PageHero
        title="Blog & Berita FIM"
        subtitle="Informasi terbaru seputar kegiatan, prestasi, dan inspirasi dari Forum Indonesia Muda"
      />

      {/* Blog Grid */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-card text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((post, index) => (
              <article
                key={post.id}
                className="bg-card rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-4xl">📰</span>
                </div>

                <div className="p-6">
                  {/* Category */}
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-3">
                    {post.category}
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
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(post.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
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

          {/* Placeholder for pagination */}
          <div className="flex justify-center mt-12">
            <p className="text-muted-foreground text-sm">
              Menampilkan {posts.length} artikel terbaru
            </p>
          </div>
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
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com/forumindonesiamuda"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Follow Instagram
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
