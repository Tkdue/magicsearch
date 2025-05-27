// API Services for Magic Search
// Servizi per gestire tutte le chiamate API

import { API_CONFIG, IMAGE_SIZE_MAPPING, ERROR_MESSAGES, CONTENT_TYPE_MAPPING } from '../api-config';

// Types
export interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  title: string;
  source: string;
  photographer?: string;
  license: string;
  width: number;
  height: number;
  downloadUrl: string;
  isPremium?: boolean;
  tags?: string[];
  category?: string;
}

export interface SearchFilters {
  imageSize: string;
  imageType: string;
  colorFilter: string;
  aspectRatio: string;
  usageRights: string;
}

export interface AIExpandedQuery {
  originalQuery: string;
  expandedQueries: string[];
  reasoning: string;
}

// AI Service per l'espansione delle query
export class AIService {
  static async expandQuery(query: string): Promise<string> {
    try {
      // Prova prima OpenAI
      const expanded = await this.callOpenAI(query);
      return expanded;
    } catch (error) {
      console.log('OpenAI failed, trying Anthropic:', error);
      try {
        return await this.callAnthropic(query);
      } catch (anthropicError) {
        console.error('AI expansion failed:', anthropicError);
        // Se entrambi falliscono, ritorna la query originale
        return query;
      }
    }
  }

  private static async callOpenAI(query: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
      return query;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  private static async callAnthropic(query: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text.trim();
      }
      return query;
    } catch (error) {
      console.error('Anthropic API call failed:', error);
      throw error;
    }
  }
}

// Google Custom Search Service
export class GoogleSearchService {
  static async searchImages(query: string, filters: SearchFilters, count: number = 10): Promise<ImageResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, filters, count);
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseGoogleResults(data);
    } catch (error) {
      console.error('Google Search failed:', error);
      return [];
    }
  }

  private static buildSearchUrl(query: string, filters: SearchFilters, count: number): string {
    const params = new URLSearchParams({
      q: query,
      num: Math.min(count, 10).toString(),
      imgSize: IMAGE_SIZE_MAPPING[filters.imageSize as keyof typeof IMAGE_SIZE_MAPPING]?.google || 'medium',
    });

    if (filters.colorFilter !== 'any') {
      params.append('imgColorType', filters.colorFilter);
    }

    if (filters.aspectRatio !== 'any') {
      const ratioMap = { square: 'tall', wide: 'wide', tall: 'tall' };
      params.append('imgType', ratioMap[filters.aspectRatio as keyof typeof ratioMap] || 'any');
    }

    return `/api/search/google?${params.toString()}`;
  }

  private static parseGoogleResults(data: any): ImageResult[] {
    if (!data.items) return [];

    return data.items.map((item: any, index: number) => ({
      id: `google-${index}`,
      url: item.link,
      thumbnailUrl: item.image?.thumbnailLink || item.link,
      title: item.title,
      source: 'Google',
      license: 'Mixed',
      width: item.image?.width || 0,
      height: item.image?.height || 0,
      downloadUrl: item.link,
    }));
  }
}

// Unsplash Service
export class UnsplashService {
  static async searchImages(query: string, filters: SearchFilters, count: number = 10): Promise<ImageResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, filters, count);
      
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseUnsplashResults(data);
    } catch (error) {
      console.error('Unsplash Search failed:', error);
      return [];
    }
  }

  private static buildSearchUrl(query: string, filters: SearchFilters, count: number): string {
    const params = new URLSearchParams({
      query: query,
      per_page: Math.min(count, 30).toString(),
      orientation: filters.aspectRatio === 'wide' ? 'landscape' : 
                   filters.aspectRatio === 'tall' ? 'portrait' : 
                   filters.aspectRatio === 'square' ? 'squarish' : 'any',
    });

    if (filters.colorFilter !== 'any') {
      params.append('color', filters.colorFilter);
    }

    return `/api/search/unsplash?${params.toString()}`;
  }

  private static parseUnsplashResults(data: any): ImageResult[] {
    if (!data.results) return [];

    return data.results.map((item: any) => ({
      id: `unsplash-${item.id}`,
      url: item.urls.regular,
      thumbnailUrl: item.urls.thumb,
      title: item.alt_description || item.description || 'Untitled',
      source: 'Unsplash',
      photographer: item.user.name,
      license: 'Unsplash License',
      width: item.width,
      height: item.height,
      downloadUrl: item.urls.full,
    }));
  }
}

