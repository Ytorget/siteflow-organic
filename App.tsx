import React, { useState, useEffect } from 'react';
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

// Pages
import PhilosophyPage from './components/PhilosophyPage';
import AudiencePage from './components/AudiencePage';
import ResultsPage from './components/ResultsPage';
import ContactPage from './components/ContactPage';

import { Page } from './types';

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
      contact: 'Starta Dialog | Siteflow'
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
        return <PhilosophyPage onNavigate={handleNavigate} />;
      case 'audience':
        return <AudiencePage onNavigate={handleNavigate} />;
      case 'results':
        return <ResultsPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
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