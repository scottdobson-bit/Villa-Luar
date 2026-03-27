import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import PhotoGallery, { PhotoGalleryHandle } from '../components/PhotoGallery';
import ThemeToggle from '../components/ThemeToggle';

import { CALENDLY_URL } from '../constants';
import { useScrollRevealChildren } from '../utils/useScrollReveal';

// ─── Wave Divider ─────────────────────────────────────────────────────────────
const WaveDivider = ({
  fromColor,
  toColor,
  flip = false,
}: {
  fromColor: string;
  toColor: string;
  flip?: boolean;
}) => (
  <div className={`relative h-16 overflow-hidden ${fromColor}`} aria-hidden="true">
    <svg
      viewBox="0 0 1440 64"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={`absolute inset-0 w-full h-full ${flip ? 'scale-x-[-1]' : ''}`}
    >
      <path
        d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
        className={toColor}
      />
    </svg>
  </div>
);

// ─── Section Heading ──────────────────────────────────────────────────────────
const SectionHeading = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <div className="section-rule mb-12">
    <h2 className={`text-4xl font-semibold text-center px-4 whitespace-nowrap ${light ? 'text-white' : 'text-stone-800 dark:text-white'}`}>
      {children}
    </h2>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
  <div className="stat-card rounded-xl px-4 py-3 text-white text-center min-w-[80px]">
    <div className="text-amber-300 flex justify-center mb-1">{icon}</div>
    <div className="text-xl font-bold leading-tight">{value}</div>
    <div className="text-xs text-white/70 uppercase tracking-wider">{label}</div>
  </div>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const BedIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 7v10M3 7l2-4h14l2 4M21 7v10M3 17h18M8 7V5m8 2V5" />
  </svg>
);
const BathIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h18v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2zM3 13V8a1 1 0 011-1h3V5a2 2 0 012-2h0a2 2 0 012 2v2h9" />
  </svg>
);
const PoolIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0M3 12c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0M3 7h18" />
  </svg>
);
const AreaIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h4m12 0h-4m0 0V4m0 0v4M4 4v4m0 12v-4m0 4h4m12 0h-4m0 0v-4m0 4v-4M4 20v-4" />
  </svg>
);

// Feature card icons — mapped by keyword
const featureIconMap: Record<string, React.ReactNode> = {
  pool:       <PoolIcon />,
  bed:        <BedIcon />,
  bath:       <BathIcon />,
  garage:     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 10l2-5h14l2 5M3 10v7a1 1 0 001 1h16a1 1 0 001-1v-7" /></svg>,
  garden:     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3C8 3 5 6 5 9c0 2.5 1.5 4.5 3.5 5.5M12 3c4 0 7 3 7 6 0 2.5-1.5 4.5-3.5 5.5M12 3v18M9.5 14.5C9 16 8 18 7 21M14.5 14.5C15 16 16 18 17 21" /></svg>,
  gym:        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 7h2m8 0h2m-10 0V5m8 2V5m0 2v10m-8-10v10M6 17h2m8 0h2m-2 0v2m-8-2v2M4 12h2m12 0h2" /></svg>,
  view:       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" strokeWidth={1.5} /></svg>,
  wifi:       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" /></svg>,
  air:        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" /></svg>,
  terrace:    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 12v8h18v-8M3 12l9-8 9 8" /></svg>,
  default:    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
};

function getFeatureIcon(name: string): React.ReactNode {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(featureIconMap)) {
    if (lower.includes(key)) return icon;
  }
  return featureIconMap.default;
}

// ─── Loading ──────────────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen bg-stone-50 dark:bg-stone-900">
    <div className="relative flex items-center justify-center">
      <div className="absolute h-24 w-24 rounded-full border-t-2 border-b-2 border-amber-700 dark:border-amber-500 animate-spin"></div>
      <div className="text-amber-700 dark:text-amber-500 text-xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>VL</div>
    </div>
  </div>
);

// ─── Calendly ─────────────────────────────────────────────────────────────────
const CalendlyBookingSection = () => (
  <section id="booking" className="py-20 bg-white dark:bg-stone-800">
    <div className="container mx-auto px-6 text-center max-w-4xl">
      <SectionHeading>Arrange a Private Viewing</SectionHeading>
      <p className="mt-4 text-stone-600 dark:text-stone-300 max-w-xl mx-auto">
        Select an available time slot from our live calendar to schedule your personal tour of Villa Luar.
      </p>
      <div
        className="calendly-inline-widget mt-10 border dark:border-stone-700 rounded-2xl shadow-xl overflow-hidden bg-white"
        data-url={CALENDLY_URL}
        style={{ minWidth: '320px', height: '950px' }}
      />
    </div>
  </section>
);

