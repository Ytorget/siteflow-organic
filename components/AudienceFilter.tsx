import React from 'react';
import { Check, X } from 'lucide-react';

const AudienceFilter: React.FC = () => {
  return (
    <section id="audience" className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">Matchning</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Vem vi är till för</h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Vi tror på ärlighet. Om du är nöjd med hur det är idag, är vi förmodligen inte rätt för dig.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* The Right Fit */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 text-green-600">
                <Check className="w-5 h-5" />
              </div>
              Vi ska prata om du:
            </h3>
            <ul className="space-y-4">
              {[
                "Ser tekniska system som en långsiktig investering",
                "Är trött på 'brandkårsutryckningar' och krascher",
                "Planerar att skala upp kraftigt inom ett år",
                "Värdesätter kvalitet som sänker kostnaden över tid"
              ].map((item, i) => (
                <li key={i} className="flex items-start text-slate-700">
                  <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* The Wrong Fit */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-50 opacity-80 hover:opacity-100 transition-opacity">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3 text-slate-500">
                <X className="w-5 h-5" />
              </div>
              Vi är inte rätt om du:
            </h3>
            <ul className="space-y-4">
              {[
                "Söker den absolut billigaste lösningen just nu",
                "Bara behöver en enkel presentationssida",
                "Vill ha en 'quick fix' utan att lösa grundproblemet",
                "Älskar buzzwords och 'tech-bro' kultur"
              ].map((item, i) => (
                <li key={i} className="flex items-start text-slate-500">
                  <span className="mr-3 mt-1.5 w-1.5 h-1.5 bg-slate-300 rounded-full flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AudienceFilter;