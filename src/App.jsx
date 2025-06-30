import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { logPageView } from './utils/analytics';
import * as Sentry from '@sentry/browser';
import './App.css';

function App() {
  const location = useLocation();
  
  // Initialize analytics and focus management
  useEffect(() => {
    // Initialize Sentry
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        integrations: [Sentry.browserTracingIntegration()],
        tracesSampleRate: 1.0,
      });
    }

    // Initialize Google Analytics
    if (import.meta.env.PROD) {
      import('./utils/analytics').then(({ initGA }) => {
        initGA();
        logPageView();
      });
    }
    
    // Set focus to main content on route change
    setTimeout(() => {
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus();
      }
    }, 100);
  }, [location]);

  return (
    <div className="App">
      {/* Skip to Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;