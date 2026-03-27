import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to the returned ref.
 * When the element enters the viewport, the CSS class "visible" is added.
 * Works with .reveal, .reveal-left, .reveal-right classes in index.css.
 */
export function useScrollReveal<T extends HTMLElement>(
  threshold = 0.05,
  once = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove('visible');
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return ref;
}

/**
 * Observes all children with a .reveal* class inside the returned container ref.
 * Useful for staggered lists.
 */
export function useScrollRevealChildren<T extends HTMLElement>(
  threshold = 0.05
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll<HTMLElement>(
      '.reveal, .reveal-left, .reveal-right'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, [threshold]);

  return containerRef;
}
