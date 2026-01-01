import { useQuery } from '@tanstack/react-query';
import { wordpressApi, isWordPressConfigured } from '@/services/wordpress';
import type { WPQueryParams } from '@/types/wordpress';

// Cache times
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

// Posts / Blog
export function usePosts(params?: WPQueryParams) {
  return useQuery({
    queryKey: ['wp-posts', params],
    queryFn: () => wordpressApi.getPosts(params),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured(),
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['wp-post', slug],
    queryFn: () => wordpressApi.getPost(slug),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured() && Boolean(slug),
  });
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ['wp-categories'],
    queryFn: () => wordpressApi.getCategories(),
    staleTime: STALE_TIME * 2, // Categories change less frequently
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured(),
  });
}

// Programs
export function usePrograms(params?: WPQueryParams) {
  return useQuery({
    queryKey: ['wp-programs', params],
    queryFn: () => wordpressApi.getPrograms(params),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured(),
  });
}

// Alumni Stories
export function useAlumniStories(params?: WPQueryParams) {
  return useQuery({
    queryKey: ['wp-alumni-stories', params],
    queryFn: () => wordpressApi.getAlumniStories(params),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured(),
  });
}

// Regional
export function useRegionals(params?: WPQueryParams) {
  return useQuery({
    queryKey: ['wp-regionals', params],
    queryFn: () => wordpressApi.getRegionals(params),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured(),
  });
}

// FAQ
export function useFAQs(params?: WPQueryParams) {
  return useQuery({
    queryKey: ['wp-faqs', params],
    queryFn: () => wordpressApi.getFAQs(params),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured(),
  });
}

// Partners
export function usePartners(params?: WPQueryParams) {
  return useQuery({
    queryKey: ['wp-partners', params],
    queryFn: () => wordpressApi.getPartners(params),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled: isWordPressConfigured(),
  });
}
