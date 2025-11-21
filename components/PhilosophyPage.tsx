import React from 'react';
import { Waves, Zap, BrainCircuit, Activity } from 'lucide-react';
import CTA from './CTA';
import { Page } from '../types';

interface PhilosophyPageProps {
  onNavigate: (page: Page) => void;
}

const PhilosophyPage: React.FC<PhilosophyPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 text-white pt-32 pb-20 relative overflow-hidden">
         {/* Background Image */}
         <div className="absolute inset-0 bg-[url('/ilustration/2.png')] bg-cover bg-center opacity-10"></div>
         
         <div className="container mx-auto px-6 relative z-10 text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 text-blue-300 text-xs tracking-widest uppercase mb-4">
              Kärnarketype
            </span>
            <h1 className="text-5xl md:text-6xl font-serif mb-6">Flödesarkitekterna</h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Vi tvingar inte system att fungera. Vi orkestrerar naturliga mönster där data, arbete och energi flödar fritt.
            </p>
         </div>
      </div>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="prose prose-lg prose-slate mx-auto">
            <p className="text-2xl font-serif text-slate-800 leading-relaxed mb-8 italic">
              "Precis som vattenbyggare som utnyttjar floder istället för att bekämpa dem, designar vi digitala system som omfamnar grundläggande rytmer av data."
            </p>
            <p className="text-slate-600 mb-6">
              Siteflow förkroppsligar arketypen Flödesarkitekten. Vi förstår att verklig kraft inte ligger i att tvinga system att fungera genom råstyrka, utan i att förstå hur data vill röra sig.
            </p>
            <p className="text-slate-600 mb-6">
              Vi ser bortom bara ettor och nollor till de djupare strömmarna som förbinder mänsklig avsikt med maskinkapacitet. Varje system vi bygger är ett levande ekosystem där information flödar som vatten som hittar sin optimala väg – effektivt, motståndskraftigt och förvånansvärt elegant.
            </p>
          </div>
        </div>
      </section>

      {/* The Three Flows */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-slate-900 mb-4">Flöde som universell princip</h2>
            <p className="text-slate-600">Flöde är inte bara vårt namn – det är vår världsbild.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dataflöde</h3>
              <p className="text-slate-600 text-sm">
                Det moderna affärslivets livsnerv, som rör sig genom system likt floder genom landskap. Vi optimerar vägarna så att informationen aldrig stannar upp.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Arbetsflöde</h3>
              <p className="text-slate-600 text-sm">
                Den mänskliga rytmen av skapande, samarbete och fullbordan. Våra system är designade för att ta bort friktion från ditt dagliga arbete.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Energiflöde</h3>
              <p className="text-slate-600 text-sm">
                Den vitala kraften som förbinder mänsklig kreativitet med beräkningskraft. Vi minimerar spill (entropi) och maximerar output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-serif text-slate-900 mb-6">Teknisk grund: Kraften i levande system</h2>
              <p className="text-slate-600 mb-4">
                Vårt val av Elixir och Ash framework är inte bara tekniskt – det är filosofiskt. Dessa verktyg förkroppsligar de principer vi tror på.
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-start">
                  <BrainCircuit className="w-5 h-5 text-blue-500 mr-3 mt-1" />
                  <div>
                    <strong className="block text-slate-900">Miljoner samtidiga flöden</strong>
                    <span className="text-sm text-slate-500">Som en stad där miljoner samtal sker samtidigt utan kollision.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Activity className="w-5 h-5 text-teal-500 mr-3 mt-1" />
                  <div>
                    <strong className="block text-slate-900">Självläkande arkitektur</strong>
                    <span className="text-sm text-slate-500">System som återhämtar sig från fel som en skog som regenererar efter en storm.</span>
                  </div>
                </li>
                <li className="flex items-start">
                  <Zap className="w-5 h-5 text-yellow-500 mr-3 mt-1" />
                  <div>
                    <strong className="block text-slate-900">80% kostnadsminskning</strong>
                    <span className="text-sm text-slate-500">Att göra mer med mindre, inspirerat av naturens egen effektivitet.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="bg-slate-900 p-8 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
                <h3 className="text-xl font-bold mb-4">Varför Elixir?</h3>
                <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                  Tekniken vi använder kommer från telekomindustrin där 99.9999999% uptime är standard. Det är inte en slump att WhatsApp kunde ha 2 miljoner samtidiga anslutningar på en enda server med samma teknik.
                </p>
                <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                  <code className="text-xs text-blue-200 font-mono block">
                    defmodule Flow do<br/>
                    &nbsp;&nbsp;def handle_traffic(millions) do<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;Stream.run(millions)<br/>
                    &nbsp;&nbsp;end<br/>
                    end
                  </code>
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

export default PhilosophyPage;
