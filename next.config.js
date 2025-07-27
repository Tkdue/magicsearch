/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  
  // Ottimizzazioni per le immagini esterne
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  
  // Headers per sicurezza API
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  
  // Redirects per gestire le route
  async redirects() {
    return [];
  },
  
  // Rewrites per API
  async rewrites() {
    return [];
  },
  
  // Variabili ambiente esposte al frontend
  env: {
    CUSTOM_KEY: 'magic-search-v1',
  },
  
  // Configurazione TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configurazione ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configurazione per il build
  trailingSlash: false,
  
  // Configurazione experimental rimossa per compatibilità
};

module.exports = nextConfig; 