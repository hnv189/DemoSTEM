import { useEffect, useState } from 'react';

export type Page = 'home' | 'present' | 'demo' | 'build' | 'assess';

export interface Route {
  page: Page;
  /** Scene number (1-based) for the presentation. */
  scene?: number;
  /** Set when the demo was opened from a presentation scene. */
  from?: number;
}

const PAGES: Page[] = ['home', 'present', 'demo', 'build', 'assess'];

export function parseHash(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const [first, second] = path.split('/');
  const page = (PAGES.includes(first as Page) ? first : 'home') as Page;
  const params = new URLSearchParams(query);
  const route: Route = { page };
  if (page === 'present' && second && /^\d+$/.test(second)) route.scene = Number(second);
  if (page === 'demo' && params.get('from')) route.from = Number(params.get('from'));
  return route;
}

export function hrefFor(route: Route): string {
  if (route.page === 'home') return '#/';
  if (route.page === 'present') return `#/present${route.scene ? `/${route.scene}` : ''}`;
  if (route.page === 'demo' && route.from) return `#/demo?from=${route.from}`;
  return `#/${route.page}`;
}

export function navigate(route: Route) {
  const href = hrefFor(route);
  if (window.location.hash !== href) window.location.hash = href;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

/** True when keyboard shortcuts should be left alone (typing, or focus inside an interactive widget). */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return !!target.closest('[data-no-shortcuts]');
}
