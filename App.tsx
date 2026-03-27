
import React, { useEffect, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ContentProvider, useContent } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import PrivateRoute from './components/PrivateRoute';

// Lazy-load the entire admin bundle — visitors never download this code
const AdminPage = lazy(() => import('./pages/AdminPage'));

const AdminFallback = () => (
  <div className="flex justify-center items-center h-screen bg-stone-50 dark:bg-stone-900">
    <div className="relative flex items-center justify-center">
      <div className="absolute h-16 w-16 rounded-full border-t-2 border-b-2 border-amber-700 dark:border-amber-500 animate-spin"></div>
      <div className="text-amber-700 dark:text-amber-500 text-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}>Admin</div>
    </div>
  </div>
);

const AppHeader = () => {
  const location = useLocation();
  const { content } = useContent();

  if (location.pathname !== '/') {
    return null;
  }

  const logoUrl = content?.logoUrl;

  return (
    <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
      <div className="container mx-auto flex justify-center items-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Villa Luar Logo"
              className="h-12 md:h-14 w-auto"
              style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))' }}
            />
          ) : (
            <span className="text-white text-2xl md:text-3xl font-semibold tracking-wider" style={{ fontFamily: "'Montserrat', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>VILLA LUAR</span>
          )}
        </Link>
      </div>
    </header>
  );
};

const AppContent = () => {
  const { content } = useContent();

  useEffect(() => {
    const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
    if (favicon && content?.faviconUrl) {
      favicon.href = content.faviconUrl;
    }
  }, [content?.faviconUrl]);

  return (
    <div className="bg-stone-50 text-stone-800 dark:bg-stone-900 dark:text-stone-200 min-h-screen">
      <AppHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={
          <PrivateRoute>
            <Suspense fallback={<AdminFallback />}>
              <AdminPage />
            </Suspense>
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <ContentProvider>
            <AppContent />
          </ContentProvider>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