// Pixabay Service
export class PixabayService {
  static async searchImages(query: string, filters: SearchFilters, count: number = 10): Promise<ImageResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, filters, count);
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parsePixabayResults(data);
    } catch (error) {
      console.error('Pixabay Search failed:', error);
      return [];
    }
  }

  private static buildSearchUrl(query: string, filters: SearchFilters, count: number): string {
    const params = new URLSearchParams({
      q: query,
      image_type: filters.imageType === 'all' ? 'all' : filters.imageType,
      per_page: Math.max(3, Math.min(count, 20)).toString(),
      category: 'backgrounds,fashion,nature,science,education,feelings,health,people,religion,places,animals,industry,computer,food,sports,transportation,travel,buildings,business,music',
      safesearch: 'true',
    });

    if (filters.colorFilter !== 'any') {
      params.append('color', filters.colorFilter);
    }

    return `/api/search/pixabay?${params.toString()}`;
  }

  private static parsePixabayResults(data: any): ImageResult[] {
    if (!data.hits) return [];

    return data.hits.map((item: any) => ({
      id: `pixabay-${item.id}`,
      url: item.webformatURL,
      thumbnailUrl: item.previewURL,
      title: item.tags,
      source: 'Pixabay',
      photographer: item.user,
      license: 'Pixabay License',
      width: item.imageWidth,
      height: item.imageHeight,
      downloadUrl: item.largeImageURL,
    }));
  }
}

// Pexels Service
export class PexelsService {
  static async searchImages(query: string, filters: SearchFilters, count: number = 10): Promise<ImageResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, filters, count);
      
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parsePexelsResults(data);
    } catch (error) {
      console.error('Pexels Search failed:', error);
      return [];
    }
  }

  private static buildSearchUrl(query: string, filters: SearchFilters, count: number): string {
    const params = new URLSearchParams({
      query: query,
      per_page: Math.min(count, 80).toString(),
    });

    if (filters.aspectRatio !== 'any') {
      const orientationMap = {
        wide: 'landscape',
        tall: 'portrait',
        square: 'square'
      };
      params.append('orientation', orientationMap[filters.aspectRatio as keyof typeof orientationMap] || '');
    }

    return `/api/search/pexels?${params.toString()}`;
  }

  private static parsePexelsResults(data: any): ImageResult[] {
    if (!data.photos) return [];

    return data.photos.map((item: any) => ({
      id: `pexels-${item.id}`,
      url: item.src.large,
      thumbnailUrl: item.src.medium,
      title: item.alt || 'Untitled',
      source: 'Pexels',
      photographer: item.photographer,
      license: 'Pexels License',
      width: item.width,
      height: item.height,
      downloadUrl: item.src.original,
    }));
  }
}

