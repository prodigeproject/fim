// WordPress REST API Response Types

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details?: {
    width: number;
    height: number;
    sizes?: {
      thumbnail?: { source_url: string };
      medium?: { source_url: string };
      large?: { source_url: string };
      full?: { source_url: string };
    };
  };
}

export interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: WPCategory[][];
    author?: WPAuthor[];
  };
  acf?: Record<string, unknown>;
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface WPAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  avatar_urls: {
    '24': string;
    '48': string;
    '96': string;
  };
}

export interface WPProgram {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
  };
  acf?: {
    tanggal_mulai?: string;
    tanggal_selesai?: string;
    lokasi?: string;
    kuota?: number;
    pendaftaran_url?: string;
    status?: 'upcoming' | 'ongoing' | 'completed';
  };
}

export interface WPAlumniStory {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
  };
  acf?: {
    nama: string;
    batch: string;
    foto_url?: string;
    quote?: string;
    sektor?: string;
    jabatan?: string;
    perusahaan?: string;
    linkedin_url?: string;
    video_url?: string;
  };
}

export interface WPRegional {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  acf?: {
    provinsi: string;
    pulau: string;
    koordinator?: string;
    email?: string;
    instagram?: string;
    jumlah_anggota?: number;
  };
}

export interface WPFAQ {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  acf?: {
    kategori?: string;
    urutan?: number;
  };
}

export interface WPPartner {
  id: number;
  title: { rendered: string };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
  };
  acf?: {
    website_url?: string;
    kategori?: string;
  };
}

// Query params types
export interface WPQueryParams {
  per_page?: number;
  page?: number;
  search?: string;
  categories?: number[];
  tags?: number[];
  orderby?: 'date' | 'title' | 'id';
  order?: 'asc' | 'desc';
  _embed?: boolean;
}

// Transformed types for frontend use
export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  image: string;
  author?: {
    name: string;
    avatar: string;
  };
}

export interface Program {
  id: number;
  title: string;
  description: string;
  image: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  quota?: number;
  registrationUrl?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export interface AlumniStory {
  id: number;
  name: string;
  batch: string;
  photo: string;
  quote: string;
  sector: string;
  position?: string;
  company?: string;
  linkedinUrl?: string;
  videoUrl?: string;
  story: string;
}

export interface Regional {
  id: number;
  name: string;
  province: string;
  island: string;
  coordinator?: string;
  email?: string;
  instagram?: string;
  memberCount?: number;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
  order?: number;
}

export interface Partner {
  id: number;
  name: string;
  logo: string;
  websiteUrl?: string;
  category?: string;
}
