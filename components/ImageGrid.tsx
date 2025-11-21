import React from 'react';

const ImageGrid: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-3 block">Insidan</span>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">Bakom kulisserna</h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Inga generiska stock-foton. Så här ser det ut när vi designar flöden och löser problem.
            </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-96 md:h-[500px]">
            
            {/* Large item - The 'Hero' asset */}
            <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden group">
                <img
                    src="/behind-the-scen/anders-coding.jpg"
                    alt="Siteflow Architect Coding"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900">
                    Live Arkitektur
                </div>
            </div>

            {/* Wide item */}
            <div className="col-span-2 relative rounded-2xl overflow-hidden group">
                <img
                    src="/behind-the-scen/architecting.jpg"
                    alt="Strategic Planning"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                 <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-900">
                    Flödesdesign
                </div>
            </div>

            {/* Small item 1 */}
            <div className="relative rounded-2xl overflow-hidden group">
                <img
                    src="/behind-the-scen/lookingatipad.jpg"
                    alt="Detail work"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>

            {/* Small item 2 */}
            <div className="relative rounded-2xl overflow-hidden group bg-slate-100 flex items-center justify-center">
                 <div className="text-center p-4">
                    <p className="font-serif text-4xl text-blue-600 mb-1">100%</p>
                    <p className="text-xs uppercase tracking-widest text-slate-500">In-House</p>
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ImageGrid;
