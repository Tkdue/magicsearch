// API Configuration for Magic Search
// Configurazione centrale per tutte le API utilizzate

export const API_CONFIG = {
  // AI APIs per espansione creativa
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY || '',
    BASE_URL: 'https://api.openai.com/v1',
    MODEL: 'gpt-4o',
    MAX_TOKENS: 300,
  },
  
  GEMINI: {
    API_KEY: process.env.GEMINI_API_KEY || '',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
    MODEL: 'gemini-1.5-pro',
    MAX_TOKENS: 300,
  },
  
  ANTHROPIC: {
    API_KEY: process.env.ANTHROPIC_API_KEY || '',
    BASE_URL: 'https://api.anthropic.com/v1',
    MODEL: 'claude-3-5-sonnet-20241022',
    MAX_TOKENS: 300,
  },

  // Image Search APIs
  GOOGLE_CUSTOM_SEARCH: {
    API_KEY: process.env.GOOGLE_API_KEY || '',
    SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID || '',
    BASE_URL: 'https://www.googleapis.com/customsearch/v1',
  },

  UNSPLASH: {
    ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY || '',
    SECRET_KEY: process.env.UNSPLASH_SECRET_KEY || '',
    BASE_URL: 'https://api.unsplash.com',
  },

  PIXABAY: {
    API_KEY: process.env.PIXABAY_API_KEY || '',
    BASE_URL: 'https://pixabay.com/api',
  },

  PEXELS: {
    API_KEY: process.env.PEXELS_API_KEY || '',
    BASE_URL: 'https://api.pexels.com/v1',
  },

  // NEW: Creative Resources APIs
  FREEPIK: {
    API_KEY: process.env.FREEPIK_API_KEY || '',
    BASE_URL: 'https://api.freepik.com/v1',
  },

  ENVATO: {
    API_TOKEN: process.env.ENVATO_API_TOKEN || '',
    BASE_URL: 'https://api.envato.com/v1',
  },
};

// Rate limiting configuration
export const RATE_LIMITS = {
  GOOGLE_CUSTOM_SEARCH: {
    REQUESTS_PER_DAY: 100,
    REQUESTS_PER_SECOND: 10,
  },
  UNSPLASH: {
    REQUESTS_PER_HOUR: 50,
    REQUESTS_PER_SECOND: 1,
  },
  PIXABAY: {
    REQUESTS_PER_MINUTE: 100,
  },
  PEXELS: {
    REQUESTS_PER_HOUR: 200,
    REQUESTS_PER_SECOND: 3,
  },
  FREEPIK: {
    REQUESTS_PER_HOUR: 100,
    REQUESTS_PER_SECOND: 2,
  },
  ENVATO: {
    REQUESTS_PER_HOUR: 1000,
    REQUESTS_PER_SECOND: 5,
  },
  OPENAI: {
    REQUESTS_PER_MINUTE: 60,
    TOKENS_PER_MINUTE: 60000,
  },
};

