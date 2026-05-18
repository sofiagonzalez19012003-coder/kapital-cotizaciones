import { useState, useEffect, useRef } from "react";

// ─── GOOGLE SHEETS URL ────────────────────────────────────────────────────────
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzU-SX_AGIPzqYCdigD5ZS3uj94uOH-GghfEz6KREVkqCSs1bzBMZlP4oFqLOz2Dfb0CQ/exec";

// ─── GUARDAR EN GOOGLE SHEETS ─────────────────────────────────────────────────
async function guardarEnSheets(answers, extras, cotizacion) {
  const fecha = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
  const servicios = answers.serviciosInteres || [];

  const fila = {
    "Fecha":                  fecha,
    "Nombre artístico":       answers.nombre || "",
    "Nombre real":            answers.nombreReal || "",
    "Email":                  answers.email || "",
    "WhatsApp":               answers.telefono || "",
    "Géneros":                (answers.generos || []).join(", "),
    "Años de carrera":        answers.anosCarrera || "",
    "Lanzamientos":           answers.lanzamientos || "",
    "Registrado legalmente":  answers.registrado || "",
    "Distribuidora":          answers.distribuidora || "",
    "Asesoría legal previa":  answers.asesoriaLegal || "",
    "Seguidores Instagram":   answers.seguidoresIG || "",
    "Seguidores TikTok":      answers.seguidoresTT || "",
    "Actividad en redes":     answers.contenidoActual || "",
    "Objetivos":              (answers.objetivos || []).join(", "),
    "Servicios de interés":   servicios.join(", "),
    "Presupuesto":            answers.presupuesto || "",
    "Descripción proyecto":   answers.descripcion || "",
    "Estudio elegido":        extras.estudio ? `Estudio ${extras.estudio}` : "",
    "Sesiones estudio":       extras.sesionesEstudio || "",
    "Horas por sesión":       extras.horasEstudio || "",
    "Productor elegido":      extras.productora || "",
    "Sesiones producción":    extras.sesionesProduccion || "",
    "Canciones mezcla":       extras.canciones || "",
    "Total base COP":         cotizacion?.totalBase || "",
    "Total con promos COP":   cotizacion?.totalPromo || "",
    "Ahorro COP":             cotizacion?.ahorro || "",
    "Servicios cotizados":    (cotizacion?.items || []).map(i => `${i.nombre}: ${i.total}`).join(" | "),
  };

  try {
    await fetch(SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fila),
    });
  } catch (err) {
    console.error("Error guardando en Sheets:", err);
  }
}

// ─── PRECIOS ──────────────────────────────────────────────────────────────────
const PRECIOS = {
  estudio: {
    A: { hora: 500000, horaPromo: 420000, minimoHoras: 3 },
    B: { hora: 250000, horaPromo: 200000, minimoHoras: 3 },
  },
  produccion: {
    tunyD: { sesion: 8000000, sesionPromo: 6500000 },
    moneyMakers: { sesion: 10000000, sesionPromo: 8000000 },
  },
  asesoria: { base: 1500000, promoConMarketing: 1000000 },
  marketing: { base: 2000000, promoConOtros: 1800000 },
  mezclamaster: { base: 2000000, promoMas3: 1500000 },
};

function calcularPropuesta(serviciosElegidos, extras) {
  const tiene = (s) => serviciosElegidos.includes(s);
  const items = [];
  let totalBase = 0, totalPromo = 0;

  if (tiene("Alquiler de estudios")) {
    const est = extras.estudio || "A";
    const p = PRECIOS.estudio[est];
    const sesiones = extras.sesionesEstudio || 1;
    const horas = extras.horasEstudio || p.minimoHoras;
    const esPromo = sesiones > 3 || tiene("Marketing 30") || tiene("Asesoría legal");
    const precioHora = esPromo ? p.horaPromo : p.hora;
    const totalEst = precioHora * horas * sesiones;
    totalBase += p.hora * horas * sesiones;
    totalPromo += totalEst;
    items.push({ nombre: `Estudio ${est}`, detalle: `${sesiones} sesión${sesiones>1?"es":""} × ${horas}h`, precioHora: fmt(p.hora), precioHoraPromo: esPromo?fmt(p.horaPromo):null, total: fmt(totalEst), promo: esPromo, promoRazon: esPromo?(sesiones>3?"+3 sesiones":"combinado con otro servicio"):null });
  }
  if (tiene("Producción musical")) {
    const prod = extras.productora || "tunyD";
    const p = PRECIOS.produccion[prod];
    const sesiones = extras.sesionesProduccion || 1;
    const esPromo = sesiones > 3;
    const precioPorSesion = esPromo ? p.sesionPromo : p.sesion;
    const totalProd = precioPorSesion * sesiones;
    totalBase += p.sesion * sesiones;
    totalPromo += totalProd;
    items.push({ nombre: prod==="tunyD"?"Producción con TunyD":"Producción con Money Makers", detalle: `${sesiones} sesión${sesiones>1?"es":""}`, precioBase: fmt(p.sesion), precioPromo: esPromo?fmt(p.sesionPromo):null, total: fmt(totalProd), promo: esPromo, promoRazon: esPromo?"+3 sesiones con el mismo productor":null });
  }
  if (tiene("Asesoría legal")) {
    const esPromo = tiene("Marketing 30");
    const precio = esPromo ? PRECIOS.asesoria.promoConMarketing : PRECIOS.asesoria.base;
    totalBase += PRECIOS.asesoria.base; totalPromo += precio;
    items.push({ nombre:"Asesoría Legal", detalle:"Sesión única", precioBase:fmt(PRECIOS.asesoria.base), precioPromo:esPromo?fmt(PRECIOS.asesoria.promoConMarketing):null, total:fmt(precio), promo:esPromo, promoRazon:esPromo?"combinado con Marketing 30":null });
  }
  if (tiene("Marketing 30")) {
    const esPromo = tiene("Producción musical") || tiene("Asesoría legal");
    const precio = esPromo ? PRECIOS.marketing.promoConOtros : PRECIOS.marketing.base;
    totalBase += PRECIOS.marketing.base; totalPromo += precio;
    items.push({ nombre:"Marketing 30", detalle:"Plan mensual completo", precioBase:fmt(PRECIOS.marketing.base), precioPromo:esPromo?fmt(PRECIOS.marketing.promoConOtros):null, total:fmt(precio), promo:esPromo, promoRazon:esPromo?"combinado con otro servicio":null });
  }
  if (tiene("Mezcla & Mastering")) {
    const canciones = extras.canciones || 1;
    const esPromo = canciones > 3;
    const precioPorCancion = esPromo ? PRECIOS.mezclamaster.promoMas3 : PRECIOS.mezclamaster.base;
    const totalMM = precioPorCancion * canciones;
    totalBase += PRECIOS.mezclamaster.base * canciones; totalPromo += totalMM;
    items.push({ nombre:"Mezcla & Mastering", detalle:`${canciones} canción${canciones>1?"es":""}`, precioBase:fmt(PRECIOS.mezclamaster.base), precioPromo:esPromo?fmt(PRECIOS.mezclamaster.promoMas3):null, total:fmt(totalMM), promo:esPromo, promoRazon:esPromo?"+3 canciones":null });
  }
  const ahorro = totalBase - totalPromo;
  return { items, totalBase, totalPromo, ahorro };
}

