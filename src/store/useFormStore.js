import { create } from 'zustand';
import { 
  QUESTIONS, 
  EXTRAS_QUESTIONS, 
  calcularPropuesta, 
  guardarEnSheets, 
  esColombiano 
} from '../utils/businessLogic';

export const useFormStore = create((set, get) => ({
  phase: 'landing', // 'landing' | 'services' | 'form' | 'extras' | 'loading' | 'proposal'
  scrollProgress: 0,
  currentQ: 0,
  answers: {},
  fieldError: '',
  extras: {},
  extrasStep: 0,
  extrasCurrentQ: 0,
  extrasQueue: [],
  cotizacion: null,
  proposal: null,
  savedOk: false,
  booked: false,
  activeSrv: null,
  loadMsg: 0,

  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setPhase: (phase) => set({ phase, scrollProgress: 0 }), // Reset scroll on phase change
  setActiveSrv: (activeSrv) => set({ activeSrv }),
  setBooked: (booked) => set({ booked }),
  setFieldError: (fieldError) => set({ fieldError }),
  setLoadMsg: (loadMsg) => set({ loadMsg }),

  setAnswer: (val) => {
    const { currentQ, answers } = get();
    const visibleQuestions = QUESTIONS.filter(q => !q.conditional || q.conditional(answers));
    const q = visibleQuestions[currentQ];
    if (!q) return;

    set({ fieldError: '' });
    const newAnswers = { ...answers };

    if (q.type === 'multicheck') {
      const prev = answers[q.id] || [];
      let newVal;
      if (prev.includes(val)) {
        newVal = prev.filter(x => x !== val);
      } else {
        newVal = [...prev, val];
        if (q.id === 'serviciosInteres') {
          if (val === 'Alquiler de estudios') {
            newVal = newVal.filter(x => x !== 'Producción musical completa (incluye mezcla y master)');
          }
          if (val === 'Producción musical completa (incluye mezcla y master)') {
            newVal = newVal.filter(x => x !== 'Alquiler de estudios');
            newVal = newVal.filter(x => x !== 'Mezcla & Mastering (ya tengo grabado)');
          }
        }
      }
      newAnswers[q.id] = newVal;
    } else {
      newAnswers[q.id] = val;
    }

    set({ answers: newAnswers });
  },

  getFieldError: () => {
    const { currentQ, answers } = get();
    const visibleQuestions = QUESTIONS.filter(q => !q.conditional || q.conditional(answers));
    const q = visibleQuestions[currentQ];
    if (!q) return '';
    if (!q.required) return '';

    const a = answers[q.id];
    if (!a || (typeof a === 'string' && !a.trim()) || (Array.isArray(a) && !a.length)) {
      return 'Este campo es obligatorio';
    }
    if (q.validate && !q.validate(a)) {
      return q.errorMsg || 'Valor inválido';
    }
    return '';
  },

  nextQ: () => {
    const { getFieldError, currentQ, answers } = get();
    const visibleQuestions = QUESTIONS.filter(q => !q.conditional || q.conditional(answers));
    const err = getFieldError();
    if (err) {
      set({ fieldError: err });
      return;
    }
    set({ fieldError: '' });
    if (currentQ < visibleQuestions.length - 1) {
      set({ currentQ: currentQ + 1 });
    } else {
      get().startExtras();
    }
  },

  prevQ: () => {
    const { currentQ } = get();
    if (currentQ > 0) {
      set({ currentQ: currentQ - 1, fieldError: '' });
    }
  },

  startExtras: () => {
    const { answers } = get();
    const servicios = answers.serviciosInteres || [];
    const queue = servicios.filter(s => EXTRAS_QUESTIONS[s]);
    if (!queue.length) {
      get().buildAndSubmit({});
      return;
    }
    set({
      extrasQueue: queue,
      extrasStep: 0,
      extrasCurrentQ: 0,
      extras: {},
      phase: 'extras',
    });
  },

  setExtraAnswer: (val) => {
    const { extrasQueue, extrasStep, extrasCurrentQ, extras } = get();
    const currentServiceExtras = extrasQueue[extrasStep];
    const allExtrasQs = EXTRAS_QUESTIONS[currentServiceExtras] || [];
    const currentExtrasQs = allExtrasQs.filter(eq => !eq.conditional || eq.conditional(extras));
    const currentEQ = currentExtrasQs[extrasCurrentQ];
    if (!currentEQ) return;

    let mk = val;
    if (currentEQ.id === 'estudio') mk = val.startsWith('Estudio A') ? 'A' : 'B';
    if (currentEQ.id === 'sesionesEstudio') mk = val.startsWith('Más') ? 4 : parseInt(val);
    if (currentEQ.id === 'horasEstudio') mk = val.startsWith('6') ? 6 : parseInt(val);
    if (currentEQ.id === 'productora') mk = val.startsWith('TunyD') ? 'tunyD' : 'moneyMakers';
    if (currentEQ.id === 'sesionesProduccion') mk = val.startsWith('Más') ? 4 : parseInt(val);
    if (currentEQ.id === 'canciones') mk = val.startsWith('Más') ? 4 : parseInt(val);

    set({ extras: { ...extras, [currentEQ.id]: mk } });
  },

  setExtraText: (val) => {
    const { extrasQueue, extrasStep, extrasCurrentQ, extras } = get();
    const currentServiceExtras = extrasQueue[extrasStep];
    const allExtrasQs = EXTRAS_QUESTIONS[currentServiceExtras] || [];
    const currentExtrasQs = allExtrasQs.filter(eq => !eq.conditional || eq.conditional(extras));
    const currentEQ = currentExtrasQs[extrasCurrentQ];
    if (!currentEQ) return;

    const num = parseInt(val) || 4;
    const newExtras = { ...extras };
    if (currentEQ.id === 'sesionesEstudioExacto') newExtras.sesionesEstudio = num;
    if (currentEQ.id === 'sesionesProduccionExacto') newExtras.sesionesProduccion = num;
    if (currentEQ.id === 'cancionesExacto') newExtras.canciones = num;
    newExtras[currentEQ.id] = num;

    set({ extras: newExtras });
  },

  canNextExtra: () => {
    const { extrasQueue, extrasStep, extrasCurrentQ, extras } = get();
    const currentServiceExtras = extrasQueue[extrasStep];
    const allExtrasQs = EXTRAS_QUESTIONS[currentServiceExtras] || [];
    const currentExtrasQs = allExtrasQs.filter(eq => !eq.conditional || eq.conditional(extras));
    const currentEQ = currentExtrasQs[extrasCurrentQ];
    if (!currentEQ) return false;
    if (currentEQ.type === 'number') return (extras[currentEQ.id] || 0) > 3;
    return extras[currentEQ.id] !== undefined && extras[currentEQ.id] !== null;
  },

  nextExtra: () => {
    const { extrasQueue, extrasStep, extrasCurrentQ, extras } = get();
    const currentServiceExtras = extrasQueue[extrasStep];
    const allExtrasQs = EXTRAS_QUESTIONS[currentServiceExtras] || [];
    const currentExtrasQs = allExtrasQs.filter(eq => !eq.conditional || eq.conditional(extras));

    if (extrasCurrentQ < currentExtrasQs.length - 1) {
      set({ extrasCurrentQ: extrasCurrentQ + 1 });
      return;
    }
    if (extrasStep < extrasQueue.length - 1) {
      set({ extrasStep: extrasStep + 1, extrasCurrentQ: 0 });
      return;
    }
    get().buildAndSubmit(extras);
  },

  prevExtra: () => {
    const { extrasCurrentQ, extrasStep } = get();
    if (extrasCurrentQ > 0) {
      set({ extrasCurrentQ: extrasCurrentQ - 1 });
    } else if (extrasStep > 0) {
      set({ extrasStep: extrasStep - 1, extrasCurrentQ: 0 });
    } else {
      set({ phase: 'form' });
    }
  },

  buildAndSubmit: async (extrasData) => {
    set({ phase: 'loading' });
    const { answers } = get();
    const servicios = answers.serviciosInteres || [];
    const internacional = answers.ciudad ? !esColombiano(answers.ciudad) : false;

    const serviciosFiltrados = servicios.filter(s =>
      !(s === 'Mezcla & Mastering (ya tengo grabado)' && servicios.includes('Producción musical completa (incluye mezcla y master)'))
    );

    const cot = calcularPropuesta(serviciosFiltrados, extrasData, internacional);
    set({ cotizacion: cot });

    await guardarEnSheets({ ...answers, esInternacional: internacional }, extrasData, cot);
    set({ savedOk: true });

    const nombre = answers.nombre || 'Artista';
    const anos = answers.anosCarrera || '';
    const segIG = answers.seguidoresIG || '';
    const segTT = answers.seguidoresTT || '';
    const lanz = answers.lanzamientos || '';
    const registrado = answers.registrado || '';
    const distribuidora = answers.distribuidora || '';
    const generos = (answers.generos || []).join(', ');
    const management = answers.management || '';
    const contenido = answers.contenidoActual || '';
    const asesoriaPrevia = answers.asesoriaLegal || '';
    const descripcion = answers.descripcion || '';

    let nivel = 'COMENZANDO';
    if (anos.includes('2 – 5') || segIG.includes('5,000') || segIG.includes('20,000') || lanz.includes('4 – 10')) nivel = 'CRECIENDO';
    if (anos.includes('Más de 10') || segIG.includes('Más de 100,000') || lanz.includes('Más de 10')) nivel = 'ESTABLECIDO';

    let donde = `Llevas ${anos} en la música`;
    if (lanz.includes('Ninguno')) donde += ` y aún no has lanzado material oficial. No te preocupes — muchos de los artistas que hoy suenan fuerte empezaron exactamente aquí.`;
    else donde += ` y ya tienes ${lanz} lanzamientos oficiales. Eso dice mucho — significa que has dado pasos reales cuando muchos solo hablan de hacerlo.`;
    donde += ` Tu presencia en Instagram es de ${segIG} seguidores`;
    if (segTT && !segTT.includes('No tengo')) donde += `, y en TikTok llegas a ${segTT}`;
    donde += `.`;

    if (contenido.includes('No publico')) donde += ` Hoy no estás publicando contenido, y eso es lo primero que hay que cambiar — el algoritmo solo trabaja para quienes le dan razones para hacerlo.`;
    else if (contenido.includes('Esporádicamente')) donde += ` Publicas de vez en cuando, lo cual es un buen comienzo, pero la consistencia es lo que marca la diferencia entre crecer y estancarse.`;
    else if (contenido.includes('Casi diario') || contenido.includes('equipo')) donde += ` Tu disciplina con el contenido ya es una ventaja — ahora hay que asegurarnos de que ese esfuerzo tenga la estrategia correcta detrás.`;
    if (descripcion) donde += ` Sobre tu proyecto: "${descripcion.substring(0, 100)}${descripcion.length > 100 ? '...' : ''}".`;

    const tabla = [
      { area: 'Presencia digital', estado: segIG.includes('Menos de 1,000') || segIG.includes('No tengo') ? 'Audiencia muy pequeña' : segIG.includes('1,000 – 5,000') ? 'Audiencia emergente' : segIG.includes('5,000') || segIG.includes('20,000') ? 'En crecimiento' : 'Audiencia establecida', potencial: 'Con estrategia de contenido + pauta Meta podemos escalar tu alcance mes a mes' },
      { area: 'Producción musical', estado: lanz.includes('Ninguno') ? 'Sin material lanzado aún' : lanz.includes('1 – 3') ? 'Primeros lanzamientos' : lanz.includes('4 – 10') ? 'Catálogo en construcción' : 'Catálogo establecido', potencial: 'Sonido profesional con TunyD o Money Makers — mezcla y master incluidos' },
      { area: 'Protección legal', estado: registrado === 'Sí' ? 'Registrado ✓' : 'Sin registro legal ⚠', potencial: registrado === 'Sí' ? 'Optimizar contratos y acuerdos comerciales' : 'Registro DNDA + SAYCO/ACINPRO/ASCAP desde la primera sesión' },
      { area: 'Distribución', estado: distribuidora === 'No tengo' ? 'Sin distribuidora' : `Con ${distribuidora}`, potencial: distribuidora === 'No tengo' ? 'Asesoría para elegir la mejor plataforma según tu perfil' : 'Estrategia de lanzamiento para maximizar streams y royalties' },
      { area: 'Equipo / Respaldo', estado: management.includes('solo') ? 'Trabajando solo' : management, potencial: 'Kapital como equipo completo: producción, estrategia y legal en un solo lugar' }
    ];

    const frena = [];
    if (registrado !== 'Sí') frena.push('Tu música no está registrada legalmente. Esto significa que si alguien usa tu trabajo, no tienes herramientas para reclamar ni cobrar regalías. Es el paso 0 de cualquier carrera profesional.');
    if (distribuidora === 'No tengo') frena.push('No tienes distribuidora digital. Tu música no aparece en Spotify, Apple Music ni YouTube Music — estás perdiendo streams y royalties cada día.');
    if (contenido.includes('No publico') || contenido.includes('Esporádicamente')) frena.push('La inconsistencia en redes es uno de los mayores frenos para crecer hoy. Sin contenido constante el algoritmo no trabaja para ti.');
    if (lanz.includes('Ninguno')) frena.push('Sin lanzamientos oficiales no hay historial digital que las plataformas, prensa o booking agencies puedan verificar.');
    if (management.includes('solo') && asesoriaPrevia !== 'Sí') frena.push('Estás gestionando todo solo y sin asesoría previa — lo que significa que probablemente estés dejando dinero sobre la mesa.');
    if (frena.length === 0) frena.push('Aunque tienes una base sólida, la dispersión sin una estrategia unificada puede frenar el crecimiento. Es el momento de consolidar todo bajo un solo sistema.');

    const fortalezas = [];
    if (!lanz.includes('Ninguno')) fortalezas.push(`Ya tienes ${lanz} lanzamientos — hay experiencia real y un catálogo sobre el cual construir.`);
    if (!segIG.includes('No tengo') && !segIG.includes('Menos de 1,000')) fortalezas.push(`Tu audiencia en Instagram de ${segIG} es una base real y activa sobre la cual trabajar con estrategia.`);
    if (generos) fortalezas.push(`Tu identidad en ${generos} te da un nicho claro — lo que facilita la estrategia de contenido.`);
    if (contenido.includes('Casi diario') || contenido.includes('equipo')) fortalezas.push('Tu disciplina con el contenido digital es una ventaja competitiva real.');
    if (fortalezas.length === 0) fortalezas.push('Tu decisión de buscar profesionalización en este momento es exactamente lo que diferencia a los artistas que crecen.');

    const analisisServ = `Los servicios que elegiste — ${serviciosFiltrados.join(', ')} — no son un gasto, son una inversión en la estructura que tu carrera necesita.${serviciosFiltrados.includes('Asesoría legal') ? ' La asesoría legal es urgente: sin ella cualquier contrato o acuerdo puede costarte más de lo que ganaste.' : ''}${serviciosFiltrados.includes('Producción musical completa (incluye mezcla y master)') ? ' La producción con nuestros productores no es solo grabar — es crear el sonido que te posiciona internacionalmente.' : ''}${serviciosFiltrados.includes('Marketing 30') ? ' El Marketing 30 te da visibilidad real: orgánica y pagada, con estrategia y medición desde el día uno.' : ''} Kapital te acompaña en todo desde el primer día.`;

    const pasos = [];
    if (registrado !== 'Sí') pasos.push('Registra tu música ante la DNDA y afíliate a SAYCO/ACINPRO. Nuestro servicio de Asesoría Legal lo resuelve en una sola sesión.');
    if (distribuidora === 'No tengo') pasos.push('Configura tu distribuidora digital. En la asesoría te orientamos según tu volumen de lanzamientos.');
    if (serviciosFiltrados.includes('Producción musical completa (incluye mezcla y master)')) pasos.push('Reserva tu sesión de producción — el proceso incluye concepto, grabación, mezcla y master.');
    if (serviciosFiltrados.includes('Marketing 30')) pasos.push('Activar Marketing 30: análisis de presencia digital, pauta Meta y plan de crecimiento orgánico.');
    if (serviciosFiltrados.includes('Alquiler de estudios')) pasos.push('Agenda tu sesión de estudio — te ayudamos a elegir entre Estudio A y B según tu proyecto.');
    pasos.push('Agenda una reunión con el equipo Kapital — es gratuita, sin compromiso, y en ella ajustamos todos los detalles.');

    set({
      proposal: {
        bienvenida: `Hola ${nombre}, gracias por confiar en nosotros. Revisamos todo lo que compartiste y queremos ser honestos contigo — como lo haría un equipo que de verdad quiere verte crecer.`,
        diagnostico: { nivel, donde_esta: donde, tabla, que_lo_frena: frena.slice(0, 3), fortalezas: fortalezas.slice(0, 3), analisis_servicios: analisisServ, pasos_a_seguir: pasos },
        mensajeServicios: 'Estos son los servicios que elegiste. Cada uno tiene un precio claro y una razón específica para tu momento actual.',
        mensajeFinal: `${nombre}, el talento ya lo tienes. Lo que necesitas ahora es el equipo correcto — y Kapital está listo para ser ese equipo.`
      },
      phase: 'proposal'
    });
  },

  reset: () => set({
    phase: 'landing',
    currentQ: 0,
    answers: {},
    fieldError: '',
    extras: {},
    extrasStep: 0,
    extrasCurrentQ: 0,
    extrasQueue: [],
    cotizacion: null,
    proposal: null,
    savedOk: false,
    booked: false,
    activeSrv: null,
  })
}));
