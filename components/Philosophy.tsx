import React from 'react';
import { Waves, ShieldCheck, Zap, BrainCircuit, ServerCrash, Network } from 'lucide-react';
import { Page } from '../types';

interface PhilosophyProps {
  onNavigate: (page: Page) => void;
}

const Philosophy: React.FC<PhilosophyProps> = ({ onNavigate }) => {
  return (
    <section id="philosophy" className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
                <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">Vår Filosofi</span>
                <h2 className="text-4xl md:text-5xl font-serif text-slate-900 leading-tight">
                    Flöde framför kraft
                </h2>
                <p className="text-lg md:text-xl text-slate-600 mt-4 leading-relaxed">
                    Vi tvingar inte system att fungera. Vi bygger dem så att de följer naturliga mönster. 
                    Som vatten som hittar sin väg, skalar våra system utan friktion.
                </p>
            </div>
            <div className="hidden md:block">
                 <button 
                   onClick={() => onNavigate('philosophy')} 
                   className="text-slate-900 font-medium border-b-2 border-slate-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-colors"
                 >
                   Läs hela manifestet
                 </button>
            </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Large Card: Scalability */}
          <div className="md:col-span-2 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                    <Waves className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif text-slate-900 mb-3">Hantera enorma flöden</h3>
                <p className="text-slate-600 max-w-md leading-relaxed">
                    Miljontals användare samtidigt? Inga problem. Vi använder Actor-modellen (samma som WhatsApp) där varje användare är en isolerad process. Systemet blir snabbare ju mer det används, inte långsammare.
                </p>
            </div>
          </div>

          {/* Tall Card: Self Healing */}
          <div className="bg-slate-900 text-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-800 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="relative z-10">
                <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center text-teal-400 mb-6 border border-teal-500/30">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif mb-3">Självläkande</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                    "Let it crash". Om en del av systemet får problem, startar vi om just den delen på mikrosekunder. Resten av systemet påverkas aldrig.
                </p>
             </div>
             <div className="mt-8 pt-8 border-t border-slate-700/50">
                <div className="flex items-center text-xs font-mono text-teal-400">
                    <ServerCrash className="w-4 h-4 mr-2" />
                    <span>Error detected. Restarting process...</span>
                </div>
                <div className="flex items-center text-xs font-mono text-green-400 mt-1">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span>System healthy.</span>
                </div>
             </div>
          </div>

          {/* Regular Card: Cost */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Kostnadseffektivt</h3>
            <p className="text-slate-600 text-sm">
                Upp till 80% lägre infrastrukturkostnader. Vi gör mer med mindre hårdvara.
            </p>
          </div>

          {/* Regular Card: AI Ready */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300 group">
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Redo för AI</h3>
            <p className="text-slate-600 text-sm">
                Byggt för agenter och parallella processer från dag ett. Inte efterkonstruerat.
            </p>
          </div>

           {/* Wide Card: Connection */}
           <div className="bg-gradient-to-r from-blue-50 to-white p-8 rounded-3xl shadow-sm border border-blue-100 hover:shadow-xl transition-shadow duration-300 flex items-center">
                <div className="mr-6 hidden sm:block">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                        <Network className="w-8 h-8" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Massiv Concurrency</h3>
                    <p className="text-slate-600 text-sm">
                        Medan andra servrar svettas vid 1000 anslutningar, gäspar våra vid 100 000.
                    </p>
                </div>
           </div>

        </div>
      </div>
    </section>
  );
};

export default Philosophy;