function fmt(n) { return n>=1000000?`$${(n/1000000).toFixed(n%1000000===0?0:1)}M`:`$${(n/1000).toFixed(0)}K`; }
function fmtFull(n) { return "$"+n.toLocaleString("es-CO"); }

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres el equipo de Kapital Music escribiéndole directamente a un artista. Tu tono es de tú a tú: cercano, directo, sin rodeos, como cuando un amigo que sabe del negocio te da un consejo real. Nada de lenguaje corporativo, nada de "estimado cliente".

Kapital Music es un sello independiente colombiano con 136K seguidores, 5M+ views/trimestre y 446K interacciones en Q4 2025 — crecimiento 100% orgánico.

SERVICIOS: Alquiler de estudios (A o B), Asesoría legal, Mezcla & Mastering (72h), Marketing 30 (análisis + orgánico + pauta Meta + parrilla + marca), Producción musical (TunyD o Money Makers).

Tu tarea: analizar el perfil y devolver SOLO este JSON (sin markdown):
{
  "bienvenida": "Saludo directo y personal, 2-3 frases. Usa el nombre artístico. Menciona algo específico de su perfil. Como si fueras un aliado que ya lo conoce.",
  "diagnostico": {
    "nivel": "COMENZANDO | CRECIENDO | ESTABLECIDO",
    "resumen": "2 frases honestas sobre dónde está. Sin adornos.",
    "urgencias": ["máx. 2 cosas concretas que necesita hacer ya"],
    "fortalezas": ["2-3 cosas reales que tiene a su favor"],
    "oportunidades": ["2-3 oportunidades concretas que puede aprovechar"]
  },
  "mensajeServicios": "1-2 frases introduciendo la cotización, de forma natural.",
  "mensajeFinal": "Cierre de 2 frases. Directo, motivador. Que sienta que Kapital es su aliado."
}
REGLA: Si no está registrado → urgencias incluye registro. Si no tiene distribuidora → menciónalo. Adapta tono al género.`;

// ─── DATA ─────────────────────────────────────────────────────────────────────
const GENEROS = ["Trap","Reggaetón","Rap","Hip-Hop","R&B","Reggae","Afrobeats","Pop urbano","Otro"];
const OBJETIVOS = ["Lanzar mi primer sencillo","Crecer en redes sociales","Monetizar mi música","Construir mi marca personal","Producir un EP o álbum","Registrar y proteger mi música","Conseguir una distribuidora"];
const DISTRIBUIDORAS = ["No tengo","DistroKid","TuneCore","CD Baby","Amuse","ONErpm","Otra"];

const SERVICES_DATA = [
  { icon:"🎙️", title:"Alquiler de Estudios", tag:"GRABACIÓN", desde:"Desde $200K/hora", desc:"Dos estudios disponibles. El Estudio A es nuestro espacio premium para proyectos de alto nivel. El Estudio B es ideal para preproducción o grabación rápida. Ambos con ingenieros certificados." },
  { icon:"⚖️", title:"Asesoría Legal", tag:"PROTECCIÓN", desde:"$1.5M por sesión", desc:"Protege lo que es tuyo. Contratos, registro SAYCO/ACINPRO, constitución de empresa artística y todo lo que necesitas para manejar tu carrera como un negocio real." },
  { icon:"🎚️", title:"Mezcla & Mastering", tag:"PRODUCCIÓN", desde:"$2M por canción", desc:"Tu música al nivel que merece. Ingenieros entrenados para el urbano colombiano y latinoamericano, entrega en 72 horas lista para todas las plataformas." },
  { icon:"📲", title:"Marketing 30", tag:"CRECIMIENTO", desde:"$2M/mes", desc:"Un mes completo de estrategia. Analizamos tu contenido, diseñamos crecimiento orgánico, manejamos pauta en Meta (Instagram y Facebook), armamos tu parrilla y te asesoramos en marca." },
  { icon:"🎵", title:"Producción Musical", tag:"CREACIÓN", desde:"Desde $6.5M/sesión", desc:"Trabajamos con TunyD y Money Makers, dos de los productores más sólidos del movimiento. Desde el beat hasta el master, construimos el sonido que te representa." },
];

const QUESTIONS = [
  { id:"nombre", label:"¿Cuál es tu nombre artístico?", type:"text", placeholder:"Tu alias o nombre de escenario...", required:true, section:"DATOS BÁSICOS" },
  { id:"nombreReal", label:"¿Y tu nombre completo?", type:"text", placeholder:"Nombre y apellidos...", required:true, section:"DATOS BÁSICOS" },
  { id:"email", label:"¿Cuál es tu correo?", type:"email", placeholder:"artista@email.com", required:true, section:"DATOS BÁSICOS" },
  { id:"telefono", label:"¿Tu número de WhatsApp?", type:"tel", placeholder:"+57 300 000 0000", required:false, section:"DATOS BÁSICOS" },
  { id:"generos", label:"¿Con qué géneros te identificas?", type:"multicheck", options:GENEROS, required:true, hint:"Selecciona todos los que apliquen", section:"TU MÚSICA" },
  { id:"anosCarrera", label:"¿Cuánto tiempo llevas activo como artista?", type:"single", options:["Menos de 1 año","1 – 2 años","2 – 5 años","5 – 10 años","Más de 10 años"], required:true, section:"TU CARRERA" },
  { id:"lanzamientos", label:"¿Cuántos lanzamientos oficiales has tenido?", type:"single", options:["Ninguno todavía","1 – 3","4 – 10","Más de 10"], required:true, section:"TU CARRERA" },
  { id:"registrado", label:"¿Tu música está registrada legalmente? (SAYCO, ACINPRO, copyright...)", type:"yesno", required:true, section:"TU CARRERA" },
  { id:"distribuidora", label:"¿Tienes distribuidora digital?", type:"single", options:DISTRIBUIDORAS, required:true, section:"TU CARRERA" },
  { id:"asesoriaLegal", label:"¿Has tenido asesoría legal para tu música antes?", type:"yesno", required:true, section:"TU CARRERA" },
  { id:"seguidoresIG", label:"¿Cuántos seguidores tienes en Instagram?", type:"single", options:["No tengo Instagram","Menos de 1,000","1,000 – 5,000","5,000 – 20,000","20,000 – 100,000","Más de 100,000"], required:true, section:"TUS REDES" },
  { id:"seguidoresTT", label:"¿Y en TikTok?", type:"single", options:["No tengo TikTok","Menos de 1,000","1,000 – 10,000","10,000 – 50,000","50,000 – 200,000","Más de 200,000"], required:true, section:"TUS REDES" },
  { id:"contenidoActual", label:"¿Qué tan activo eres publicando contenido?", type:"single", options:["No publico","Esporádicamente","1-2 veces por semana","Casi diario","Tengo equipo de contenido"], required:true, section:"TUS REDES" },
  { id:"objetivos", label:"¿Cuáles son tus objetivos principales?", type:"multicheck", options:OBJETIVOS, required:true, hint:"Selecciona todos los que apliquen", section:"TUS OBJETIVOS" },
  { id:"serviciosInteres", label:"¿Qué servicios de Kapital te interesan?", type:"multicheck", options:["Alquiler de estudios","Asesoría legal","Mezcla & Mastering","Marketing 30","Producción musical"], required:true, hint:"Selecciona todos los que necesitas", section:"TUS OBJETIVOS" },
  { id:"presupuesto", label:"¿Cuánto puedes invertir mensualmente en tu carrera?", type:"single", options:["Menos de $500,000","$500,000 – $1,500,000","$1,500,000 – $3,000,000","$3,000,000 – $6,000,000","Más de $6,000,000"], required:true, section:"TUS OBJETIVOS" },
  { id:"descripcion", label:"Cuéntanos sobre tu proyecto musical", type:"textarea", placeholder:"¿De qué trata tu música? ¿Qué te hace diferente? Lo que quieras que sepamos antes de reunirnos...", required:false, section:"TUS OBJETIVOS" },
];

const EXTRAS_QUESTIONS = {
  "Alquiler de estudios": [
    { id:"estudio", label:"¿Qué estudio te interesa?", options:["Estudio A — $500K/hora (premium)","Estudio B — $250K/hora"] },
    { id:"sesionesEstudio", label:"¿Cuántas sesiones aproximadamente?", options:["1 sesión","2 sesiones","3 sesiones","Más de 3 sesiones"] },
    { id:"horasEstudio", label:"¿Cuántas horas por sesión? (mínimo 3)", options:["3 horas","4 horas","5 horas","6+ horas"] },
  ],
  "Producción musical": [
    { id:"productora", label:"¿Con qué productor quieres trabajar?", options:["TunyD — $8M/sesión","Money Makers — $10M/sesión"] },
    { id:"sesionesProduccion", label:"¿Cuántas sesiones necesitas?", options:["1 sesión","2 sesiones","3 sesiones","Más de 3 sesiones"] },
  ],
  "Mezcla & Mastering": [
    { id:"canciones", label:"¿Cuántas canciones vas a mezclar?", options:["1 canción","2 canciones","3 canciones","Más de 3 canciones"] },
  ],
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("landing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [extras, setExtras] = useState({});
  const [extrasStep, setExtrasStep] = useState(0);
  const [extrasQueue, setExtrasQueue] = useState([]);
  const [extrasCurrentQ, setExtrasCurrentQ] = useState(0);
  const [proposal, setProposal] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [loadMsg, setLoadMsg] = useState(0);
  const [activeSrv, setActiveSrv] = useState(0);
  const [booked, setBooked] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const topRef = useRef(null);

  const LOAD_MSGS = ["Analizando tu perfil...","Calculando tu cotización...","Identificando oportunidades...","Armando tu propuesta...","Ya casi está lista..."];

  useEffect(() => {
    if (phase==="loading") {
      const iv = setInterval(()=>setLoadMsg(p=>(p+1)%LOAD_MSGS.length),1900);
      return ()=>clearInterval(iv);
    }
  },[phase]);

  useEffect(()=>{ topRef.current?.scrollIntoView({behavior:"smooth"}); },[phase,currentQ,extrasStep,extrasCurrentQ]);

  const q = QUESTIONS[currentQ];
  const canNext = () => {
    if (!q?.required) return true;
    const a = answers[q.id];
    if (!a) return false;
    if (typeof a==="string") return a.trim().length>0;
    if (Array.isArray(a)) return a.length>0;
    return true;
  };
  const setAnswer = (val) => {
    if (q.type==="multicheck") {
      const prev=answers[q.id]||[];
      if (prev.includes(val)) setAnswers(a=>({...a,[q.id]:prev.filter(x=>x!==val)}));
      else setAnswers(a=>({...a,[q.id]:[...prev,val]}));
    } else setAnswers(a=>({...a,[q.id]:val}));
  };
  const nextQ = () => { if (currentQ<QUESTIONS.length-1) setCurrentQ(c=>c+1); else startExtras(); };

  const startExtras = () => {
    const servicios = answers.serviciosInteres||[];
    const queue = servicios.filter(s=>EXTRAS_QUESTIONS[s]);
    if (queue.length===0) { buildAndSubmit({}); return; }
    setExtrasQueue(queue); setExtrasStep(0); setExtrasCurrentQ(0); setPhase("extras");
  };

  const currentServiceExtras = extrasQueue[extrasStep];
  const currentExtrasQs = EXTRAS_QUESTIONS[currentServiceExtras]||[];
  const currentEQ = currentExtrasQs[extrasCurrentQ];

  const setExtraAnswer = (val) => {
    let mapped = val;
    if (currentEQ.id==="estudio") mapped=val.startsWith("Estudio A")?"A":"B";
    if (currentEQ.id==="sesionesEstudio") mapped=val.startsWith("Más")?4:parseInt(val);
    if (currentEQ.id==="horasEstudio") mapped=val.startsWith("6")?6:parseInt(val);
    if (currentEQ.id==="productora") mapped=val.startsWith("TunyD")?"tunyD":"moneyMakers";
    if (currentEQ.id==="sesionesProduccion") mapped=val.startsWith("Más")?4:parseInt(val);
    if (currentEQ.id==="canciones") mapped=val.startsWith("Más")?4:parseInt(val);
    setExtras(e=>({...e,[currentEQ.id]:mapped}));
  };

  const nextExtra = () => {
    if (extrasCurrentQ<currentExtrasQs.length-1) { setExtrasCurrentQ(c=>c+1); return; }
    if (extrasStep<extrasQueue.length-1) { setExtrasStep(s=>s+1); setExtrasCurrentQ(0); return; }
    buildAndSubmit(extras);
  };

  const buildAndSubmit = async (extrasData) => {
    setPhase("loading");
    const servicios = answers.serviciosInteres||[];
    const cot = calcularPropuesta(servicios, extrasData);
    setCotizacion(cot);

    // 1. Guardar en Google Sheets
    await guardarEnSheets(answers, extrasData, cot);
    setSavedOk(true);

    // 2. Generar propuesta con IA
    const summary = QUESTIONS.map(q=>{
      const a=answers[q.id];
      if (!a||(Array.isArray(a)&&!a.length)) return null;
      return `${q.label}: ${Array.isArray(a)?a.join(", "):a}`;
    }).filter(Boolean).join("\n");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT, messages:[{role:"user",content:`Analiza este perfil:\n\n${summary}`}] })
      });
      const data = await res.json();
      const text = data.content?.find(b=>b.type==="text")?.text||"";
      setProposal(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch {
      setProposal({
        bienvenida:`${answers.nombre||"Artista"}, ya tenemos todo registrado. Tu cotización está lista y el equipo Kapital te va a contactar pronto.`,
        diagnostico:{nivel:"CRECIENDO",resumen:"Perfil guardado correctamente.",urgencias:[],fortalezas:[],oportunidades:[]},
        mensajeServicios:"Acá está la cotización según lo que nos contaste:",
        mensajeFinal:"El primer paso ya lo diste. Kapital está contigo desde ahora."
      });
    }
    setPhase("proposal");
  };

  const reset = ()=>{setPhase("landing");setCurrentQ(0);setAnswers({});setExtras({});setExtrasStep(0);setExtrasCurrentQ(0);setExtrasQueue([]);setProposal(null);setCotizacion(null);setBooked(false);setSavedOk(false);};

  const nivelColor={COMENZANDO:"#ff8080",CRECIENDO:"#CDC7BD",ESTABLECIDO:"#6be8a0"};
  const nivelBg={COMENZANDO:"rgba(89,7,7,.22)",CRECIENDO:"rgba(115,109,102,.18)",ESTABLECIDO:"rgba(26,107,56,.18)"};
  const nivelBorder={COMENZANDO:"rgba(89,7,7,.45)",CRECIENDO:"rgba(115,109,102,.38)",ESTABLECIDO:"rgba(26,107,56,.38)"};
  const waLink=`https://wa.me/573001234567?text=${encodeURIComponent(`Hola equipo Kapital! Soy ${answers.nombre||"un artista"} y acabo de completar mi formulario. Me gustaría hablar sobre mi propuesta.`)}`;
  const mailLink=`mailto:contacto@kapitalmusic.co?subject=${encodeURIComponent(`Propuesta — ${answers.nombre||"Artista"}`)}&body=${encodeURIComponent(`Hola equipo Kapital,\n\nSoy ${answers.nombre||""} (${answers.nombreReal||""}) y acabo de completar el formulario.\n\nQuedo pendiente.\n\nWhatsApp: ${answers.telefono||""}`)}`;
  const progress=(currentQ/QUESTIONS.length)*100;

  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,400;1,700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{background:#080808;min-height:100vh}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0a0a0a}::-webkit-scrollbar-thumb{background:#590707}
    .bp{background:#590707;color:#fff;border:none;padding:14px 30px;border-radius:6px;font-family:'Raleway',sans-serif;font-weight:800;font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .25s;display:inline-flex;align-items:center;gap:9px}
    .bp:hover{background:#7a0a0a;transform:translateY(-2px);box-shadow:0 8px 28px rgba(89,7,7,.5)}
    .bp:disabled{opacity:.38;cursor:default;transform:none;box-shadow:none}
    .bg{background:transparent;color:rgba(255,255,255,.58);border:1px solid rgba(255,255,255,.16);padding:12px 22px;border-radius:6px;font-family:'Raleway',sans-serif;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .22s}
    .bg:hover{border-color:rgba(255,255,255,.42);color:#fff}
    .bg:disabled{opacity:.3;cursor:default}
    .bw{background:#fff;color:#590707;border:none;padding:14px 30px;border-radius:6px;font-family:'Raleway',sans-serif;font-weight:800;font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .25s;display:inline-flex;align-items:center;gap:8px;text-decoration:none}
    .bw:hover{background:#f0f0f0;transform:translateY(-2px)}
    .bm{color:#fff;border:none;padding:13px 26px;border-radius:6px;font-family:'Raleway',sans-serif;font-weight:800;font-size:12px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .25s;display:inline-flex;align-items:center;gap:8px;text-decoration:none;justify-content:center;background:linear-gradient(135deg,#1a6b38,#0f4d28)}
    .bm:hover{background:linear-gradient(135deg,#228040,#1a6b38);transform:translateY(-2px);box-shadow:0 6px 24px rgba(26,107,56,.4)}
    .fu{animation:fu .45s ease-out both}
    @keyframes fu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
    .d1{animation-delay:.07s}.d2{animation-delay:.14s}.d3{animation-delay:.21s}.d4{animation-delay:.28s}
    .spin{animation:spin .85s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .pulse{animation:pulse 2s ease-in-out infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.38}}
    .hg{background-image:linear-gradient(rgba(89,7,7,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(89,7,7,.1) 1px,transparent 1px);background-size:56px 56px}
    .sc{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:18px 14px;text-align:center;transition:all .3s}
    .sc:hover{border-color:rgba(89,7,7,.5);background:rgba(89,7,7,.08);transform:translateY(-4px)}
    .st{background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:7px;padding:12px 15px;cursor:pointer;transition:all .22s;width:100%;color:rgba(255,255,255,.5);font-family:'Raleway',sans-serif;font-size:12px;font-weight:700;letter-spacing:.5px;text-align:left}
    .st.on{background:rgba(89,7,7,.2);border-color:rgba(89,7,7,.55);color:#fff}
    .st:hover:not(.on){border-color:rgba(255,255,255,.28);color:rgba(255,255,255,.85)}
    .qi{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:14px 16px;color:#fff;font-family:'Raleway',sans-serif;font-size:15px;outline:none;transition:all .2s}
    .qi:focus{border-color:#590707;background:rgba(89,7,7,.1)}
    .qi::placeholder{color:rgba(255,255,255,.26)}
    .op{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:12px 15px;cursor:pointer;transition:all .18s;text-align:left;color:rgba(255,255,255,.68);font-family:'Raleway',sans-serif;font-size:13px;display:flex;align-items:center;gap:10px}
    .op:hover{border-color:rgba(89,7,7,.4);color:#fff}
    .op.sel{background:rgba(89,7,7,.2);border-color:rgba(89,7,7,.62);color:#fff}
    .ock{width:18px;height:18px;border-radius:4px;border:2px solid rgba(255,255,255,.22);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .18px}
    .op.sel .ock{background:#590707;border-color:#590707}
    .ord{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.22);flex-shrink:0;transition:all .18s}
    .op.sel .ord{border-color:#590707;box-shadow:inset 0 0 0 4px #590707}
    .cr{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px}
    .ci{width:17px;height:17px;border-radius:50%;background:rgba(89,7,7,.26);border:1px solid rgba(89,7,7,.48);display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;margin-top:2px;color:#ff9090}
    .tag{display:inline-block;background:rgba(89,7,7,.24);border:1px solid rgba(89,7,7,.46);color:#ff8080;font-size:9px;font-weight:800;letter-spacing:2px;padding:3px 9px;border-radius:3px;text-transform:uppercase}
    .tgg{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.11);color:rgba(255,255,255,.4)}
    .tgn{background:rgba(26,107,56,.2);border:1px solid rgba(26,107,56,.42);color:#6be8a0}
    .pb{height:2px;background:rgba(255,255,255,.06);border-radius:1px;overflow:hidden}
    .pf{height:100%;background:linear-gradient(90deg,#590707,#e63333);border-radius:1px;transition:width .4s ease}
    .divl{height:1px;background:rgba(255,255,255,.06);margin:20px 0}
    .promo-badge{background:rgba(200,160,0,.15);border:1px solid rgba(200,160,0,.35);color:#f0d060;font-size:9px;font-weight:800;letter-spacing:2px;padding:3px 9px;border-radius:3px;display:inline-block}
    .ahorro-box{background:rgba(26,107,56,.12);border:1px solid rgba(26,107,56,.3);border-radius:8px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
    .saved-pill{background:rgba(26,107,56,.15);border:1px solid rgba(26,107,56,.35);color:#6be8a0;font-size:10px;font-weight:700;letter-spacing:1px;padding:5px 12px;border-radius:20px;display:inline-flex;align-items:center;gap:6px}
  `;

  return (
    <div style={{minHeight:"100vh",background:"#080808",color:"#fff",fontFamily:"'Raleway',sans-serif",overflowX:"hidden"}}>
      <style>{css}</style>
      <div ref={topRef}/>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:50,background:"rgba(8,8,8,.94)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(89,7,7,.24)",padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,background:"#590707",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:16}}>K</div>
          <div>
            <div style={{fontSize:12,fontWeight:800,letterSpacing:3,textTransform:"uppercase"}}>Kapital Music</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.28)",letterSpacing:2}}>SELLO INDEPENDIENTE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {savedOk&&<div className="saved-pill">✓ Datos guardados</div>}
          {phase!=="landing"&&<button className="bg" onClick={reset} style={{padding:"7px 12px",fontSize:10}}>← Inicio</button>}
          <span style={{fontSize:10,color:"rgba(255,255,255,.26)",letterSpacing:1,display:"none"}}>contacto@kapitalmusic.co</span>
        </div>
      </nav>

      {/* ══ LANDING ══ */}
      {phase==="landing"&&(<>
        <div style={{position:"relative",minHeight:"91vh",display:"flex",alignItems:"center",overflow:"hidden"}} className="hg">
          <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 55% 65% at 72% 48%, rgba(89,7,7,.36) 0%, transparent 68%)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom, transparent 55%, #080808 100%)",pointerEvents:"none"}}/>
          <div style={{maxWidth:1080,margin:"0 auto",padding:"80px 32px",position:"relative",width:"100%"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 200px",gap:48,alignItems:"center"}}>
              <div>
                <div className="tag fu" style={{marginBottom:22}}>BIENVENIDO AL MOVIMIENTO</div>
                <h1 className="fu d1" style={{fontSize:"clamp(40px,7.5vw,80px)",fontWeight:900,lineHeight:.94,marginBottom:22,textTransform:"uppercase",letterSpacing:-1}}>
                  Tu música.<br/><span style={{color:"#590707"}}>Tu legado.</span><br/>Tu momento.
                </h1>
                <p className="fu d2" style={{fontSize:"clamp(14px,2vw,17px)",color:"rgba(255,255,255,.55)",lineHeight:1.78,maxWidth:500,marginBottom:40}}>
                  Kapital Music es más que un sello. Somos el equipo que te acompaña a construir una carrera real — con estrategia, producción y respaldo legal desde el día uno.
                </p>
                <div className="fu d3" style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  <button className="bp" onClick={()=>setPhase("services")}>Ver servicios →</button>
                  <button className="bg" onClick={()=>setPhase("form")}>Quiero mi propuesta</button>
                </div>
              </div>
              <div className="fu d4" style={{display:"flex",flexDirection:"column",gap:10}}>
                {[{n:"5M+",l:"Views/trimestre"},{n:"446K",l:"Interacciones Q4"},{n:"136K",l:"Seguidores IG"},{n:"0%",l:"Pauta pagada"}].map((s,i)=>(
                  <div key={i} className="sc">
                    <div style={{fontWeight:900,fontSize:24,color:"#590707"}}>{s.n}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,.34)",letterSpacing:1,marginTop:4,textTransform:"uppercase"}}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{maxWidth:860,margin:"0 auto",padding:"70px 32px"}}>
          <div className="tag tgg" style={{marginBottom:18}}>NUESTRA HISTORIA</div>
          <h2 style={{fontSize:"clamp(26px,4vw,44px)",fontWeight:900,lineHeight:1.05,marginBottom:22,textTransform:"uppercase"}}>
            No somos una empresa.<br/>Somos un <span style={{color:"#590707"}}>movimiento.</span>
          </h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:34}}>
            <p style={{color:"rgba(255,255,255,.55)",lineHeight:1.82,fontSize:15}}>Kapital Music nació con una convicción: el talento en Latinoamérica es enorme, pero la infraestructura para desarrollarlo es escasa. Somos ese puente.</p>
            <p style={{color:"rgba(255,255,255,.55)",lineHeight:1.82,fontSize:15}}>Pasamos de 644K a 5M views por trimestre y de 404 a 446,951 interacciones — sin pauta masiva. Puro contenido. Pura estrategia. Pura cultura.</p>
          </div>
        </div>

        <div style={{background:"linear-gradient(135deg,#590707 0%,#2a0303 100%)",padding:"60px 32px",textAlign:"center"}}>
          <div style={{maxWidth:560,margin:"0 auto"}}>
            <div className="tag" style={{marginBottom:16,background:"rgba(0,0,0,.3)",borderColor:"rgba(255,255,255,.16)",color:"rgba(255,255,255,.6)"}}>¿LISTO?</div>
            <h2 style={{fontSize:"clamp(22px,4vw,42px)",fontWeight:900,marginBottom:12,textTransform:"uppercase",lineHeight:1.08}}>Construyamos tu carrera juntos</h2>
            <p style={{color:"rgba(255,255,255,.65)",marginBottom:32,fontSize:15,lineHeight:1.65}}>Completa el formulario y te armamos una propuesta con los precios exactos de los servicios que necesitas.</p>
            <button className="bw" onClick={()=>setPhase("form")}>Comenzar ahora →</button>
          </div>
        </div>
      </>)}

      {/* ══ SERVICES ══ */}
      {phase==="services"&&(
        <div style={{maxWidth:960,margin:"0 auto",padding:"54px 26px"}}>
          <div className="tag tgg fu" style={{marginBottom:18}}>SERVICIOS</div>
          <h2 className="fu d1" style={{fontSize:"clamp(26px,5vw,50px)",fontWeight:900,textTransform:"uppercase",lineHeight:1,marginBottom:10}}>
            Todo lo que necesitas<br/><span style={{color:"#590707"}}>en un solo lugar.</span>
          </h2>
          <p className="fu d2" style={{color:"rgba(255,255,255,.44)",fontSize:15,marginBottom:42,maxWidth:460}}>Desde grabar tu primera canción hasta lanzarte al mundo.</p>
          <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:18}}>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {SERVICES_DATA.map((s,i)=>(
                <button key={i} className={`st ${activeSrv===i?"on":""}`} onClick={()=>setActiveSrv(i)}>{s.icon} {s.title}</button>
              ))}
            </div>
            <div key={activeSrv} className="fu" style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"34px"}}>
              <div style={{fontSize:40,marginBottom:16}}>{SERVICES_DATA[activeSrv].icon}</div>
              <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
                <div className="tag">{SERVICES_DATA[activeSrv].tag}</div>
                <div className="tag tgg" style={{fontSize:9}}>{SERVICES_DATA[activeSrv].desde}</div>
              </div>
              <h3 style={{fontSize:25,fontWeight:900,textTransform:"uppercase",marginBottom:12}}>{SERVICES_DATA[activeSrv].title}</h3>
              <p style={{color:"rgba(255,255,255,.58)",fontSize:15,lineHeight:1.8,marginBottom:26}}>{SERVICES_DATA[activeSrv].desc}</p>
              <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                <button className="bp" onClick={()=>setPhase("form")}>Solicitar cotización →</button>
                {activeSrv<SERVICES_DATA.length-1&&<button className="bg" onClick={()=>setActiveSrv(a=>a+1)}>Siguiente →</button>}
              </div>
            </div>
          </div>
          <div style={{marginTop:42,textAlign:"center"}}>
            <button className="bp" onClick={()=>setPhase("form")} style={{fontSize:13,padding:"16px 42px"}}>Quiero mi cotización personalizada →</button>
          </div>
        </div>
      )}

      {/* ══ FORM ══ */}
      {phase==="form"&&(
        <div style={{maxWidth:640,margin:"0 auto",padding:"42px 22px"}}>
          <div style={{marginBottom:36}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.32)",letterSpacing:2}}>{q?.section} — {currentQ+1}/{QUESTIONS.length}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.32)"}}>{Math.round(progress)}%</div>
            </div>
            <div className="pb"><div className="pf" style={{width:`${progress}%`}}/></div>
          </div>
          {q&&<div key={currentQ} className="fu">
            <div className="tag tgg" style={{marginBottom:16}}>{q.section}</div>
            <h2 style={{fontSize:"clamp(19px,3.5vw,26px)",fontWeight:800,marginBottom:q.hint?8:24,lineHeight:1.3}}>
              {q.label}
              {!q.required&&<span style={{fontSize:12,fontWeight:400,color:"rgba(255,255,255,.26)",marginLeft:10}}>(opcional)</span>}
            </h2>
            {q.hint&&<p style={{fontSize:11,color:"rgba(255,255,255,.3)",marginBottom:20,letterSpacing:1}}>{q.hint}</p>}
            {(q.type==="text"||q.type==="email"||q.type==="tel")&&(
              <input className="qi" type={q.type} placeholder={q.placeholder} value={answers[q.id]||""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&canNext()&&nextQ()} autoFocus/>
            )}
            {q.type==="textarea"&&(
              <textarea className="qi" rows={5} placeholder={q.placeholder} value={answers[q.id]||""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} style={{resize:"vertical"}}/>
            )}
            {q.type==="yesno"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {["Sí","No"].map(opt=>(
                  <button key={opt} className={`op ${answers[q.id]===opt?"sel":""}`} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))}>
                    <div className="ord"/><span style={{fontWeight:700,fontSize:15}}>{opt}</span>
                  </button>
                ))}
              </div>
            )}
            {q.type==="single"&&(
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {q.options.map(opt=>(
                  <button key={opt} className={`op ${answers[q.id]===opt?"sel":""}`} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))}>
                    <div className="ord"/><span>{opt}</span>
                  </button>
                ))}
              </div>
            )}
            {q.type==="multicheck"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {q.options.map(opt=>{const sel=(answers[q.id]||[]).includes(opt);return(
                  <button key={opt} className={`op ${sel?"sel":""}`} onClick={()=>setAnswer(opt)}>
                    <div className="ock">{sel?"✓":""}</div><span style={{fontSize:12}}>{opt}</span>
                  </button>
                );})}
              </div>
            )}
          </div>}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:34}}>
            <button className="bg" onClick={()=>setCurrentQ(c=>c-1)} disabled={currentQ===0}>← Anterior</button>
            <button className="bp" onClick={nextQ} disabled={!canNext()}>
              {currentQ===QUESTIONS.length-1?"Ver mi cotización ✦":"Siguiente →"}
            </button>
          </div>
        </div>
      )}

      {/* ══ EXTRAS ══ */}
      {phase==="extras"&&currentServiceExtras&&(
        <div style={{maxWidth:640,margin:"0 auto",padding:"42px 22px"}}>
          <div style={{marginBottom:36}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,.32)",letterSpacing:2}}>DETALLES — {extrasStep+1}/{extrasQueue.length}</div>
            </div>
            <div className="pb"><div className="pf" style={{width:`${((extrasStep)/Math.max(extrasQueue.length,1))*100}%`}}/></div>
          </div>
          <div key={`${extrasStep}-${extrasCurrentQ}`} className="fu">
            <div className="tag" style={{marginBottom:16}}>{currentServiceExtras.toUpperCase()}</div>
            <h2 style={{fontSize:"clamp(18px,3.5vw,24px)",fontWeight:800,marginBottom:24,lineHeight:1.3}}>{currentEQ?.label}</h2>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {currentEQ?.options?.map(opt=>{
                let mk=opt;
                if(currentEQ.id==="estudio") mk=opt.startsWith("Estudio A")?"A":"B";
                if(currentEQ.id==="sesionesEstudio") mk=opt.startsWith("Más")?4:parseInt(opt);
                if(currentEQ.id==="horasEstudio") mk=opt.startsWith("6")?6:parseInt(opt);
                if(currentEQ.id==="productora") mk=opt.startsWith("TunyD")?"tunyD":"moneyMakers";
                if(currentEQ.id==="sesionesProduccion") mk=opt.startsWith("Más")?4:parseInt(opt);
                if(currentEQ.id==="canciones") mk=opt.startsWith("Más")?4:parseInt(opt);
                const isSel=extras[currentEQ.id]===mk;
                return(
                  <button key={opt} className={`op ${isSel?"sel":""}`} onClick={()=>setExtraAnswer(opt)}>
                    <div className="ord"/><span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:34}}>
            <button className="bg" onClick={()=>{if(extrasCurrentQ>0)setExtrasCurrentQ(c=>c-1);else if(extrasStep>0){setExtrasStep(s=>s-1);setExtrasCurrentQ((EXTRAS_QUESTIONS[extrasQueue[extrasStep-1]]?.length||1)-1);}else setPhase("form");}}>← Anterior</button>
            <button className="bp" onClick={nextExtra} disabled={extras[currentEQ?.id]===undefined||extras[currentEQ?.id]===null}>
              {extrasStep===extrasQueue.length-1&&extrasCurrentQ===currentExtrasQs.length-1?"Ver mi cotización ✦":"Siguiente →"}
            </button>
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {phase==="loading"&&(
        <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:32}}>
          <div className="spin" style={{width:52,height:52,border:"3px solid rgba(255,255,255,.06)",borderTopColor:"#590707",borderRadius:"50%",marginBottom:24}}/>
          <div style={{fontSize:18,fontWeight:800,marginBottom:10}} className="pulse">{LOAD_MSGS[loadMsg]}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,.25)",letterSpacing:2}}>KAPITAL MUSIC</div>
        </div>
      )}

      {/* ══ PROPOSAL ══ */}
      {phase==="proposal"&&proposal&&cotizacion&&(
        <div style={{maxWidth:860,margin:"0 auto",padding:"42px 22px"}}>
          {/* BIENVENIDA */}
          <div className="fu" style={{position:"relative",background:"linear-gradient(135deg,#590707 0%,#2a0303 55%,#0d0d0d 100%)",borderRadius:14,padding:"46px 40px",marginBottom:22,overflow:"hidden"}}>
            <div style={{position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.04)",pointerEvents:"none"}}/>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
              <div className="tag" style={{background:"rgba(0,0,0,.28)",borderColor:"rgba(255,255,255,.16)",color:"rgba(255,255,255,.5)"}}>
                PROPUESTA PERSONAL — {new Date().toLocaleDateString("es-CO",{month:"long",year:"numeric"}).toUpperCase()}
              </div>
              {savedOk&&<div className="saved-pill">✓ Guardado en Kapital Leads</div>}
            </div>
            <h1 style={{fontSize:"clamp(28px,6vw,58px)",fontWeight:900,textTransform:"uppercase",lineHeight:.95,marginBottom:14}}>{answers.nombre||"Artista"}</h1>
            <p style={{fontSize:"clamp(14px,2vw,17px)",color:"rgba(255,255,255,.76)",lineHeight:1.8,maxWidth:520}}>{proposal.bienvenida}</p>
          </div>

          {/* DIAGNÓSTICO */}
          <div className="fu d1" style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"26px",marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10,marginBottom:14}}>
              <div>
                <div className="tag tgg" style={{marginBottom:8}}>DIAGNÓSTICO</div>
                <h2 style={{fontSize:19,fontWeight:800}}>Así vemos tu momento</h2>
              </div>
              {proposal.diagnostico?.nivel&&(
                <div style={{display:"inline-block",padding:"5px 13px",borderRadius:4,fontSize:9,fontWeight:800,letterSpacing:3,color:nivelColor[proposal.diagnostico.nivel]||"#CDC7BD",background:nivelBg[proposal.diagnostico.nivel]||"rgba(115,109,102,.18)",border:`1px solid ${nivelBorder[proposal.diagnostico.nivel]||"rgba(115,109,102,.38)"}`}}>{proposal.diagnostico.nivel}</div>
              )}
            </div>
            <p style={{color:"rgba(255,255,255,.6)",fontSize:14,lineHeight:1.75,marginBottom:18}}>{proposal.diagnostico?.resumen}</p>
            {proposal.diagnostico?.urgencias?.length>0&&(
              <div style={{background:"rgba(89,7,7,.13)",border:"1px solid rgba(89,7,7,.28)",borderRadius:8,padding:"13px 17px",marginBottom:18}}>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:"#ff8080",marginBottom:9}}>⚡ LO QUE NECESITAS HACER YA</div>
                {proposal.diagnostico.urgencias.map((u,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:5,color:"rgba(255,255,255,.75)",fontSize:13}}><span style={{color:"#590707",fontWeight:900}}>→</span>{u}</div>
                ))}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:"#590707",textTransform:"uppercase",marginBottom:11}}>↗ LO QUE TIENES</div>
                {(proposal.diagnostico?.fortalezas||[]).map((f,i)=>(
                  <div key={i} className="cr"><div className="ci">✓</div><span style={{fontSize:12,color:"rgba(255,255,255,.7)",lineHeight:1.5}}>{f}</span></div>
                ))}
              </div>
              <div>
                <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:"#CDC7BD",textTransform:"uppercase",marginBottom:11}}>◎ LO QUE PUEDES APROVECHAR</div>
                {(proposal.diagnostico?.oportunidades||[]).map((o,i)=>(
                  <div key={i} className="cr"><div className="ci" style={{background:"rgba(205,199,189,.1)",borderColor:"rgba(205,199,189,.3)",color:"#CDC7BD"}}>○</div><span style={{fontSize:12,color:"rgba(255,255,255,.7)",lineHeight:1.5}}>{o}</span></div>
                ))}
              </div>
            </div>
          </div>

          {/* COTIZACIÓN */}
          <div className="fu d2" style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:12,padding:"26px",marginBottom:18}}>
            <div className="tag tgg" style={{marginBottom:12}}>TU COTIZACIÓN</div>
            <h2 style={{fontSize:19,fontWeight:800,marginBottom:6}}>Lo que calculamos para ti</h2>
            <p style={{color:"rgba(255,255,255,.45)",fontSize:13,lineHeight:1.6,marginBottom:20}}>{proposal.mensajeServicios}</p>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:18}}>
              {cotizacion.items.map((item,i)=>(
                <div key={i} style={{background:item.promo?"rgba(89,7,7,.12)":"rgba(255,255,255,.03)",border:`1px solid ${item.promo?"rgba(89,7,7,.3)":"rgba(255,255,255,.07)"}`,borderRadius:9,padding:"16px 18px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:item.promo?8:0}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{item.nombre}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,.38)"}}>{item.detalle}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      {item.promo&&(item.precioHora||item.precioBase)&&(
                        <div style={{fontSize:11,color:"rgba(255,255,255,.3)",textDecoration:"line-through",marginBottom:2}}>{item.precioHora||item.precioBase}</div>
                      )}
                      <div style={{fontSize:18,fontWeight:900,color:item.promo?"#f0d060":"#fff"}}>{item.total}</div>
                      {item.promo&&(item.precioHoraPromo||item.precioPromo)&&(
                        <div style={{fontSize:10,color:"rgba(240,208,96,.6)"}}>{item.precioHoraPromo||item.precioPromo} c/u con promo</div>
                      )}
                    </div>
                  </div>
                  {item.promo&&item.promoRazon&&<div className="promo-badge">🏷 PROMO ACTIVA: {item.promoRazon}</div>}
                </div>
              ))}
            </div>
            <div className="divl"/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {cotizacion.ahorro>0&&(
                <div className="ahorro-box">
                  <div>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:"#6be8a0",marginBottom:4}}>✦ ESTÁS AHORRANDO</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>Por combinar servicios o superar el mínimo</div>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,color:"#6be8a0"}}>{fmtFull(cotizacion.ahorro)} COP</div>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0",borderTop:"1px solid rgba(255,255,255,.08)"}}>
                <div>
                  <div style={{fontSize:9,fontWeight:800,letterSpacing:2,color:"rgba(255,255,255,.38)",marginBottom:4}}>TOTAL CON PROMOS</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>Clientes internacionales: consultamos en USD</div>
                </div>
                <div style={{textAlign:"right"}}>
                  {cotizacion.ahorro>0&&<div style={{fontSize:12,color:"rgba(255,255,255,.3)",textDecoration:"line-through",marginBottom:2}}>{fmtFull(cotizacion.totalBase)} COP</div>}
                  <div style={{fontSize:26,fontWeight:900,color:"#fff"}}>{fmtFull(cotizacion.totalPromo)} COP</div>
                </div>
              </div>
            </div>
          </div>

          {/* MENSAJE FINAL */}
          <div className="fu d3" style={{position:"relative",background:"linear-gradient(135deg,#590707,#2a0303)",borderRadius:12,padding:"32px",textAlign:"center",marginBottom:14,overflow:"hidden"}}>
            <div style={{fontSize:22,marginBottom:12}}>✦</div>
            <p style={{fontSize:"clamp(14px,2.2vw,18px)",fontWeight:600,fontStyle:"italic",color:"rgba(255,255,255,.82)",lineHeight:1.75,maxWidth:460,margin:"0 auto"}}>"{proposal.mensajeFinal}"</p>
          </div>

          {/* AGENDAR */}
          <div className="fu d4" style={{background:"linear-gradient(135deg,rgba(26,107,56,.16) 0%,rgba(15,77,40,.12) 100%)",border:"1px solid rgba(26,107,56,.35)",borderRadius:12,padding:"24px",marginBottom:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:20}}>
              <div style={{flex:1,minWidth:220}}>
                <div className="tag tgn" style={{marginBottom:10}}>SIGUIENTE PASO</div>
                <h3 style={{fontSize:18,fontWeight:800,marginBottom:7}}>Hablemos y lo cerramos</h3>
                <p style={{color:"rgba(255,255,255,.5)",fontSize:13,lineHeight:1.65}}>Esta cotización es la base. En la reunión ajustamos los detalles, resolvemos dudas y arrancamos.</p>
                <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:5}}>
                  {["Sin costo — sin compromiso","Respondemos en menos de 24 horas","Virtual o presencial, como prefieras"].map((b,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:12,color:"rgba(255,255,255,.6)"}}>
                      <span style={{color:"#6be8a0",fontSize:12}}>✓</span>{b}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:9,minWidth:200}}>
                {!booked?(<>
                  <a href={mailLink} className="bm" onClick={()=>setBooked(true)}>📧 Escribirnos por email</a>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="bm" onClick={()=>setBooked(true)}>💬 Escribirnos por WhatsApp</a>
                </>):(
                  <div style={{background:"rgba(26,107,56,.14)",border:"1px solid rgba(26,107,56,.28)",borderRadius:8,padding:"17px 18px",textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:7}}>✅</div>
                    <div style={{fontSize:13,fontWeight:700,color:"#6be8a0",marginBottom:4}}>¡Listo!</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.4)",lineHeight:1.5}}>Te contactamos en menos de 24 horas.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{textAlign:"center"}}><button className="bg" onClick={reset}>← Volver al inicio</button></div>
        </div>
      )}

      <div style={{borderTop:"1px solid rgba(255,255,255,.05)",padding:"16px 24px",textAlign:"center",marginTop:32}}>
        <div style={{fontSize:9,color:"rgba(255,255,255,.16)",letterSpacing:2}}>KAPITAL MUSIC © 2026 — SELLO DISCOGRÁFICO INDEPENDIENTE — contacto@kapitalmusic.co</div>
      </div>
    </div>
  );
}
