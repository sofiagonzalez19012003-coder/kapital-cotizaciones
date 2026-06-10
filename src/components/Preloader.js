import React, { useState, useEffect } from 'react';
import { LOGO_URL } from '../utils/businessLogic';

export default function Preloader({ onDone }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1800);
    const t2 = setTimeout(() => setStage(2), 2900);
    const t3 = setTimeout(() => onDone(), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  if (stage === 3) return null;

  return (
    <div 
      style={{
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        opacity: stage === 2 ? 0 : 1,
      }}
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center font-mono text-[10px] text-[#ff8080]"
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none z-50 opacity-30" />

      {/* Cyberpunk Grid Background */}
      <div 
        style={{ transition: 'opacity 1.5s' }}
        className={`absolute inset-0 bg-[linear-gradient(rgba(89,7,7,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(89,7,7,.04)_1px,transparent_1px)] bg-[size:30px_30px] ${
          stage >= 1 ? 'opacity-100' : 'opacity-40'
        }`} 
      />

      {/* Radial Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(89,7,7,0.2)_0%,transparent_75%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Minimalist Soundwaves (Pulsing and rotating circles surrounding the logo) */}
      <div className="absolute w-72 h-72 flex items-center justify-center z-0">
        <svg className="w-full h-full animate-[pulse_2s_ease-in-out_infinite]" viewBox="0 0 100 100">
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            fill="none" 
            stroke="#C0392B" 
            strokeWidth="0.3" 
            strokeDasharray="2 4" 
            className="animate-[spin_25s_linear_infinite]" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="38" 
            fill="none" 
            stroke="#590707" 
            strokeWidth="0.4" 
            strokeDasharray="4 3" 
            className="animate-[spin_18s_linear_infinite_reverse]" 
          />
          <circle 
            cx="50" 
            cy="50" 
            r="32" 
            fill="none" 
            stroke="#e63333" 
            strokeWidth="0.6" 
            strokeDasharray="1 6" 
            className="animate-[spin_10s_linear_infinite]" 
            style={{ opacity: 0.8 }}
          />
          <path 
            d="M 50 15 A 35 35 0 0 1 85 50 A 35 35 0 0 1 50 85 A 35 35 0 0 1 15 50 A 35 35 0 0 1 50 15" 
            fill="none" 
            stroke="#C0392B" 
            strokeWidth="0.2" 
            strokeDasharray="6,8" 
            className="animate-pulse" 
          />
        </svg>
      </div>

      {/* Main Logo with 3D Y-axis spinning animation */}
      <div className="relative mb-8 z-10 flex items-center justify-center">
        <div className="animate-spin-3d-y">
          <img 
            src={LOGO_URL} 
            alt="Kapital Music" 
            style={{
              filter: "drop-shadow(0 0 20px rgba(192,57,43,.6))",
            }}
            className="w-[30vw] max-w-[140px] h-auto object-contain"
          />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8 relative z-10">
        <div className="text-lg font-display font-black tracking-[0.4em] text-white">KAPITAL</div>
        <div className="text-[10px] font-mono tracking-[0.45em] text-[#C0392B] mt-1.5 uppercase">Asesoría Personalizada</div>
      </div>

      {/* Slim Minimalist Loading Progress Bar */}
      <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-[#590707] via-[#C0392B] to-[#e63333] rounded-full"
          style={{ animation: "bar-fill 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) both" }}
        />
      </div>

      <style>{`
        @keyframes spin3dy {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .animate-spin-3d-y {
          animation: spin3dy 6s linear infinite;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        @keyframes bar-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
