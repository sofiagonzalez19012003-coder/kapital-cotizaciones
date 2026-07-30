import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../store/useFormStore';
import { 
  validarEmail, 
  validarTelefono, 
  guardarPostulacionFreeTrial 
} from '../utils/businessLogic';

const FREE_TRIAL_QUESTIONS = [
  { 
    id: "nombreArtistico", 
    label: "¿Cuál es tu nombre artístico?", 
    type: "text", 
    placeholder: "Tu alias o nombre de escenario...", 
    required: true, 
    section: "DATOS BÁSICOS" 
  },
  { 
    id: "nombreReal", 
    label: "¿Y tu nombre completo?", 
    type: "text", 
    placeholder: "Nombre y apellidos...", 
    required: true, 
    section: "DATOS BÁSICOS" 
  },
  { 
    id: "email", 
    label: "¿Cuál es tu correo electrónico?", 
    type: "email", 
    placeholder: "artista@email.com", 
    required: true, 
    section: "DATOS BÁSICOS", 
    validate: validarEmail, 
    errorMsg: "Ingresa un correo válido (ej: nombre@gmail.com)" 
  },
  { 
    id: "whatsapp", 
    label: "¿Tu número de WhatsApp?", 
    type: "tel", 
    placeholder: "+57 300 000 0000", 
    required: true, 
    section: "DATOS BÁSICOS", 
    validate: validarTelefono, 
    errorMsg: "Ingresa un número válido (mínimo 7 dígitos)" 
  },
  { 
    id: "instagram", 
    label: "¿Cuál es tu Instagram / TikTok principal?", 
    type: "text", 
    placeholder: "ej: @usuario", 
    required: true, 
    section: "DATOS BÁSICOS" 
  },
  { 
    id: "seguidores8k", 
    label: "¿Tienes una comunidad de más de 8 mil seguidores?", 
    type: "yesno", 
    required: true, 
    section: "Tu asistente de marketing, ya" 
  },
  { 
    id: "constancia", 
    label: "¿Has mantenido una constancia de mínimo 2 publicaciones semanales durante los últimos 3 meses?", 
    type: "yesno", 
    required: true, 
    section: "Tu asistente de marketing, ya" 
  },
  { 
    id: "lanzamientos", 
    label: "¿Tienes al menos 5 lanzamientos oficiales (sencillos, EPs o álbumes)?", 
    type: "yesno", 
    required: true, 
    section: "Tu asistente de marketing, ya" 
  }
];

