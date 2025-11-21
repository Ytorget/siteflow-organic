import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Är era system dyrare än 'vanliga' lösningar?",
      answer: "Initialt kan investeringen vara något högre än en standard Wordpress-mall, ja. Men över tid? Nej. Våra kunder sänker ofta sina driftkostnader med 50-80% eftersom våra system kräver betydligt mindre serverkraft och mindre manuellt underhåll. Det är billigare att bygga rätt en gång än att laga fel varje månad."
    },
    {
      question: "Vilken teknik bygger ni med?",
      answer: "Vi är teknikagnostiska men föredrar BEAM (Erlang/Elixir) för system som kräver extrem pålitlighet och skalbarhet. Det är samma teknik som driver WhatsApp och delar av 5G-nätet. För frontend använder vi moderna ramverk som React eller Phoenix LiveView beroende på behov."
    },
    {
      question: "Måste vi byta ut allt vi har?",
      answer: "Sällan. Vi tror på evolution, inte revolution. Ofta kan vi bygga ett 'strömmande lager' som hanterar de tunga lyften, medan era gamla system kan leva kvar i bakgrunden tills de fasas ut naturligt. Vi integrerar sömlöst."
    },
    {
      question: "Hur lång tid tar ett projekt?",
      answer: "En förstudie tar ofta 1-2 veckor. Ett första MVP-system (Minimum Viable Product) kan ofta stå klart på 4-8 veckor. Eftersom vi bygger modulärt kan vi leverera värde snabbt istället för att vänta ett år på en 'big bang'-lansering."
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">Kunskap</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
            Vanliga funderingar
          </h2>
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Teknik är komplext, men svaren behöver inte vara det.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-medium text-slate-900">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-blue-500 flex-shrink-0 ml-4" />
                ) : (
                  <Plus className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
                )}
              </button>
              
              <div 
                className={`px-6 text-slate-600 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;