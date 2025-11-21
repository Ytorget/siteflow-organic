import React from 'react';
import { Quote, Building2 } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Alexandra Holm",
      title: "CTO",
      company: "Nordic Retail Group",
      quote: "Vi gick från att frukta Black Friday till att knappt märka av trafiktopparna. Siteflows arkitektur hanterade 10x vår vanliga last utan en enda varning. Det känns som magi, men det är bara extremt bra ingenjörskonst.",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Erik Berglund",
      title: "Grundare",
      company: "Fintech Flow",
      quote: "Våra molnkostnader åt upp marginalerna. Siteflow byggde om kärnan och sänkte infrastrukturomkostnaderna med 75%. Systemet betalade för sig själv på tre månader.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ];

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">Förtroende</span>
          <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
            Vad våra partners säger
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Riktiga resultat från företag som vågade tänka annorlunda.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative group hover:shadow-md transition-shadow duration-300">
              <div className="absolute top-8 right-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-12 h-12 text-blue-600" />
              </div>
              
              <div className="flex-grow mb-8 relative z-10">
                <p className="text-slate-700 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="flex items-center mt-auto pt-6 border-t border-slate-50">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 shadow-md shrink-0 border-2 border-white"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{testimonial.name}</h4>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Building2 className="w-3 h-3 mr-1" />
                    <span>{testimonial.title}, {testimonial.company}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
