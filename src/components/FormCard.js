import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../store/useFormStore';
import { QUESTIONS, esColombiano } from '../utils/businessLogic';

export default function FormCard() {
  const {
    currentQ,
    answers,
    fieldError,
    setAnswer,
    nextQ,
    prevQ
  } = useFormStore();

  const visibleQuestions = QUESTIONS.filter(q => !q.conditional || q.conditional(answers));
  const q = visibleQuestions[currentQ];
  const progress = visibleQuestions.length > 0 ? (currentQ / visibleQuestions.length) * 100 : 0;
  const esIntl = answers.ciudad ? !esColombiano(answers.ciudad) : false;

  if (!q) return null;

  const slideVariants = {
    initial: { opacity: 0, x: 50, skewX: -4, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)', transition: { duration: 0.28, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, skewX: 4, filter: 'blur(4px)', transition: { duration: 0.22, ease: 'easeIn' } }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 relative z-10 pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] text-white/40 tracking-widest uppercase">
          {q.section} · {currentQ + 1}/{visibleQuestions.length}
        </div>
        <div className="text-[10px] text-white/40 font-bold">{Math.round(progress)}%</div>
      </div>
      
      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-8">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#590707] to-[#e63333]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {esIntl && q.section === "TUS OBJETIVOS" && (
        <div className="flex gap-3 bg-[#5078c8]/15 border border-[#5078c8]/35 rounded-xl p-4 mb-6 align-start animate-fade-in">
          <span className="text-xl">🌎</span>
          <div>
            <div className="text-[10px] font-black tracking-widest text-[#90b8ff] uppercase mb-1">CLIENTE INTERNACIONAL</div>
            <div className="text-xs text-white/60 leading-relaxed">Para artistas fuera de Colombia ofrecemos sesiones virtuales con precios especiales equivalentes a paquetes de +3 sesiones.</div>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C0392B] to-transparent opacity-60" />

          <span className="inline-block bg-[#590707]/30 border border-[#C0392B]/35 text-[#ff8080] text-[9px] font-extrabold tracking-widest px-3 py-1 rounded mb-4 uppercase">
            {q.section}
          </span>
          
          <h2 className="text-2xl font-black text-white leading-tight mb-2">
            {q.label}
            {!q.required && <span className="text-xs font-normal text-white/30 ml-2">(opcional)</span>}
          </h2>
          
          {q.hint && <p className="text-xs text-white/40 mb-6">{q.hint}</p>}

          <div className="mt-6">
            {(q.type === 'text' || q.type === 'email' || q.type === 'tel') && (
              <>
                <input
                  className={`w-full bg-white/5 border rounded-xl p-4 text-white text-base outline-none transition-all duration-300 placeholder:text-white/20 ${
                    fieldError ? 'border-[#e63333] focus:border-[#e63333]' : 'border-white/15 focus:border-[#C0392B] focus:bg-[#590707]/10'
                  }`}
                  type={q.type}
                  placeholder={q.placeholder}
                  value={answers[q.id] || ''}
                  onChange={e => setAnswer(e.target.value)}
                  autoFocus
                  inputMode={q.type === "tel" ? "tel" : q.type === "email" ? "email" : "text"}
                />
                {fieldError && <div className="text-[#ff8080] text-xs mt-2 flex items-center gap-1">⚠ {fieldError}</div>}
              </>
            )}

            {q.type === 'textarea' && (
              <textarea
                className="w-full bg-white/5 border border-white/15 rounded-xl p-4 text-white text-base outline-none transition-all duration-300 focus:border-[#C0392B] focus:bg-[#590707]/10 placeholder:text-white/20 resize-none"
                rows={4}
                placeholder={q.placeholder}
                value={answers[q.id] || ''}
                onChange={e => setAnswer(e.target.value)}
              />
            )}

            {q.type === 'yesno' && (
              <div className="flex flex-col gap-3">
                {['Sí', 'No'].map(opt => {
                  const sel = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswer(opt)}
                      className={`flex items-center gap-4 w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        sel 
                          ? 'bg-[#590707]/20 border-[#C0392B] text-white' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                        sel ? 'border-[#C0392B] bg-[#C0392B] shadow-[inset_0_0_0_4px_#590707]' : 'border-white/30'
                      }`} />
                      <span className="font-bold">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'single' && (
              <div className="flex flex-col gap-3">
                {q.options.map(opt => {
                  const sel = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswer(opt)}
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

            {q.type === 'multicheck' && (
              <div className="flex flex-col gap-3">
                {(q.filterOptions ? q.filterOptions(answers) : q.options).map(opt => {
                  const sel = (answers[q.id] || []).includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswer(opt)}
                      className={`flex items-center gap-4 w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                        sel 
                          ? 'bg-[#590707]/20 border-[#C0392B] text-white' 
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs transition-all ${
                        sel ? 'bg-[#C0392B] border-[#C0392B] text-white' : 'border-white/30'
                      }`}>
                        {sel && '✓'}
                      </div>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {fieldError && q.type !== "text" && q.type !== "email" && q.type !== "tel" && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#ff8080] text-xs mt-4 flex items-center gap-1"
            >
              <span>⚠</span> {fieldError}
            </motion.div>
          )}

          <div className="flex gap-4 mt-8">
            <button
              onClick={prevQ}
              disabled={currentQ === 0}
              className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 pointer-events-auto"
            >
              ←
            </button>
            <button
              onClick={nextQ}
              className="flex-1 bg-gradient-to-r from-[#590707] to-[#8a0c0c] hover:from-[#8a0c0c] hover:to-[#C0392B] text-white font-extrabold uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_20px_rgba(89,7,7,0.5)] active:scale-95 transition-all duration-300 pointer-events-auto"
            >
              {currentQ === visibleQuestions.length - 1 ? 'Ver mi propuesta ✦' : 'Siguiente →'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