export default function FreeTrialForm() {
  const { reset } = useFormStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [califica, setCalifica] = useState(false);

  const q = FREE_TRIAL_QUESTIONS[currentStep];
  const progress = FREE_TRIAL_QUESTIONS.length > 0 ? (currentStep / FREE_TRIAL_QUESTIONS.length) * 100 : 0;

  const slideVariants = {
    initial: { opacity: 0, x: 50, skewX: -4, filter: 'blur(4px)' },
    animate: { opacity: 1, x: 0, skewX: 0, filter: 'blur(0px)', transition: { duration: 0.28, ease: 'easeOut' } },
    exit: { opacity: 0, x: -50, skewX: 4, filter: 'blur(4px)', transition: { duration: 0.22, ease: 'easeIn' } }
  };

  const handleAnswerChange = (val) => {
    setFieldError('');
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  };

  const validateCurrentStep = () => {
    const val = answers[q.id];
    if (!val || (typeof val === 'string' && !val.trim())) {
      return 'Este campo es obligatorio';
    }
    if (q.validate && !q.validate(val)) {
      return q.errorMsg || 'Valor inválido';
    }
    return '';
  };

  const handleNext = async () => {
    const err = validateCurrentStep();
    if (err) {
      setFieldError(err);
      return;
    }
    setFieldError('');

    if (currentStep < FREE_TRIAL_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      await submitForm();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setFieldError('');
    }
  };

  const submitForm = async () => {
    setLoading(true);
    
    const calificaResultado = (
      answers.seguidores8k === "Sí" && 
      answers.constancia === "Sí" && 
      answers.lanzamientos === "Sí"
    );
    const resultadoText = calificaResultado ? "Califica" : "No califica";

    const payload = {
      nombreArtistico: answers.nombreArtistico,
      nombreReal: answers.nombreReal,
      email: answers.email,
      whatsapp: answers.whatsapp,
      instagram: answers.instagram,
      seguidores8k: answers.seguidores8k,
      constancia: answers.constancia,
      lanzamientos: answers.lanzamientos,
      resultado: resultadoText
    };

    setCalifica(calificaResultado);
    
    await guardarPostulacionFreeTrial(payload);
    
    setLoading(false);
    setShowResult(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-[3px] border-white/5 border-t-[#C0392B] animate-spin mb-6" />
        <div className="text-lg font-extrabold mb-2 text-white animate-pulse">Procesando postulación...</div>
        <div className="text-[9px] text-white/20 tracking-wider uppercase font-mono">KAPITAL MUSIC</div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="w-full max-w-lg mx-auto px-4 py-8 relative z-10 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C0392B] to-transparent opacity-60" />
          
          <div className="text-center">
            <span className="inline-block bg-[#590707]/30 border border-[#C0392B]/35 text-[#ff8080] text-[9px] font-extrabold tracking-widest px-3 py-1 rounded mb-6 uppercase">
              POSTULACIÓN ENVIADA
            </span>

            {califica ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6 text-emerald-400 text-3xl">
                  ✓
                </div>
                <h2 className="text-2xl font-black text-white leading-tight mb-4">
                  ¡Felicitaciones!
                </h2>
                <p className="text-sm text-white/70 leading-relaxed mb-8">
                  ¡Gracias, <strong className="text-white">{answers.nombreArtistico}</strong>! Cumples con todos los requisitos para el Free Trial Full de Kapital Marketing Engine. Nos pondremos en contacto contigo por WhatsApp en las próximas 24 horas para activar tu acceso.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400 text-3xl">
                  ✦
                </div>
                <h2 className="text-2xl font-black text-white leading-tight mb-4">
                  Postulación Recibida
                </h2>
                <p className="text-sm text-white/70 leading-relaxed mb-8">
                  ¡Gracias, <strong className="text-white">{answers.nombreArtistico}</strong>! Por ahora no cumples con los requisitos para el Free Trial Full, pero no te preocupes: nos pondremos en contacto contigo para darte acceso a la versión gratuita de Kapital Marketing Engine.
                </p>
              </>
            )}

            <button
              onClick={reset}
              className="w-full bg-gradient-to-r from-[#590707] to-[#8a0c0c] hover:from-[#8a0c0c] hover:to-[#C0392B] text-white font-extrabold uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_20px_rgba(89,7,7,0.5)] active:scale-95 transition-all duration-300 pointer-events-auto text-xs"
            >
              Volver al inicio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 relative z-10 pointer-events-auto">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] text-white/40 tracking-widest uppercase">
          {q.section} · {currentStep + 1}/{FREE_TRIAL_QUESTIONS.length}
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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
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
          </h2>

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
                  onChange={e => handleAnswerChange(e.target.value)}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleNext();
                  }}
                  inputMode={q.type === "tel" ? "tel" : q.type === "email" ? "email" : "text"}
                />
                {fieldError && <div className="text-[#ff8080] text-xs mt-2 flex items-center gap-1">⚠ {fieldError}</div>}
              </>
            )}

            {q.type === 'yesno' && (
              <div className="flex flex-col gap-3">
                {['Sí', 'No'].map(opt => {
                  const sel = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerChange(opt)}
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
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 pointer-events-auto"
            >
              ←
            </button>
            <button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-[#590707] to-[#8a0c0c] hover:from-[#8a0c0c] hover:to-[#C0392B] text-white font-extrabold uppercase tracking-wider py-4 rounded-xl shadow-[0_4px_20px_rgba(89,7,7,0.5)] active:scale-95 transition-all duration-300 pointer-events-auto text-xs"
            >
              {currentStep === FREE_TRIAL_QUESTIONS.length - 1 ? 'Enviar postulación ✦' : 'Siguiente →'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
