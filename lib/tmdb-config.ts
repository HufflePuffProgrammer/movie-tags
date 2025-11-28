export const TMDB_CONFIG = {
    API_KEY: process.env.TMDB_API_KEY,
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
    TIMEOUT: 5000,
    
    ENDPOINTS: {
      SEARCH_MOVIES: '/search/movie',
      SEARCH_TV: '/search/tv',
      MOVIE_DETAILS: (id: number) => `/movie/${id}`,
    },
    
    buildUrl: (endpoint: string, params: Record<string, string> = {}) => {
      const url = new URL(`${TMDB_CONFIG.BASE_URL}${endpoint}`);
      url.searchParams.append('api_key', TMDB_CONFIG.API_KEY || '');
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      return url.toString();
    },
    
    buildImageUrl: (path: string | null, size: 'w500' | 'w780' | 'original' = 'w500') => {
      if (!path) return null;
      return `https://image.tmdb.org/t/p/${size}${path}`;
    }
  } as const;
  
  // Type-safe TMDB fetch helper
  export async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = TMDB_CONFIG.buildUrl(endpoint, params);
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(TMDB_CONFIG.TIMEOUT)
    });
  
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
    }
  
    return response.json();
  }