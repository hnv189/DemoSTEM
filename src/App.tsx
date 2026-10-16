import { useEffect, useRef } from 'react';
import { AppStateProvider } from './state/AppState';
import { hrefFor, useRoute, type Page } from './state/router';
import { HomePage } from './pages/HomePage';
import { PresentationPage } from './pages/PresentationPage';
import { DemoPage } from './pages/DemoPage';
import { BuildPage } from './pages/BuildPage';
import { AssessPage } from './pages/AssessPage';
import { PrintPage } from './pages/PrintPage';

const NAV: { page: Page; label: string }[] = [
  { page: 'present', label: 'Trình bày' },
  { page: 'demo', label: 'Demo 3D' },
  { page: 'build', label: 'Thiết kế & Chế tạo' },
  { page: 'print', label: 'In mẫu' },
  { page: 'assess', label: 'Đánh giá' },
];

function Shell() {
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);

  // Move focus to the new page for keyboard and screen-reader users.
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [route.page]);

  return (
    <div className={`app app--${route.page}`}>
      <a className="skip" href="#main">Bỏ qua thanh điều hướng</a>
      <header className="site-header">
        <a className="brand" href={hrefFor({ page: 'home' })}>
          <span className="logo" aria-hidden="true"><i /><i /><i /></span>
          <span lang="en">Magic English Cubes</span>
        </a>
        <nav className="site-nav" aria-label="Điều hướng chính">
          {NAV.map((n) => (
            <a key={n.page} href={hrefFor({ page: n.page })} aria-current={route.page === n.page ? 'page' : undefined}>
              {n.label}
            </a>
          ))}
        </nav>
      </header>
      <main id="main" ref={mainRef} tabIndex={-1}>
        {route.page === 'home' && <HomePage />}
        {route.page === 'present' && <PresentationPage route={route} />}
        {route.page === 'demo' && <DemoPage route={route} />}
        {route.page === 'build' && <BuildPage />}
        {route.page === 'print' && <PrintPage />}
        {route.page === 'assess' && <AssessPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <Shell />
    </AppStateProvider>
  );
}
