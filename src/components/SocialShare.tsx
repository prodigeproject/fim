import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SocialShareProps {
  title: string;
  url?: string;
  variant?: "default" | "compact";
}

const SocialShare = ({ title, url, variant = "default" }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      url: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
      color: "hover:text-green-600",
    },
    {
      name: "LinkedIn",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-blue-700",
    },
    {
      name: "Telegram",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
      color: "hover:text-blue-500",
    },
    {
      name: "X",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-gray-900 dark:hover:text-gray-100",
    },
    {
      name: "Facebook",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "hover:text-blue-600",
    },
    {
      name: "TikTok",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      url: null,
      copyForTikTok: true,
      color: "hover:text-black dark:hover:text-white",
    },
    {
      name: "Threads",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.5 12.068c0-3.518.85-6.372 2.495-8.424C5.845 1.341 8.6.16 12.18.137h.014c2.746.018 5.147.727 7.137 2.106 1.945 1.348 3.368 3.282 4.23 5.748l-2.257.836c-.69-1.98-1.82-3.515-3.364-4.569-1.51-1.031-3.37-1.57-5.532-1.6h-.012c-2.682.018-4.847.891-6.436 2.597-1.61 1.73-2.427 4.151-2.427 7.195 0 3.044.818 5.465 2.427 7.194 1.589 1.707 3.754 2.58 6.436 2.597h.012c2.392-.017 4.312-.62 5.702-1.793 1.41-1.19 2.179-2.798 2.287-4.777l.002-.053c0-.936-.15-1.794-.447-2.549-.289-.735-.71-1.373-1.252-1.896-.535-.518-1.185-.923-1.93-1.2a7.77 7.77 0 0 0-2.46-.424c-.987 0-1.86.162-2.593.483a4.7 4.7 0 0 0-1.845 1.38c-.487.6-.808 1.32-.956 2.144-.153.847-.115 1.754.111 2.696.218.906.597 1.703 1.127 2.37.524.659 1.175 1.172 1.934 1.523.761.353 1.589.533 2.461.533.705 0 1.356-.103 1.934-.305.564-.197 1.048-.477 1.44-.832.382-.346.68-.757.884-1.22.201-.454.302-.952.302-1.48 0-.528-.101-1.026-.3-1.48a3.34 3.34 0 0 0-.883-1.22 4.03 4.03 0 0 0-1.44-.832 5.336 5.336 0 0 0-1.934-.305c-.872 0-1.7.18-2.461.533a4.7 4.7 0 0 0-1.845 1.38l-1.741-1.422c.593-.725 1.34-1.335 2.218-1.812.879-.477 1.886-.806 2.993-.978V8.46c-.988.15-1.874.43-2.634.835-.76.405-1.41.923-1.932 1.542a6.42 6.42 0 0 0-1.197 2.127c-.27.78-.406 1.625-.406 2.505 0 .88.137 1.724.406 2.505.27.78.67 1.483 1.197 2.088.522.6 1.172 1.098 1.932 1.485.76.387 1.646.653 2.634.79v2.08c-1.107-.15-2.114-.457-2.993-.918-.879-.462-1.625-1.05-2.218-1.761l1.741-1.421a4.7 4.7 0 0 0 1.845 1.38c.761.353 1.589.532 2.461.532.705 0 1.356-.103 1.934-.305.564-.197 1.048-.477 1.44-.832.382-.346.68-.757.884-1.22.201-.454.302-.952.302-1.48z"/>
        </svg>
      ),
      url: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
      color: "hover:text-black dark:hover:text-white",
    },
    {
      name: "Instagram",
      icon: () => (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
        </svg>
      ),
      // Instagram doesn't have direct share URL, copy link instead
      url: null,
      copyForIG: true,
      color: "hover:text-pink-600",
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClick = (link: typeof shareLinks[0]) => {
    if ((link as any).copyForIG || (link as any).copyForTikTok) {
      copyToClipboard();
      return;
    }
    if (link.url) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-8 w-8">
            <Share2 className="h-3.5 w-3.5" />
            <span className="sr-only">Bagikan</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {shareLinks.map((link) => (
            <DropdownMenuItem 
              key={link.name} 
              onClick={() => handleClick(link)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <link.icon />
              {link.name}
              {((link as any).copyForIG || (link as any).copyForTikTok) && <span className="text-xs text-muted-foreground">(salin)</span>}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-2">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Tersalin!" : "Salin Link"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 print:hidden">
      <span className="text-sm text-muted-foreground mr-1">Bagikan:</span>
      {shareLinks.map((link) => (
        <button
          key={link.name}
          onClick={() => handleClick(link)}
          className={`p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors ${link.color}`}
          title={`Bagikan ke ${link.name}${((link as any).copyForIG || (link as any).copyForTikTok) ? ' (salin link)' : ''}`}
        >
          <link.icon />
          <span className="sr-only">Bagikan ke {link.name}</span>
        </button>
      ))}
      <button
        onClick={copyToClipboard}
        className="p-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary transition-colors"
        title="Salin Link"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span className="sr-only">{copied ? "Tersalin!" : "Salin Link"}</span>
      </button>
    </div>
  );
};

export default SocialShare;
