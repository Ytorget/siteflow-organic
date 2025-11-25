import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Process from './components/Process';
import Stats from './components/Stats';
import Philosophy from './components/Philosophy';
import Testimonials from './components/Testimonials';
import ImageGrid from './components/ImageGrid';
import Integrations from './components/Integrations';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';

// Lazy load pages that aren't shown on initial render
const PhilosophyPage = lazy(() => import('./components/PhilosophyPage'));
const AudiencePage = lazy(() => import('./components/AudiencePage'));
const ResultsPage = lazy(() => import('./components/ResultsPage'));
const ContactPage = lazy(() => import('./components/ContactPage'));
const LoginPage = lazy(() => import('./components/LoginPage'));

import { Page } from './types';

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Handle side effects of navigation (SEO Title + Scroll)
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const titles: Record<Page, string> = {
      home: 'Siteflow | Digitala system som flödar naturligt',
      philosophy: 'Vår Filosofi | Siteflow',
      audience: 'För Vem? | Siteflow',
      results: 'Resultat & Case | Siteflow',
      contact: 'Starta Dialog | Siteflow',
      login: 'Logga in | Siteflow'
    };

    document.title = titles[currentPage] || 'Siteflow';
  }, [currentPage]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onNavigate={handleNavigate} />
            <Stats />
            <Philosophy onNavigate={handleNavigate} />
            <Process />
            <ImageGrid />
            <Testimonials />
            <Integrations />
            <CTA onNavigate={handleNavigate} />
            <FAQ />
          </>
        );
      case 'philosophy':
        return <Suspense fallback={<PageLoader />}><PhilosophyPage onNavigate={handleNavigate} /></Suspense>;
      case 'audience':
        return <Suspense fallback={<PageLoader />}><AudiencePage onNavigate={handleNavigate} /></Suspense>;
      case 'results':
        return <Suspense fallback={<PageLoader />}><ResultsPage onNavigate={handleNavigate} /></Suspense>;
      case 'contact':
        return <Suspense fallback={<PageLoader />}><ContactPage /></Suspense>;
      case 'login':
        return <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>;
      default:
        return <Hero onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;