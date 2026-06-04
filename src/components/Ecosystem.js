import React, { useState, useEffect, useRef } from 'react';

export default function Ecosystem({ onServiceClick }) {
  const [hovered, setHovered] = useState(null);
  const [visibleCards, setVisibleCards] = useState([]);
  const cardRefs = useRef([]);

  const satellites = [
    { label: "Studio", icon: "🎙️", desc: "Grabación profesional A77X", angle: 0, serviceIdx: 0, coords: "BOG: 04.60° N, 74.08° W" },
    { label: "Legal", icon: "⚖️", desc: "Split-sheets y DNDA", angle: 60, serviceIdx: 1, coords: "MDE: 06.25° N, 75.56° W" },
    { label: "Marketing", icon: "📲", desc: "Pauta inteligente Meta", angle: 120, serviceIdx: 3, coords: "MIA: 25.76° N, 80.19° W" },
    { label: "Digital", icon: "🌐", desc: "Distribución multi-plataforma", angle: 180, serviceIdx: 1, coords: "MEX: 19.43° N, 99.13° W" },
    { label: "Management", icon: "🤝", desc: "A&R estratégico", angle: 240, serviceIdx: 3, coords: "LAX: 34.05° N, 118.24° W" },
    { label: "Sync", icon: "🎬", desc: "Licenciamiento audiovisual", angle: 300, serviceIdx: 4, coords: "SCL: 33.45° S, 70.66° W" },
  ];

  const bentoCards = [
    { icon: "🎙️", title: "Estudio Profesional", desc: "Dos salas acústicas certificadas equipadas con hardware analógico Universal Audio y Manley.", color: "#C0392B", serviceIdx: 0, tag: "TECH: ANALOG_CONSOLE" },
    { icon: "⚖️", title: "Blindaje Legal", desc: "Protección patrimonial de fonogramas y obras musicales. SAYCO/ACINPRO/ASCAP sin fricción.", color: "#8a0c0c", serviceIdx: 1, tag: "SECURE: SPLIT_SHEETS" },
    { icon: "📲", title: "Marketing 360°", desc: "Campañas de Meta Ads con optimización de CPC y conversión para escalar lanzamientos orgánicos.", color: "#C0392B", serviceIdx: 3, tag: "MARKET: SCALING_ALGO" },
    { icon: "🎵", title: "Producción Elite", desc: "Bajo la dirección de TunyD y Money Makers. Del concepto primario al master final.", color: "#8a0c0c", serviceIdx: 4, tag: "CREATIVE: PRO_BEATS" },
  ];

  useEffect(() => {
    const observers = cardRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisibleCards(v => [...new Set([...v, i])]), i * 120);
        }
      }, { threshold: 0.2 });
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, []);

  return (
    <div className="my-6 pointer-events-auto">
      {/* High-Tech Circular Radar Console */}
      <div className="relative w-full pb-[110%] max-w-[380px] mx-auto mb-8 border border-white/5 bg-black/40 rounded-full shadow-[0_0_40px_rgba(192,57,43,0.05)]">
        
        {/* Radar Corner Brackets */}
        <div className="absolute top-6 left-6 w-3 h-3 border-t border-l border-[#C0392B]/40" />
        <div className="absolute top-6 right-6 w-3 h-3 border-t border-r border-[#C0392B]/40" />
        <div className="absolute bottom-6 left-6 w-3 h-3 border-b border-l border-[#C0392B]/40" />
        <div className="absolute bottom-6 right-6 w-3 h-3 border-b border-r border-[#C0392B]/40" />

        <div className="absolute inset-4">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <radialGradient id="cg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C0392B" stopOpacity="0.25"/>
                <stop offset="70%" stopColor="#C0392B" stopOpacity="0.03"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0"/>
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.8" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Glowing background matrix */}
            <circle cx="50" cy="50" r="48" fill="url(#cg)"/>
            
            {/* Concentric telemetry rings */}
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(192,57,43,.1)" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(192,57,43,.2)" strokeWidth="0.4" strokeDasharray="3 3"/>
            <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(192,57,43,.15)" strokeWidth="0.3" strokeDasharray="1.5 2"/>
            
            {/* Rotating compass outer ticks */}
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(192,57,43,.3)" strokeWidth="0.4" strokeDasharray="1 14">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="20s" repeatCount="indefinite" />
            </circle>

            {/* Radar Scanning Line */}
            <line x1="50" y1="50" x2="50" y2="10" stroke="rgba(192,57,43,0.4)" strokeWidth="0.6" filter="url(#glow)">
              <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="7s" repeatCount="indefinite" />
            </line>

            {/* Static alignment axes */}
            <line x1="50" y1="4" x2="50" y2="96" stroke="rgba(192,57,43,.06)" strokeWidth="0.2" />
            <line x1="4" y1="50" x2="96" y2="50" stroke="rgba(192,57,43,.06)" strokeWidth="0.2" />

            {/* Degree notations */}
            <text x="50" y="8" fontSize="2" fill="rgba(255,255,255,.3)" textAnchor="middle" fontFamily="monospace">000°</text>
            <text x="94" y="51" fontSize="2" fill="rgba(255,255,255,.3)" dominantBaseline="middle" fontFamily="monospace">090°</text>
            <text x="50" y="94" fontSize="2" fill="rgba(255,255,255,.3)" textAnchor="middle" fontFamily="monospace">180°</text>
            <text x="6" y="51" fontSize="2" fill="rgba(255,255,255,.3)" dominantBaseline="middle" fontFamily="monospace">270°</text>

            {/* Connections from core to nodes */}
            {satellites.map((s, i) => {
              const rad = (s.angle - 90) * Math.PI / 180;
              const x = 50 + 36 * Math.cos(rad); const y = 50 + 36 * Math.sin(rad);
              const isHov = hovered === i;
              return (
                <line key={i} x1="50" y1="50" x2={x} y2={y}
                  stroke={isHov ? "rgba(255,51,51,0.85)" : "rgba(192,57,43,0.2)"}
                  strokeWidth={isHov ? 0.7 : 0.3} 
                  strokeDasharray={isHov ? "none" : "2 1.5"}
                  style={{ transition: "all 0.3s" }}
                />
              );
            })}

            {/* Constellation Nodes */}
            {satellites.map((s, i) => {
              const rad = (s.angle - 90) * Math.PI / 180;
              const x = 50 + 36 * Math.cos(rad); const y = 50 + 36 * Math.sin(rad);
              const isHov = hovered === i;
              return (
                <g key={i} style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                  onClick={() => onServiceClick && onServiceClick(s.serviceIdx)}>
                  
                  {/* Glowing core animation */}
                  <circle cx={x} cy={y} r={isHov ? 8 : 6} fill="none" stroke="rgba(192,57,43,0.3)" strokeWidth="0.3">
                    <animate attributeName="r" values={`${isHov ? 7 : 5};${isHov ? 10 : 8};${isHov ? 7 : 5}`} dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
                  </circle>

                  {/* Node solid point */}
                  <circle cx={x} cy={y} r={isHov ? 5.5 : 4.5}
                    fill={isHov ? "#ff0033" : "#0d0505"}
                    stroke={isHov ? "#ff9999" : "rgba(192,57,43,0.6)"}
                    strokeWidth={isHov ? 0.7 : 0.4}
                    filter={isHov ? "url(#glow)" : "none"}
                    style={{ transition: "all 0.3s" }}
                  />
                  
                  {/* Node Icon */}
                  <text x={x} y={y + 0.3} textAnchor="middle" dominantBaseline="middle" fontSize="3" className="select-none">{s.icon}</text>
                  
                  {/* Telemetry labels and boxes */}
                  {isHov ? (
                    <g>
                      <rect x={x - 22} y={y + 7} width="44" height="11" rx="2" fill="rgba(5,5,5,.95)" stroke="#C0392B" strokeWidth="0.4"/>
                      <text x={x} y={y + 10.5} textAnchor="middle" fontSize="2.2" fill="#fff" fontFamily="monospace" fontWeight="900" letterSpacing="0.2">{s.label.toUpperCase()}</text>
                      <text x={x} y={y + 13.5} textAnchor="middle" fontSize="1.6" fill="rgba(255,255,255,.6)" fontFamily="monospace">{s.desc}</text>
                      <text x={x} y={y + 16} textAnchor="middle" fontSize="1.3" fill="#ff8080" fontFamily="monospace">{s.coords}</text>
                    </g>
                  ) : (
                    <g>
                      <text x={x} y={y + 8} textAnchor="middle" fontSize="2.0" fill="rgba(255,255,255,.6)" fontFamily="monospace" fontWeight="600">{s.label}</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Central radar antenna hub */}
            <circle cx="50" cy="50" r="12" fill="#050505" stroke="#C0392B" strokeWidth="0.8" filter="url(#glow)"/>
            <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(192,57,43,.3)" strokeWidth="0.3">
              <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite"/>
            </circle>

            {/* Central core detail */}
            <circle cx="50" cy="50" r="3" fill="#C0392B" />
            <circle cx="50" cy="50" r="1.5" fill="#fff" />
          </svg>
        </div>
      </div>

      {/* Bento Grid: Glassmorphic Cards with Neon details */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {bentoCards.map((card, i) => {
          const visible = visibleCards.includes(i);
          return (
            <div 
              key={i} 
              ref={el => cardRefs.current[i] = el}
              style={{
                transform: visible ? "translateY(0)" : "translateY(24px)",
                opacity: visible ? 1 : 0,
                transition: `transform .5s ease ${i*0.12}s, opacity .5s ease ${i*0.12}s, box-shadow .3s, border-color .3s`,
              }}
              className="group cursor-pointer bg-black/60 hover:bg-[#590707]/15 backdrop-blur-xl border border-white/10 hover:border-[#C0392B]/50 hover:shadow-[0_0_25px_rgba(192,57,43,0.3)] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between"
              onClick={() => onServiceClick && onServiceClick(card.serviceIdx)}
            >
              {/* HUD corner lines inside the card */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 group-hover:border-[#C0392B]/60 transition-colors" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/10 group-hover:border-[#C0392B]/60 transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/10 group-hover:border-[#C0392B]/60 transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 group-hover:border-[#C0392B]/60 transition-colors" />

              {/* System Tag */}
              <div className="flex justify-between items-center text-[7px] font-mono text-white/30 tracking-widest mb-3 leading-none">
                <span>{card.tag}</span>
                <span className="w-1 h-1 bg-[#C0392B] rounded-full group-hover:animate-ping" />
              </div>

              <div>
                {/* Glowing Icon Hub */}
                <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 mb-4 flex items-center justify-center relative overflow-hidden group-hover:border-[#C0392B]/40 group-hover:bg-[#590707]/10 transition-all duration-300">
                  <div 
                    style={{ background: `radial-gradient(circle, ${card.color}22 0%, transparent 70%)` }}
                    className="absolute w-[50px] h-[50px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
                  />
                  <span className="text-xl relative">{card.icon}</span>
                </div>
                
                <div className="font-mono font-black text-xs text-white mb-2 leading-tight tracking-wide">{card.title.toUpperCase()}</div>
                <div className="text-[10px] text-white/55 font-mono leading-relaxed mb-4">{card.desc}</div>
              </div>
              
              <div className="inline-flex items-center gap-1.5 self-start bg-white/5 border border-white/10 group-hover:bg-[#590707]/35 group-hover:border-[#C0392B]/50 rounded px-2.5 py-1.5 cursor-pointer transition-all duration-300">
                <span className="text-[8px] font-mono font-bold text-white/50 group-hover:text-[#ff8080] tracking-widest uppercase">CONECTAR_CANAL</span>
                <span className="text-[8px] text-white/40 group-hover:text-[#ff8080]">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
