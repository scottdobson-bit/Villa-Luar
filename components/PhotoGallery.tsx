
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { VillaPhoto, PhotoSection } from '../types';
import { useContent } from '../context/ContentContext';

export interface PhotoGalleryHandle {
  openLightbox: (index: number) => void;
}

interface PhotoGalleryProps {
  photos?: VillaPhoto[]; // Legacy prop, optional now
}

const PhotoGallery = forwardRef<PhotoGalleryHandle, PhotoGalleryProps>(({ photos: legacyPhotos }, ref) => {
  const { content } = useContent();
  const sections = content?.gallerySections || [];
  
  // Flatten photos for the lightbox navigation while keeping track of index
  const allPhotos = React.useMemo(() => {
      if (legacyPhotos && legacyPhotos.length > 0) return legacyPhotos;
      return sections.flatMap(section => 
        section.subSections.flatMap(sub => sub.photos)
      );
  }, [sections, legacyPhotos]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    openLightbox: (index: number) => {
      if (index >= 0 && index < allPhotos.length) {
        setSelectedIndex(index);
      }
    }
  }));

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prevIndex) => {
      if (prevIndex === null || prevIndex === allPhotos.length - 1) {
        return prevIndex;
      }
      return prevIndex + 1;
    });
  }, [selectedIndex, allPhotos.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prevIndex) => {
      if (prevIndex === null || prevIndex === 0) {
        return prevIndex;
      }
      return prevIndex - 1;
    });
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (event.key === 'Escape') {
        handleClose();
      }
      if (event.key === 'ArrowRight') {
        handleNext();
      }
      if (event.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, handleNext, handlePrev, handleClose]);

  if (allPhotos.length === 0) {
    return null;
  }
  
  const selectedPhoto = selectedIndex !== null ? allPhotos[selectedIndex] : null;

  return (
    <div className="bg-white dark:bg-stone-900 py-12">
      <div className="container mx-auto px-4">
        
        {sections.map((section) => (
            <div key={section.id} className="mb-16 last:mb-0">
                <h2 className="text-3xl font-bold text-center text-stone-800 dark:text-white mb-10 font-serif border-b border-stone-200 dark:border-stone-800 pb-4 mx-auto max-w-3xl">
                    {section.title}
                </h2>
                
                {section.subSections.map(sub => sub.photos.length > 0 && (
                    <div key={sub.id} className="mb-10 last:mb-0">
                        <h3 className="text-xl font-semibold text-amber-700 dark:text-amber-500 mb-6 pl-4 border-l-4 border-amber-700 dark:border-amber-500">
                            {sub.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {sub.photos.map((photo) => {
                                // Find global index for lightbox
                                const globalIndex = allPhotos.findIndex(p => p.id === photo.id);
                                return (
                                    <div 
                                        key={photo.id} 
                                        className="break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg shadow-md aspect-[4/3]" 
                                        onClick={() => setSelectedIndex(globalIndex)}
                                    >
                                        <img 
                                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform group-hover:scale-105" 
                                        src={photo.url} 
                                        alt={photo.caption} 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <div className="absolute bottom-0 left-0 p-4 w-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                            <p className="font-semibold text-white text-lg">{photo.caption}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        ))}

        {/* Fallback for flat list if sections are empty but photos exist (migration edge case) */}
        {sections.every(s => s.subSections.every(sub => sub.photos.length === 0)) && legacyPhotos && legacyPhotos.length > 0 && (
             <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
                {legacyPhotos.map((photo, index) => (
                 <div 
                    key={photo.id} 
                    className="mb-4 break-inside-avoid cursor-pointer group relative overflow-hidden rounded-lg shadow-md" 
                    onClick={() => setSelectedIndex(index)}
                  >
                    <img 
                      className="w-full h-auto object-cover transition-transform duration-500 ease-in-out transform group-hover:scale-105" 
                      src={photo.url} 
                      alt={photo.caption} 
                    />
                    {/* Hover effect */}
                  </div>
                ))}
             </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
           {selectedIndex !== null && selectedIndex > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full w-12 h-12 flex items-center justify-center text-3xl hover:bg-black/60 transition-colors z-50"
              aria-label="Previous image"
            >
              &#8249;
            </button>
          )}

          <div 
            className="bg-white dark:bg-stone-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
                onClick={handleClose} 
                className="absolute top-2 right-3 text-black dark:text-white bg-white/70 dark:bg-stone-700/70 rounded-full w-8 h-8 flex items-center justify-center text-2xl hover:bg-white dark:hover:bg-stone-600 transition-colors z-20"
                aria-label="Close image viewer"
            >
                &times;
            </button>
            <div className="w-full md:w-3/4 bg-black flex items-center justify-center">
                 <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="max-w-full max-h-[80vh] object-contain"/>
            </div>
            <div className="p-6 flex flex-col justify-center md:w-1/4 bg-white dark:bg-stone-800 overflow-y-auto">
              <h3 className="text-2xl font-bold mb-2 text-stone-800 dark:text-white">{selectedPhoto.caption}</h3>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm">{selectedPhoto.description}</p>
            </div>
          </div>
           {selectedIndex !== null && selectedIndex < allPhotos.length - 1 && (
             <button 
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full w-12 h-12 flex items-center justify-center text-3xl hover:bg-black/60 transition-colors z-50"
              aria-label="Next image"
            >
              &#8250;
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default PhotoGallery;
