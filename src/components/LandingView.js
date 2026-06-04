import React, { useMemo } from 'react';
import { useFormStore } from '../store/useFormStore';
import { PORTADAS_ROW1, PORTADAS_ROW2 } from '../utils/businessLogic';
import CountUp from './CountUp';
import Ecosystem from './Ecosystem';
import LaCasa from './LaCasa';

function HudBracket() {
  return (
    <>
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#C0392B]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#C0392B]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#C0392B]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#C0392B]" />
    </>
  );
}


export default function LandingView() {
  const { setPhase, setActiveSrv, scrollProgress } = useFormStore();

  // Opacity calculations for fading sections in and out based on scrollProgress
  // Section 1 (Hero/Dashboard): Scroll 0.0 -> 0.25 (fades out by 0.2)
  const opacityS1 = useMemo(() => {
    return Math.max(0, 1 - (scrollProgress * 5));
  }, [scrollProgress]);

  // Section 2 (History): Scroll 0.25 -> 0.5 (fades in 0.2->0.3, fades out 0.45->0.5)
  const opacityS2 = useMemo(() => {
    if (scrollProgress < 0.15) return 0;
    if (scrollProgress > 0.45) return Math.max(0, 1 - (scrollProgress - 0.45) * 10);
    return Math.min(1, (scrollProgress - 0.15) * 8);
  }, [scrollProgress]);

  // Section 3 (Ecosystem): Scroll 0.5 -> 0.75 (fades in 0.45->0.55, fades out 0.7->0.75)
  const opacityS3 = useMemo(() => {
    if (scrollProgress < 0.4) return 0;
    if (scrollProgress > 0.72) return Math.max(0, 1 - (scrollProgress - 0.72) * 10);
    return Math.min(1, (scrollProgress - 0.4) * 8);
  }, [scrollProgress]);

  // Section 4 (La Casa + CTA): Scroll 0.75 -> 1.0 (fades in 0.7->0.8)
  const opacityS4 = useMemo(() => {
    if (scrollProgress < 0.68) return 0;
    return Math.min(1, (scrollProgress - 0.68) * 8);
  }, [scrollProgress]);

  return (
    <div className="w-full flex flex-col pointer-events-auto max-w-xl mx-auto pb-24">
      
      {/* ──────────────── SECTION 1: HERO / CORE DASHBOARD ──────────────── */}
      <section 
        style={{ opacity: opacityS1, transform: `translateY(${-scrollProgress * 40}px)`, transition: 'transform 0.1s ease-out' }}
        className="min-h-screen flex items-center justify-center w-full transition-opacity duration-300"
      >
        <div className="relative py-10 px-6 bg-black/70 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(89,7,7,0.25)] rounded-3xl w-full">
          <HudBracket />

          {/* Diagnostic Status Bar */}
          <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8 text-[8px] font-mono tracking-widest text-white/50">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#C0392B] rounded-full animate-ping" />
              <span>PORTAL: ONLINE</span>
            </div>
            <div>ASESORÍA PERSONALIZADA</div>
          </div>
          
          <div className="relative z-10 text-center flex flex-col items-center">
            <span className="inline-block bg-[#590707]/30 border border-[#C0392B]/50 text-[#ff8080] text-[9px] font-mono tracking-[0.2em] px-4 py-1.5 rounded-md mb-6 uppercase">
              BIENVENIDO AL MOVIMIENTO
            </span>
            
            <h1 className="text-3xl sm:text-4xl font-black leading-[0.9] tracking-tighter uppercase text-white mb-6">
              Tu música.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e63333] to-[#590707]">Tu legado.</span><br />
              Tu momento.
            </h1>
            
            <p className="text-xs text-white/55 leading-relaxed mb-8 max-w-md font-mono">
              Somos el equipo que te acompaña a construir una carrera real — estrategia, producción y respaldo legal desde el día uno.
            </p>

            {/* Interactive Diagnostic Widget Grid */}
            <div className="grid grid-cols-2 gap-4 w-full mb-8 text-left">
              {[
                { target: 50, prefix: "+", label: "Artistas activos", sub: "DIAGNÓSTICO_OK" },
                { target: 250, prefix: "+", label: "Canciones producidas", sub: "MASTER_STREAM" },
                { target: 15, prefix: "", label: "Años en el mercado", sub: "CAPITAL_ASSET" },
                { target: null, widget: <span className="text-2xl">🌎</span>, label: "Visibilidad internacional", sub: "GLOBAL_PRESENCE" },
              ].map((s, i) => (
                <div key={i} className="relative bg-white/5 border border-white/10 rounded-2xl p-4 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                  <div className="absolute top-2 right-3 text-[7px] font-mono text-white/30 tracking-widest">{s.sub}</div>
                  <div className="font-mono text-2xl font-black text-[#C0392B] leading-none mb-1.5">
                    {s.target !== null ? (
                      <CountUp target={s.target} prefix={s.prefix} />
                    ) : (
                      s.widget
                    )}
                  </div>
                  <div className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-widest leading-none mt-2">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => setPhase('form')}
                className="bg-gradient-to-r from-[#590707] to-[#8a0c0c] hover:from-[#8a0c0c] hover:to-[#C0392B] text-white font-extrabold uppercase tracking-wider py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(192,57,43,0.4)] active:scale-95 transition-all duration-300 pointer-events-auto text-xs"
              >
                Quiero mi propuesta →
              </button>
              <div className="text-[9px] font-mono text-white/40 mt-4 sm:hidden flex items-center justify-center gap-1.5 animate-bounce">
                <span>↓ Desliza para explorar</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ──────────────── SECTION 2: HISTORY / LOG DIAGNOSTICS ──────────────── */}
      <section 
        style={{ opacity: opacityS2 }}
        className="min-h-screen flex items-center justify-center w-full transition-opacity duration-300 pointer-events-none"
      >
        <div className="relative py-10 px-6 bg-black/75 backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(89,7,7,0.25)] rounded-3xl w-full pointer-events-auto">
          <HudBracket />
          
          <div className="flex flex-col gap-4">
            <span className="self-start bg-[#590707]/30 border border-[#C0392B]/50 text-[#ff8080] text-[8px] font-mono tracking-widest px-3 py-1 rounded-md uppercase">
              NUESTRA HISTORIA
            </span>
            <h2 className="text-2xl font-black tracking-tight leading-none text-white uppercase mt-2">
              15 años construyendo<br />
              carreras <span className="text-[#C0392B]">reales.</span>
            </h2>
            
            <div className="h-[1px] bg-white/10 my-2" />
            
            <p className="text-xs text-white/70 leading-relaxed font-mono">
              Kapital Music lleva más de 15 años liderando en la industria urbana. Hemos impulsado y desarrollado proyectos de más de 50 artistas activos y producido más de 250 canciones, cruzando fronteras continentales.
            </p>
            
            <p className="text-xs text-white/70 leading-relaxed font-mono">
              No somos un eslabón suelto. Somos la estructura integral de desarrollo: estudios, estrategia de pauta, producción de beats y consultoría jurídica de nivel élite. Todo consolidado bajo una misma dirección.
            </p>
          </div>
        </div>
      </section>


      {/* ──────────────── SECTION 3: CONSTELACIÓN / ECOSYSTEM ──────────────── */}
      <section 
        style={{ opacity: opacityS3 }}
        className="min-h-screen flex items-center justify-center w-full transition-opacity duration-300 pointer-events-none"
      >
        <div className="relative bg-black/75 backdrop-blur-md border border-[#C0392B]/25 px-6 py-8 rounded-3xl w-full pointer-events-auto">
          <HudBracket />
          
          <span className="inline-block bg-[#590707]/30 border border-[#C0392B]/50 text-[#ff8080] text-[8px] font-mono tracking-widest px-2.5 py-1 rounded mb-3 uppercase">
            POR QUÉ KAPITAL
          </span>
          <h2 className="text-2xl font-black tracking-tight leading-none text-white uppercase mb-2">
            Un ecosistema <span className="text-[#C0392B]">completo para ti.</span>
          </h2>
          <p className="text-xs text-white/55 leading-relaxed mb-4 font-mono">
            Kapital conecta cada pieza de tu carrera artística en un solo lugar — producción, estrategia, protección legal y visibilidad, todo trabajando en sincronía para que tú solo te enfoques en crear. <span className="text-white/30 italic">(Usa los faders y toca los canales para explorar en tiempo real)</span>
          </p>

          <Ecosystem onServiceClick={(idx) => { setActiveSrv(idx); setPhase('services'); }} />
        </div>
      </section>


      {/* ──────────────── SECTION 4: LA CASA + COVERS + CTA FINAL ──────────────── */}
      <section 
        style={{ opacity: opacityS4 }}
        className="min-h-screen flex flex-col justify-center gap-8 w-full transition-opacity duration-300"
      >
        {/* Album Strip Overlay */}
        <div className="relative py-6 bg-black/75 border border-white/10 backdrop-blur-md rounded-3xl overflow-hidden">
          <HudBracket />
          <div className="px-6 mb-4 flex justify-between items-center">
            <div>
              <span className="inline-block bg-[#590707]/30 border border-[#C0392B]/30 text-[#ff8080] text-[8px] font-mono tracking-widest px-2.5 py-1 rounded uppercase mb-1">
                +250 CANCIONES PRODUCIDAS
              </span>
              <p className="text-[10px] text-white/50 font-mono">Parte del catálogo que hemos construido</p>
            </div>
            <div className="text-[8px] font-mono text-white/30">COUNT: 250+</div>
          </div>

          {/* Row 1: Leftward Scroll */}
          <div className="overflow-hidden w-full relative mb-4">
            <div className="flex gap-4 animate-scroll-albums hover:[animation-play-state:paused] w-max">
              {[...PORTADAS_ROW1, ...PORTADAS_ROW1].map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt={"lanzamiento a " + i} 
                  className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow-lg flex-shrink-0 transition-all duration-300"
                  onError={e => { e.target.style.display = "none"; }} 
                />
              ))}
            </div>
          </div>

          {/* Row 2: Rightward Scroll */}
          <div className="overflow-hidden w-full relative">
            <div className="flex gap-4 animate-scroll-albums-rev hover:[animation-play-state:paused] w-max">
              {[...PORTADAS_ROW2, ...PORTADAS_ROW2].map((url, i) => (
                <img 
                  key={i} 
                  src={url} 
                  alt={"lanzamiento b " + i} 
                  className="w-20 h-20 rounded-xl object-cover border border-white/10 shadow-lg flex-shrink-0 transition-all duration-300"
                  onError={e => { e.target.style.display = "none"; }} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="relative">
          <LaCasa />
        </div>

        {/* Final Interactive CTA Panel */}
        <div className="bg-gradient-to-br from-[#590707]/80 to-[#2a0303]/90 backdrop-blur-md border border-[#590707]/50 px-6 py-8 rounded-3xl text-center flex flex-col items-center relative overflow-hidden">
          <HudBracket />
          <span className="inline-block bg-black/40 border border-white/15 text-white/50 text-[8px] font-mono tracking-widest px-3 py-1 rounded mb-4 uppercase">
            ¿LISTO?
          </span>
          <h2 className="text-2xl font-black tracking-tight leading-none text-white uppercase mb-2">
            Construyamos tu carrera juntos
          </h2>
          <p className="text-xs text-white/60 leading-relaxed mb-6 max-w-sm font-mono">
            Completa el formulario y te armamos una propuesta personalizada con precios exactos. Sin compromisos.
          </p>
          
          <button 
            onClick={() => setPhase('form')}
            className="bg-white hover:bg-white/90 text-[#590707] font-black uppercase tracking-wider py-4 px-8 rounded-xl active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 pointer-events-auto text-xs"
          >
            Comenzar ahora →
          </button>
        </div>
      </section>

    </div>
  );
}
