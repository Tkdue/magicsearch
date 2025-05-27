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
        hostname: 'picsum.photos', // per placeholder durante sviluppo
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
  
  // Variabili ambiente esposte al frontend
  env: {
    CUSTOM_KEY: 'magic-search-v1',
  },
  
  // Ottimizzazioni performance
  experimental: {
    optimizeCss: true,
  },
  
  // Configurazione TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Configurazione ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig; 