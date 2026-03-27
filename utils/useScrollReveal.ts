import { useState, useEffect, useCallback } from 'react';

/**
 * Attaches an IntersectionObserver to the returned callback ref.
 * When the element enters the viewport, the CSS class "visible" is added.
 * Works with .reveal, .reveal-left, .reveal-right classes in index.css.
 *
 * Uses a callback ref (not useRef) so the effect fires when the element
 * is actually mounted — safe when the component conditionally renders
 * (e.g. behind an isLoading guard).
 */
export function useScrollReveal<T extends HTMLElement>(
  threshold = 0.05,
  once = true
) {
  const [el, setEl] = useState<T | null>(null);
  const callbackRef = useCallback((node: T | null) => setEl(node), []);

  useEffect(() => {
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
  }, [el, threshold, once]);

  return callbackRef;
}

/**
 * Observes all children with a .reveal* class inside the returned container ref.
 * Useful for staggered lists.
 *
 * Uses a callback ref so the effect fires after the element is mounted,
 * not just after first render (which may be a loading screen).
 */
export function useScrollRevealChildren<T extends HTMLElement>(
  threshold = 0.05
) {
  const [container, setContainer] = useState<T | null>(null);
  const callbackRef = useCallback((node: T | null) => setContainer(node), []);

  useEffect(() => {
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
  }, [container, threshold]);

  return callbackRef;
}
