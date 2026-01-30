import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, ChevronLeft, ChevronRight, Pause, SkipForward } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FeaturedVideo {
  id: string;
  title: string;
  youtube_id: string;
  thumbnail_url: string | null;
  description: string | null;
}

// YouTube Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function FeaturedVideoSection() {
  const queryClient = useQueryClient();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

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

  // Real-time updates for featured videos
  useEffect(() => {
    const channel = supabase
      .channel("featured-videos-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "featured_videos",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["featured-videos"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  // Initialize YouTube player when playing
  useEffect(() => {
    if (!isPlaying || !videos?.length || !window.YT) return;

    const currentVideo = videos[activeVideoIndex];
    
    // Wait for YT API to be ready
    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player("youtube-player", {
        videoId: currentVideo.youtube_id,
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onStateChange: (event: any) => {
            // Video ended (state = 0)
            if (event.data === 0 && autoplayEnabled && videos.length > 1) {
              // Play next video in playlist
              const nextIndex = (activeVideoIndex + 1) % videos.length;
              setActiveVideoIndex(nextIndex);
            }
          },
        },
      });
    };

    if (window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isPlaying, activeVideoIndex, videos, autoplayEnabled]);

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
    // Keep playing if already playing
  }, [videos?.length]);

  const goToNext = useCallback(() => {
    if (!videos?.length) return;
    setActiveVideoIndex((prev) => (prev + 1) % videos.length);
    // Keep playing if already playing
  }, [videos?.length]);

  if (isLoading || !videos?.length) return null;

  const currentVideo = videos[activeVideoIndex];

  const getYouTubeThumbnail = (youtubeId: string) => {
    // Use hqdefault as it's more reliably available than maxresdefault
    return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  };

  return (
    <section className="py-10 lg:py-14 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Compact Header */}
          <div className="text-center mb-6">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
              VIDEO INSPIRATIF
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
              Kisah Alumni FIM
            </h2>
          </div>
          
          {/* Video + Info Layout - More compact */}
          <div className="grid lg:grid-cols-5 gap-6 items-center">
            {/* Video Display - Takes 3 columns */}
            <div className="lg:col-span-3 relative group rounded-xl overflow-hidden shadow-xl bg-card">
              {isPlaying ? (
                <div className="aspect-video relative" ref={playerContainerRef}>
                  <div id="youtube-player" className="w-full h-full" />
                  {/* Skip to next button when playing */}
                  {videos.length > 1 && (
                    <button
                      onClick={goToNext}
                      className="absolute bottom-4 right-4 px-3 py-2 bg-black/70 backdrop-blur rounded-lg flex items-center gap-2 text-white text-sm hover:bg-black/90 transition-colors z-10"
                    >
                      <SkipForward className="h-4 w-4" />
                      Video Berikutnya
                    </button>
                  )}
                </div>
              ) : (
                <div 
                  className="aspect-video relative cursor-pointer"
                  onClick={() => setIsPlaying(true)}
                >
                  <img
                    src={currentVideo.thumbnail_url || getYouTubeThumbnail(currentVideo.youtube_id)}
                    alt={currentVideo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentVideo.youtube_id}/hqdefault.jpg`;
                    }}
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Play Button - Centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-2xl">
                      <Play className="h-8 w-8 lg:h-10 lg:w-10 text-primary-foreground ml-1" />
                    </div>
                  </div>

                  {/* Video Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-lg text-white line-clamp-2">{currentVideo.title}</h3>
                  </div>
                </div>
              )}

              {/* Navigation Arrows - More subtle */}
              {videos.length > 1 && !isPlaying && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Video sebelumnya"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Video berikutnya"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Info Panel - Takes 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              {/* Current Video Info */}
              <div className="bg-card rounded-xl p-5 shadow-lg border border-border">
                <div className="flex items-center gap-2 text-primary text-xs font-semibold mb-2">
                  <Play className="h-3 w-3" />
                  <span>SEDANG DIPUTAR</span>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-2">
                  {currentVideo.title}
                </h3>
                {currentVideo.description && (
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {currentVideo.description}
                  </p>
                )}
                
                {/* Video Indicators */}
                {videos.length > 1 && (
                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    <button
                      onClick={() => {
                        if (isPlaying) {
                          setIsPlaying(false);
                        }
                        setIsPaused(!isPaused);
                      }}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      title={isPaused ? "Lanjutkan" : "Pause"}
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </button>
                    <div className="flex gap-1.5 flex-1">
                      {videos.map((video, index) => (
                        <button
                          key={video.id}
                          onClick={() => { 
                            setActiveVideoIndex(index); 
                            // If currently playing, continue playing the new video
                          }}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            index === activeVideoIndex 
                              ? "flex-1 bg-primary" 
                              : "w-6 bg-muted hover:bg-muted-foreground/50"
                          }`}
                          aria-label={`Lihat video ${index + 1}: ${video.title}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activeVideoIndex + 1}/{videos.length}
                    </span>
                  </div>
                )}

                {/* Autoplay toggle */}
                {videos.length > 1 && isPlaying && (
                  <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
                    <span className="text-xs text-muted-foreground">Putar otomatis ke video berikutnya</span>
                    <button
                      onClick={() => setAutoplayEnabled(!autoplayEnabled)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        autoplayEnabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span 
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          autoplayEnabled ? "left-5" : "left-0.5"
                        }`} 
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-5 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Tertarik menjadi bagian dari perjalanan ini?
                </p>
                <Button asChild className="w-full">
                  <a href="/daftar">Daftar Sekarang</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}