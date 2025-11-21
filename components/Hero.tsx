import React from 'react';
import { ArrowRight, Activity, Zap } from 'lucide-react';
import { Page } from '../types';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative min-h-screen flex items-center bg-slate-900 text-white pt-24 pb-12 overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Custom Flow Background */}
        <div className="absolute inset-0 bg-[url('images/abstract-flow.jpg')] bg-cover bg-center opacity-20 mix-blend-screen"></div>
        
        {/* Gradient Blobs for extra depth */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Content */}
            <div className="text-left space-y-8">
                <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-sm">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-slate-300 tracking-wide uppercase">System Status: Optimal</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight">
                  Teknik som flödar <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">som vatten.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed font-light border-l-2 border-blue-500/30 pl-6">
                  Vi bygger självläkande system som skalar naturligt. Inga krascher. Inga exploderande kostnader. Bara ett stadigt, oavbrutet flöde.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => onNavigate('contact')} 
                    className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                  >
                    <span>Starta analys</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onNavigate('philosophy')}
                    className="px-8 py-4 border border-white/20 rounded-full font-medium hover:bg-white/10 transition-colors text-slate-200 flex items-center justify-center"
                  >
                    Vår filosofi
                  </button>
                </div>

                {/* Team Avatar Section */}
                <div className="pt-8 border-t border-white/10 mt-8">
                    <div className="flex items-center gap-6">
                         <div className="flex -space-x-3">
                            <img src="siteflow-public/team-avatars/Sara.jpg" alt="Sara" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                            <img src="siteflow-public/team-avatars/Jhon.jpg" alt="Jhon" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                            <img src="siteflow-public/team-avatars/Rakesh.jpg" alt="Rakesh" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                         </div>
                         <div className="text-sm">
                            <p className="text-white font-medium">Direktkontakt med arkitekterna</p>
                            <p className="text-slate-400 text-xs">Svar inom 2 timmar</p>
                         </div>
                    </div>
                </div>
            </div>

            {/* Right Visual - Abstract System Monitor */}
            <div className="relative hidden lg:block">
                <div className="relative z-10 bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                    
                    {/* Fake Browser/Terminal Header */}
                    <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">siteflow_core_monitor.ex</div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Stat Card 1 */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-xs uppercase">Active Connections</span>
                                <Activity className="w-4 h-4 text-green-400" />
                            </div>
                            <div className="text-2xl font-mono text-white font-bold">2,405,192</div>
                            <div className="text-xs text-green-400 mt-1 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span> Live
                            </div>
                        </div>

                        {/* Stat Card 2 */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-xs uppercase">Response Time</span>
                                <Zap className="w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="text-2xl font-mono text-white font-bold">12ms</div>
                            <div className="text-xs text-slate-500 mt-1">Global Average</div>
                        </div>

                        {/* Graph Area */}
                        <div className="col-span-2 bg-slate-900/50 rounded-lg p-4 border border-slate-700/50 h-32 flex items-end space-x-1">
                             {[30, 45, 35, 50, 60, 40, 55, 70, 65, 50, 60, 75, 80, 60, 50, 65, 85, 90, 70, 60].map((h, i) => (
                                 <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-teal-400 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }}></div>
                             ))}
                        </div>

                        {/* Log Area */}
                        <div className="col-span-2 bg-black/40 rounded-lg p-4 border border-slate-700/50 font-mono text-xs space-y-2">
                            <div className="text-green-400">[info] Scaling event triggered: Node_2 joined cluster</div>
                            <div className="text-blue-400">[info] Load balancing traffic across 3 regions</div>
                            <div className="text-slate-500">[debug] Heal-check passed for process &lt;0.142.0&gt;</div>
                        </div>
                    </div>
                </div>

                {/* Decorative element behind */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl opacity-20 blur-xl -z-10 transform rotate-6"></div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;