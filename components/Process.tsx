import React from 'react';
import { Search, PenTool, Code2, Activity } from 'lucide-react';

const Process: React.FC = () => {
  const steps = [
    {
      id: 1,
      title: "Analys & Diagnos",
      description: "Vi börjar inte med att koda. Vi börjar med att förstå flödet. Var läcker resurserna?",
      icon: <Search className="w-6 h-6" />
    },
    {
      id: 2,
      title: "Flytande Arkitektur",
      description: "Vi designar systemet som ett ekosystem. Vi ritar upp hur data ska flöda för att minimera friktion.",
      icon: <PenTool className="w-6 h-6" />
    },
    {
      id: 3,
      title: "Konstruktion",
      description: "Vi bygger med Elixir/OTP. System som kan krascha tusentals gånger utan att användaren märker det.",
      icon: <Code2 className="w-6 h-6" />
    },
    {
      id: 4,
      title: "Levande Skalning",
      description: "Systemet sjösätts. Designat för att svälla vid hög trafik och dra ihop sig vid låg.",
      icon: <Activity className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">Metodik</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
            Från stillastående till strömmande
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            En process designad för att ta bort friktion.
          </p>
        </div>

        <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-blue-50 via-blue-200 to-blue-50 -translate-y-1/2 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
                <div key={step.id} className="relative group">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 h-full flex flex-col relative z-10 hover:-translate-y-2">
                        <div className="w-14 h-14 bg-white border-2 border-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        {step.icon}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                            <span className="text-blue-100 text-4xl font-serif italic absolute right-4 top-4 select-none group-hover:text-blue-50 transition-colors">{step.id}</span>
                            {step.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                        {step.description}
                        </p>
                    </div>
                </div>
            ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default Process;