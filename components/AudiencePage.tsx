import React from 'react';
import { Target, TrendingUp, Eye, HeartHandshake, AlertTriangle } from 'lucide-react';
import CTA from './CTA';
import { Page } from '../types';

interface AudiencePageProps {
  onNavigate: (page: Page) => void;
}

const AudiencePage: React.FC<AudiencePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-32 pb-20 relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
         </div>

         <div className="container mx-auto px-6 text-center relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs tracking-widest uppercase mb-6 border border-blue-500/20">
              Målgrupp
            </span>
            <h1 className="text-5xl md:text-6xl font-serif mb-6">Vem vi är till för</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Vi är inte för alla. Vi är för dig som ser längre än till imorgon.
            </p>
         </div>
      </div>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="space-y-8">
               <h2 className="text-3xl font-serif text-slate-900">Målgrupp</h2>
               <p className="text-slate-600 leading-relaxed">
                 Vi riktar oss till ambitiösa företag som förstår att deras digitala system är mer än teknik – de är levande organismer som måste flöda med deras affär.
               </p>
               
               <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mr-4">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Visionära ledare</h3>
                      <p className="text-sm text-slate-500">Du ser bortom dagens begränsningar och vill bygga för framtiden.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 shrink-0 mr-4">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Växande företag</h3>
                      <p className="text-sm text-slate-500">Du planerar att skala och behöver system som inte kollapsar under tryck.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 shrink-0 mr-4">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Kostnadsmedvetna innovatörer</h3>
                      <p className="text-sm text-slate-500">Du har tröttnat på skenande molnkostnader och vill ha effektivitet.</p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-2xl flex flex-col justify-center">
              <h3 className="text-2xl font-serif mb-6">Vårt löfte till dig</h3>
              <ul className="space-y-4">
                <li className="flex items-start text-slate-300">
                  <HeartHandshake className="w-5 h-5 text-blue-400 mr-3 mt-1 shrink-0" />
                  <span><strong>System som jobbar med dig.</strong> Teknik ska underlätta, inte försvåra.</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <TrendingUp className="w-5 h-5 text-green-400 mr-3 mt-1 shrink-0" />
                  <span><strong>Förutsägbara kostnader.</strong> När du växer, ska inte dina kostnader explodera linjärt.</span>
                </li>
                <li className="flex items-start text-slate-300">
                  <Eye className="w-5 h-5 text-purple-400 mr-3 mt-1 shrink-0" />
                  <span><strong>Tydlighet.</strong> Inga överraskningar, inga gömda tekniska skulder.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* What we are NOT */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full text-red-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif text-slate-900 mb-4">Vad vi inte är</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Låt oss vara ärliga. Om du söker det absolut billigaste alternativet eller en "quick fix", finns det andra som gör det bättre.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
               <div className="bg-white p-4 rounded-lg shadow-sm">
                 <h4 className="font-bold text-slate-900 mb-1">Vi är inte billigast</h4>
                 <p className="text-xs text-slate-500">Kvalitet kostar, men det är billigare i längden.</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm">
                 <h4 className="font-bold text-slate-900 mb-1">Vi är inte snabbast</h4>
                 <p className="text-xs text-slate-500">Vi bygger för att hålla, inte för att slänga ihop.</p>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm">
                 <h4 className="font-bold text-slate-900 mb-1">Vi är inte säljiga</h4>
                 <p className="text-xs text-slate-500">Vi guidar och förklarar, men vi pushar inte.</p>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <CTA onNavigate={onNavigate} />
    </div>
  );
};

export default AudiencePage;