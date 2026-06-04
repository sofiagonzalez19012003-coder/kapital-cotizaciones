import React, { useState, useEffect } from 'react';
import { LOGO_URL } from '../utils/businessLogic';

const diagnosticLogs = [
  "KAPITAL_A&R_CORE: v2.0.26 INIT...",
  "GPU_RENDERER: WEBGL_ACTIVE",
  "ESTABLISHING SECURE SHEET LINK...",
  "CACHING AUDITORY DATA PACKETS...",
  "CALIBRATING STEREO CAMERA RIG...",
  "COMPUTING HOLOGRAPHIC PIPELINES...",
  "INITIALIZING AUDIO WAVEFORM MATRIX...",
  "SYSTEM STATUS: OPTIMAL // WELCOME ARTISTA"
];

export default function Preloader({ onDone }) {
  const [stage, setStage] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    diagnosticLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
      }, index * 250);
    });

    const t1 = setTimeout(() => setStage(1), 2200);
    const t2 = setTimeout(() => setStage(2), 3400);
    const t3 = setTimeout(() => onDone(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  if (stage === 3) return null;

  return (
    <div 
      style={{
        transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',
        opacity: stage === 2 ? 0 : 1,
      }}
      className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center font-mono text-[10px] text-[#ff8080]"
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none z-50 opacity-40" />

      {/* Cyberpunk Grid Background */}
      <div 
        style={{ transition: 'opacity 1.5s' }}
        className={`absolute inset-0 bg-[linear-gradient(rgba(89,7,7,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(89,7,7,.06)_1px,transparent_1px)] bg-[size:30px_30px] ${
          stage >= 1 ? 'opacity-100' : 'opacity-40'
        }`} 
      />

      {/* Radial Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(89,7,7,0.25)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Radar rings */}
      <div className="absolute w-72 h-72 border border-[#C0392B]/20 rounded-full animate-[spin_10s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
      <div className="absolute w-64 h-64 border border-[#590707]/30 rounded-full" />
      <div className="absolute w-40 h-40 border border-[#C0392B]/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" style={{ borderStyle: 'dotted' }} />

      {/* Crosshair accents */}
      <div className="absolute top-10 left-10 w-8 h-8 border-t border-l border-[#C0392B]/40" />
      <div className="absolute top-10 right-10 w-8 h-8 border-t border-r border-[#C0392B]/40" />
      <div className="absolute bottom-10 left-10 w-8 h-8 border-b border-l border-[#C0392B]/40" />
      <div className="absolute bottom-10 right-10 w-8 h-8 border-b border-r border-[#C0392B]/40" />

      {/* Main Logo & Scanner bar */}
      <div className="relative mb-6">
        <img 
          src={LOGO_URL} 
          alt="Kapital Music" 
          style={{
            filter: "drop-shadow(0 0 25px rgba(89,7,7,.85))",
          }}
          className="w-[50vw] max-w-[200px] h-auto object-contain relative z-10 animate-pulse"
        />
        {/* Holographic scanning laser line */}
        <div className="absolute left-0 right-0 h-[2px] bg-red-500 shadow-[0_0_8px_#ef4444] animate-scan z-20" />
      </div>

      {/* Title */}
      <div className="text-center mb-8 relative z-10">
        <div className="text-xl font-black tracking-[0.4em] text-white">KAPITAL</div>
        <div className="text-xs font-bold tracking-[0.5em] text-[#C0392B] mt-1">A&R SYSTEM</div>
      </div>

      {/* Boot Logs Terminal */}
      <div className="w-[85vw] max-w-sm h-36 bg-black/70 border border-[#590707]/50 rounded-xl p-4 overflow-y-auto flex flex-col gap-1.5 shadow-2xl backdrop-blur-md relative z-10 text-left">
        <div className="absolute top-2 right-3 text-[8px] text-[#ff8080]/30 animate-pulse">SECURE CONNECTION</div>
        {logs.map((log, i) => (
          <div key={i} className="leading-none tracking-wider text-[9px] flex gap-2 font-mono">
            <span className="text-[#C0392B]/80 font-bold">&gt;&gt;</span>
            <span className="text-white/95">{log}</span>
          </div>
        ))}
        {logs.length < diagnosticLogs.length && (
          <div className="animate-pulse leading-none tracking-wider text-[9px] text-[#ff8080] font-mono">
            <span className="text-[#C0392B]/80 font-bold">&gt;&gt;</span> LOADING...
          </div>
        )}
      </div>

      {/* Loading Progress Bar */}
      <div className="mt-8 w-60 h-[3px] bg-white/5 rounded-full overflow-hidden relative z-10 border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-[#590707] to-[#C0392B] rounded-full"
          style={{ animation: "bar-fill 3.2s cubic-bezier(0.2, 0.8, 0.2, 1) both" }}
        />
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        @keyframes bar-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
