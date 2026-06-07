import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import PhotoGallery, { PhotoGalleryHandle } from '../components/PhotoGallery';
import ThemeToggle from '../components/ThemeToggle';

// Calendly import removed — using custom booking
import { useScrollRevealChildren } from '../utils/useScrollReveal';
import type { StatIconKey, VillaStat } from '../types';

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
    <h2 className={`text-3xl md:text-4xl font-semibold text-center px-4 ${light ? 'text-white' : 'text-stone-800 dark:text-white'}`}>
      {children}
    </h2>
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
  <div className="stat-card rounded-xl px-3 py-3 text-white text-center">
    <div className="text-amber-300 flex justify-center mb-1">{icon}</div>
    <div className="text-lg sm:text-xl font-bold leading-tight">{value}</div>
    <div className="text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">{label}</div>
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
const STAT_ICON_MAP: Record<StatIconKey, React.ReactNode> = {
  bed:  <BedIcon />,
  bath: <BathIcon />,
  pool: <PoolIcon />,
  area: <AreaIcon />,
};

const DEFAULT_STATS: VillaStat[] = [
  { id: 'stat-1', value: '5',     label: 'Bedrooms',  iconKey: 'bed'  },
  { id: 'stat-2', value: '3',     label: 'Bathrooms', iconKey: 'bath' },
  { id: 'stat-3', value: 'Pool',  label: 'Private',   iconKey: 'pool' },
  { id: 'stat-4', value: '350m²', label: 'Living',    iconKey: 'area' },
];

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

// ─── Scroll Progress Bar ──────────────────────────────────────────────────────
const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 z-[60] transition-[width] duration-150 ease-out pointer-events-none"
      style={{ width: `${progress}%` }}
      aria-hidden="true"
    />
  );
};

// ─── Floating Contact Button (WhatsApp) ───────────────────────────────────────
const FloatingContact = () => (
  <a
    href="https://wa.me/34711013086"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contact us on WhatsApp"
    className="fixed bottom-5 right-5 z-[55] w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 shadow-2xl shadow-green-900/30 flex items-center justify-center text-white transition-all hover:scale-110 floating-contact"
  >
    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  </a>
);

// ─── Custom Booking ───────────────────────────────────────────────────────────
interface BookingSlot {
  id: string;
  datetime: string;
  label: string;
  booked: boolean;
}

type BookingStep = 'slots' | 'form' | 'success';

