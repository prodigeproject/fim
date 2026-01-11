import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import SocialShare from "@/components/SocialShare";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Tag,
  Eye,
  Clock,
  Share2,
  Link as LinkIcon,
  ChevronRight
} from "lucide-react";
import { SiWhatsapp, SiFacebook, SiTelegram, SiInstagram, SiX } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useEffect } from "react";

const categoryLabels: Record<string, string> = {
  pengumuman: "Pengumuman",
  prestasi: "Prestasi",
  kegiatan: "Kegiatan",
  sosial: "Sosial",
  opini: "Opini",
  tips: "Tips & Trik",
};

const affiliationLabels: Record<string, string> = {
  fim_pusat: "FIM Pusat",
  fim_club: "FIM Club",
  fim_regional: "FIM Regional",
};

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Fetch article
  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article-public", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error) throw error;
      
      // Fetch author profile separately
      let authorProfile = null;
      if (data?.author_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, full_name, avatar_url")
          .eq("id", data.author_id)
          .single();
        authorProfile = profile;
      }

      return { ...data, profiles: authorProfile };
    },
    enabled: !!slug,
  });

  // Increment view count
  const viewMutation = useMutation({
    mutationFn: async (articleId: string) => {
      await supabase.rpc("increment_view_count", { article_id: articleId });
    },
  });

  useEffect(() => {
    if (article?.id) {
      // Delay view count increment to avoid counting quick bounces
      const timer = setTimeout(() => {
        viewMutation.mutate(article.id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [article?.id]);

  // Fetch related articles
  const { data: relatedArticles } = useQuery({
    queryKey: ["related-articles", article?.category, article?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, featured_image_url, published_at")
        .eq("status", "published")
        .eq("category", article!.category)
        .neq("id", article!.id)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!article?.category && !!article?.id,
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link berhasil disalin!");
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article?.title || "")}`, "_blank");
  };

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article?.title} - ${shareUrl}`)}`, "_blank");
  };

  const shareToTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article?.title || "")}`, "_blank");
  };

  const shareToInstagram = () => {
    // Instagram doesn't have a direct share URL, so we copy the link and show a message
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link disalin! Buka Instagram dan paste di story/post Anda.");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-64 mb-8" />
          <Skeleton className="h-[400px] w-full mb-8 rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <SEO title="Artikel Tidak Ditemukan" noIndex />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Artikel Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-8">
            Artikel yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Button onClick={() => navigate("/blog")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Blog
          </Button>
        </div>
      </Layout>
    );
  }

  const authorName = article.profiles?.full_name || article.profiles?.username || "Tim FIM";
  const publishedDate = article.published_at 
    ? format(new Date(article.published_at), "d MMMM yyyy", { locale: id })
    : "";

  return (
    <Layout>
      <SEO 
        title={article.title}
        description={article.excerpt || article.content.replace(/<[^>]*>/g, "").substring(0, 160)}
        image={article.featured_image_url}
        type="article"
      />

      <article className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
              <ChevronRight className="h-4 w-4" />
              <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
            </nav>

            {/* Category & Affiliation */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" className="text-sm">
                {categoryLabels[article.category] || article.category}
              </Badge>
              {article.author_affiliation && (
                <span className="text-sm text-muted-foreground">
                  {affiliationLabels[article.author_affiliation] || article.author_affiliation}
                  {article.related_region && ` • ${article.related_region}`}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{authorName}</p>
                  <p className="text-sm">{publishedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.view_count || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.ceil(article.content.replace(/<[^>]*>/g, "").split(" ").length / 200)} menit baca
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="container mx-auto px-4 max-w-5xl -mt-6">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 max-w-4xl py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8">
              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-primary prose-strong:text-foreground prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    {article.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Section */}
              <div className="mt-8 p-6 bg-muted/50 rounded-xl">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Bagikan artikel ini</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareToWhatsApp} title="WhatsApp">
                      <SiWhatsapp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareToTelegram} title="Telegram">
                      <SiTelegram className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareToInstagram} title="Instagram">
                      <SiInstagram className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareToFacebook} title="Facebook">
                      <SiFacebook className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={shareToTwitter} title="X/Twitter">
                      <SiX className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={copyLink} title="Salin Link">
                      <LinkIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              {/* Author Card */}
              <div className="bg-card rounded-xl p-6 shadow-sm border mb-6">
                <h3 className="font-semibold mb-4">Tentang Penulis</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">
                      {authorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{authorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {affiliationLabels[article.author_affiliation] || "FIM"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="bg-card rounded-xl p-6 shadow-sm border">
                  <h3 className="font-semibold mb-4">Artikel Terkait</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        to={`/blog/${related.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="w-20 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {related.featured_image_url ? (
                            <img
                              src={related.featured_image_url}
                              alt={related.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📰
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {related.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {related.published_at && format(new Date(related.published_at), "d MMM yyyy", { locale: id })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="container mx-auto px-4 max-w-4xl pb-12">
          <Separator className="mb-8" />
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/blog")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Blog
            </Button>
          </div>
        </div>
      </article>
    </Layout>
  );
}
