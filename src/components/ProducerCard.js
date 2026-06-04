import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function ProducerCard({ name, price, tag, isSelected, onClick }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 220, damping: 18 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 220, damping: 18 });

  const shineX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const shineY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative w-full overflow-hidden rounded-2xl border cursor-pointer p-6 transition-all duration-300 pointer-events-auto ${
        isSelected 
          ? 'bg-gradient-to-br from-[#590707]/35 to-[#8a0c0c]/12 border-[#C0392B] shadow-[0_0_35px_rgba(192,57,43,0.35)]' 
          : 'bg-white/5 border-white/10 hover:border-[#C0392B]/50'
      }`}
    >
      {hovered && (
        <motion.div
          style={{
            background: `radial-gradient(circle at ${shineX} ${shineY}, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0) 70%)`,
          }}
          className="absolute inset-0 pointer-events-none mix-blend-color-dodge z-10"
        />
      )}

      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.05] z-0 mix-blend-overlay"
        style={{
          backgroundImage: 'linear-gradient(135deg, #ff007f 10%, #7f00ff 30%, #00ffff 50%, #00ff7f 70%, #ff007f 90%)',
          backgroundSize: '200% 200%',
          animation: hovered ? 'hologramAnim 6s linear infinite' : 'none',
        }}
      />

      <style>{`
        @keyframes hologramAnim {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div style={{ transform: 'translateZ(25px)' }} className="relative z-20 flex flex-col justify-between h-full">
        <div>
          <span className="inline-block bg-[#C0392B]/20 border border-[#C0392B]/50 text-[#ff9999] text-[9px] font-black tracking-widest px-2.5 py-1 rounded mb-4 uppercase">
            {tag}
          </span>
          <h3 className="text-2xl font-black uppercase text-white tracking-tight leading-none">{name}</h3>
          <p className="text-white/40 text-[10px] tracking-wide mt-1">PRODUCCIÓN ÉLITE URBANA</p>
        </div>

        <div className="mt-8">
          <div className="text-[10px] text-white/50 tracking-wider">TARIFA POR SESIÓN</div>
          <div className="text-2xl font-extrabold text-white mt-0.5">{price}</div>
          <div className="text-[11px] text-[#ff8080] font-bold mt-2">Beat + Grabación + Mezcla + Master</div>
        </div>
      </div>

      <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-[#C0392B]/20 rounded-full blur-2xl pointer-events-none" />
    </motion.div>
  );
}
