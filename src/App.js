import React, { useEffect, useState, useRef } from 'react';
import { useFormStore } from './store/useFormStore';
import Scene from './components/Scene';
import Preloader from './components/Preloader';
import FormCard from './components/FormCard';
import FormExtras from './components/FormExtras';
import LandingView from './components/LandingView';
import ServicesView from './components/ServicesView';
import ProposalView from './components/ProposalView';
import { LOGO_NAV } from './utils/businessLogic';

export default function App() {
  const [preloading, setPreloading] = useState(true);
  const { 
    phase, 
    savedOk, 
    reset, 
    loadMsg, 
    setLoadMsg,
    setScrollProgress
  } = useFormStore();
  
  const topRef = useRef(null);

  const LOAD_MSGS = ["Analizando tu perfil...", "Calculando tu cotización...", "Identificando qué te está frenando...", "Armando tu plan de carrera...", "Ya casi está lista..."];

  useEffect(() => {
    if (phase !== 'landing') return;
    
    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // initial trigger

    return () => window.removeEventListener('scroll', handleScroll);
  }, [phase, setScrollProgress]);

  useEffect(() => {
    if (phase === "loading") {
      const iv = setInterval(() => {
        setLoadMsg((loadMsg + 1) % 5);
      }, 1900);
      return () => clearInterval(iv);
    }
  }, [phase, loadMsg, setLoadMsg]);

  useEffect(() => {
    // Only scroll into view if NOT in landing phase to avoid breaking scrollytelling focus
    if (phase !== 'landing') {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [phase]);

  return (
    <div className="relative min-h-screen text-white font-['Raleway'] overflow-x-hidden bg-[#070707]">
      {/* 3D WebGL Background Scene */}
      <Scene />

      {/* Intro Preloader */}
      {preloading && <Preloader onDone={() => setPreloading(false)} />}

      <div ref={topRef} />

      {/* HUD layer floating over the Canvas */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between pointer-events-none">
        
        {/* Navigation Bar */}
        <nav className="sticky top-0 w-full backdrop-blur-md bg-[#080808]/80 border-b border-[#590707]/30 px-6 py-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 cursor-pointer" onClick={reset}>
            <img 
              src={LOGO_NAV} 
              alt="Kapital Music" 
              className="w-10 h-10 object-contain block flex-shrink-0"
              onError={e => { e.target.style.display = "none"; }} 
            />
            <div>
              <div className="text-xs font-black tracking-widest text-white uppercase">Kapital Music</div>
              <div className="text-[9px] text-white/30 tracking-widest uppercase">Sello Independiente</div>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            {savedOk && (
              <div className="text-[10px] text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                ✓ Guardado
              </div>
            )}
            {phase !== "landing" && (
              <button 
                className="px-4 py-2 border border-white/10 hover:border-white/30 rounded-lg text-[10px] font-bold tracking-widest uppercase text-white/60 hover:text-white transition-all pointer-events-auto"
                onClick={reset}
              >
                ← Inicio
              </button>
            )}
          </div>
        </nav>

        {/* HUD Content Pages */}
        <main className="flex-1 w-full flex items-center justify-center py-6 px-4 pointer-events-auto">
          {phase === "landing" && <LandingView />}
          {phase === "services" && <ServicesView />}
          {phase === "form" && <FormCard />}
          {phase === "extras" && <FormExtras />}
          
          {phase === "loading" && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full border-[3px] border-white/5 border-t-[#C0392B] animate-spin mb-6" />
              <div className="text-lg font-extrabold mb-2 text-white animate-pulse">{LOAD_MSGS[loadMsg]}</div>
              <div className="text-[9px] text-white/20 tracking-wider uppercase">KAPITAL MUSIC</div>
            </div>
          )}
          
          {phase === "proposal" && <ProposalView />}
        </main>

        {/* Footer */}
        <footer className="py-6 border-t border-white/5 text-center text-[9px] text-white/15 tracking-widest pointer-events-auto">
          KAPITAL MUSIC © {new Date().getFullYear()} — contacto@kapitalmusic.co
        </footer>
      </div>
    </div>
  );
}
