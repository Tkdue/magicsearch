import React from 'react';
import { ImageResult } from '../services/api-services';

interface ImagePreviewModalProps {
  image: ImageResult | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (image: ImageResult) => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  image,
  isOpen,
  onClose,
  onDownload
}) => {
  if (!isOpen || !image) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    onDownload(image);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium">
              {image.source}
            </span>
            {image.isPremium && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-full font-medium">
                Premium
              </span>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Image */}
          <div className="lg:w-2/3 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <img
              src={image.url}
              alt={image.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              style={{ maxHeight: '60vh' }}
              onError={(e) => {
                // Fallback al thumbnailUrl se l'URL principale non funziona
                const target = e.target as HTMLImageElement;
                if (target.src !== image.thumbnailUrl && image.thumbnailUrl) {
                  target.src = image.thumbnailUrl;
                }
              }}
            />
          </div>

          {/* Details */}
          <div className="lg:w-1/3 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {image.title}
                </h3>
              </div>

              {/* Photographer */}
              {image.photographer && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fotografo</p>
                  <p className="text-gray-900 dark:text-white">{image.photographer}</p>
                </div>
              )}

              {/* Dimensions */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Dimensioni</p>
                <p className="text-gray-900 dark:text-white">{image.width} × {image.height}px</p>
              </div>

              {/* License */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Licenza</p>
                <p className="text-gray-900 dark:text-white">{image.license}</p>
              </div>

              {/* Source */}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Fonte</p>
                <p className="text-gray-900 dark:text-white">{image.source}</p>
              </div>

              {/* Tags */}
              {image.tags && image.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {image.tags.slice(0, 10).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              {image.category && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Categoria</p>
                  <p className="text-gray-900 dark:text-white">{image.category}</p>
                </div>
              )}

              {/* Download Button */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Scarica Immagine</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 