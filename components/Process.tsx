import React from 'react';
import { Search, PenTool, Code2, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Process: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      title: t('process.steps.analysis.title'),
      description: t('process.steps.analysis.description'),
      icon: <Search className="w-6 h-6" />
    },
    {
      id: 2,
      title: t('process.steps.architecture.title'),
      description: t('process.steps.architecture.description'),
      icon: <PenTool className="w-6 h-6" />
    },
    {
      id: 3,
      title: t('process.steps.construction.title'),
      description: t('process.steps.construction.description'),
      icon: <Code2 className="w-6 h-6" />
    },
    {
      id: 4,
      title: t('process.steps.scaling.title'),
      description: t('process.steps.scaling.description'),
      icon: <Activity className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">{t('process.badge')}</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
            {t('process.title')}
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('process.description')}
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