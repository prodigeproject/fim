import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, ChevronLeft, ChevronRight, Pause } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface FeaturedVideo {
  id: string;
  title: string;
  youtube_id: string;
  thumbnail_url: string | null;
  description: string | null;
}

export default function FeaturedVideoSection() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

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

  // Auto-rotate videos every 8 seconds when not playing
  useEffect(() => {
    if (!videos?.length || isPlaying || isPaused) return;
    
    const interval = setInterval(() => {
      setActiveVideoIndex((prev) => (prev + 1) % videos.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [videos?.length, isPlaying, isPaused]);

  const goToPrevious = useCallback(() => {
    if (!videos?.length) return;
    setActiveVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(false);
  }, [videos?.length]);

  const goToNext = useCallback(() => {
    if (!videos?.length) return;
    setActiveVideoIndex((prev) => (prev + 1) % videos.length);
    setIsPlaying(false);
  }, [videos?.length]);

  if (isLoading || !videos?.length) return null;

  const currentVideo = videos[activeVideoIndex];

  const getYouTubeThumbnail = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Kisah Inspiratif
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Saksikan perjalanan dan pengalaman alumni FIM yang telah berkarya di berbagai bidang untuk Indonesia
            </p>
          </div>
          
          {/* Main Video Display */}
          <div className="relative group rounded-2xl overflow-hidden shadow-2xl bg-card">
            {isPlaying ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${currentVideo.youtube_id}?autoplay=1&rel=0`}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div 
                className="aspect-video relative cursor-pointer"
                onClick={() => setIsPlaying(true)}
              >
                <img
                  src={currentVideo.thumbnail_url || getYouTubeThumbnail(currentVideo.youtube_id)}
                  alt={currentVideo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentVideo.youtube_id}/hqdefault.jpg`;
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-2xl backdrop-blur-sm">
                    <Play className="h-10 w-10 lg:h-12 lg:w-12 text-primary-foreground ml-1" />
                  </div>
                </div>

                {/* Video Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h3 className="font-bold text-xl lg:text-2xl text-white mb-2 line-clamp-2">
                    {currentVideo.title}
                  </h3>
                  {currentVideo.description && (
                    <p className="text-white/80 text-sm lg:text-base line-clamp-2 max-w-2xl">
                      {currentVideo.description}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {videos.length > 1 && !isPlaying && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-background/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Video Indicators & Pause Control */}
          {videos.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {/* Pause/Play Button */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                title={isPaused ? "Lanjutkan auto-rotate" : "Pause auto-rotate"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </button>
              
              {/* Dots */}
              <div className="flex gap-2">
                {videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => { setActiveVideoIndex(index); setIsPlaying(false); }}
                    className={`transition-all duration-300 rounded-full ${
                      index === activeVideoIndex 
                        ? "w-8 h-2 bg-primary" 
                        : "w-2 h-2 bg-muted hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm mb-4">
              Tertarik menjadi bagian dari perjalanan ini?
            </p>
            <Button asChild>
              <a href="/daftar">Daftar Sekarang</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}