import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../store/useFormStore';
import { EXTRAS_QUESTIONS } from '../utils/businessLogic';
import ProducerCard from './ProducerCard';

export default function FormExtras() {
  const {
    extrasStep,
    extrasCurrentQ,
    extrasQueue,
    extras,
    setExtraAnswer,
    setExtraText,
    canNextExtra,
    nextExtra,
    prevExtra
  } = useFormStore();

  const currentServiceExtras = extrasQueue[extrasStep];
  const allExtrasQs = EXTRAS_QUESTIONS[currentServiceExtras] || [];
  const currentExtrasQs = allExtrasQs.filter(eq => !eq.conditional || eq.conditional(extras));
  const currentEQ = currentExtrasQs[extrasCurrentQ];

  if (!currentEQ) return null;

  const slideVariants = {
    initial: { opacity: 0, x: 50, skewX: -4, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)', transition: { duration: 0.28, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, skewX: 4, filter: 'blur(4px)', transition: { duration: 0.22, ease: 'easeIn' } }
  };

  const isProductora = currentEQ.id === 'productora';

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 relative z-10 pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] text-white/40 tracking-widest uppercase">
          DETALLES · {extrasStep + 1}/{extrasQueue.length}
        </div>
      </div>
      
      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#590707] to-[#e63333]"
          initial={{ width: 0 }}
          animate={{ width: `${(extrasStep / Math.max(extrasQueue.length, 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${extrasStep}-${extrasCurrentQ}`}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 relative overflow-hidden ${
            isProductora ? 'max-w-xl mx-auto' : ''
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C0392B] to-transparent opacity-60" />

          <span className="inline-block bg-[#590707]/30 border border-[#C0392B]/35 text-[#ff8080] text-[9px] font-extrabold tracking-widest px-3 py-1 rounded mb-4 uppercase">
            {currentServiceExtras.split("(")[0].trim()}
          </span>
          
          <h2 className="text-2xl font-black text-white leading-tight mb-6">
            {currentEQ.label}
          </h2>

          <div className="mt-6">
            {currentEQ.type === 'number' ? (
              <div>
                <input
                  className="w-full bg-white/5 border border-white/15 rounded-xl p-4 text-white text-base outline-none transition-all duration-300 focus:border-[#C0392B] focus:bg-[#590707]/10 placeholder:text-white/20"
                  type="number"
                  placeholder={currentEQ.placeholder}
                  min="4"
                  onChange={e => setExtraText(e.target.value)}
                  inputMode="numeric"
                />
                <p className="text-xs text-white/30 mt-2">Mínimo 4 para aplicar el precio con descuento</p>
              </div>
            ) : isProductora ? (
              // HOLOGRAPHICAL PRODUCER CARDS
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProducerCard
                  name="TunyD"
                  price="$8,000,000 COP"
                  tag="REGGAETÓN / TRAP"
                  isSelected={extras.productora === 'tunyD'}
                  onClick={() => setExtraAnswer("TunyD — $8M/sesión")}
                />
                <ProducerCard
                  name="Money Makers"
                  price="$10,000,000 COP"
                  tag="DANCEHALL / URBAN ÉLITE"
                  isSelected={extras.productora === 'moneyMakers'}
                  onClick={() => setExtraAnswer("Money Makers — $10M/sesión")}
                />
              </div>
            ) : (
              // STANDARD EXTRA CHOICE BUTTONS
              <div className="flex flex-col gap-3">
                {currentEQ.options.map(opt => {
                  let mk = opt;
                  if (currentEQ.id === "estudio") mk = opt.startsWith("Estudio A") ? "A" : "B";
                  if (currentEQ.id === "sesionesEstudio") mk = opt.startsWith("Más") ? 4 : parseInt(opt);
                  if (currentEQ.id === "horasEstudio") mk = opt.startsWith("6") ? 6 : parseInt(opt);
                  if (currentEQ.id === "productora") mk = opt.startsWith("TunyD") ? "tunyD" : "moneyMakers";
                  if (currentEQ.id === "sesionesProduccion") mk = opt.startsWith("Más") ? 4 : parseInt(opt);
                  if (currentEQ.id === "canciones") mk = opt.startsWith("Más") ? 4 : parseInt(opt);

                  const sel = extras[currentEQ.id] === mk;

                  return (
                    <button
                      key={opt}
                      onClick={() => setExtraAnswer(opt)}
                      className={`flex items-center gap-4 w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        sel 
                          ? 'bg-[#590707]/20 border-[#C0392B] text-white' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        sel ? 'border-[#C0392B] bg-[#C0392B] shadow-[inset_0_0_0_4px_#590707]' : 'border-white/30'
                      }`} />
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={prevExtra}
              className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 transition-all duration-300 pointer-events-auto"
            >
              ←
            </button>
            <button
              onClick={nextExtra}
              disabled={!canNextExtra()}
              className="flex-1 bg-gradient-to-r from-[#590707] to-[#8a0c0c] hover:from-[#8a0c0c] hover:to-[#C0392B] text-white font-extrabold uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_20px_rgba(89,7,7,0.5)] active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 pointer-events-auto"
            >
              {extrasStep === extrasQueue.length - 1 && extrasCurrentQ === currentExtrasQs.length - 1 ? "Ver mi propuesta ✦" : "Siguiente →"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
