import React from 'react';
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
  const { setPhase, setActiveSrv } = useFormStore();

  const scrollToServices = () => {
    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto gap-24 px-6 md:px-12 py-10 pointer-events-auto">
      
      {/* ──────────────── SECTION 1: HERO / CORE DASHBOARD ──────────────── */}
      <section className="w-full text-center py-12 md:py-20 flex flex-col items-center justify-center animate-[fu_0.5s_ease-out] relative">
        {/* Subtle ambient red background light */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-red-950/15 blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center max-w-3xl">
          <span className="inline-flex items-center gap-2 bg-[#590707]/30 border border-[#C0392B]/35 text-[#ff8080] text-[9px] font-mono tracking-[0.25em] px-4 py-1.5 rounded-full mb-6 uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 bg-[#C0392B] rounded-full animate-ping" />
            BIENVENIDO AL MOVIMIENTO
          </span>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[0.9] tracking-tighter uppercase text-white mb-6">
            Tu música.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e63333] via-[#ff4d4d] to-[#8a0c0c] filter drop-shadow-[0_0_15px_rgba(230,51,51,0.2)]">Tu legado.</span><br />
            Tu momento.
          </h1>
          
          <p className="text-xs md:text-sm text-white/55 leading-relaxed mb-10 max-w-lg font-sans">
            Somos el equipo que te acompaña a construir una carrera real — estrategia, producción y respaldo legal desde el día uno.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button 
              onClick={() => setPhase('form')}
              className="bg-[#C0392B] hover:bg-[#8a0c0c] text-white font-mono font-bold uppercase tracking-wider py-4 px-8 rounded-xl shadow-[0_0_20px_rgba(192,57,43,0.3)] active:scale-95 transition-all duration-300 pointer-events-auto text-xs"
            >
              Quiero mi propuesta →
            </button>
            <button 
              onClick={scrollToServices}
              className="bg-transparent hover:bg-white/5 border border-white/10 hover:border-white/20 text-white font-mono font-bold uppercase tracking-wider py-4 px-8 rounded-xl active:scale-95 transition-all duration-300 pointer-events-auto text-xs"
            >
              Ver servicios
            </button>
          </div>
          
          <div className="text-[9px] font-mono text-white/30 tracking-widest mt-8 uppercase">
            {"// Más de 200 artistas y músicos impulsados"}
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 2: METRICAS / STATS (Métricas Generales) ──────────────── */}
      <section className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { target: 15, prefix: "", label: "Años en la música" },
            { target: 50, prefix: "+", label: "Artistas activos" },
            { target: 250, prefix: "+", label: "Canciones producidas" },
            { target: null, widget: <span className="text-xl">🌎</span>, label: "Visibilidad Global" },
          ].map((s, i) => (
            <div key={i} className="bg-neutral-950/40 backdrop-blur-md border border-white/5 rounded-xl p-5 hover:border-[#C0392B]/20 transition-all duration-300">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#C0392B] leading-none mb-1">
                {s.target !== null ? (
                  <CountUp target={s.target} prefix={s.prefix} />
                ) : (
                  s.widget
                )}
              </div>
              <div className="text-[8px] font-mono font-bold text-white/40 uppercase tracking-widest mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── SECTION 3: LANZAMIENTOS (Catálogo Producido) ──────────────── */}
      <section id="lanzamientos" className="w-full scroll-mt-24">
        <div className="relative py-8 bg-neutral-950/40 border border-white/5 backdrop-blur-md rounded-3xl overflow-hidden hover:border-white/10 transition-colors duration-300">
          <HudBracket />
          <div className="px-8 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-block bg-[#590707]/30 border border-[#C0392B]/30 text-[#ff8080] text-[9px] font-mono tracking-widest px-2.5 py-1 rounded uppercase mb-2">
                +250 CANCIONES PRODUCIDAS
              </span>
              <h2 className="text-lg font-display font-semibold uppercase text-white">Catálogo que hemos construido</h2>
            </div>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest border border-white/5 bg-white/[0.02] px-3 py-1.5 rounded-lg">COUNT: 250+</div>
          </div>

          {/* Row 1: Leftward Scroll */}
          <div className="overflow-hidden w-full relative mb-6">
            <div className="flex gap-4 animate-scroll-albums hover:[animation-play-state:paused] w-max">
              {[...PORTADAS_ROW1, ...PORTADAS_ROW1].map((url, i) => (
                <div key={i} className="group relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-xl border border-white/10 shadow-lg transition-transform duration-300 hover:scale-105">
                  <img 
                    src={url} 
                    alt={`lanzamiento-a-${i}`} 
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={e => { e.target.style.display = "none"; }} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Rightward Scroll */}
          <div className="overflow-hidden w-full relative">
            <div className="flex gap-4 animate-scroll-albums-rev hover:[animation-play-state:paused] w-max">
              {[...PORTADAS_ROW2, ...PORTADAS_ROW2].map((url, i) => (
                <div key={i} className="group relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-xl border border-white/10 shadow-lg transition-transform duration-300 hover:scale-105">
                  <img 
                    src={url} 
                    alt={`lanzamiento-b-${i}`} 
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={e => { e.target.style.display = "none"; }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 4: HISTORIA (Nuestra Historia) ──────────────── */}
      <section id="sobre-nosotros" className="w-full relative scroll-mt-24">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-red-500/5 blur-[80px] -right-12 z-0 pointer-events-none" />
        <div className="relative py-10 px-8 bg-neutral-950/40 backdrop-blur-md border border-white/5 shadow-[0_0_30px_rgba(89,7,7,0.1)] rounded-3xl w-full hover:border-white/10 transition-colors duration-300">
          <HudBracket />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 flex flex-col gap-4">
              <span className="self-start bg-[#590707]/30 border border-[#C0392B]/40 text-[#ff8080] text-[9px] font-mono tracking-widest px-3 py-1 rounded-md uppercase">
                NUESTRA HISTORIA
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight leading-none text-white uppercase">
                15 años construyendo<br />
                carreras <span className="text-[#C0392B]">reales.</span>
              </h2>
            </div>
            
            <div className="md:col-span-7 flex flex-col gap-4 text-xs text-white/60 leading-relaxed font-sans">
              <p>
                Kapital Music lleva más de 15 años liderando en la industria urbana. Hemos impulsado y desarrollado proyectos de más de 50 artistas activos y producido más de 250 canciones, cruzando fronteras continentales.
              </p>
              
              <p>
                Somos la Kapital de la música. Somos la estructura integral de desarrollo: estudios, estrategia de pauta, producción de beats y consultoría jurídica. Todo en el mismo lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── SECTION 5: SERVICIOS (Consola Unificada) ──────────────── */}
      <section id="servicios" className="w-full flex flex-col gap-10 scroll-mt-24">
        <div className="flex flex-col gap-2 max-w-xl">
          <span className="self-start bg-white/5 border border-white/10 text-white/40 text-[9px] font-mono tracking-[0.2em] px-3 py-1 rounded uppercase">
            NUESTROS SERVICIOS
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-tight">
            Ecosistema <span className="text-[#C0392B]">Kapital Music.</span>
          </h2>
          <p className="text-xs md:text-sm text-white/55 font-sans leading-relaxed">
            Manipula los faders de la consola en tiempo real para explorar los servicios
          </p>
        </div>

        {/* Mixer console integrated widget */}
        <div className="relative bg-neutral-950/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 w-full hover:border-[#C0392B]/20 transition-all duration-300">
          <HudBracket />
          <p className="text-[9px] text-[#ff8080] font-mono mb-6 uppercase text-center tracking-widest">
            {"// Faders verticales activos — Selecciona tu canal"}
          </p>
          <Ecosystem onServiceClick={(idx) => { setActiveSrv(idx); setPhase('services'); }} />
        </div>
      </section>

      {/* ──────────────── SECTION 6: LA CASA (Studio Gallery) ──────────────── */}
      <section className="w-full">
        <LaCasa />
      </section>

      {/* ──────────────── SECTION 7: VALORES (Bento de Valores) ──────────────── */}
      <section className="w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          <div className="bg-gradient-to-br from-neutral-950/60 to-neutral-950/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-[#C0392B]/40 hover:shadow-[0_4px_25px_rgba(192,57,43,0.15)] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C0392B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h4 className="text-xs font-display font-bold text-white/90 tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
              Visión
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">Le damos dirección a tus ideas para que tu música tenga identidad propia y suene con fuerza.</p>
          </div>

          <div className="bg-gradient-to-br from-neutral-950/60 to-neutral-950/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-[#C0392B]/40 hover:shadow-[0_4px_25px_rgba(192,57,43,0.15)] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C0392B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h4 className="text-xs font-display font-bold text-white/90 tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
              Oficio
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">Cuidamos cada detalle del proceso, desde el primer beat hasta el máster final para que tu sonido sea impecable.</p>
          </div>

          <div className="bg-gradient-to-br from-neutral-950/60 to-neutral-950/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-[#C0392B]/40 hover:shadow-[0_4px_25px_rgba(192,57,43,0.15)] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C0392B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h4 className="text-xs font-display font-bold text-white/90 tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
              Confianza
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">Hablamos claro y sin rodeos. Cumplimos con los tiempos acordados y te acompañamos en todo el camino.</p>
          </div>

          <div className="bg-gradient-to-br from-neutral-950/60 to-neutral-950/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl hover:border-[#C0392B]/40 hover:shadow-[0_4px_25px_rgba(192,57,43,0.15)] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C0392B]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h4 className="text-xs font-display font-bold text-white/90 tracking-widest uppercase mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B]" />
              Energía
            </h4>
            <p className="text-[11px] text-white/60 leading-relaxed font-sans">El entorno que impulsará tu sueño.</p>
          </div>

        </div>
      </section>

      {/* ──────────────── SECTION 8: CTA FINAL (Get In Touch) ──────────────── */}
      <section className="w-full">
        <div className="bg-gradient-to-br from-[#590707]/80 to-[#2a0303]/90 backdrop-blur-md border border-[#590707]/40 px-6 py-12 md:py-16 rounded-3xl text-center flex flex-col items-center relative overflow-hidden">
          <HudBracket />
          <span className="inline-block bg-black/40 border border-white/10 text-white/50 text-[9px] font-mono tracking-widest px-3 py-1 rounded mb-4 uppercase">
            ¿LISTO?
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-none text-white uppercase mb-4">
            Construyamos tu carrera juntos
          </h2>
          <p className="text-xs md:text-sm text-white/60 leading-relaxed mb-8 max-w-md font-sans">
            Completa el formulario y te armamos una propuesta personalizada con precios exactos, o contáctanos de inmediato por nuestros canales directos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center max-w-lg">
            <button 
              onClick={() => setPhase('form')}
              className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#590707] font-mono font-bold uppercase tracking-wider py-4 px-8 rounded-xl active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 pointer-events-auto text-xs"
            >
              Comenzar ahora →
            </button>
            <a 
              href="https://wa.me/573113143351"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#1a8f3c] hover:bg-[#20a348] text-white font-mono font-bold uppercase tracking-wider py-4 px-6 rounded-xl active:scale-95 transition-all duration-300 pointer-events-auto text-xs flex items-center justify-center gap-2"
            >
              <span>💬</span> WhatsApp
            </a>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=clientes@kapitalmusic.co"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/15 border border-white/10 text-white font-mono font-bold uppercase tracking-wider py-4 px-6 rounded-xl active:scale-95 transition-all duration-300 pointer-events-auto text-xs flex items-center justify-center gap-2"
            >
              <span>📧</span> Email
            </a>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-6 text-[10px] font-mono text-white/40 tracking-wider">
            <div>WHATSAPP: <span className="text-white/80">+57 311 314 3351</span></div>
            <div className="hidden sm:block">|</div>
            <div>EMAIL: <span className="text-white/80">clientes@kapitalmusic.co</span></div>
          </div>
        </div>
      </section>

    </div>
  );
}
