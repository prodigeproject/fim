import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface FeaturedVideo {
  id: string;
  title: string;
  youtube_id: string;
  thumbnail_url: string | null;
  description: string | null;
}

export default function FeaturedVideoSection() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["featured-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_videos")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as FeaturedVideo[];
    },
  });

  if (isLoading || !videos?.length) return null;

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  return (
    <section className="py-8 bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-center text-foreground mb-6">
            Video Pilihan
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((video) => (
              <div
                key={video.id}
                className="relative group rounded-xl overflow-hidden shadow-lg cursor-pointer bg-card"
                onClick={() => setActiveVideo(video.id)}
              >
                {activeVideo === video.id ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <>
                    <div className="aspect-video relative">
                      <img
                        src={video.thumbnail_url || getYouTubeThumbnail(video.youtube_id)}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          // Fallback to hqdefault if maxresdefault fails
                          (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="h-8 w-8 text-primary-foreground ml-1" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground line-clamp-1">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
