import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Page } from '../types';

interface CTAProps {
  onNavigate: (page: Page) => void;
}

const CTA: React.FC<CTAProps> = ({ onNavigate }) => {
  return (
    <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        
        <div className="max-w-4xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs tracking-widest uppercase mb-6 border border-blue-500/20">
                Redo för nästa steg?
            </span>
            
            <h2 className="text-5xl md:text-6xl font-serif mb-8 leading-tight">
                Sluta slåss mot strömmen. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Börja flöda med den.</span>
            </h2>
            
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                Vi tar bara in ett begränsat antal projekt per år för att garantera kvaliteten. Är ditt företag redo för ett system som faktiskt håller?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                    onClick={() => onNavigate('contact')}
                    className="w-full sm:w-auto px-8 py-5 bg-white text-slate-900 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transform hover:-translate-y-1"
                >
                    <span>Starta dialogen</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
                
                <a 
                    href="mailto:hello@siteflow.se"
                    className="w-full sm:w-auto px-8 py-5 border border-slate-700 rounded-full font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-slate-300 hover:text-white"
                >
                    <Mail className="w-5 h-5" />
                    <span>hello@siteflow.se</span>
                </a>
            </div>

            <p className="mt-8 text-sm text-slate-500">
                Inga säljare. Du pratar direkt med en arkitekt.
            </p>
        </div>

      </div>
    </section>
  );
};

export default CTA;