'use client'

import React, { useState, useRef } from 'react';
import { Search, Download, Folder, Sparkles, Settings, Image, Filter, Tag, Palette, Clock, Info, ChevronDown, Crown, Star, FolderOpen, ExternalLink, Eye } from 'lucide-react';
import { MagicSearchService, DownloadService, ImageResult, SearchFilters } from './services/api-services';
import { A31_PRESETS } from './api-config';
import { ImagePreviewModal } from './components/ImagePreviewModal';

const MagicSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'specific' | 'creative'>('specific');
  const [imageCount, setImageCount] = useState(20);
  const [downloadFolder, setDownloadFolder] = useState('./downloads');
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>('');
  const [selectedFolderHandle, setSelectedFolderHandle] = useState<any>(null);
  const [imageSize, setImageSize] = useState('any');
  const [imageType, setImageType] = useState('all');
  const [colorFilter, setColorFilter] = useState('any');
  const [aspectRatio, setAspectRatio] = useState('any');
  const [usageRights, setUsageRights] = useState('any');
  const [additionalContext, setAdditionalContext] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ImageResult[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showPresets, setShowPresets] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [aiExpansionInfo, setAiExpansionInfo] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [downloadedFiles, setDownloadedFiles] = useState<string[]>([]);
  const [autoDownload, setAutoDownload] = useState(true);
  
  // Stati per il modal di preview
  const [previewImage, setPreviewImage] = useState<ImageResult | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Funzione per selezionare cartella di download con browser picker
  const handleSelectFolder = async () => {
    try {
      // Prova prima con File System Access API (Chrome/Edge moderni)
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        setSelectedFolderHandle(directoryHandle);
        
        // Chiediamo all'utente di specificare il percorso completo della cartella selezionata
        const folderName = directoryHandle.name;
        const userPath = prompt(
          `📁 CARTELLA SELEZIONATA: "${folderName}"\n\n` +
          `Inserisci il percorso completo di questa cartella sul tuo computer:\n` +
          `(es. /Users/tuonome/Desktop/${folderName} su Mac)\n` +
          `(es. C:\\Users\\tuonome\\Desktop\\${folderName} su Windows)`,
          `/Users/tuonome/Desktop/${folderName}`
        );
        
        if (userPath && userPath.trim()) {
          const finalPath = userPath.trim();
          setDownloadFolder(finalPath);
          setSelectedFolderPath(finalPath);
          
          alert(
            `✅ CARTELLA DI DOWNLOAD IMPOSTATA!\n\n` +
            `📂 ${finalPath}\n\n` +
            `Tutte le immagini future verranno salvate qui automaticamente.`
          );
        } else {
          alert('❌ Selezione annullata - percorso non impostato');
        }
      } else {
        // Fallback: usa input file nascosto con webkitdirectory
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;
        
        input.onchange = (event) => {
          const files = (event.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            // Prendi il primo file per ottenere il percorso della cartella
            const firstFile = files[0];
            const pathParts = firstFile.webkitRelativePath.split('/');
            const folderName = pathParts[0];
            
            // Chiediamo all'utente di specificare il percorso completo
            const userPath = prompt(
              `📁 CARTELLA SELEZIONATA: "${folderName}"\n\n` +
              `Inserisci il percorso completo di questa cartella sul tuo computer:\n` +
              `(es. /Users/tuonome/Desktop/${folderName} su Mac)\n` +
              `(es. C:\\Users\\tuonome\\Desktop\\${folderName} su Windows)`,
              `/Users/tuonome/Desktop/${folderName}`
            );
            
            if (userPath && userPath.trim()) {
              const finalPath = userPath.trim();
              setDownloadFolder(finalPath);
              setSelectedFolderPath(finalPath);
              
              alert(
                `✅ CARTELLA DI DOWNLOAD IMPOSTATA!\n\n` +
                `📂 ${finalPath}\n\n` +
                `Tutte le immagini future verranno salvate qui automaticamente.`
              );
            } else {
              alert('❌ Selezione annullata - percorso non impostato');
            }
          }
        };
        
        // Mostra il dialog di selezione cartella
        input.click();
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        // L'utente ha cancellato la selezione - non mostrare errore
        return;
      }
      
      alert(
        `⚠️ Errore nella selezione della cartella.\n\n` +
        `Puoi sempre inserire manualmente il percorso nel campo sopra.\n` +
        `Esempio: /Users/tuonome/Desktop/mie-immagini`
      );
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setResults([]);
    setAiExpansionInfo('');

    try {
      const filters: SearchFilters = {
        imageSize,
        imageType,
        colorFilter,
        aspectRatio,
        usageRights,
      };

      const searchResults = await MagicSearchService.performSearch(
        searchQuery,
        searchType,
        filters,
        additionalContext,
        imageCount
      );

      setResults(searchResults);

      if (searchType === 'creative') {
        const premiumCount = searchResults.filter(r => r.isPremium).length;
        setAiExpansionInfo(`🤖 L'AI ha espanso "${searchQuery}" in ${Math.ceil(searchResults.length / 6)} query correlate. Trovati ${searchResults.length} risultati (${premiumCount} premium) da 6 fonti diverse.${autoDownload ? ' 🚀 Download automatico avviato...' : ''}`);
      } else {
        const premiumCount = searchResults.filter(r => r.isPremium).length;
        setAiExpansionInfo(`🎯 Ricerca completata: ${searchResults.length} risultati trovati (${premiumCount} premium)${autoDownload ? ' 🚀 Download automatico avviato...' : ''}`);
      }

      // Download automatico se abilitato
      if (autoDownload && searchResults.length > 0) {
        setTimeout(() => {
          downloadAllImagesAutomatically(searchResults);
        }, 1000); // Piccolo delay per mostrare prima i risultati
      }

    } catch (error) {
      console.error('Search failed:', error);
      setSearchError(error instanceof Error ? error.message : 'Errore durante la ricerca');
    } finally {
      setIsSearching(false);
    }
  };

  // Funzione specifica per download automatico
  const downloadAllImagesAutomatically = async (imagesToDownload: ImageResult[]) => {
    if (imagesToDownload.length === 0) return;

    setIsDownloading(true);
    setDownloadProgress(`🚀 Download automatico in corso... ${imagesToDownload.length} immagini`);
    setDownloadedFiles([]);

    try {
      // Usa il percorso relativo selezionato dall'utente
      const result = await DownloadService.downloadMultipleImages(imagesToDownload, downloadFolder);
      
      const newDownloadedFiles = imagesToDownload.map(img => `${img.title.replace(/[^a-z0-9_-]/gi, '_')}.jpg`);
      setDownloadedFiles(prev => [...prev, ...newDownloadedFiles]);
      
      setDownloadProgress(`✅ Download automatico completato! ${result.success} successi, ${result.failed} errori`);
      
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 3000);
    } catch (error) {
      console.error('Auto download failed:', error);
      setDownloadProgress('❌ Errore durante il download automatico');
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 3000);
    }
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = A31_PRESETS[presetKey as keyof typeof A31_PRESETS];
    if (preset) {
      setImageSize(preset.filters.imageSize);
      setUsageRights(preset.filters.usageRights);
      setColorFilter(preset.filters.colorFilter);
      setAspectRatio(preset.filters.aspectRatio);
      setSelectedPreset(presetKey);
      setShowPresets(false);
      
      // Aggiungi contesto AI se in modalità creativa
      if (searchType === 'creative') {
        setAdditionalContext(prev => 
          prev ? `${prev}. ${preset.aiPromptAddition}` : preset.aiPromptAddition
        );
      }
    }
  };

  const handleImageSelect = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === results.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(results.map(r => r.id)));
    }
  };

  const handleDownloadSelected = async () => {
    const selectedResults = results.filter(r => selectedImages.has(r.id));
    if (selectedResults.length === 0) {
      alert('⚠️ Seleziona almeno un\'immagine da scaricare');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(`Iniziando il download di ${selectedResults.length} immagini...`);
    setDownloadedFiles([]);

    try {
      // Usa il percorso relativo selezionato dall'utente
      const result = await DownloadService.downloadMultipleImages(selectedResults, downloadFolder);
      
      const newDownloadedFiles = selectedResults.map(img => `${img.title.replace(/[^a-z0-9_-]/gi, '_')}.jpg`);
      setDownloadedFiles(prev => [...prev, ...newDownloadedFiles]);
      
      setDownloadProgress(`✅ Download completato! ${result.success} successi, ${result.failed} errori`);
      
      // Reset selezione dopo download
      setSelectedImages(new Set());
      
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadProgress('❌ Errore durante il download delle immagini');
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 3000);
    }
  };

  const handleDownloadSingle = async (imageResult: ImageResult) => {
    setIsDownloading(true);
    setDownloadProgress('Scaricando immagine...');
    
    try {
      const fileName = `${imageResult.title.replace(/[^a-z0-9_-]/gi, '_')}.jpg`;
      // Usa il percorso relativo selezionato dall'utente
      const success = await DownloadService.downloadImage(imageResult.url, fileName, downloadFolder);
      
      if (success) {
        setDownloadedFiles(prev => [...prev, fileName]);
        setDownloadProgress('✅ Immagine scaricata con successo!');
      } else {
        setDownloadProgress('❌ Errore durante il download');
      }
      
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 2000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadProgress('❌ Errore durante il download');
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 2000);
    }
  };

  const handleDownloadAll = async () => {
    if (results.length === 0) {
      alert('⚠️ Nessuna immagine da scaricare');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(`Iniziando il download di ${results.length} immagini...`);
    setDownloadedFiles([]);

    try {
      // Usa il percorso relativo selezionato dall'utente
      const result = await DownloadService.downloadMultipleImages(results, downloadFolder);
      
      const newDownloadedFiles = results.map(img => `${img.title.replace(/[^a-z0-9_-]/gi, '_')}.jpg`);
      setDownloadedFiles(prev => [...prev, ...newDownloadedFiles]);
      
      setDownloadProgress(`✅ Download completato! ${result.success} successi, ${result.failed} errori`);
      
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadProgress('❌ Errore durante il download delle immagini');
      setTimeout(() => {
        setDownloadProgress('');
        setIsDownloading(false);
      }, 3000);
    }
  };

  // Conta risultati per fonte
  const getSourceStats = () => {
    const stats: { [key: string]: number } = {};
    results.forEach(result => {
      stats[result.source] = (stats[result.source] || 0) + 1;
    });
    return stats;
  };

  // Funzione per aprire cartella download
  const openDownloadFolder = async () => {
    try {
      const response = await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: downloadFolder })
      });
      
      if (!response.ok) {
        throw new Error('Impossibile aprire la cartella');
      }
    } catch (error) {
      console.error('Error opening folder:', error);
      alert('⚠️ Impossibile aprire automaticamente la cartella. Naviga manualmente a: ' + downloadFolder);
    }
  };

  // Funzioni per il modal di preview
  const handleImagePreview = (image: ImageResult) => {
    setPreviewImage(image);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewImage(null);
  };

  const handlePreviewDownload = async (image: ImageResult) => {
    await handleDownloadSingle(image);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center">
              <img 
                src="/Magic_search_icon.png" 
                alt="Magic Search Logo" 
                className="w-12 h-12 rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold text-white">Magic Search</h1>
          </div>
          <p className="text-gray-300 text-lg">Powered by Ar1films</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pannello di controllo */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-6">
                
                {/* Preset A31 Films */}
                <div className="relative">
                  <label className="block text-white font-semibold mb-2">Preset A31 Films</label>
                  <button
                    onClick={() => setShowPresets(!showPresets)}
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white flex items-center justify-between hover:bg-gray-700 transition-colors"
                  >
                    <span>{selectedPreset ? A31_PRESETS[selectedPreset as keyof typeof A31_PRESETS].name : 'Seleziona preset...'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showPresets && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg z-10 overflow-hidden max-h-80 overflow-y-auto">
                      {Object.entries(A31_PRESETS).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => handlePresetSelect(key)}
                          className="w-full p-3 text-left text-white hover:bg-gray-700 transition-colors border-b border-gray-600 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{preset.name}</div>
                            {preset.preferredSources?.includes('envato') && (
                              <Crown className="w-3 h-3 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">{preset.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Tipo di ricerca */}
                <div>
                  <label className="block text-white font-semibold mb-3">Tipo di Ricerca</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSearchType('specific')}
                      className={`p-3 rounded-lg border transition-all ${
                        searchType === 'specific'
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Search className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-sm">Specifica</div>
                    </button>
                    <button
                      onClick={() => setSearchType('creative')}
                      className={`p-3 rounded-lg border transition-all ${
                        searchType === 'creative'
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-sm">Creativa</div>
                    </button>
                  </div>
                  
                  {/* Info tooltip */}
                  <div className="mt-2 p-2 bg-gray-800 rounded-lg text-xs text-gray-400">
                    {searchType === 'specific' ? 
                      '🎯 Ricerca diretta basata su keyword precise' : 
                      '🧠 L\'AI espande la ricerca per risultati creativi correlati'
                    }
                  </div>
                </div>

                {/* Query di ricerca */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    {searchType === 'specific' ? 'Cosa cerchi?' : 'Progetto/Ispirazione'}
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === 'specific' 
                        ? 'es. "alpi innevate"' 
                        : 'es. "concerto rock, effetti visivi"'
                    }
                    className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                {/* Contesto aggiuntivo per ricerca creativa */}
                {searchType === 'creative' && (
                  <div>
                    <label className="block text-white font-semibold mb-2">Contesto Aggiuntivo</label>
                    <textarea
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      placeholder="Descrivi il mood, lo stile, il target audience, l'utilizzo previsto..."
                      className="w-full p-3 h-20 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Numero immagini */}
                <div>
                  <label className="block text-white font-semibold mb-2">
                    Numero di Immagini: {imageCount}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={imageCount}
                    onChange={(e) => setImageCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Cartella download */}
                <div>
                  <label className="block text-white font-semibold mb-2">Cartella Download</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={downloadFolder}
                      onChange={(e) => setDownloadFolder(e.target.value)}
                      placeholder="./downloads"
                      className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleSelectFolder}
                      className="px-3 py-3 rounded-lg bg-blue-600 border border-blue-500 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 whitespace-nowrap"
                      title="Scegli cartella di download"
                    >
                      <Folder className="w-4 h-4" />
                      <span className="text-sm">Scegli</span>
                    </button>
                    {downloadedFiles.length > 0 && (
                      <button 
                        onClick={openDownloadFolder}
                        className="p-3 rounded-lg bg-green-600 border border-green-500 text-white hover:bg-green-700 transition-colors"
                        title="Apri cartella download"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Info semplificata */}
                  <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-200">
                    💡 Clicca "Scegli" per impostare dove salvare le immagini, oppure scrivi il percorso direttamente qui sopra
                  </div>
                  
                  {/* Mostra info cartella selezionata */}
                  {selectedFolderPath && selectedFolderPath !== './downloads' && (
                    <div className="mt-2 p-3 bg-green-500/20 border border-green-500/30 rounded text-sm text-green-200">
                      <div className="flex items-center gap-2 font-semibold">
                        ✅ Cartella di download configurata
                      </div>
                      <div className="mt-1 text-xs break-all">
                        📂 {selectedFolderPath}
                      </div>
                      <div className="mt-2 text-xs text-green-300">
                        ✓ Pronto per il download automatico!
                      </div>
                    </div>
                  )}
                  
                  {/* Warning se cartella non selezionata */}
                  {(!selectedFolderPath || selectedFolderPath === './downloads') && (
                    <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-xs text-yellow-200">
                      ⚠️ Stai usando la cartella di default. Clicca "Scegli" per scegliere dove scaricare le immagini.
                    </div>
                  )}
                  
                  {/* Toggle download automatico */}
                  <div className="mt-3 flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoDownload}
                        onChange={(e) => setAutoDownload(e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-white text-sm">Download automatico dopo ricerca</span>
                    </label>
                  </div>
                  
                  {/* Info download automatico */}
                  {autoDownload && (
                    <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/20 rounded text-xs text-purple-200">
                      🚀 Le immagini verranno scaricate automaticamente al termine della ricerca nella cartella: <code className="bg-purple-800/30 px-1 rounded">{downloadFolder}</code>
                    </div>
                  )}
                  
                  {/* Mostra file scaricati */}
                  {downloadedFiles.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300">
                      📥 {downloadedFiles.length} file scaricati recentemente in: <code className="bg-gray-800 px-1 rounded">{downloadFolder}</code>
                    </div>
                  )}
                </div>

                {/* Filtri avanzati */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtri Avanzati
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Dimensione immagine */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Dimensione</label>
                      <select
                        value={imageSize}
                        onChange={(e) => setImageSize(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="any">Qualsiasi</option>
                        <option value="small">Piccola (&lt;500px)</option>
                        <option value="medium">Media (500-1500px)</option>
                        <option value="large">Grande (1500-3000px)</option>
                        <option value="xlarge">Ultra (&gt;3000px)</option>
                      </select>
                    </div>

                    {/* Tipo immagine */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Tipo</label>
                      <select
                        value={imageType}
                        onChange={(e) => setImageType(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="all">Tutte</option>
                        <option value="photo">Solo Foto</option>
                        <option value="illustration">Illustrazioni</option>
                        <option value="vector">Vettoriali</option>
                        <option value="icon">Icone</option>
                      </select>
                    </div>

                    {/* Filtro colore */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Colore Dominante</label>
                      <select
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="any">Qualsiasi</option>
                        <option value="red">Rosso</option>
                        <option value="blue">Blu</option>
                        <option value="green">Verde</option>
                        <option value="yellow">Giallo</option>
                        <option value="black">Nero</option>
                        <option value="white">Bianco</option>
                        <option value="grayscale">Scala di grigi</option>
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Formato</label>
                      <select
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="any">Qualsiasi</option>
                        <option value="square">Quadrato (1:1)</option>
                        <option value="wide">Panoramico (16:9)</option>
                        <option value="tall">Verticale (9:16)</option>
                      </select>
                    </div>

                    {/* Diritti d'uso */}
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Diritti d'Uso</label>
                      <select
                        value={usageRights}
                        onChange={(e) => setUsageRights(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="any">Qualsiasi</option>
                        <option value="free">Solo Gratuiti</option>
                        <option value="commercial">Uso Commerciale</option>
                        <option value="creative_commons">Creative Commons</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pulsante ricerca */}
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Ricerca in corso...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Avvia Ricerca Magica{autoDownload ? ' + Download' : ''}
                    </>
                  )}
                </button>
                
                {/* Info download automatico sotto il pulsante */}
                {autoDownload && !isSearching && (
                  <div className="mt-2 text-center">
                    <div className="text-xs text-blue-300 bg-blue-500/10 rounded-lg px-3 py-2">
                      🚀 Download automatico attivato - Le immagini verranno scaricate subito dopo la ricerca
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Area risultati */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6">
                
                {/* AI Expansion Info */}
                {aiExpansionInfo && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-200 text-sm">
                      <Info className="w-4 h-4" />
                      {aiExpansionInfo}
                    </div>
                  </div>
                )}

                {/* Source Stats */}
                {results.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {Object.entries(getSourceStats()).map(([source, count]) => (
                      <div key={source} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 flex items-center gap-1">
                        {source === 'Envato' && <Crown className="w-3 h-3 text-yellow-400" />}
                        {source === 'Freepik' && <Star className="w-3 h-3 text-blue-400" />}
                        {source}: {count}
                      </div>
                    ))}
                  </div>
                )}

                {/* Download Controls */}
                {results.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-800 border border-gray-600 rounded-lg">
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedImages.size === results.length && results.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-white text-sm">
                          {selectedImages.size > 0 ? `${selectedImages.size} selezionate` : 'Seleziona tutto'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadSelected}
                          disabled={selectedImages.size === 0 || isDownloading}
                          className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Scarica Selezionate ({selectedImages.size})
                        </button>
                        
                        <button
                          onClick={handleDownloadAll}
                          disabled={isDownloading}
                          className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Scarica Tutto ({results.length})
                        </button>
                      </div>
                    </div>
                    
                    {/* Download Progress */}
                    {downloadProgress && (
                      <div className="mt-3 p-2 bg-gray-700 rounded text-sm text-white flex items-center gap-2">
                        {isDownloading && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                        {downloadProgress}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-400">
                      📁 Le immagini verranno salvate in: <code className="bg-gray-700 px-1 rounded">{downloadFolder}</code>
                      {downloadedFiles.length > 0 && (
                        <div className="mt-1 text-green-300">
                          ✅ Ultimi {downloadedFiles.length} file scaricati con successo!
                          <button 
                            onClick={openDownloadFolder}
                            className="ml-2 text-blue-300 hover:text-blue-200 underline"
                          >
                            Apri cartella
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Error display */}
                {searchError && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                    <div className="text-red-200 text-sm">❌ {searchError}</div>
                  </div>
                )}

                {results.length === 0 && !isSearching ? (
                  <div className="text-center py-20">
                    <Image className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-gray-300 text-lg mb-2">Nessun risultato ancora</h3>
                    <p className="text-gray-500">Configura la tua ricerca e premi "Avvia Ricerca Magica"</p>
                    <div className="mt-4 text-xs text-gray-500">
                      Accesso a 6 API: Google, Unsplash, Pixabay, Pexels, Freepik (premium), Envato (premium)
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-white font-semibold text-lg">
                          Risultati Trovati: {results.length}
                        </h3>
                        {results.length > 0 && (
                          <button
                            onClick={handleSelectAll}
                            className="text-sm text-blue-300 hover:text-blue-200 transition-colors"
                          >
                            {selectedImages.size === results.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {results.map((result) => (
                        <div key={result.id} className="group relative">
                          <div className="aspect-square overflow-hidden rounded-lg bg-gray-800 relative">
                            <img
                              src={result.thumbnailUrl || result.url}
                              alt={result.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                              loading="lazy"
                              onClick={() => handleImagePreview(result)}
                              onError={(e) => {
                                // Fallback all'URL principale se il thumbnail non funziona
                                const target = e.target as HTMLImageElement;
                                if (target.src !== result.url && result.url) {
                                  target.src = result.url;
                                }
                              }}
                            />
                            
                            {/* Checkbox */}
                            <div className="absolute top-2 left-2">
                              <input
                                type="checkbox"
                                checked={selectedImages.has(result.id)}
                                onChange={() => handleImageSelect(result.id)}
                                className="w-4 h-4 accent-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            
                            {/* Source badge */}
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <div className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                                {result.isPremium && (
                                  result.source === 'Envato' ? 
                                    <Crown className="w-3 h-3 text-yellow-400" /> :
                                    <Star className="w-3 h-3 text-blue-400" />
                                )}
                                {result.source}
                              </div>
                            </div>

                            {/* Premium badge */}
                            {result.isPremium && (
                              <div className="absolute bottom-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded font-bold">
                                PREMIUM
                              </div>
                            )}
                          </div>
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImagePreview(result);
                                }}
                                className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
                                title="Anteprima"
                              >
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSingle(result);
                                }}
                                className="p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
                                title="Download singolo"
                              >
                                <Download className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-white text-xs">
                            <div className="truncate font-medium">{result.title}</div>
                            <div className="text-gray-300">{result.width}×{result.height}</div>
                            {result.photographer && (
                              <div className="text-gray-300">📸 {result.photographer}</div>
                            )}
                            {result.category && (
                              <div className="text-gray-300">🏷️ {result.category}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal di preview */}
      <ImagePreviewModal
        image={previewImage}
        isOpen={isPreviewOpen}
        onClose={closePreview}
        onDownload={handlePreviewDownload}
      />
      
      {/* CSS per personalizzare lo slider */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1f2937;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  );
};

export default MagicSearch;