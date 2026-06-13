import React from 'react';
import { useFormStore } from '../store/useFormStore';
import { SERVICES } from '../utils/businessLogic';
import Carousel3D from './Carousel3D';

export default function ServicesView() {
  const { activeSrv, setActiveSrv, setPhase } = useFormStore();

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-4 pointer-events-auto">
      <span className="inline-block bg-white/5 border border-white/10 text-white/40 text-[9px] font-extrabold tracking-widest px-3 py-1 rounded-md mb-3 uppercase animate-[fu_0.38s_ease-out]">
        SERVICIOS
      </span>
      <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-3 animate-[fu_0.38s_ease-out]">
        Todo lo que necesitas<br />
        <span className="text-[#C0392B]">en un solo lugar.</span>
      </h2>
      <p className="text-xs text-white/40 leading-relaxed mb-6">
        Desde grabar tu primera canción hasta lanzarte al mundo.
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {SERVICES.map((s, i) => {
          const isOpen = activeSrv === i;
          return (
            <div key={i} className="border border-white/5 bg-white/5 rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                className={`w-full text-left p-5 flex items-center justify-between transition-colors pointer-events-auto ${
                  isOpen ? 'bg-[#590707]/15 border-b border-[#590707]/20' : 'hover:bg-white/10'
                }`}
                onClick={() => {
                  if (s.title === "Marketing 360") {
                    window.open('/marketing/index.html', '_blank');
                  } else {
                    setActiveSrv(isOpen ? null : i);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl leading-none">{s.icon}</span>
                  <div>
                    <div className="font-extrabold text-sm text-white">{s.title}</div>
                    <div className="text-[9px] font-extrabold tracking-wider mt-1 text-white/30 uppercase">
                      {s.tag}
                    </div>
                  </div>
                </div>
                <span className="text-white/35 text-xs transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  ▼
                </span>
              </button>
              
              {isOpen && (
                <div className="p-6 bg-black/10 flex flex-col gap-4 animate-[fu_0.35s_ease-out]">
                  <p className="text-xs text-white/70 leading-relaxed">{s.desc}</p>

                  {/* LEGAL INFORMATION SECTION */}
                  {s.legalInfo && s.legalInfo.map((section, si) => (
                    <div key={si} className="border-t border-white/5 pt-4">
                      <div className="text-[10px] font-black text-[#ff8080] tracking-widest uppercase mb-2">{section.title}</div>
                      <div className="flex flex-col gap-2">
                        {section.items.map((item, ii) => (
                          <div key={ii} className="flex gap-2.5 items-start text-xs text-white/60 leading-normal">
                            <span className="text-[#C0392B] font-bold">•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* STUDIO SUBSECTIONS (Studio A / B equipment specs) */}
                  {s.subsections && !s.subsections[0]?.imgs3d && s.subsections.map((sub, si) => (
                    <div key={si} className="border-t border-white/5 pt-4 flex flex-col gap-3">
                      <div className="text-[10px] font-black tracking-widest text-white/40 uppercase">{sub.label}</div>
                      
                      {sub.info && (
                        <div className="bg-[#590707]/10 border border-[#590707]/25 rounded-xl p-4">
                          <div className="text-[9px] font-extrabold tracking-widest text-[#ff8080] uppercase mb-2.5">EQUIPOS</div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {sub.info.map((eq, ei) => (
                              <div key={ei} className="flex gap-2 items-center text-xs text-white/60 leading-none">
                                <span className="text-[#C0392B] font-bold">*</span>
                                <span>{eq}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {sub.imgs && sub.imgs.length > 0 && (
                        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                          {sub.imgs.map((url, ii) => (
                            <img 
                              key={ii} 
                              src={url} 
                              alt={sub.label + " " + (ii+1)} 
                              className="w-48 h-32 object-cover rounded-xl border border-white/10 flex-shrink-0"
                              onError={e => { e.target.style.display = "none"; }} 
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* PRODUCTION SUBSECTIONS (TunyD / Money Makers Carousel) */}
                  {s.subsections && s.subsections[0]?.imgs3d && s.subsections.map((sub, si) => (
                    <div key={si} className="border-t border-white/5 pt-4">
                      <div className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-3">{sub.label}</div>
                      <Carousel3D imgs={sub.imgs3d} />
                    </div>
                  ))}

                  {/* SIMPLE GALLERIES */}
                  {!s.subsections && s.imgs && s.imgs.length > 0 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none mt-2">
                      {s.imgs.map((url, ii) => (
                        <img 
                          key={ii} 
                          src={url} 
                          alt={s.title + " " + (ii+1)} 
                          className="w-48 h-32 object-cover rounded-xl border border-white/10 flex-shrink-0" 
                          onError={e => { e.target.style.display = "none"; }} 
                        />
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={() => setPhase('form')}
                    className="w-full mt-4 bg-gradient-to-r from-[#590707] to-[#8a0c0c] hover:from-[#8a0c0c] hover:to-[#C0392B] text-white font-extrabold uppercase tracking-wider py-3.5 rounded-xl text-xs active:scale-95 transition-all duration-300 pointer-events-auto"
                  >
                    Solicitar cotización →
                  </button>

                  {s.title === "Marketing 360" && (
                    <a 
                      href="/marketing/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center mt-2 bg-gradient-to-r from-[#1a5090] to-[#0f3860] hover:from-[#2161ac] hover:to-[#124577] text-white font-extrabold uppercase tracking-wider py-3.5 rounded-xl text-[10px] active:scale-95 transition-all duration-300 pointer-events-auto block no-underline border border-white/5"
                    >
                      Ingresar al Marketing Engine 360° →
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        onClick={() => setPhase('form')}
        className="w-full bg-gradient-to-r from-[#590707] to-[#8a0c0c] hover:from-[#8a0c0c] hover:to-[#C0392B] text-white font-extrabold uppercase tracking-wider py-4 rounded-xl text-sm active:scale-95 transition-all duration-300 pointer-events-auto shadow-[0_4px_20px_rgba(89,7,7,0.4)]"
      >
        Quiero mi cotización personalizada →
      </button>
    </div>
  );
}