// ─── HomePage ─────────────────────────────────────────────────────────────────
const HomePage = () => {
  const { content, isLoading } = useContent();
  const galleryRef = useRef<PhotoGalleryHandle>(null);
  const aboutRef    = useScrollRevealChildren<HTMLDivElement>();
  const featuresRef = useScrollRevealChildren<HTMLDivElement>();
  const locationRef = useScrollRevealChildren<HTMLDivElement>();

  if (isLoading || !content) return <LoadingScreen />;

  const { textContent, photos, gallerySections, location } = content;

  const featuredImage =
    (photos && photos.length > 0)
      ? photos[0]
      : gallerySections?.[0]?.subSections?.[0]?.photos?.[0];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewGallery = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (galleryRef.current) {
      galleryRef.current.openLightbox(0);
    } else {
      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-noise relative h-screen flex flex-col items-center justify-center text-white text-center overflow-hidden">
        {/* Light gradient overlay — keep image bright */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30 z-[1]" />
        {/* Ken Burns image */}
        {textContent.heroImageUrl && (
          <img
            src={textContent.heroImageUrl}
            alt={textContent.heroTitle}
            className="hero-image absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Title — no frosted glass panel, just strong text shadows */}
        <div className="relative z-10 px-6 flex flex-col items-center gap-10 w-full">
          <div className="max-w-4xl mx-auto">
            <p className="hero-subtitle text-amber-300 text-sm md:text-base font-medium tracking-[0.25em] uppercase mb-4"
               style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              Luxury Villa · For Sale
            </p>
            <h1 className="hero-title text-6xl md:text-8xl font-bold tracking-tight"
                style={{ textShadow: '0 4px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)' }}>
              {textContent.heroTitle}
            </h1>
            <p className="hero-subtitle mt-4 text-lg md:text-xl max-w-2xl mx-auto text-white"
               style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
              {textContent.heroSubtitle}
            </p>
          </div>

          {/* CTAs — inline so they stay centred with the text */}
          <div className="flex flex-row gap-4 justify-center items-center">
            <a
              href="#gallery"
              onClick={handleViewGallery}
              className="px-8 py-3 bg-amber-700 text-white font-bold rounded-full text-base hover:bg-amber-600 transition-all duration-300 shadow-xl hover:shadow-amber-700/40 transform hover:scale-105"
            >
              View Gallery
            </a>
            <a
              href="#booking"
              onClick={(e) => handleScroll(e, 'booking')}
              className="px-8 py-3 bg-white/20 text-white font-semibold rounded-full text-base border-2 border-white/60 hover:bg-white/30 transition-all duration-300"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
            >
              Book a Viewing
            </a>
          </div>

          {/* Scroll indicator */}
          <a href="#about" onClick={(e) => handleScroll(e, 'about')} aria-label="Scroll down" className="mt-4">
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center items-start p-1 animate-bounce hover:border-white transition-colors">
              <div className="w-1 h-2 bg-white rounded-full" />
            </div>
          </a>
        </div>
      </section>

      {/* Wave: hero → about */}
      <WaveDivider fromColor="bg-transparent" toColor="fill-white dark:fill-stone-900" />

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white dark:bg-stone-900">
        <div ref={aboutRef} className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center reveal-stagger">
          {/* Image with floating stat cards */}
          {featuredImage && (
            <div className="reveal-left order-last md:order-first relative">
              <div className="image-glow relative">
                <img
                  src={featuredImage.url}
                  alt={featuredImage.caption}
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
                />
                {/* Floating glass stat cards */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-3 px-4">
                  <StatCard value="5" label="Bedrooms" icon={<BedIcon />} />
                  <StatCard value="3" label="Bathrooms" icon={<BathIcon />} />
                  <StatCard value="Private" label="Pool" icon={<PoolIcon />} />
                  <StatCard value="350m²" label="Living" icon={<AreaIcon />} />
                </div>
              </div>
            </div>
          )}
          {/* Text */}
          <div className="reveal-right text-center md:text-left mt-8 md:mt-0">
            <p className="text-amber-700 dark:text-amber-500 text-sm font-medium tracking-widest uppercase mb-3">
              About the Property
            </p>
            <h2 className="text-4xl font-semibold text-stone-800 dark:text-white leading-tight">
              {textContent.aboutTitle}
            </h2>
            <div className="mt-4 w-16 h-0.5 bg-amber-700 dark:bg-amber-500 md:mx-0 mx-auto rounded-full" />
            <p className="mt-6 text-stone-600 dark:text-stone-300 leading-relaxed text-lg">
              {textContent.aboutText}
            </p>
          </div>
        </div>
      </section>

      {/* Wave: about → gallery */}
      <WaveDivider fromColor="bg-white dark:bg-stone-900" toColor="fill-stone-50 dark:fill-stone-950" />

      {/* ── Gallery ───────────────────────────────────────────────────────── */}
      <div id="gallery" className="bg-stone-50 dark:bg-stone-950 pb-12">
        <PhotoGallery ref={galleryRef} />
      </div>

      {/* Wave: gallery → location */}
      <WaveDivider fromColor="bg-stone-50 dark:bg-stone-950" toColor="fill-stone-100 dark:fill-stone-900" flip />

      {/* ── Location ──────────────────────────────────────────────────────── */}
      {location && (
        <section className="py-20 bg-stone-100 dark:bg-stone-900">
          <div className="container mx-auto px-6">
            <SectionHeading>{location.title}</SectionHeading>
            <div ref={locationRef} className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <div className="reveal-left text-center md:text-left">
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line text-lg">
                  {location.description}
                </p>
              </div>
              {location.imageUrl && (
                <div className="reveal-right rounded-2xl shadow-2xl overflow-hidden">
                  <img
                    src={location.imageUrl}
                    alt={location.title}
                    className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Wave: location → booking */}
      <WaveDivider fromColor="bg-stone-100 dark:bg-stone-900" toColor="fill-white dark:fill-stone-800" />

      {/* ── Booking ───────────────────────────────────────────────────────── */}
      <CalendlyBookingSection />

      {/* Wave: booking → features */}
      <WaveDivider fromColor="bg-white dark:bg-stone-800" toColor="fill-stone-100 dark:fill-stone-900" flip />

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-stone-100 dark:bg-stone-900">
        <div className="container mx-auto px-6">
          <SectionHeading>{textContent.featuresTitle}</SectionHeading>
          <div
            ref={featuresRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto reveal-stagger"
          >
            {textContent.features.map((feature) => (
              <div
                key={feature.id}
                className="reveal feature-card bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm border border-stone-100 dark:border-stone-700"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4">
                  {getFeatureIcon(feature.name)}
                </div>
                <h3 className="font-semibold text-lg text-stone-800 dark:text-stone-100 mb-1">
                  {feature.name}
                </h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed">
                  {feature.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave: features → considerations */}
      <WaveDivider fromColor="bg-stone-100 dark:bg-stone-900" toColor="fill-amber-50 dark:fill-amber-950/20" />

      {/* ── Considerations ────────────────────────────────────────────────── */}
      <section className="py-20 bg-amber-50 dark:bg-amber-950/20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30 p-8 md:p-12">
            <div className="flex gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <h2 className="text-2xl font-semibold text-stone-800 dark:text-amber-400 mb-4 mt-2">
              {textContent.considerationsTitle}
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {textContent.considerationsText}
            </p>
          </div>
        </div>
      </section>

      {/* Wave: considerations → footer */}
      <WaveDivider fromColor="bg-amber-50 dark:bg-amber-950/20" toColor="fill-stone-800 dark:fill-stone-950" />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-800 dark:bg-stone-950 text-stone-300 pt-4 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10 py-10 border-b border-stone-700">
            {/* Brand */}
            <div className="flex flex-col gap-3">
              <p className="text-white text-xl font-semibold tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                VILLA LUAR
              </p>
              <p className="text-stone-400 text-sm leading-relaxed">
                A rare luxury property offering an exceptional lifestyle in the heart of Spain.
              </p>
              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/34711013086"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-full text-sm font-medium transition-colors w-fit"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Us
              </a>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</p>
              <div className="flex flex-col gap-2 text-sm text-stone-400">
                <a href="tel:+34711013086" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  ES: +34 711 013 086
                </a>
                <a href="tel:+447740282182" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  UK: +44 7740 282 182
                </a>
                <a href="mailto:scott@villaluar.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  scott@villaluar.com
                </a>
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal</p>
              <div className="text-sm text-stone-400 flex flex-col gap-2">
                {/* TODO: Replace with actual tourist licence number */}
                <p>Licencia Turística: <span className="font-mono text-stone-300">VFT/MU-XXXXXX</span></p>
                <p>&copy; {new Date().getFullYear()} Villa Luar. All rights reserved.</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex justify-between items-center pt-6 text-xs text-stone-500">
            <p>Villa Luar — Luxury Residential Property</p>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="hover:text-stone-300 transition-colors">Admin</Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/34711013086"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-xl flex items-center justify-center hover:bg-[#20ba5a] transition-colors chatbot-pulse"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.522 5.836L.036 23.964l6.305-1.654A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.36-.213-3.719.976.993-3.626-.234-.373A9.818 9.818 0 1112 21.818z"/>
        </svg>
      </a>
    </main>
  );
};

export default HomePage;
