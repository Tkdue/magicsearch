'use client';

import React, { useState } from 'react';
import { Search, Wand2, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  source: string;
  width?: number;
  height?: number;
  description?: string;
}

interface AutomatedSearchResponse {
  success: boolean;
  tema: string;
  numeroImmagini: number;
  expandedQueries: string[];
  results: SearchResult[];
  totalFound: number;
  gdrive?: {
    success: boolean;
    folder: {
      id: string;
      name: string;
      link: string;
    };
    results: {
      total: number;
      successful: number;
      failed: number;
    };
  };
  timestamp: string;
  processingTime: number;
}

export default function AutomatedSearchForm() {
  const [tema, setTema] = useState('');
  const [numeroImmagini, setNumeroImmagini] = useState(10);
  const [uploadToGDrive, setUploadToGDrive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AutomatedSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!tema.trim()) {
      setError('Inserisci un tema per la ricerca');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('/api/automated-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tema: tema.trim(),
          numeroImmagini,
          uploadToGDrive
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante la ricerca');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎯 MAGIC SEARCH - Automated
        </h1>
        <p className="text-lg text-gray-600">
          Ricerca automatizzata: AI Analysis → Multi-API Search → GDrive Upload
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tema Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema / Descrizione
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                placeholder="es: corporate team meeting, sunset landscape, modern architecture..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Numero Immagini */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              N° Immagini
            </label>
            <input
              type="number"
              value={numeroImmagini}
              onChange={(e) => setNumeroImmagini(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
              min="1"
              max="50"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={uploadToGDrive}
              onChange={(e) => setUploadToGDrive(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-700">Upload automatico su Google Drive</span>
          </label>
        </div>

        {/* Search Button */}
        <div className="mt-8">
          <button
            onClick={handleSearch}
            disabled={isLoading || !tema.trim()}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Elaborazione in corso...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6" />
                <span>Avvia Ricerca Automatizzata</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold text-green-800">
                Ricerca Completata
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Tema:</span>
                <p className="text-gray-900">{results.tema}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Immagini trovate:</span>
                <p className="text-gray-900">{results.totalFound}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Query espanse:</span>
                <p className="text-gray-900">{results.expandedQueries.length}</p>
              </div>
            </div>

            {/* Expanded Queries */}
            <div className="mt-4">
              <span className="font-medium text-gray-600">Query AI generate:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {results.expandedQueries.map((query, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {query}
                  </span>
                ))}
              </div>
            </div>

            {/* GDrive Info */}
            {results.gdrive && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <Upload className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Google Drive Upload</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Cartella:</span>
                    <p className="font-medium">{results.gdrive.folder.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Upload riusciti:</span>
                    <p className="font-medium">{results.gdrive.results.successful}/{results.gdrive.results.total}</p>
                  </div>
                </div>
                <a
                  href={results.gdrive.folder.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Apri Cartella Google Drive</span>
                </a>
              </div>
            )}
          </div>

          {/* Images Grid */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Immagini Trovate ({results.results.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.results.map((image) => (
                <div
                  key={image.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {image.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {image.source}
                    </p>
                    {image.width && image.height && (
                      <p className="text-xs text-gray-400 mt-1">
                        {image.width}×{image.height}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}