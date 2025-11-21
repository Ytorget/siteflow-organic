import React, { useState } from 'react';
import { ConsultationState, ConsultationResponse } from '../types';
import { assessSystemNeeds } from '../services/geminiService';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

const ConsultationTool: React.FC = () => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<ConsultationState>(ConsultationState.IDLE);
  const [result, setResult] = useState<ConsultationResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setState(ConsultationState.ANALYZING);
    try {
      const analysis = await assessSystemNeeds(input);
      setResult(analysis);
      setState(ConsultationState.COMPLETE);
    } catch (error) {
      setState(ConsultationState.ERROR);
    }
  };

  return (
    <section id="consultation" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row">
            
            {/* Left Side: Context - Dark Mode designed for contrast */}
            <div className="md:w-5/12 bg-slate-900 p-10 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
               {/* Texture overlay */}
               <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

               <div className="relative z-10">
                 <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-blue-200 mb-6 border border-white/10">
                    <Sparkles className="w-3 h-3" />
                    <span>AI-Driven Analys</span>
                 </div>
                 <h3 className="text-3xl font-serif mb-4 leading-tight">Osäker på var du ska börja?</h3>
                 <p className="text-slate-300 text-sm leading-relaxed mb-8">
                   Beskriv din tekniska utmaning. Vår AI-arkitekt ger dig en första bedömning om Siteflow-modellen passar dina behov – helt utan säljsamtal.
                 </p>
               </div>

               <div className="relative z-10 space-y-4">
                 <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Omedelbar återkoppling</span>
                 </div>
                 <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Ingen e-post krävs</span>
                 </div>
                 <div className="flex items-center space-x-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Ärlig match-score (vi säger nej om vi inte passar)</span>
                 </div>
               </div>
            </div>

            {/* Right Side: Interactive Form */}
            <div className="md:w-7/12 p-10 md:p-12 bg-white relative">
              
              {state === ConsultationState.IDLE && (
                <form onSubmit={handleSubmit} className="h-full flex flex-col justify-center animate-fade-in">
                  <label htmlFor="problem" className="block text-base font-semibold text-slate-900 mb-2">
                    Beskriv din situation
                  </label>
                  <p className="text-xs text-slate-500 mb-4">Var så specifik du kan. T.ex. "Vi har 500k användare men databasen låser sig vid peaks."</p>
                  
                  <div className="relative">
                    <textarea
                        id="problem"
                        rows={5}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none shadow-inner text-sm"
                        placeholder="Skriv här..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                  </div>

                  <div className="mt-auto pt-6">
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <span>Starta analys</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {state === ConsultationState.ANALYZING && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-md border border-slate-100">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-slate-900 font-serif text-lg mb-2">Analyserar mönster...</h4>
                    <p className="text-slate-500 text-sm">Jämför med arkitektur-modeller från WhatsApp & Discord.</p>
                  </div>
                </div>
              )}

              {state === ConsultationState.COMPLETE && result && (
                <div className="h-full flex flex-col justify-center animate-fade-in">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Analysresultat</span>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-bold ${result.fitScore > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      <span>{result.fitScore}% Match</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-6 rounded-xl mb-8 border border-slate-100">
                    <p className="text-slate-700 text-base leading-relaxed italic">
                        "{result.analysis}"
                    </p>
                  </div>

                  <div className="mt-auto">
                    {result.fitScore > 60 ? (
                        <div className="space-y-3">
                            <p className="text-slate-500 text-sm text-center">Vi bör definitivt prata vidare.</p>
                            <a href="mailto:hello@siteflow.se" className="block w-full text-center bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-md">
                            Boka ett strategimöte
                            </a>
                             <button onClick={() => setState(ConsultationState.IDLE)} className="block w-full text-center text-sm text-slate-400 hover:text-slate-600 py-2">
                                Gör en ny analys
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-slate-500 text-sm text-center">Vi är kanske inte rätt, men vi pratar gärna.</p>
                            <div className="grid grid-cols-2 gap-4">
                              <a 
                                href="mailto:hello@siteflow.se" 
                                className="flex items-center justify-center w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors"
                              >
                                Starta dialog
                              </a>
                              <button 
                                onClick={() => setState(ConsultationState.IDLE)} 
                                className="flex items-center justify-center w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                              >
                                  Gör ny sökning
                              </button>
                            </div>
                        </div>
                    )}
                  </div>
                </div>
              )}

              {state === ConsultationState.ERROR && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-900 space-y-4">
                 <AlertCircle className="w-12 h-12 text-red-500" />
                 <h4 className="font-bold text-lg">Hoppsan</h4>
                 <p className="text-slate-500 text-center max-w-xs">Något gick fel vid analysen. Kontrollera din anslutning och försök igen.</p>
                 <button onClick={() => setState(ConsultationState.IDLE)} className="text-blue-600 font-medium hover:underline mt-4">Försök igen</button>
               </div>
              )}

            </div>
          </div>
      </div>
    </section>
  );
};

export default ConsultationTool;