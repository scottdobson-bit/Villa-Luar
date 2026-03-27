
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { VillaPhoto, PhotoSection } from '../types';
import { useContent } from '../context/ContentContext';

export interface PhotoGalleryHandle {
  openLightbox: (index: number) => void;
}

interface PhotoGalleryProps {
  photos?: VillaPhoto[]; // Legacy prop, optional
}

// ─── Magazine grid for a subsection ─────────────────────────────────────────
const MagazineGrid = ({
  photos,
  globalOffset,
  onOpen,
}: {
  photos: VillaPhoto[];
  globalOffset: number;
  onOpen: (index: number) => void;
}) => {
  if (photos.length === 0) return null;

  return (
    <div className="gallery-magazine rounded-xl overflow-hidden">
      {photos.map((photo, i) => {
        const isFeatured = i === 0 && photos.length > 1;
        const isTall     = i === 1 && photos.length > 3;

        return (
          <div
            key={photo.id}
            className={`group relative overflow-hidden cursor-pointer
              ${isFeatured ? 'photo-featured' : ''}
              ${isTall ? 'photo-tall' : ''}
            `}
            style={{ minHeight: '160px' }}
            onClick={() => onOpen(globalOffset + i)}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {/* Caption */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-white font-semibold text-sm leading-tight">{photo.caption}</p>
              {photo.description && (
                <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{photo.description}</p>
              )}
            </div>
            {/* Expand icon */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Main PhotoGallery ────────────────────────────────────────────────────────
const PhotoGallery = forwardRef<PhotoGalleryHandle, PhotoGalleryProps>(({ photos: legacyPhotos }, ref) => {
  const { content } = useContent();
  const sections = content?.gallerySections || [];

  const allPhotos = React.useMemo(() => {
    if (legacyPhotos && legacyPhotos.length > 0) return legacyPhotos;
    return sections.flatMap(s => s.subSections.flatMap(ss => ss.photos));
  }, [sections, legacyPhotos]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    openLightbox: (index: number) => {
      if (index >= 0 && index < allPhotos.length) {
        setSelectedIndex(index);
        setImgLoaded(false);
      }
    },
  }));

  const openAt = useCallback((i: number) => {
    setSelectedIndex(i);
    setImgLoaded(false);
  }, []);

  const handleClose = useCallback(() => setSelectedIndex(null), []);

  const handleNext = useCallback(() => {
    setSelectedIndex(prev => (prev !== null && prev < allPhotos.length - 1 ? prev + 1 : prev));
    setImgLoaded(false);
  }, [allPhotos.length]);

  const handlePrev = useCallback(() => {
    setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    setImgLoaded(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape')      handleClose();
      if (e.key === 'ArrowRight')  handleNext();
      if (e.key === 'ArrowLeft')   handlePrev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedIndex, handleClose, handleNext, handlePrev]);

  if (allPhotos.length === 0) return null;

  // Build offset map for global index calculation
  let photoOffset = 0;

  const selectedPhoto = selectedIndex !== null ? allPhotos[selectedIndex] : null;

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 md:px-6">

        {sections.map((section) => {
          const sectionPhotos = section.subSections.flatMap(ss => ss.photos);
          if (sectionPhotos.length === 0) return null;

          return (
            <div key={section.id} className="mb-20 last:mb-0">

              {/* Section header */}
              <div className="flex items-center gap-5 mb-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent dark:via-amber-600/30" />
                <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 dark:text-white tracking-tight px-2">
                  {section.title}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-700/40 to-transparent dark:via-amber-600/30" />
              </div>

              {/* Sub-sections */}
              {section.subSections.map((sub) => {
                if (sub.photos.length === 0) return null;
                const offset = (() => {
                  const o = photoOffset;
                  photoOffset += sub.photos.length;
                  return o;
                })();

                return (
                  <div key={sub.id} className="mb-10 last:mb-0">
                    {/* Sub-section label */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-1 h-5 bg-amber-700 dark:bg-amber-500 rounded-full" />
                      <h3 className="text-base font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                        {sub.title}
                      </h3>
                      <span className="text-xs text-stone-400 ml-1">
                        ({sub.photos.length} photo{sub.photos.length !== 1 ? 's' : ''})
                      </span>
                    </div>

                    <MagazineGrid
                      photos={sub.photos}
                      globalOffset={offset}
                      onOpen={openAt}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Legacy flat-list fallback */}
        {sections.every(s => s.subSections.every(ss => ss.photos.length === 0)) && legacyPhotos && legacyPhotos.length > 0 && (
          <div className="gallery-magazine rounded-xl overflow-hidden">
            {legacyPhotos.map((photo, i) => (
              <div
                key={photo.id}
                className={`group relative cursor-pointer overflow-hidden ${i === 0 ? 'photo-featured' : ''}`}
                style={{ minHeight: '220px' }}
                onClick={() => openAt(i)}
              >
                <img src={photo.url} alt={photo.caption} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          {/* Prev */}
          {selectedIndex !== null && selectedIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              aria-label="Previous"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Panel */}
          <div
            className="lightbox-panel bg-stone-900 rounded-2xl shadow-2xl max-w-6xl w-full mx-4 md:mx-16 max-h-[92vh] flex flex-col md:flex-row overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="w-full md:w-2/3 bg-black flex items-center justify-center min-h-[300px] md:min-h-[500px]">
              {!imgLoaded && (
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              )}
              <img
                key={selectedPhoto.url}
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                onLoad={() => setImgLoaded(true)}
                className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
              />
            </div>

            {/* Info panel */}
            <div className="p-6 md:p-8 flex flex-col justify-between md:w-1/3 bg-stone-900 overflow-y-auto">
              <div>
                <p className="text-amber-500 text-xs font-medium tracking-widest uppercase mb-2">
                  {selectedIndex !== null ? `${selectedIndex + 1} / ${allPhotos.length}` : ''}
                </p>
                <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                  {selectedPhoto.caption}
                </h3>
                {selectedPhoto.description && (
                  <p className="text-stone-400 leading-relaxed text-sm">{selectedPhoto.description}</p>
                )}
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
                {allPhotos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedIndex(i); setImgLoaded(false); }}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === selectedIndex ? 'border-amber-500 scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Next */}
          {selectedIndex !== null && selectedIndex < allPhotos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              aria-label="Next"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default PhotoGallery;
