import React, { useState, useEffect } from 'react';
import { CASA_IMGS } from '../utils/businessLogic';

export default function LaCasa() {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const PREVIEW_COUNT = 8;
  const visible = expanded ? CASA_IMGS : CASA_IMGS.slice(0, PREVIEW_COUNT);

  const getStyle = (i) => {
    if (i === 0) return { gridColumn: "span 1", height: 140 }; 
    if (i === 1) return { gridColumn: "span 2", height: 140 }; 
    if (i === 2) return { gridColumn: "span 1", height: 140 }; 
    if (i === 3) return { gridColumn: "span 2", height: 180 }; 
    if (i === 4) return { gridColumn: "span 1", height: 180 }; 
    if (i === 5) return { gridColumn: "span 1", height: 140 }; 
    if (i === 6) return { gridColumn: "span 1", height: 140 }; 
    if (i === 7) return { gridColumn: "span 1", height: 140 }; 
    
    const mod = (i - PREVIEW_COUNT) % 5;
    if (mod === 0) return { gridColumn: "span 2", height: 160 };
    if (mod === 1) return { gridColumn: "span 1", height: 160 };
    if (mod === 2) return { gridColumn: "span 1", height: 120 };
    if (mod === 3) return { gridColumn: "span 1", height: 120 };
    return { gridColumn: "span 1", height: 120 };
  };

  useEffect(() => {
    const handler = (e) => { 
      if (e.key === "Escape") setLightbox(null); 
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="bg-[#080808]/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden py-4 pointer-events-auto">
      <div className="p-6">
        <span className="inline-block bg-white/5 border border-white/10 text-white/40 text-[9px] font-extrabold tracking-widest px-3 py-1 rounded-md mb-3 uppercase">
          GALERÍA KAPITAL
        </span>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
          La <span className="text-[#C0392B]">Casa.</span>
        </h2>
        <p className="text-xs text-white/50 leading-relaxed max-w-md">
          El lugar donde la música toma forma. Nuestros espacios, nuestro ambiente.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-3 gap-1 px-1">
          {visible.map((url, i) => {
            const s = getStyle(i);
            return (
              <div 
                key={i} 
                style={{ gridColumn: s.gridColumn }} 
                className="relative overflow-hidden cursor-pointer"
                onClick={() => setLightbox(i)}
              >
                <img 
                  src={url} 
                  alt={"Kapital " + i}
                  style={{ height: s.height }}
                  className="w-full object-cover block brightness-75 hover:brightness-105 hover:scale-105 transition-all duration-500"
                  onError={e => { e.target.parentElement.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
              </div>
            );
          })}
        </div>

        {!expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-transparent flex flex-col items-center justify-end pb-5 pointer-events-none">
            <button
              onClick={() => setExpanded(true)}
              className="flex flex-col items-center gap-2 bg-none border-none cursor-pointer p-0 pointer-events-auto"
            >
              <div className="backdrop-blur-md bg-black/85 border border-[#C0392B]/50 rounded-full px-6 py-2.5 flex items-center gap-2.5 active:scale-95 transition-all">
                <span className="text-xs font-black text-white tracking-widest uppercase">Ver galería completa</span>
                <span className="text-sm text-[#C0392B]">↓</span>
              </div>
              <div className="text-[10px] text-white/30 tracking-widest">{CASA_IMGS.length} fotos</div>
            </button>
          </div>
        )}

        {expanded && (
          <div className="flex justify-center py-6">
            <button 
              onClick={() => setExpanded(false)}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-6 py-2 text-xs font-bold text-white/50 tracking-widest uppercase hover:bg-white/10 active:scale-95 transition-all"
            >
              Colapsar ↑
            </button>
          </div>
        )}
      </div>

      {lightbox !== null && (
        <div 
          className="fixed inset-0 z-[9000] bg-black/98 flex items-center justify-center p-4 pointer-events-auto"
          onClick={() => setLightbox(null)}
        >
          <button 
            onClick={e => { 
              e.stopPropagation(); 
              setLightbox(l => (l - 1 + CASA_IMGS.length) % CASA_IMGS.length); 
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#8a0c0c] hover:bg-[#C0392B] border-none text-white text-2xl w-11 h-11 rounded-full cursor-pointer flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          
          <img 
            src={CASA_IMGS[lightbox]} 
            alt="Kapital"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(192,57,43,0.4)]"
            onClick={e => e.stopPropagation()} 
          />
          
          <button 
            onClick={e => { 
              e.stopPropagation(); 
              setLightbox(l => (l + 1) % CASA_IMGS.length); 
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#8a0c0c] hover:bg-[#C0392B] border-none text-white text-2xl w-11 h-11 rounded-full cursor-pointer flex items-center justify-center transition-colors"
          >
            ›
          </button>
          
          <button 
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 bg-[#8a0c0c] hover:bg-[#C0392B] border-none text-white text-sm w-9 h-9 rounded-full cursor-pointer flex items-center justify-center transition-colors"
          >
            ✕
          </button>
          
          <div className="absolute bottom-5 left-0 right-0 text-center text-[10px] text-white/30 tracking-widest">{lightbox + 1} / {CASA_IMGS.length}</div>
        </div>
      )}
    </div>
  );
}