// Freepik Service
export class FreepikService {
  static async searchImages(query: string, filters: SearchFilters, count: number = 10): Promise<ImageResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, filters, count);
      
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`Freepik API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseFreepikResults(data);
    } catch (error) {
      console.error('Freepik Search failed:', error);
      return [];
    }
  }

  private static buildSearchUrl(query: string, filters: SearchFilters, count: number): string {
    const params = new URLSearchParams({
      term: query,
      limit: Math.min(count, 20).toString(),
    });

    // Content type filtering
    if (filters.imageType !== 'all') {
      const contentType = CONTENT_TYPE_MAPPING[filters.imageType as keyof typeof CONTENT_TYPE_MAPPING]?.freepik;
      if (contentType) {
        params.append('content_type', contentType);
      }
    }

    // Color filtering
    if (filters.colorFilter !== 'any') {
      params.append('color', filters.colorFilter);
    }

    // Orientation filtering
    if (filters.aspectRatio !== 'any') {
      const orientationMap = {
        wide: 'horizontal',
        tall: 'vertical',
        square: 'square'
      };
      const orientation = orientationMap[filters.aspectRatio as keyof typeof orientationMap];
      if (orientation) {
        params.append('orientation', orientation);
      }
    }

    // Premium filtering based on usage rights
    if (filters.usageRights === 'free') {
      params.append('premium', 'false');
    }

    return `/api/search/freepik?${params.toString()}`;
  }

  private static parseFreepikResults(data: any): ImageResult[] {
    if (!data.data || !Array.isArray(data.data)) return [];

    return data.data.map((item: any) => ({
      id: `freepik-${item.id}`,
      url: item.image?.source?.url || item.thumbnail?.url || '',
      thumbnailUrl: item.thumbnail?.url || item.image?.source?.url || '',
      title: item.title || 'Freepik Resource',
      source: 'Freepik',
      photographer: item.author?.name,
      license: item.premium ? 'Freepik Premium' : 'Freepik Free',
      width: parseInt(item.image?.source?.size?.split('x')[0]) || 1920,
      height: parseInt(item.image?.source?.size?.split('x')[1]) || 1080,
      downloadUrl: item.url || item.image?.source?.url || '',
      isPremium: item.premium || false,
      tags: item.tags || [],
      category: item.category,
    }));
  }
}

// Envato Service
export class EnvatoService {
  static async searchImages(query: string, filters: SearchFilters, count: number = 10): Promise<ImageResult[]> {
    try {
      const searchUrl = this.buildSearchUrl(query, filters, count);
      
      const response = await fetch(searchUrl);

      if (!response.ok) {
        throw new Error(`Envato API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseEnvatoResults(data);
    } catch (error) {
      console.error('Envato Search failed:', error);
      return [];
    }
  }

  private static buildSearchUrl(query: string, filters: SearchFilters, count: number): string {
    const params = new URLSearchParams({
      term: query,
      page_size: Math.min(count, 50).toString(),
    });

    // Non aggiungiamo parametri site o category che causano errori
    // L'API Envato gestirà automaticamente i siti appropriati

    return `/api/search/envato?${params.toString()}`;
  }

  private static parseEnvatoResults(data: any): ImageResult[] {
    if (!data.matches || !Array.isArray(data.matches)) return [];

    return data.matches.map((item: any) => {
      // Ottieni l'URL dell'immagine dalla struttura corretta di Envato
      const mainImageUrl = item.previews?.icon_with_video_preview?.landscape_url || 
                          item.previews?.icon_with_video_preview?.image_urls?.[0]?.url ||
                          item.previews?.landscape_preview?.landscape_url ||
                          '';
      
      const thumbnailUrl = item.previews?.icon_with_video_preview?.icon_url || 
                          mainImageUrl;

      return {
        id: `envato-${item.id}`,
        url: mainImageUrl,
        thumbnailUrl: thumbnailUrl,
        title: item.name || 'Envato Item',
        source: 'Envato',
        photographer: item.author_username,
        license: 'Envato Standard License',
        width: item.previews?.icon_with_video_preview?.image_urls?.[0]?.width || 1920,
        height: item.previews?.icon_with_video_preview?.image_urls?.[0]?.height || 1080,
        downloadUrl: item.url,
        isPremium: true,
        tags: item.tags || [],
        category: item.classification,
      };
    });
  }
}

