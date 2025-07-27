'use client'

import React, { useState } from 'react'
import MagicSearch from '../magic-search-app'
import AutomatedSearchForm from './AutomatedSearchForm'
import { Bot, Search } from 'lucide-react'

export default function HomePage() {
  const [mode, setMode] = useState<'automated' | 'manual'>('automated')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mode Selector */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setMode('automated')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'automated'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>Ricerca Automatizzata</span>
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                mode === 'manual'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Ricerca Manuale</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {mode === 'automated' ? (
          <AutomatedSearchForm />
        ) : (
          <MagicSearch />
        )}
      </div>
    </div>
  )
}