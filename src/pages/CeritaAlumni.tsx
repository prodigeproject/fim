import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import SocialShare from "@/components/SocialShare";
import { Quote, GraduationCap, Briefcase, Heart, Globe, Leaf, Code, User, Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlumniGridSkeleton, VideoTestimonialSkeleton } from "@/components/skeletons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fallback data
const fallbackStories = [
  { id: "1", name: "Andi Pratama", batch: "FIM 5", sector: "Pendidikan", position: "Founder Sekolah Inspirasi", company: "Yogyakarta", photo_url: null, quote: "FIM mengajarkan saya bahwa perubahan dimulai dari pendidikan. Kini saya mendirikan sekolah gratis untuk anak-anak kurang mampu.", story: "500+ siswa terbantu" },
  { id: "2", name: "Siti Rahayu", batch: "FIM 8", sector: "Sosial", position: "CEO Yayasan Peduli Desa", company: "Makassar", photo_url: null, quote: "Jaringan FIM membantu saya membangun program pemberdayaan di 50 desa tertinggal.", story: "50 desa terdampak" },
  { id: "3", name: "Budi Santoso", batch: "FIM 12", sector: "Teknologi", position: "CTO Startup Edutech", company: "Jakarta", photo_url: null, quote: "Dari workshop leadership FIM, saya belajar membangun tim. Sekarang startup kami sudah Series A.", story: "1M+ pengguna aplikasi" },
  { id: "4", name: "Maria Theresia", batch: "FIM 15", sector: "Kesehatan", position: "Dokter & Aktivis Kesehatan", company: "Flores", photo_url: null, quote: "FIM membuka mata saya tentang kesenjangan akses kesehatan. Saya memilih bertugas di daerah terpencil.", story: "10.000+ pasien dilayani" },
  { id: "5", name: "Ahmad Fauzi", batch: "FIM 10", sector: "Lingkungan", position: "Founder Green Movement ID", company: "Bandung", photo_url: null, quote: "Semangat kunang-kunang FIM yang menerangi kegelapan menginspirasi gerakan lingkungan kami.", story: "100.000 pohon ditanam" },
  { id: "6", name: "Dewi Lestari", batch: "FIM 18", sector: "Bisnis", position: "Founder Social Enterprise", company: "Surabaya", photo_url: null, quote: "FIM mengajarkan bahwa bisnis bisa berdampak sosial. Social enterprise kami memberdayakan 200 pengrajin lokal.", story: "200 UMKM diberdayakan" },
  { id: "7", name: "Rizky Ramadhan", batch: "FIM 20", sector: "Internasional", position: "Diplomat Muda RI", company: "Jenewa", photo_url: null, quote: "Public speaking dan diplomacy skills dari FIM sangat membantu karir saya di kancah internasional.", story: "Perwakilan Indonesia di PBB" },
  { id: "8", name: "Putri Handayani", batch: "FIM 7", sector: "Pendidikan", position: "Founder Gerakan Literasi", company: "Semarang", photo_url: null, quote: "Saya percaya setiap anak Indonesia berhak membaca. FIM memberi saya keberanian untuk memulai.", story: "1.000+ perpustakaan desa" },
];

const fallbackOtherAlumni = [
  { id: "1", name: "Raden Mas Haryanto", batch: "FIM 3", track_record: "Direktur Utama BUMN Strategis", photo_url: null },
  { id: "2", name: "Kartini Sari Dewi", batch: "FIM 4", track_record: "Anggota DPR RI Komisi X", photo_url: null },
  { id: "3", name: "Dr. Bambang Sutrisno", batch: "FIM 6", track_record: "Rektor Universitas Negeri", photo_url: null },
  { id: "4", name: "Ratna Megawati", batch: "FIM 7", track_record: "CEO Perusahaan Teknologi", photo_url: null },
  { id: "5", name: "Agus Prasetyo", batch: "FIM 9", track_record: "Direktur LSM Internasional", photo_url: null },
  { id: "6", name: "Indah Permatasari", batch: "FIM 11", track_record: "Kepala Dinas Pendidikan Provinsi", photo_url: null },
  { id: "7", name: "Hendra Wijaya", batch: "FIM 13", track_record: "Founder Unicorn Startup", photo_url: null },
  { id: "8", name: "Siska Rahmawati", batch: "FIM 14", track_record: "Peneliti Senior Lembaga Think Tank", photo_url: null },
];

