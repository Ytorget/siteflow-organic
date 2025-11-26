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
const BlogPage = lazy(() => import('./components/BlogPage'));
const BlogPostPage = lazy(() => import('./components/BlogPostPage'));
const CaseStudiesPage = lazy(() => import('./components/CaseStudiesPage'));
const CaseStudyPage = lazy(() => import('./components/CaseStudyPage'));
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./components/TermsOfServicePage'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage'));

import { Page } from './types';

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string | null>(null);
  const [currentCaseStudySlug, setCurrentCaseStudySlug] = useState<string | null>(null);

  // Handle side effects of navigation (SEO Title + Scroll)
  useEffect(() => {
    window.scrollTo(0, 0);

    const titles: Record<Page, string> = {
      home: 'Siteflow | Digitala system som flödar naturligt',
      philosophy: 'Vår Filosofi | Siteflow',
      audience: 'För Vem? | Siteflow',
      results: 'Resultat & Case | Siteflow',
      contact: 'Starta Dialog | Siteflow',
      login: 'Logga in | Siteflow',
      blog: 'Blogg | Siteflow',
      blogPost: 'Blogg | Siteflow',
      caseStudies: 'Kundcase | Siteflow',
      caseStudy: 'Kundcase | Siteflow',
      privacy: 'Integritetspolicy | Siteflow',
      terms: 'Användarvillkor | Siteflow',
      notFound: '404 - Sidan hittades inte | Siteflow'
    };

    document.title = titles[currentPage] || 'Siteflow';
  }, [currentPage]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'blogPost') {
      setCurrentBlogSlug(null);
    }
    if (page !== 'caseStudy') {
      setCurrentCaseStudySlug(null);
    }
  };

  const handleSelectBlogPost = (slug: string) => {
    setCurrentBlogSlug(slug);
    setCurrentPage('blogPost');
  };

  const handleBackToBlog = () => {
    setCurrentBlogSlug(null);
    setCurrentPage('blog');
  };

  const handleSelectCaseStudy = (slug: string) => {
    setCurrentCaseStudySlug(slug);
    setCurrentPage('caseStudy');
  };

  const handleBackToCaseStudies = () => {
    setCurrentCaseStudySlug(null);
    setCurrentPage('caseStudies');
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
      case 'blog':
        return <Suspense fallback={<PageLoader />}><BlogPage onNavigate={handleNavigate} onSelectPost={handleSelectBlogPost} /></Suspense>;
      case 'blogPost':
        return currentBlogSlug ? (
          <Suspense fallback={<PageLoader />}><BlogPostPage slug={currentBlogSlug} onNavigate={handleNavigate} onBack={handleBackToBlog} /></Suspense>
        ) : null;
      case 'caseStudies':
        return <Suspense fallback={<PageLoader />}><CaseStudiesPage onNavigate={handleNavigate} onSelectCase={handleSelectCaseStudy} /></Suspense>;
      case 'caseStudy':
        return currentCaseStudySlug ? (
          <Suspense fallback={<PageLoader />}><CaseStudyPage slug={currentCaseStudySlug} onNavigate={handleNavigate} onBack={handleBackToCaseStudies} /></Suspense>
        ) : null;
      case 'privacy':
        return <Suspense fallback={<PageLoader />}><PrivacyPolicyPage onNavigate={handleNavigate} /></Suspense>;
      case 'terms':
        return <Suspense fallback={<PageLoader />}><TermsOfServicePage onNavigate={handleNavigate} /></Suspense>;
      case 'notFound':
        return <Suspense fallback={<PageLoader />}><NotFoundPage setCurrentPage={handleNavigate} /></Suspense>;
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
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;