import React, { useState } from 'react';

export default function Ecosystem({ onServiceClick }) {
  const [activeChannel, setActiveChannel] = useState(0);

  const channels = [
    {
      idx: 0,
      icon: "🎙️",
      title: "Alquiler de Estudios",
      tag: "GRABACIÓN",
      subtitle: "Estudios A y B de nivel élite",
      desc: "Dos salas equipadas con la mejor tecnología de alta gama para que grabes tu música con un sonido impecable. Haz clic para conocer los detalles de cada estudio.",
      faderValue: 80,
      tech: "HARDWARE: CLASS_A_PREAMP_APOLLO8",
      serviceIdx: 0
    },
    {
      idx: 1,
      icon: "⚖️",
      title: "Asesoría Legal",
      tag: "PROTECCIÓN",
      subtitle: "Derechos de autor y contratos",
      desc: "Protegemos tu patrimonio musical: registro de obras, contratos a tu medida y recaudación de regalías a nivel internacional. Haz clic para ver todo lo que incluye.",
      faderValue: 70,
      tech: "LEGAL: DNDA_COPYRIGHT_SECURE",
      serviceIdx: 1
    },
    {
      idx: 2,
      icon: "🎚️",
      title: "Mezcla & Mastering",
      tag: "SONIDO",
      subtitle: "Post-producción profesional",
      desc: "Llevamos tus canciones grabadas al estándar de las plataformas digitales con nuestra mezcla y máster en 72 horas. Haz clic para conocer más.",
      faderValue: 75,
      tech: "PROCESSING: ANALOG_SUMMING_72H",
      serviceIdx: 2
    },
    {
      idx: 3,
      icon: "📲",
      title: "Marketing 360",
      tag: "CRECIMIENTO",
      subtitle: "Estrategia y pauta digital",
      desc: "Estrategia digital integral con pautas optimizadas de Meta Ads para hacer crecer tus reproducciones y oyentes mensuales. Haz clic para descubrir el plan.",
      faderValue: 85,
      tech: "ADS: FB_PIXEL_CONVERSION_ENGINE",
      serviceIdx: 3
    },
    {
      idx: 4,
      icon: "🎵",
      title: "Producción Musical",
      tag: "CREACIÓN",
      subtitle: "Concepto y beats exclusivos",
      desc: "Desarrollo creativo completo de la mano de TunyD y Money Makers, desde la idea inicial y los beats hasta el máster final. Haz clic para conocer el proceso.",
      faderValue: 95,
      tech: "PRODUCTION: ELITE_ARRANGERS_KAPITAL",
      serviceIdx: 4
    }
  ];

  const CL = "https://res.cloudinary.com/dssujt8zt/image/upload/q_auto,f_auto/";
  const serviceImages = {
    0: [
      CL + "estudio-a-1_yitif2",
      CL + "estudio-a-2_ax1jy5",
      CL + "estudio-b-1_hlduee",
      CL + "estudio-b-2_wpzby5"
    ],
    1: [
      CL + "DSC05600_ylryqo",
      CL + "DSC09145-2_n3jfk8",
      CL + "DSC09540_qo0mux",
      CL + "DSC08188_axo980"
    ],
    2: [
      CL + "DSC08964_pwxai2",
      CL + "DSC09087_iygxrp",
      CL + "DSC09077_cs0xwa",
      CL + "DSC09091_gkd66d"
    ],
    3: [
      CL + "DSC09091_gkd66d",
      CL + "DSC09026_qcghrz",
      CL + "DSC09017_mxtnrf",
      CL + "DSC08200_unvjmy"
    ],
    4: [
      CL + "money-makers-1_ezbtfk",
      CL + "money-makers-3_oba1ls",
      CL + "tunyd-2_wo2quf",
      CL + "tunyd-1_sr6wde"
    ]
  };

  return (
    <div className="my-6 pointer-events-auto max-w-lg mx-auto font-mono text-[11px] w-full">
      <div className="relative bg-neutral-950/80 border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-6 backdrop-blur-md">
        
        {/* HUD corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#C0392B]/50" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#C0392B]/50" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#C0392B]/50" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C0392B]/50" />

        {/* Console Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3 text-[8px] text-white/40 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C0392B] animate-ping" />
            <span>KAPITAL_MIX_DESK_v2.5</span>
          </div>
          <div>CONSOLE: ONLINE</div>
        </div>

        {/* 5-Channel Faders Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 py-1 justify-center items-stretch h-[230px]">
          {channels.map((chan) => {
            const isActive = activeChannel === chan.idx;
            return (
              <div 
                key={chan.idx}
                onClick={() => setActiveChannel(chan.idx)}
                className={`relative flex flex-col items-center justify-between border rounded-xl py-3 px-1 transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-[#590707]/15 border-[#C0392B] shadow-[0_0_20px_rgba(192,57,43,0.25)] scale-[1.02] z-10' 
                    : 'bg-white/[0.01] border-white/5 hover:border-white/20 opacity-50 hover:opacity-80'
                }`}
              >
                {/* Channel Label */}
                <div className="text-[6.5px] text-center font-bold tracking-tighter text-white/40 uppercase leading-none truncate max-w-full">
                  {chan.tag}
                </div>

                {/* Level Meter (LED Stack) */}
                <div className="flex flex-col gap-[1.5px] h-16 w-1 justify-end mt-2">
                  {Array.from({ length: 8 }).map((_, ledIdx) => {
                    const ledValue = (ledIdx + 1) * 12.5;
                    const isLit = isActive ? (chan.faderValue >= ledValue) : (ledValue <= 25);
                    
                    let ledClass = "bg-neutral-800";
                    if (isLit) {
                      if (ledIdx >= 6) ledClass = "bg-red-500 shadow-[0_0_3px_#ef4444]";
                      else if (ledIdx >= 4) ledClass = "bg-amber-400 shadow-[0_0_2px_#fbbf24]";
                      else ledClass = "bg-emerald-500 shadow-[0_0_2px_#34d399]";
                    }
                    
                    return (
                      <div 
                        key={ledIdx}
                        style={{
                          animation: isActive ? 'ledPulse 1.4s ease-in-out infinite' : 'none',
                          animationDelay: `${(7 - ledIdx) * 0.08}s`,
                          '--led-glow': ledIdx >= 6 ? '#ef4444' : ledIdx >= 4 ? '#fbbf24' : '#34d399'
                        }}
                        className={`w-full h-[4px] rounded-sm transition-all duration-300 ${ledClass}`} 
                      />
                    );
                  })}
                </div>

                {/* Volume Fader Slider Slot */}
                <div className="relative h-16 w-[1.5px] bg-neutral-800 rounded-full my-2 flex items-center justify-center">
                  <div className="absolute top-0 -left-1 text-[5px] text-white/10 font-bold">-0dB</div>
                  <div className="absolute bottom-0 -left-1 text-[5px] text-white/10 font-bold">-INF</div>

                  {/* Slider Fader Knob */}
                  <div 
                    style={{ 
                      bottom: isActive ? `${chan.faderValue - 10}%` : '10%',
                      transition: 'bottom 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.3s'
                    }}
                    className={`absolute w-3 h-5 rounded border shadow-md ${
                      isActive 
                        ? 'bg-[#C0392B] border-[#ff8080] shadow-[0_0_5px_#C0392B]' 
                        : 'bg-neutral-600 border-neutral-500'
                    }`}
                  >
                    <div className="w-full h-[1px] bg-white/40 absolute top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Solo / Mute Indicator */}
                <div className="flex gap-1 mt-1">
                  <div className={`w-3 h-3 rounded-[2px] flex items-center justify-center text-[6px] font-bold border transition-all duration-300 ${
                    isActive 
                      ? 'bg-emerald-500/25 border-emerald-500 text-emerald-400' 
                      : 'bg-neutral-900 border-white/5 text-white/15'
                  }`}>
                    S
                  </div>
                  <div className="w-3 h-3 rounded-[2px] bg-neutral-900 border border-white/5 flex items-center justify-center text-[6px] font-bold text-white/15">
                    M
                  </div>
                </div>

                {/* Channel Icon */}
                <div className="text-sm mt-1.5 leading-none">
                  {chan.icon}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Channel Specifications Panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden transition-all duration-300">

          <h3 className="font-mono font-black text-sm text-white uppercase tracking-wider mb-0.5">
            {channels[activeChannel].title}
          </h3>
          <p className="text-[9px] text-[#ff8080] font-bold uppercase tracking-widest mb-2.5">
            {channels[activeChannel].subtitle}
          </p>
          <p className="text-[10px] text-white/60 leading-relaxed font-mono mb-4">
            {channels[activeChannel].desc}
          </p>

          <button 
            onClick={() => onServiceClick(channels[activeChannel].serviceIdx)}
            className="inline-flex items-center gap-2 bg-[#590707]/30 hover:bg-[#C0392B]/35 border border-[#C0392B]/50 rounded-lg px-3.5 py-2 mb-4 transition-all duration-300 pointer-events-auto"
          >
            <span className="text-[8.5px] font-mono font-bold text-[#ff8080] tracking-widest uppercase">
              VER_DETALLES_SERVICIO
            </span>
            <span className="text-[8.5px] text-[#ff8080]">→</span>
          </button>

          {/* Dynamic real photo gallery at the bottom */}
          <div className="mt-4 border-t border-white/5 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {serviceImages[activeChannel]?.map((url, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/5 group/img hover:border-[#C0392B]/45 transition-all duration-300">
                  <img 
                    src={url} 
                    alt={`servicios-${activeChannel}-${i}`} 
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display = "none"; }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes ledPulse {
          0%, 100% { opacity: 0.3; filter: brightness(0.7); }
          50% { opacity: 1; filter: brightness(1.2) drop-shadow(0 0 2px var(--led-glow)); }
        }
      `}</style>
    </div>
  );
}
