
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import PhotoGallery, { PhotoGalleryHandle } from '../components/PhotoGallery';
import ThemeToggle from '../components/ThemeToggle';
import { CALENDLY_URL } from '../constants';


const FeatureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-700 dark:text-amber-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-amber-800 dark:text-amber-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
);

const LoadingScreen = () => (
    <div className="flex justify-center items-center h-screen bg-stone-50 dark:bg-stone-900">
        <div className="relative flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full border-t-2 border-b-2 border-amber-700 dark:border-amber-500 animate-spin"></div>
            <div className="text-amber-700 dark:text-amber-500 text-xl" style={{fontFamily: "'Montserrat', sans-serif"}}>VL</div>
        </div>
    </div>
);

const CalendlyBookingSection = () => {
  useEffect(() => {
    // This effect ensures the Calendly script re-initializes if the component re-renders.
    // The main script is in index.html for initial load.
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);
  
  return (
    <section id="booking" className="py-20 bg-white dark:bg-stone-800">
        <div className="container mx-auto px-6 text-center max-w-4xl">
            <h2 className="text-4xl font-semibold text-stone-800 dark:text-white">Arrange a Private Viewing</h2>
            <p className="mt-4 text-stone-600 dark:text-stone-300">
                Select an available time slot from our live calendar below to schedule your personal tour of Villa Luar.
            </p>
            <div className="calendly-inline-widget mt-8 border dark:border-stone-700 rounded-lg shadow-lg overflow-hidden bg-white" data-url={CALENDLY_URL} style={{ minWidth: '320px', height: '950px' }}>
                {/* Fallback content removed. Calendly has its own loader. */}
            </div>
        </div>
    </section>
  );
};


const HomePage = () => {
    const { content, isLoading } = useContent();
    const galleryRef = useRef<PhotoGalleryHandle>(null);

    if (isLoading || !content) {
        return <LoadingScreen />;
    }
    
    const { textContent, photos, gallerySections, location } = content;
    
    // Determine a featured image for the About section (try to find one from sections if flat list is empty)
    const featuredImage = (photos && photos.length > 0) ? photos[0] : 
                          (gallerySections && gallerySections[0] && gallerySections[0].subSections[0] && gallerySections[0].subSections[0].photos[0]);

    const handleScroll = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        event.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleViewGallery = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (galleryRef.current) {
            galleryRef.current.openLightbox(0);
        } else {
            // Fallback if ref is missing for some reason
            const targetElement = document.getElementById('gallery');
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <main>
            <section className="relative h-screen flex flex-col items-center justify-start text-white text-center pt-24 md:pt-32">
                <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
                {textContent.heroImageUrl && (
                     <img src={textContent.heroImageUrl} alt={textContent.heroTitle} className="absolute inset-0 w-full h-full object-cover"/>
                )}
                <div className="relative z-10 px-4 flex flex-col items-center gap-8">
                    <div className="bg-black/25 backdrop-blur-md p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto">
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight" style={{ textShadow: '0 3px 6px rgba(0,0,0,0.7)' }}>{textContent.heroTitle}</h1>
                        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>{textContent.heroSubtitle}</p>
                    </div>
                </div>
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-8">
                    <a href="#gallery" onClick={handleViewGallery} className="px-8 py-3 bg-amber-700 text-white font-bold rounded-full text-lg hover:bg-amber-600 transition-all duration-300 shadow-lg transform hover:scale-105">
                        View Gallery
                    </a>
                    <a href="#about" onClick={(e) => handleScroll(e, 'about')} aria-label="Scroll down">
                        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center items-start p-1 animate-bounce">
                            <div className="w-1 h-2 bg-white rounded-full"></div>
                        </div>
                    </a>
                </div>
            </section>

            <section id="about" className="py-20 bg-white dark:bg-stone-900">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    {featuredImage && (
                       <div className="order-last md:order-first">
                         <img src={featuredImage.url} alt={featuredImage.caption} className="rounded-lg shadow-xl w-full h-auto object-cover aspect-[4/3]" />
                       </div>
                    )}
                    <div className="text-center md:text-left">
                        <h2 className="text-4xl font-semibold text-stone-800 dark:text-white">{textContent.aboutTitle}</h2>
                        <p className="mt-6 text-stone-600 dark:text-stone-300 leading-relaxed">{textContent.aboutText}</p>
                    </div>
                </div>
            </section>

            <div id="gallery">
                {/* PhotoGallery now handles content context internally */}
                <PhotoGallery ref={galleryRef} />
            </div>

            {/* Location Section */}
            {location && (
                <section className="py-20 bg-stone-50 dark:bg-stone-900">
                    <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                         <div className="text-center md:text-left">
                            <h2 className="text-4xl font-semibold text-stone-800 dark:text-white">{location.title}</h2>
                            <p className="mt-6 text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">{location.description}</p>
                         </div>
                         {location.imageUrl && (
                             <div className="rounded-lg shadow-xl overflow-hidden">
                                <img src={location.imageUrl} alt={location.title} className="w-full h-auto object-cover" />
                             </div>
                         )}
                    </div>
                </section>
            )}

            <CalendlyBookingSection />

            <section className="py-20 bg-stone-100 dark:bg-stone-800">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-semibold text-center text-stone-800 dark:text-white mb-12">{textContent.featuresTitle}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {textContent.features.map(feature => (
                            <div key={feature.id} className="flex items-start">
                                <FeatureIcon/>
                                <div>
                                    <h3 className="font-semibold text-lg text-stone-700 dark:text-stone-200">{feature.name}</h3>
                                    <p className="text-stone-500 dark:text-stone-400">{feature.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-amber-50 border-t border-b border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="flex items-start">
                        <InfoIcon />
                        <div>
                            <h2 className="text-3xl font-semibold text-stone-800 dark:text-amber-500 mb-4">{textContent.considerationsTitle}</h2>
                            <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">{textContent.considerationsText}</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <footer className="bg-stone-800 text-stone-300 py-12 dark:bg-black/50">
                <div className="container mx-auto px-6 flex flex-col items-center text-center gap-8">
                    <div>
                        <p className="font-semibold">Contact Us</p>
                        <div className="text-sm mt-2 text-stone-400 flex flex-col gap-1">
                            <a href="tel:+34711013086" className="hover:text-white">ES: +34 711013086</a>
                            <a href="tel:+447740282182" className="hover:text-white">UK: +44 7740 282182</a>
                            <a href="mailto:scott@villaluar.com" className="hover:text-white">scott@villaluar.com</a>
                        </div>
                    </div>
                    <div>
                        <p>&copy; {new Date().getFullYear()} Villa Luar. All rights reserved.</p>
                        <p className="text-sm mt-2 text-stone-400">Tourist Licence: Available on request</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <Link to="/admin" className="text-xs text-stone-500 hover:text-stone-300">Admin</Link>
                        <ThemeToggle />
                    </div>
                </div>
            </footer>
        </main>
    );
};

export default HomePage;
