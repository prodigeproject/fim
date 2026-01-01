import type {
  WPPost,
  WPProgram,
  WPAlumniStory,
  WPRegional,
  WPFAQ,
  WPPartner,
  WPCategory,
  WPQueryParams,
  BlogPost,
  Program,
  AlumniStory,
  Regional,
  FAQ,
  Partner,
} from '@/types/wordpress';

const WP_API_URL = import.meta.env.VITE_WP_API_URL || '';

// Helper to build query string
function buildQueryString(params: WPQueryParams = {}): string {
  const query = new URLSearchParams();
  
  if (params.per_page) query.set('per_page', params.per_page.toString());
  if (params.page) query.set('page', params.page.toString());
  if (params.search) query.set('search', params.search);
  if (params.orderby) query.set('orderby', params.orderby);
  if (params.order) query.set('order', params.order);
  if (params._embed !== false) query.set('_embed', 'true');
  if (params.categories?.length) query.set('categories', params.categories.join(','));
  if (params.tags?.length) query.set('tags', params.tags.join(','));
  
  return query.toString();
}

// Transform WordPress post to BlogPost
function transformPost(post: WPPost): BlogPost {
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  const category = post._embedded?.['wp:term']?.[0]?.[0];
  const author = post._embedded?.author?.[0];
  
  return {
    id: post.id,
    slug: post.slug,
    title: post.title.rendered,
    excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').trim(),
    content: post.content.rendered,
    date: post.date,
    category: category?.name || 'Uncategorized',
    image: featuredMedia?.source_url || '/placeholder.svg',
    author: author ? {
      name: author.name,
      avatar: author.avatar_urls['96'],
    } : undefined,
  };
}

// Transform WordPress program to Program
function transformProgram(program: WPProgram): Program {
  const featuredMedia = program._embedded?.['wp:featuredmedia']?.[0];
  
  return {
    id: program.id,
    title: program.title.rendered,
    description: program.excerpt.rendered.replace(/<[^>]*>/g, '').trim(),
    image: featuredMedia?.source_url || '/placeholder.svg',
    startDate: program.acf?.tanggal_mulai,
    endDate: program.acf?.tanggal_selesai,
    location: program.acf?.lokasi,
    quota: program.acf?.kuota,
    registrationUrl: program.acf?.pendaftaran_url,
    status: program.acf?.status,
  };
}

// Transform WordPress alumni story to AlumniStory
function transformAlumniStory(story: WPAlumniStory): AlumniStory {
  const featuredMedia = story._embedded?.['wp:featuredmedia']?.[0];
  
  return {
    id: story.id,
    name: story.acf?.nama || story.title.rendered,
    batch: story.acf?.batch || '',
    photo: story.acf?.foto_url || featuredMedia?.source_url || '/placeholder.svg',
    quote: story.acf?.quote || '',
    sector: story.acf?.sektor || '',
    position: story.acf?.jabatan,
    company: story.acf?.perusahaan,
    linkedinUrl: story.acf?.linkedin_url,
    videoUrl: story.acf?.video_url,
    story: story.content.rendered,
  };
}

// Transform WordPress regional to Regional
function transformRegional(regional: WPRegional): Regional {
  return {
    id: regional.id,
    name: regional.title.rendered,
    province: regional.acf?.provinsi || '',
    island: regional.acf?.pulau || '',
    coordinator: regional.acf?.koordinator,
    email: regional.acf?.email,
    instagram: regional.acf?.instagram,
    memberCount: regional.acf?.jumlah_anggota,
  };
}

// Transform WordPress FAQ to FAQ
function transformFAQ(faq: WPFAQ): FAQ {
  return {
    id: faq.id,
    question: faq.title.rendered,
    answer: faq.content.rendered,
    category: faq.acf?.kategori,
    order: faq.acf?.urutan,
  };
}