const fallbackVideoTestimonials = [
  { id: "1", youtube_id: "dQw4w9WgXcQ", title: "Perjalanan Alumni FIM di Bidang Pendidikan", thumbnail_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=225&fit=crop", speaker: "Alumni FIM 10" },
  { id: "2", youtube_id: "dQw4w9WgXcQ", title: "Dampak FIM dalam Karir Profesional", thumbnail_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop", speaker: "Alumni FIM 15" },
  { id: "3", youtube_id: "dQw4w9WgXcQ", title: "Membangun Jaringan Nasional Melalui FIM", thumbnail_url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=225&fit=crop", speaker: "Alumni FIM 18" },
  { id: "4", youtube_id: "dQw4w9WgXcQ", title: "Kisah Sukses Alumni FIM di Startup", thumbnail_url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=225&fit=crop", speaker: "Alumni FIM 20" },
];

const CeritaAlumni = () => {
  const [selectedSector, setSelectedSector] = useState("Semua");
  const [selectedVideo, setSelectedVideo] = useState<{ youtube_id: string; title: string } | null>(null);

  // Fetch alumni stories from database
  const { data: dbStories, isLoading: storiesLoading } = useQuery({
    queryKey: ["public-alumni-stories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_stories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch other alumni from database
  const { data: dbOtherAlumni, isLoading: otherLoading } = useQuery({
    queryKey: ["public-alumni-other"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alumni_other")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch video testimonials from database
  const { data: dbVideos, isLoading: videosLoading } = useQuery({
    queryKey: ["public-video-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_testimonials")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Use database data or fallback
  const stories = dbStories && dbStories.length > 0 ? dbStories : fallbackStories;
  const otherAlumni = dbOtherAlumni && dbOtherAlumni.length > 0 ? dbOtherAlumni : fallbackOtherAlumni;
  const videoTestimonials = dbVideos && dbVideos.length > 0 ? dbVideos : fallbackVideoTestimonials;

  const sectors = ["Semua", "Pendidikan", "Sosial", "Teknologi", "Kesehatan", "Lingkungan", "Bisnis", "Internasional"];

  const filteredStories = selectedSector === "Semua" ? stories : stories.filter((s: any) => s.sector === selectedSector);

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, any> = { Pendidikan: GraduationCap, Sosial: Heart, Teknologi: Code, Kesehatan: Heart, Lingkungan: Leaf, Bisnis: Briefcase, Internasional: Globe };
    return icons[sector] || Heart;
  };

  const isLoading = storiesLoading || otherLoading || videosLoading;

  return (
    <Layout>
      <SEO 
        title="Cerita Alumni" 
        description="Kisah inspiratif dari ribuan alumni Forum Indonesia Muda yang telah berkontribusi di berbagai sektor: pendidikan, sosial, teknologi, kesehatan, lingkungan, bisnis, dan internasional."
      />
      <PageHero title="Cerita Alumni" subtitle="Kisah inspiratif dari ribuan alumni FIM yang telah berkontribusi di berbagai sektor untuk kemajuan Indonesia" />

      {/* Quote Section */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-accent mx-auto mb-4" />
            <blockquote className="text-xl lg:text-2xl text-foreground italic mb-4">"Setiap alumni FIM adalah kunang-kunang yang menerangi sudut Indonesia dengan caranya masing-masing."</blockquote>
            <p className="text-muted-foreground">— Filosofi Alumni FIM</p>
          </div>
        </div>
      </section>

      {/* Video Testimonial Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Video Testimoni Alumni</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Dengarkan langsung cerita inspiratif dari alumni FIM</p>

          {videosLoading ? (
            <VideoTestimonialSkeleton />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {videoTestimonials.map((video: any, index: number) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo({ youtube_id: video.youtube_id, title: video.title })}
                  className="group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 animate-fade-in bg-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative aspect-video">
                    <img 
                      src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                      alt={video.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">{video.speaker}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <button onClick={() => setSelectedVideo(null)} className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
          {selectedVideo && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                title={selectedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stories Section */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Kisah Mereka, Inspirasi Kita</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">Dari Sabang sampai Merauke, alumni FIM telah memberikan dampak nyata di berbagai bidang.</p>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {sectors.map((sector) => (
              <button key={sector} onClick={() => setSelectedSector(sector)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSector === sector ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted border border-border"}`}>{sector}</button>
            ))}
          </div>

          {storiesLoading ? (
            <AlumniGridSkeleton />
          ) : (
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {filteredStories.map((story: any, index: number) => {
                const Icon = getSectorIcon(story.sector);
                return (
                  <div key={story.id} className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {story.photo_url ? (
                          <img src={story.photo_url} alt={story.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-bold text-primary">{story.name.split(" ").map((n: string) => n[0]).join("")}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground">{story.name}</h3>
                        <p className="text-sm text-primary">{story.batch}</p>
                        <p className="text-sm text-muted-foreground">{story.position}</p>
                        <p className="text-xs text-muted-foreground">{story.company}</p>
                      </div>
                      <div className="w-10 h-10 bg-supporting/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-supporting" />
                      </div>
                    </div>
                    <blockquote className="text-muted-foreground italic mb-6 relative pl-4 border-l-2 border-accent">"{story.quote}"</blockquote>
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Dampak:</span>
                      <span className="text-sm font-semibold text-supporting">{story.story}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {filteredStories.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">Tidak ada cerita di sektor ini.</p></div>}
        </div>
      </section>

      {/* Alumni FIM Lainnya Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4">Alumni FIM Lainnya</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Ribuan alumni FIM telah berkontribusi di berbagai sektor dan jabatan strategis.</p>

          {otherLoading ? (
            <AlumniGridSkeleton />
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {otherAlumni.map((alumni: any, index: number) => (
                <div key={alumni.id} className="bg-card rounded-xl p-4 shadow-lg hover:shadow-xl transition-all animate-fade-in text-center" style={{ animationDelay: `${index * 0.03}s` }}>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {alumni.photo_url ? (
                      <img src={alumni.photo_url} alt={alumni.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-primary/50" />
                    )}
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{alumni.name}</h3>
                  <p className="text-xs text-primary font-medium mb-2">{alumni.batch}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alumni.track_record}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">Punya Cerita untuk Dibagikan?</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Jika Anda alumni FIM dan ingin berbagi cerita perjalanan Anda, hubungi kami.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
            <a href="mailto:alumni@forumindonesiamuda.org" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">Kirim Cerita Anda</a>
          </div>
          <div className="flex justify-center">
            <SocialShare title="Cerita Inspiratif Alumni Forum Indonesia Muda" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CeritaAlumni;