// Preset configurations per A31 Films
export const A31_PRESETS = {
  COMMERCIAL_PROJECT: {
    name: 'Commercial Project',
    description: 'Focus su prodotti, lifestyle, business',
    filters: {
      imageSize: 'xlarge',
      usageRights: 'commercial',
      colorFilter: 'any',
      aspectRatio: 'wide',
    },
    aiPromptAddition: 'professional, high-quality, commercial use, brand-friendly colors',
    preferredSources: ['envato', 'freepik', 'unsplash'], // Priorità per contenuti premium
  },
  
  DOCUMENTARY_STYLE: {
    name: 'Documentary Style',
    description: 'Fotografia sociale, reportage',
    filters: {
      imageSize: 'large',
      usageRights: 'free',
      colorFilter: 'black',
      aspectRatio: 'any',
    },
    aiPromptAddition: 'authentic, realistic, documentary photography, social reportage, natural lighting',
    preferredSources: ['unsplash', 'pexels', 'pixabay'],
  },
  
  MUSIC_VIDEO: {
    name: 'Music Video',
    description: 'Performance, strumenti, crowd',
    filters: {
      imageSize: 'xlarge',
      usageRights: 'commercial',
      colorFilter: 'any',
      aspectRatio: 'wide',
    },
    aiPromptAddition: 'dynamic, performance, dramatic lighting, movement, energy, concert, stage',
    preferredSources: ['envato', 'freepik', 'unsplash'],
  },
  
  CORPORATE_INSTITUTIONAL: {
    name: 'Corporate/Institutional',
    description: 'Professionalità, uffici, team',
    filters: {
      imageSize: 'large',
      usageRights: 'commercial',
      colorFilter: 'blue',
      aspectRatio: 'wide',
    },
    aiPromptAddition: 'professional, clean composition, corporate, team diversity, neutral colors',
    preferredSources: ['envato', 'freepik', 'unsplash'],
  },

  // NEW: Preset specifici per risorse creative
  GRAPHIC_DESIGN: {
    name: 'Graphic Design',
    description: 'Vettoriali, icone, template, PSD',
    filters: {
      imageSize: 'xlarge',
      usageRights: 'commercial',
      colorFilter: 'any',
      aspectRatio: 'any',
    },
    aiPromptAddition: 'vector graphics, icons, design elements, minimalist, modern design',
    preferredSources: ['freepik', 'envato'],
  },

  SOCIAL_MEDIA: {
    name: 'Social Media',
    description: 'Template, post, stories, banner',
    filters: {
      imageSize: 'medium',
      usageRights: 'commercial',
      colorFilter: 'any',
      aspectRatio: 'square',
    },
    aiPromptAddition: 'social media template, instagram, facebook, modern layout, trending',
    preferredSources: ['freepik', 'envato', 'unsplash'],
  },
};

// Image size mappings (updated with new APIs)
export const IMAGE_SIZE_MAPPING = {
  small: {
    google: 'small',
    unsplash: 'small',
    pixabay: 'category=photo&min_width=640&min_height=480',
    pexels: 'per_page=15&size=small',
    freepik: 'size=small',
    envato: 'page_size=15',
  },
  medium: {
    google: 'medium',
    unsplash: 'regular',
    pixabay: 'category=photo&min_width=1280&min_height=720',
    pexels: 'per_page=15&size=medium',
    freepik: 'size=medium',
    envato: 'page_size=15',
  },
  large: {
    google: 'large',
    unsplash: 'full',
    pixabay: 'category=photo&min_width=1920&min_height=1080',
    pexels: 'per_page=15&size=large',
    freepik: 'size=large',
    envato: 'page_size=15',
  },
  xlarge: {
    google: 'xlarge',
    unsplash: 'raw',
    pixabay: 'category=photo&min_width=2560&min_height=1440',
    pexels: 'per_page=15&size=large',
    freepik: 'size=large',
    envato: 'page_size=15',
  },
};

// Content type mappings for different APIs
export const CONTENT_TYPE_MAPPING = {
  photo: {
    freepik: 'photo',
    envato: 'photo',
    pixabay: 'photo',
  },
  vector: {
    freepik: 'vector',
    envato: 'graphics',
  },
  illustration: {
    freepik: 'psd',
    envato: 'graphics',
  },
  icon: {
    freepik: 'icon',
    envato: 'graphics',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  API_KEY_MISSING: 'API key mancante per il servizio',
  RATE_LIMIT_EXCEEDED: 'Limite di richieste superato',
  NETWORK_ERROR: 'Errore di connessione',
  INVALID_RESPONSE: 'Risposta API non valida',
  AI_EXPANSION_FAILED: 'Errore nell\'espansione AI della query',
  DOWNLOAD_FAILED: 'Errore nel download dell\'immagine',
  FREEPIK_ERROR: 'Errore nell\'API Freepik',
  ENVATO_ERROR: 'Errore nell\'API Envato',
};

export default API_CONFIG; 