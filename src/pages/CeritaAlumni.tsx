import { useState } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Quote, GraduationCap, Briefcase, Heart, Globe, Leaf, Code, User, Play, X, Video, Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlumniGridSkeleton, VideoTestimonialSkeleton } from "@/components/skeletons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const } }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const CeritaAlumni = () => {
  const [selectedSector, setSelectedSector] = useState("Semua");
  const [selectedVideo, setSelectedVideo] = useState<{ youtube_id: string; title: string } | null>(null);

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["public-alumni-stories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alumni_stories").select("*").eq("is_active", true).order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: otherAlumni, isLoading: otherLoading } = useQuery({
    queryKey: ["public-alumni-other"],
    queryFn: async () => {
      const { data, error } = await supabase.from("alumni_other").select("*").eq("is_active", true).order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: videoTestimonials, isLoading: videosLoading } = useQuery({
    queryKey: ["public-video-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("video_testimonials").select("*").eq("is_active", true).order("sort_order", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const sectors = ["Semua", "Pendidikan", "Sosial", "Teknologi", "Kesehatan", "Lingkungan", "Bisnis", "Internasional"];
  const filteredStories = selectedSector === "Semua" ? (stories || []) : (stories || []).filter((s: any) => s.sector === selectedSector);

  const getSectorIcon = (sector: string) => {
    const icons: Record<string, any> = { Pendidikan: GraduationCap, Sosial: Heart, Teknologi: Code, Kesehatan: Heart, Lingkungan: Leaf, Bisnis: Briefcase, Internasional: Globe };
    return icons[sector] || Heart;
  };

  const EmptyState = ({ title, description, icon: Icon }: { title: string; description: string; icon: any }) => (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Icon className="h-8 w-8 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
    </div>
  );

  return (
    <Layout>
      <SEO title="Cerita Alumni" description="Kisah inspiratif dari ribuan alumni Forum Indonesia Muda." />
      <PageHero title="Cerita Alumni" subtitle="Kisah inspiratif dari ribuan alumni FIM yang telah berkontribusi di berbagai sektor untuk kemajuan Indonesia" />

      <motion.section className="py-12 bg-secondary" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Quote className="h-12 w-12 text-accent mx-auto mb-4" />
            <blockquote className="text-xl lg:text-2xl text-foreground italic mb-4">"Setiap alumni FIM adalah kunang-kunang yang menerangi sudut Indonesia dengan caranya masing-masing."</blockquote>
            <p className="text-muted-foreground">— Filosofi Alumni FIM</p>
          </div>
        </div>
      </motion.section>

      {/* Video Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>Video Testimoni Alumni</motion.h2>
          <motion.p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>Dengarkan langsung cerita inspiratif dari alumni FIM</motion.p>
          {videosLoading ? <VideoTestimonialSkeleton /> : (videoTestimonials || []).length > 0 ? (
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {(videoTestimonials || []).map((video: any) => (
                <motion.div key={video.id} variants={fadeUp} onClick={() => setSelectedVideo({ youtube_id: video.youtube_id, title: video.title })} className="group cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-card">
                  <div className="relative aspect-video">
                    <img src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Play className="h-6 w-6 text-primary-foreground ml-1" fill="currentColor" /></div>
                    </div>
                  </div>
                  <div className="p-4"><h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">{video.title}</h3><p className="text-xs text-muted-foreground">{video.speaker}</p></div>
                </motion.div>
              ))}
            </motion.div>
          ) : <EmptyState icon={Video} title="Belum Ada Video Testimoni" description="Video testimoni alumni akan segera ditambahkan." />}
        </div>
      </section>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black border-none">
          <button onClick={() => setSelectedVideo(null)} className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"><X className="h-5 w-5 text-white" /></button>
          {selectedVideo && <div className="aspect-video"><iframe src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`} title={selectedVideo.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>}
        </DialogContent>
      </Dialog>

      {/* Stories */}
      <section className="py-16 lg:py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>Kisah Mereka, Inspirasi Kita</motion.h2>
          <motion.p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>Dari Sabang sampai Merauke, alumni FIM telah memberikan dampak nyata di berbagai bidang.</motion.p>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {sectors.map((sector) => (
              <button key={sector} onClick={() => setSelectedSector(sector)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedSector === sector ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-muted border border-border"}`}>{sector}</button>
            ))}
          </div>
          {storiesLoading ? <AlumniGridSkeleton /> : filteredStories.length > 0 ? (
            <motion.div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {filteredStories.map((story: any) => {
                const Icon = getSectorIcon(story.sector);
                return (
                  <motion.div key={story.id} variants={fadeUp} className="bg-card rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {story.photo_url ? <img src={story.photo_url} alt={story.name} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-primary">{story.name.split(" ").map((n: string) => n[0]).join("")}</span>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground">{story.name}</h3>
                        <p className="text-sm text-primary">{story.batch}</p>
                        <p className="text-sm text-muted-foreground">{story.position}</p>
                        <p className="text-xs text-muted-foreground">{story.company}</p>
                      </div>
                      <div className="w-10 h-10 bg-supporting/10 rounded-lg flex items-center justify-center"><Icon className="h-5 w-5 text-supporting" /></div>
                    </div>
                    <blockquote className="text-muted-foreground italic mb-6 relative pl-4 border-l-2 border-accent">"{story.quote}"</blockquote>
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Dampak:</span>
                      <span className="text-sm font-semibold text-supporting">{story.story}</span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (stories || []).length === 0 ? <EmptyState icon={Quote} title="Belum Ada Kisah Alumni" description="Kisah-kisah inspiratif dari alumni FIM akan segera ditambahkan." /> : (
            <div className="text-center py-12"><p className="text-muted-foreground">Tidak ada cerita di sektor {selectedSector}.</p></div>
          )}
        </div>
      </section>

      {/* Other Alumni */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.h2 className="text-3xl lg:text-4xl font-bold text-center text-foreground mb-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>Alumni FIM Lainnya</motion.h2>
          <motion.p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>Ribuan alumni FIM telah berkontribusi di berbagai sektor dan jabatan strategis.</motion.p>
          {otherLoading ? <AlumniGridSkeleton /> : (otherAlumni || []).length > 0 ? (
            <motion.div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {(otherAlumni || []).map((alumni: any) => (
                <motion.div key={alumni.id} variants={fadeUp} className="bg-card rounded-xl p-4 shadow-lg hover:shadow-xl transition-all text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {alumni.photo_url ? <img src={alumni.photo_url} alt={alumni.name} className="w-full h-full object-cover" /> : <User className="h-8 w-8 text-primary/50" />}
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">{alumni.name}</h3>
                  <p className="text-xs text-primary font-medium mb-2">{alumni.batch}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alumni.track_record}</p>
                </motion.div>
              ))}
            </motion.div>
          ) : <EmptyState icon={Users} title="Belum Ada Data Alumni Lainnya" description="Daftar alumni FIM akan segera ditambahkan." />}
        </div>
      </section>

      <motion.section className="py-16 bg-secondary" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">Punya Cerita untuk Dibagikan?</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Jika Anda alumni FIM dan ingin berbagi cerita perjalanan Anda, hubungi kami.</p>
          <a href="mailto:alumni@forumindonesiamuda.org" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">Kirim Cerita Anda</a>
        </div>
      </motion.section>
    </Layout>
  );
};

export default CeritaAlumni;
