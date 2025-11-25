import React from 'react';
import { useTranslation } from 'react-i18next';

const Stats: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="results" className="py-24 bg-slate-950 text-white border-t border-slate-900 relative overflow-hidden">

      {/* Grid Background Texture - CSS pattern instead of heavy image */}
      <div className="absolute inset-0 opacity-10 mix-blend-screen" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-900/80 to-slate-900 opacity-80"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">

          <div className="p-4 group animate-scale-in stagger-1">
            <div className="text-5xl md:text-6xl font-serif text-blue-500 mb-3 group-hover:scale-110 transition-transform duration-500">80%</div>
            <div className="h-1 w-12 bg-slate-800 mx-auto mb-4"></div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-medium">{t('stats.stat1')}</div>
          </div>

          <div className="p-4 group animate-scale-in stagger-2">
            <div className="text-5xl md:text-6xl font-serif text-teal-400 mb-3 group-hover:scale-110 transition-transform duration-500">99.9%</div>
            <div className="h-1 w-12 bg-slate-800 mx-auto mb-4"></div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-medium">{t('stats.stat2')}</div>
          </div>

          <div className="p-4 group animate-scale-in stagger-3">
            <div className="text-5xl md:text-6xl font-serif text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-500">2M+</div>
            <div className="h-1 w-12 bg-slate-800 mx-auto mb-4"></div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-medium">{t('stats.stat3')}</div>
          </div>

          <div className="p-4 group animate-scale-in stagger-4">
            <div className="text-5xl md:text-6xl font-serif text-white mb-3 group-hover:scale-110 transition-transform duration-500">0</div>
            <div className="h-1 w-12 bg-slate-800 mx-auto mb-4"></div>
            <div className="text-sm text-slate-400 uppercase tracking-widest font-medium">{t('stats.stat4')}</div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Stats;
