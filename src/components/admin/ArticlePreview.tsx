import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import DOMPurify from 'dompurify';

interface ArticlePreviewProps {
  title: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  authorName: string;
  authorAffiliation: string;
  createdAt?: Date;
}

const categoryLabels: Record<string, string> = {
  pengumuman: 'Pengumuman',
  prestasi: 'Prestasi',
  kegiatan: 'Kegiatan',
  sosial: 'Sosial',
  opini: 'Opini',
  tips: 'Tips & Trik',
};

const affiliationLabels: Record<string, string> = {
  fim_pusat: 'FIM Pusat',
  fim_club: 'FIM Club',
  fim_regional: 'FIM Regional',
};

export function ArticlePreview({
  title,
  content,
  featuredImage,
  category,
  tags,
  authorName,
  authorAffiliation,
  createdAt = new Date(),
}: ArticlePreviewProps) {
  return (
    <article className="max-w-4xl mx-auto bg-background">
      {/* Header */}
      <header className="space-y-4">
        {/* Category Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {categoryLabels[category] || category}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {affiliationLabels[authorAffiliation] || authorAffiliation}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">
          {title || 'Judul Artikel'}
        </h1>

        {/* Author & Date */}
        <div className="flex items-center gap-4 py-4 border-y">
          <Avatar>
            <AvatarFallback>
              {authorName?.charAt(0)?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{authorName || 'Penulis'}</p>
            <p className="text-sm text-muted-foreground">
              {format(createdAt, "d MMMM yyyy", { locale: id })}
            </p>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {featuredImage && (
        <div className="my-8">
          <img
            src={featuredImage}
            alt={title}
            className="w-full h-auto rounded-lg object-cover max-h-[500px]"
          />
        </div>
      )}

      {/* Content */}
      <div 
        className="prose prose-lg max-w-none my-8"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(content || '<p class="text-muted-foreground">Mulai menulis konten artikel...</p>', {
            ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img', 'br', 'hr', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'iframe'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'style'],
            ALLOW_DATA_ATTR: false
          })
        }}
      />

      {/* Tags */}
      {tags && tags.length > 0 && (
        <footer className="pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
