import React from 'react';
import { TrendingDown, Server, Users, Award } from 'lucide-react';
import Stats from './Stats';
import CTA from './CTA';
import { Page } from '../types';

interface ResultsPageProps {
  onNavigate: (page: Page) => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-32 pb-20 text-center relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
         </div>
         <div className="container mx-auto px-6 relative z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs tracking-widest uppercase mb-6 border border-blue-500/20">
              Resultat & Bevis
            </span>
            <h1 className="text-5xl md:text-6xl font-serif mb-6">Konkreta bevis</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Vi pratar inte bara. Tekniken vi bygger på har bevisat sig i världens största system.
            </p>
         </div>
      </div>

      {/* Re-use Stats Component */}
      <Stats />

      {/* Detailed Breakdown */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16">
            
            <div>
              <h2 className="text-3xl font-serif text-slate-900 mb-6">Teknologin i praktiken</h2>
              <p className="text-slate-600 mb-6">
                Vi använder Erlang/Elixir-ekosystemet. Det är samma teknologi som driver världens mest krävande kommunikationsplattformar. Här är vad den tekniken möjliggör:
              </p>
              
              <ul className="space-y-6">
                <li className="border-l-4 border-green-500 pl-4">
                  <div className="font-bold text-slate-900 text-lg">WhatsApp</div>
                  <p className="text-slate-600">Lyckades hantera 2 miljoner samtidiga anslutningar på en enda server. Detta är den nivå av effektivitet vi bygger in i ditt system.</p>
                </li>
                <li className="border-l-4 border-blue-500 pl-4">
                  <div className="font-bold text-slate-900 text-lg">Discord</div>
                  <p className="text-slate-600">Hanterar över 5 miljoner samtidiga användare i realtid. Skalbarhet som inte viker sig.</p>
                </li>
                <li className="border-l-4 border-red-500 pl-4">
                  <div className="font-bold text-slate-900 text-lg">Pinterest</div>
                  <p className="text-slate-600">Sparade 2 miljoner dollar per år i serverkostnader och minskade kodbasen drastiskt genom att byta till Elixir.</p>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Vad det betyder för dig</h3>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                     <TrendingDown className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900">Minskad teknisk skuld</h4>
                     <p className="text-sm text-slate-600">Vi bygger levande system, inte statiska strukturer. De anpassar sig och är enkla att underhålla över tid.</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-sm shrink-0">
                     <Server className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900">Infrastruktur-optimering</h4>
                     <p className="text-sm text-slate-600">Generellt ser vi en 80%+ reduktion av infrastrukturkostnader när man går från traditionella molnlösningar till vår arkitektur.</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm shrink-0">
                     <Award className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900">Redo för AI</h4>
                     <p className="text-sm text-slate-600">LLM:er (Large Language Models) skriver ofta bättre Elixir-kod än annan kod på grund av språkets funktionella tydlighet. Du är framtidssäkrad.</p>
                   </div>
                </div>
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

export default ResultsPage;