// Transform WordPress partner to Partner
function transformPartner(partner: WPPartner): Partner {
  const featuredMedia = partner._embedded?.['wp:featuredmedia']?.[0];
  
  return {
    id: partner.id,
    name: partner.title.rendered,
    logo: featuredMedia?.source_url || '/placeholder.svg',
    websiteUrl: partner.acf?.website_url,
    category: partner.acf?.kategori,
  };
}

// API Methods
export const wordpressApi = {
  // Posts / Blog
  async getPosts(params?: WPQueryParams): Promise<BlogPost[]> {
    if (!WP_API_URL) return [];
    
    const queryString = buildQueryString(params);
    const response = await fetch(`${WP_API_URL}/posts?${queryString}`);
    
    if (!response.ok) throw new Error('Failed to fetch posts');
    
    const posts: WPPost[] = await response.json();
    return posts.map(transformPost);
  },
  
  async getPost(slug: string): Promise<BlogPost | null> {
    if (!WP_API_URL) return null;
    
    const response = await fetch(`${WP_API_URL}/posts?slug=${slug}&_embed=true`);
    
    if (!response.ok) throw new Error('Failed to fetch post');
    
    const posts: WPPost[] = await response.json();
    return posts.length > 0 ? transformPost(posts[0]) : null;
  },
  
  // Categories
  async getCategories(): Promise<WPCategory[]> {
    if (!WP_API_URL) return [];
    
    const response = await fetch(`${WP_API_URL}/categories?per_page=100`);
    
    if (!response.ok) throw new Error('Failed to fetch categories');
    
    return response.json();
  },
  
  // Programs
  async getPrograms(params?: WPQueryParams): Promise<Program[]> {
    if (!WP_API_URL) return [];
    
    const queryString = buildQueryString(params);
    const response = await fetch(`${WP_API_URL}/program?${queryString}`);
    
    if (!response.ok) throw new Error('Failed to fetch programs');
    
    const programs: WPProgram[] = await response.json();
    return programs.map(transformProgram);
  },
  
  // Alumni Stories
  async getAlumniStories(params?: WPQueryParams): Promise<AlumniStory[]> {
    if (!WP_API_URL) return [];
    
    const queryString = buildQueryString(params);
    const response = await fetch(`${WP_API_URL}/alumni_story?${queryString}`);
    
    if (!response.ok) throw new Error('Failed to fetch alumni stories');
    
    const stories: WPAlumniStory[] = await response.json();
    return stories.map(transformAlumniStory);
  },
  
  // Regional
  async getRegionals(params?: WPQueryParams): Promise<Regional[]> {
    if (!WP_API_URL) return [];
    
    const queryString = buildQueryString(params);
    const response = await fetch(`${WP_API_URL}/regional?${queryString}`);
    
    if (!response.ok) throw new Error('Failed to fetch regionals');
    
    const regionals: WPRegional[] = await response.json();
    return regionals.map(transformRegional);
  },
  
  // FAQ
  async getFAQs(params?: WPQueryParams): Promise<FAQ[]> {
    if (!WP_API_URL) return [];
    
    const queryString = buildQueryString({ ...params, orderby: 'title' });
    const response = await fetch(`${WP_API_URL}/faq?${queryString}`);
    
    if (!response.ok) throw new Error('Failed to fetch FAQs');
    
    const faqs: WPFAQ[] = await response.json();
    return faqs.map(transformFAQ).sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  
  // Partners
  async getPartners(params?: WPQueryParams): Promise<Partner[]> {
    if (!WP_API_URL) return [];
    
    const queryString = buildQueryString(params);
    const response = await fetch(`${WP_API_URL}/partner?${queryString}`);
    
    if (!response.ok) throw new Error('Failed to fetch partners');
    
    const partners: WPPartner[] = await response.json();
    return partners.map(transformPartner);
  },
};

// Check if WordPress is configured
export function isWordPressConfigured(): boolean {
  return Boolean(WP_API_URL);
}
