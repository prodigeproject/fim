import { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none";
  placeholder?: "blur" | "empty";
  onLoad?: () => void;
  onError?: () => void;
}

function getSupabaseTransformUrl(src: string, width?: number, height?: number): string {
  // Check if it's a Supabase storage URL
  if (src.includes("supabase.co/storage") && (width || height)) {
    const url = new URL(src);
    const transformParams: string[] = [];
    
    if (width) transformParams.push(`width=${width}`);
    if (height) transformParams.push(`height=${height}`);
    transformParams.push("format=webp");
    transformParams.push("quality=80");
    
    // Insert transform path
    const pathParts = url.pathname.split("/object/");
    if (pathParts.length === 2) {
      url.pathname = pathParts[0] + "/object/public/" + transformParams.join(",") + "/" + pathParts[1].replace("public/", "");
    }
    
    return url.toString();
  }
  
  return src;
}

function OptimizedImageComponent({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  objectFit = "cover",
  placeholder = "blur",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading when 200px away from viewport
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const optimizedSrc = getSupabaseTransformUrl(src, width, height);

  // Generate srcset for responsive images
  const getSrcSet = () => {
    if (!src.includes("supabase.co/storage") || !width) return undefined;
    
    const sizes = [0.5, 1, 1.5, 2]; // 50%, 100%, 150%, 200%
    return sizes
      .map((scale) => {
        const scaledWidth = Math.round(width * scale);
        const url = getSupabaseTransformUrl(src, scaledWidth);
        return `${url} ${scaledWidth}w`;
      })
      .join(", ");
  };

  const objectFitClasses = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      style={{ width, height }}
    >
      {/* Blur Placeholder */}
      {placeholder === "blur" && !isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
      )}

      {/* Actual Image */}
      {isInView && !hasError && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={getSrcSet()}
          sizes={width ? `${width}px` : undefined}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-300",
            objectFitClasses[objectFit],
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);
