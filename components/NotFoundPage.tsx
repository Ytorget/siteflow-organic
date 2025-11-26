import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft, Search, MessageCircle } from 'lucide-react';
import type { Page } from '../types';

interface NotFoundPageProps {
  setCurrentPage: (page: Page) => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ setCurrentPage }) => {
  const { t } = useTranslation();

  const quickLinks = [
    { page: 'home' as Page, icon: Home, label: t('nav.home') },
    { page: 'philosophy' as Page, icon: Search, label: t('nav.philosophy') },
    { page: 'contact' as Page, icon: MessageCircle, label: t('nav.contact') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-bold text-slate-700/30 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-2xl" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          Sidan kunde inte hittas
        </h2>
        <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
          Precis som vatten som hittar nya vägar, kan vi guida dig tillbaka till rätt flöde.
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {quickLinks.map(({ page, icon: Icon, label }) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 border border-slate-700 hover:border-cyan-500/50"
            >
              <Icon className="w-5 h-5 text-cyan-400" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Gå tillbaka</span>
        </button>

        {/* Water Effect Decoration */}
        <div className="mt-16 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-500/40"
              style={{
                animation: `pulse 2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
