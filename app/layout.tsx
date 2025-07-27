import React from 'react'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Magic Search - Powered by Ar1films',
  description: 'AI-powered intelligent image search with 6 integrated APIs: Google, Unsplash, Pixabay, Pexels, Freepik, Envato',
  keywords: ['image search', 'AI', 'creative tools', 'Ar1films', 'stock photos', 'premium graphics'],
  authors: [{ name: 'Ar1films' }],
  icons: {
    icon: '/Magic_search_icon.png',
    shortcut: '/Magic_search_icon.png',
    apple: '/Magic_search_icon.png',
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#8B5CF6',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 