// Main Search Orchestrator
export class MagicSearchService {
  static async performSearch(
    query: string,
    searchType: 'specific' | 'creative',
    filters: SearchFilters,
    additionalContext: string = '',
    imageCount: number = 20
  ): Promise<ImageResult[]> {
    try {
      let searchQueries: string[] = [query];

      // Se ricerca creativa, espandi con AI
      if (searchType === 'creative') {
        const aiExpansion = await AIService.expandQuery(query);
        searchQueries = [query, ...aiExpansion.split('\n').filter(q => q.trim() !== '')];
      }

      // Distribuisci le ricerche tra le API (ora abbiamo 6 API!)
      const imagesPerQuery = Math.ceil(imageCount / searchQueries.length);
      const imagesPerAPI = Math.ceil(imagesPerQuery / 6); // 6 API totali

      const allResults: ImageResult[] = [];

      // Esegui ricerche parallele con tutte le API
      for (const searchQuery of searchQueries) {
        const [
          googleResults, 
          unsplashResults, 
          pixabayResults, 
          pexelsResults,
          freepikResults,
          envatoResults
        ] = await Promise.allSettled([
          GoogleSearchService.searchImages(searchQuery, filters, imagesPerAPI),
          UnsplashService.searchImages(searchQuery, filters, imagesPerAPI),
          PixabayService.searchImages(searchQuery, filters, imagesPerAPI),
          PexelsService.searchImages(searchQuery, filters, imagesPerAPI),
          FreepikService.searchImages(searchQuery, filters, imagesPerAPI),
          EnvatoService.searchImages(searchQuery, filters, imagesPerAPI),
        ]);

        // Raccogli tutti i risultati validi
        [
          googleResults, 
          unsplashResults, 
          pixabayResults, 
          pexelsResults,
          freepikResults,
          envatoResults
        ].forEach(result => {
          if (result.status === 'fulfilled' && result.value.length > 0) {
            allResults.push(...result.value);
          }
        });
      }

      // Rimuovi duplicati e ordina per rilevanza + premium content
      const uniqueResults = this.removeDuplicates(allResults);
      const sortedResults = this.sortByRelevanceAndQuality(uniqueResults);
      
      return sortedResults.slice(0, imageCount);
      
    } catch (error) {
      console.error('Magic Search failed:', error);
      throw error;
    }
  }

  private static removeDuplicates(results: ImageResult[]): ImageResult[] {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.title}-${result.width}x${result.height}-${result.source}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private static sortByRelevanceAndQuality(results: ImageResult[]): ImageResult[] {
    return results.sort((a, b) => {
      // Priority: Premium content first, then by source quality
      const sourceQuality = {
        'Envato': 10,
        'Freepik': 9,
        'Unsplash': 8,
        'Pexels': 7,
        'Pixabay': 6,
        'Google': 5
      };
      
      const aScore = (a.isPremium ? 100 : 0) + (sourceQuality[a.source as keyof typeof sourceQuality] || 0);
      const bScore = (b.isPremium ? 100 : 0) + (sourceQuality[b.source as keyof typeof sourceQuality] || 0);
      
      return bScore - aScore;
    });
  }
}

// Download Service per il download automatico
export class DownloadService {
  static async downloadImage(imageUrl: string, fileName: string, downloadPath?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          fileName,
          downloadPath
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Download failed:', error);
        return false;
      }

      const result = await response.json();
      console.log('Download successful:', result.message);
      return true;
    } catch (error) {
      console.error('Download error:', error);
      return false;
    }
  }

  static async downloadMultipleImages(images: ImageResult[], downloadPath?: string): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    
    for (const image of images) {
      try {
        const fileName = this.generateFileName(image);
        const success = await this.downloadImage(image.url, fileName, downloadPath);
        if (success) {
          results.success++;
        } else {
          results.failed++;
        }
        // Piccola pausa per evitare rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error('Error downloading image:', error);
        results.failed++;
      }
    }

    return results;
  }

  private static generateFileName(image: ImageResult): string {
    // Genera un nome file basato sul titolo o ID dell'immagine
    let fileName = 'image';
    
    if (image.title) {
      fileName = image.title.substring(0, 50); // Limita lunghezza
    } else if (image.id) {
      fileName = `image_${image.id}`;
    }

    // Rimuovi caratteri non validi
    fileName = fileName.replace(/[^a-z0-9_-]/gi, '_');
    
    // Aggiungi estensione basata sull'URL
    const extension = this.getImageExtension(image.url);
    return `${fileName}.${extension}`;
  }

  private static getImageExtension(url: string): string {
    const urlPath = new URL(url).pathname;
    const extension = urlPath.split('.').pop()?.toLowerCase();
    
    // Fallback a jpg se non riusciamo a determinare l'estensione
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '') ? extension || 'jpg' : 'jpg';
  }
} 