const BookingSection = () => {
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<BookingStep>('slots');
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/slots')
      .then(r => r.json())
      .then((data: BookingSlot[]) => { setSlots(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Group slots by date
  const grouped = slots.reduce<Record<string, BookingSlot[]>>((acc, slot) => {
    const date = new Date(slot.datetime).toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id, ...form }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? 'Booking failed');
      }
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" className="py-20 bg-white dark:bg-stone-800">
      <div className="container mx-auto px-6 text-center max-w-3xl">
        <p className="text-amber-700 dark:text-amber-500 text-sm font-medium tracking-widest uppercase mb-3">
          Schedule Your Visit
        </p>
        <SectionHeading>Arrange a Private Viewing</SectionHeading>
        <p className="mt-4 text-stone-600 dark:text-stone-300 max-w-xl mx-auto text-lg">
          Viewings are available on Sundays, 12:00–16:00. Select a slot to book your personal tour.
        </p>

        <div className="mt-10 text-left">
          {step === 'slots' && (
            <>
              {loading && (
                <p className="text-center text-stone-500 py-10">Loading available times…</p>
              )}
              {!loading && Object.keys(grouped).length === 0 && (
                <div className="text-center py-10 text-stone-500 dark:text-stone-400">
                  <p className="text-lg font-medium mb-2">No slots available right now.</p>
                  <p className="text-sm">Please check back soon or contact us directly.</p>
                </div>
              )}
              {!loading && Object.entries(grouped).map(([date, daySlots]) => (
                <div key={date} className="mb-8">
                  <h3 className="text-stone-700 dark:text-stone-300 font-semibold text-base mb-3 border-b border-stone-200 dark:border-stone-700 pb-2">
                    {date}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {daySlots.map(slot => (
                      <button
                        key={slot.id}
                        onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                        className="px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-700 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-medium text-sm transition-colors"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {step === 'form' && selectedSlot && (
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setStep('slots')}
                className="text-sm text-amber-700 dark:text-amber-400 mb-4 flex items-center gap-1 hover:underline"
              >
                ← Back to slots
              </button>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                <p className="text-amber-900 dark:text-amber-200 font-semibold">{selectedSlot.label}</p>
                <p className="text-amber-700 dark:text-amber-400 text-sm">
                  {new Date(selectedSlot.datetime).toLocaleDateString('en-GB', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <form onSubmit={handleBook} className="space-y-4">
                <input
                  required
                  type="text"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <input
                  required
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <textarea
                  rows={3}
                  placeholder="Any questions or special requests? (optional)"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
                {error && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
                >
                  {submitting ? 'Confirming…' : 'Confirm Viewing'}
                </button>
              </form>
            </div>
          )}

          {step === 'success' && selectedSlot && (
            <div className="max-w-md mx-auto text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">Viewing Confirmed!</h3>
              <p className="text-stone-600 dark:text-stone-300 mb-1">
                Your viewing is booked for <strong>{selectedSlot.label}</strong>.
              </p>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                We'll be in touch at <strong>{form.email}</strong> to confirm details.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

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
      <ScrollProgress />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero-noise relative h-screen flex flex-col items-center justify-center text-white text-center overflow-hidden">
        {/* Gradient overlay — keeps the hero image bright but gives the text something to sit against */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/40 z-[1]" />
        {/* Ken Burns image */}
        {textContent.heroImageUrl && (
          <img
            src={textContent.heroImageUrl}
            alt={textContent.heroTitle}
            className="hero-image absolute inset-0 w-full h-full object-cover"
            loading="eager"
            // @ts-expect-error — valid HTML attribute, React 19 supports it, types lag
            fetchpriority="high"
            decoding="async"
          />
        )}

        {/* Title — no frosted glass panel, just strong text shadows */}
        <div className="relative z-10 px-6 flex flex-col items-center gap-8 md:gap-10 w-full">
          <div className="max-w-4xl mx-auto">
            <p className="hero-eyebrow inline-flex items-center gap-3 text-amber-300 text-xs md:text-sm font-medium tracking-[0.3em] uppercase mb-5"
               style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              <span className="h-px w-8 bg-amber-300/70" aria-hidden="true" />
              Luxury Villa · For Sale
              <span className="h-px w-8 bg-amber-300/70" aria-hidden="true" />
            </p>
            <h1 className="hero-title text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight"
                style={{ textShadow: '0 4px 32px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)' }}>
              {textContent.heroTitle}
            </h1>
            <p className="hero-subtitle mt-5 text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-white/95"
               style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
              {textContent.heroSubtitle}
            </p>
          </div>

          {/* CTAs */}
          <div className="hero-cta flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full sm:w-auto">
            <a
              href="#gallery"
              onClick={handleViewGallery}
              className="w-full sm:w-auto px-8 py-3 bg-amber-700 text-white font-bold rounded-full text-base hover:bg-amber-600 transition-all duration-300 shadow-xl shadow-amber-900/30 hover:shadow-amber-700/50 transform hover:scale-105"
            >
              View Gallery
            </a>
            <a
              href="#booking"
              onClick={(e) => handleScroll(e, 'booking')}
              className="w-full sm:w-auto px-8 py-3 bg-white/15 text-white font-semibold rounded-full text-base border-2 border-white/60 hover:bg-white/25 hover:border-white transition-all duration-300 backdrop-blur-sm"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
            >
              Book a Viewing
            </a>
          </div>

          {/* Scroll indicator */}
          <a
            href="#about"
            onClick={(e) => handleScroll(e, 'about')}
            aria-label="Scroll to about section"
            className="hero-cta mt-2 md:mt-4 opacity-80 hover:opacity-100 transition-opacity"
          >
            <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center items-start p-1 animate-bounce">
              <div className="w-1 h-2 bg-white rounded-full" />
            </div>
          </a>
        </div>
      </section>

      {/* Wave: hero → about */}
      <WaveDivider fromColor="bg-transparent" toColor="fill-white dark:fill-stone-900" />

      {/* ── About ─────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 md:py-24 bg-white dark:bg-stone-900">
        <div ref={aboutRef} className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center reveal-stagger">
          {/* Image with floating stat cards */}
          {featuredImage && (
            <div className="reveal-left order-last md:order-first relative pb-20 md:pb-16">
              <div className="image-glow relative">
                <img
                  src={featuredImage.url}
                  alt={featuredImage.caption}
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover aspect-[4/3]"
                  loading="lazy"
                  decoding="async"
                />
                {/* Floating glass stat cards — content-driven, 4 across (2×2 on very narrow screens via wrapping) */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 md:-bottom-10 w-[92%] max-w-md">
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {(textContent.stats && textContent.stats.length > 0 ? textContent.stats : DEFAULT_STATS).map((s) => (
                      <StatCard
                        key={s.id}
                        value={s.value}
                        label={s.label}
                        icon={STAT_ICON_MAP[s.iconKey] ?? <AreaIcon />}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Text */}
          <div className="reveal-right text-center md:text-left mt-8 md:mt-0">
            <p className="text-amber-700 dark:text-amber-500 text-sm font-medium tracking-widest uppercase mb-3">
              About the Property
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold text-stone-800 dark:text-white leading-tight">
              {textContent.aboutTitle}
            </h2>
            <div className="mt-4 w-16 h-0.5 bg-amber-700 dark:bg-amber-500 md:mx-0 mx-auto rounded-full" />
            <p className="mt-6 text-stone-600 dark:text-stone-300 leading-relaxed text-base md:text-lg">
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
        <section className="py-20 md:py-24 bg-stone-100 dark:bg-stone-900">
          <div className="container mx-auto px-6">
            <p className="text-amber-700 dark:text-amber-500 text-sm font-medium tracking-widest uppercase mb-3 text-center">
              The Setting
            </p>
            <SectionHeading>{location.title}</SectionHeading>
            <div ref={locationRef} className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
              <div className="reveal-left text-center md:text-left">
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line text-base md:text-lg">
                  {location.description}
                </p>
              </div>
              {location.imageUrl && (
                <div className="reveal-right rounded-2xl shadow-2xl overflow-hidden">
                  <img
                    src={location.imageUrl}
                    alt={location.title}
                    className="w-full h-auto object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                    decoding="async"
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
      <BookingSection />

      {/* Wave: booking → features */}
      <WaveDivider fromColor="bg-white dark:bg-stone-800" toColor="fill-stone-100 dark:fill-stone-900" flip />

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-stone-100 dark:bg-stone-900">
        <div className="container mx-auto px-6">
          <p className="text-amber-700 dark:text-amber-500 text-sm font-medium tracking-widest uppercase mb-3 text-center">
            At a Glance
          </p>
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
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-900/30 ring-1 ring-amber-100 dark:ring-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4">
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
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800/50">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 dark:text-amber-400 leading-tight">
                {textContent.considerationsTitle}
              </h2>
            </div>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {textContent.considerationsText}
            </p>
          </div>
        </div>
      </section>

      {/* Wave: considerations → footer */}
      <WaveDivider fromColor="bg-amber-50 dark:bg-amber-950/20" toColor="fill-stone-800 dark:fill-stone-950" />

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-800 dark:bg-stone-950 text-stone-300 pt-4 pb-10">
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  ES: +34 711 013 086
                </a>
                <a href="tel:+447740282182" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  UK: +44 7740 282 182
                </a>
                <a href="mailto:scott@villaluar.com" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  scott@villaluar.com
                </a>
              </div>
            </div>

            {/* Listing info */}
            <div>
              <p className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Listing</p>
              <div className="text-sm text-stone-400 flex flex-col gap-2">
                <p>Private Residential Sale</p>
                <p>Located in Spain · EUR (€)</p>
                <p>&copy; {new Date().getFullYear()} Villa Luar. All rights reserved.</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 text-xs text-stone-500">
            <p>Villa Luar — Luxury Residential Property</p>
            <div className="flex items-center gap-4">
              <Link to="/admin" className="hover:text-stone-300 transition-colors">Admin</Link>
              <div className="text-stone-300 dark:text-stone-300">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <FloatingContact />
    </main>
  );
};

export default HomePage;
