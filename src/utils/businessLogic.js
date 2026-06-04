export const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzU-SX_AGIPzqYCdigD5ZS3uj94uOH-GghfEz6KREVkqCSs1bzBMZlP4oFqLOz2Dfb0CQ/exec";
export const WA_NUMBER = "573113143351";

export async function guardarEnSheets(answers, extras, cotizacion) {
  const fecha = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });
  const fila = {
    "Fecha": fecha,
    "Nombre artístico": answers.nombre || "",
    "Nombre real": answers.nombreReal || "",
    "Email": answers.email || "",
    "WhatsApp": answers.telefono || "",
    "Ciudad/País": answers.ciudad || "",
    "Instagram": answers.instagram || "",
    "TikTok": answers.tiktok || "",
    "Géneros": (answers.generos || []).join(", "),
    "Años de carrera": answers.anosCarrera || "",
    "Lanzamientos": answers.lanzamientos || "",
    "Registrado legalmente": answers.registrado || "",
    "Distribuidora": answers.distribuidora || "",
    "Asesoría legal previa": answers.asesoriaLegal || "",
    "Tiene management": answers.management || "",
    "Sello o inversionista": answers.selloInversionista || "",
    "Seguidores Instagram": answers.seguidoresIG || "",
    "Seguidores TikTok": answers.seguidoresTT || "",
    "Actividad en redes": answers.contenidoActual || "",
    "Objetivos": (answers.objetivos || []).join(", "),
    "Servicios de interés": (answers.serviciosInteres || []).join(", "),
    "Presupuesto": answers.presupuesto || "",
    "Descripción proyecto": answers.descripcion || "",
    "Sesiones virtuales": answers.esInternacional ? "Sí" : "No",
    "Estudio elegido": extras.estudio ? `Estudio ${extras.estudio}` : "",
    "Sesiones estudio": extras.sesionesEstudio || "",
    "Horas por sesión": extras.horasEstudio || "",
    "Productor elegido": extras.productora || "",
    "Sesiones producción": extras.sesionesProduccion || "",
    "Canciones mezcla": extras.canciones || "",
    "Total base COP": cotizacion?.totalBase || "",
    "Total con promos COP": cotizacion?.totalPromo || "",
    "Ahorro COP": cotizacion?.ahorro || "",
    "Servicios cotizados": (cotizacion?.items || []).map(i => `${i.nombre}: ${i.total}`).join(" | "),
  };
  try {
    await fetch(SHEETS_URL, {
      method: "POST", mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fila),
    });
  } catch (err) { console.error("Sheets error:", err); }
}

// ─── PRECIOS ──────────────────────────────────────────────────────────────────
export const PRECIOS = {
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

export function fmt(n) { return n >= 1000000 ? `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M` : `$${(n / 1000).toFixed(0)}K`; }
export function fmtFull(n) { return "$" + n.toLocaleString("es-CO"); }

export function calcularPropuesta(serviciosElegidos, extras, esInternacional) {
  const tiene = (s) => serviciosElegidos.includes(s);
  const items = []; let totalBase = 0, totalPromo = 0;

  if (tiene("Alquiler de estudios")) {
    const est = extras.estudio || "A"; const p = PRECIOS.estudio[est];
    const sesiones = extras.sesionesEstudio || 1; const horas = extras.horasEstudio || p.minimoHoras;
    const esPromo = sesiones > 3 || tiene("Marketing 30") || tiene("Asesoría legal") || esInternacional;
    const precioIndividual = p.hora * horas * sesiones; // siempre sin promo
    const precioConPromo = (esPromo ? p.horaPromo : p.hora) * horas * sesiones;
    totalBase += precioIndividual; totalPromo += precioConPromo;
    items.push({
      nombre: `Alquiler Estudio ${est}${esInternacional ? " (virtual)" : ""}`,
      detalle: `${sesiones} sesión${sesiones > 1 ? "es" : ""} × ${horas}h`,
      precioIndividual: fmtFull(precioIndividual),
      precioIndividualNum: precioIndividual,
      totalConPromo: fmtFull(precioConPromo),
      totalConPromoNum: precioConPromo,
      promo: esPromo,
      promoRazon: esInternacional ? "tarifa virtual" : sesiones > 3 ? `+3 sesiones` : "combinado con otro servicio",
      precioUnitBase: fmt(p.hora) + "/hora",
      precioUnitPromo: esPromo ? fmt(p.horaPromo) + "/hora" : null,
    });
  }

  if (tiene("Producción musical completa (incluye mezcla y master)")) {
    const prod = extras.productora || "tunyD"; const p = PRECIOS.produccion[prod];
    const sesiones = esInternacional ? Math.max(extras.sesionesProduccion || 1, 4) : (extras.sesionesProduccion || 1);
    const esPromo = sesiones > 3 || esInternacional;
    const precioIndividual = p.sesion * sesiones;
    const precioConPromo = (esPromo ? p.sesionPromo : p.sesion) * sesiones;
    totalBase += precioIndividual; totalPromo += precioConPromo;
    items.push({
      nombre: prod === "tunyD" ? "Producción con TunyD (incl. mezcla y master)" : "Producción con Money Makers (incl. mezcla y master)",
      detalle: `${sesiones} sesión${sesiones > 1 ? "es" : ""}${esInternacional ? " (virtual)" : ""}`,
      precioIndividual: fmtFull(precioIndividual),
      precioIndividualNum: precioIndividual,
      totalConPromo: fmtFull(precioConPromo),
      totalConPromoNum: precioConPromo,
      promo: esPromo,
      promoRazon: esInternacional ? "tarifa virtual" : `${sesiones} sesiones (+3)`,
      precioUnitBase: fmt(p.sesion) + "/sesión",
      precioUnitPromo: esPromo ? fmt(p.sesionPromo) + "/sesión" : null,
    });
  }

  if (tiene("Asesoría legal")) {
    const esPromo = tiene("Marketing 30");
    const precioIndividual = PRECIOS.asesoria.base;
    const precioConPromo = esPromo ? PRECIOS.asesoria.promoConMarketing : PRECIOS.asesoria.base;
    totalBase += precioIndividual; totalPromo += precioConPromo;
    items.push({
      nombre: "Asesoría Legal",
      detalle: "Sesión única",
      precioIndividual: fmtFull(precioIndividual),
      precioIndividualNum: precioIndividual,
      totalConPromo: fmtFull(precioConPromo),
      totalConPromoNum: precioConPromo,
      promo: esPromo,
      promoRazon: esPromo ? "combinado con Marketing 30" : null,
      precioUnitBase: fmt(PRECIOS.asesoria.base),
      precioUnitPromo: esPromo ? fmt(PRECIOS.asesoria.promoConMarketing) : null,
    });
  }

  if (tiene("Marketing 30")) {
    const esPromo = tiene("Producción musical completa (incluye mezcla y master)") || tiene("Asesoría legal");
    const precioIndividual = PRECIOS.marketing.base;
    const precioConPromo = esPromo ? PRECIOS.marketing.promoConOtros : PRECIOS.marketing.base;
    totalBase += precioIndividual; totalPromo += precioConPromo;
    items.push({
      nombre: "Marketing 30",
      detalle: "Plan mensual completo",
      precioIndividual: fmtFull(precioIndividual),
      precioIndividualNum: precioIndividual,
      totalConPromo: fmtFull(precioConPromo),
      totalConPromoNum: precioConPromo,
      promo: esPromo,
      promoRazon: esPromo ? "combinado con otro servicio" : null,
      precioUnitBase: fmt(PRECIOS.marketing.base) + "/mes",
      precioUnitPromo: esPromo ? fmt(PRECIOS.marketing.promoConOtros) + "/mes" : null,
    });
  }

  if (tiene("Mezcla & Mastering (ya tengo grabado)")) {
    const canciones = esInternacional ? Math.max(extras.canciones || 1, 4) : (extras.canciones || 1);
    const esPromo = canciones > 3 || esInternacional;
    const precioIndividual = PRECIOS.mezclamaster.base * canciones;
    const precioConPromo = (esPromo ? PRECIOS.mezclamaster.promoMas3 : PRECIOS.mezclamaster.base) * canciones;
    totalBase += precioIndividual; totalPromo += precioConPromo;
    items.push({
      nombre: "Mezcla & Mastering",
      detalle: `${canciones} canción${canciones > 1 ? "es" : ""}`,
      precioIndividual: fmtFull(precioIndividual),
      precioIndividualNum: precioIndividual,
      totalConPromo: fmtFull(precioConPromo),
      totalConPromoNum: precioConPromo,
      promo: esPromo,
      promoRazon: esPromo ? (esInternacional ? "tarifa virtual" : `${canciones} canciones (+3)`) : null,
      precioUnitBase: fmt(PRECIOS.mezclamaster.base) + "/canción",
      precioUnitPromo: esPromo ? fmt(PRECIOS.mezclamaster.promoMas3) + "/canción" : null,
    });
  }

  const ahorro = totalBase - totalPromo;
  return { items, totalBase, totalPromo, ahorro };
}

export function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
export function validarTelefono(tel) { const l = tel.replace(/[\s\-+()]/g, ""); return l.length >= 7 && /^\d+$/.test(l); }
export function esColombiano(ciudad) {
  if (!ciudad) return true;
  const c = ciudad.toLowerCase();
  const colombia = ["colombia", "bogotá", "bogota", "medellin", "medellín", "cali", "barranquilla", "cartagena", "bucaramanga", "pereira", "manizales", "cucuta", "cúcuta", "ibague", "ibagué", "santa marta", "villavicencio", "monteria", "montería", "pasto", "neiva", "armenia", "sincelejo", "popayan", "popayán", "valledupar"];
  return colombia.some(x => c.includes(x));
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
export const GENEROS = ["Trap", "Reggaetón", "Rap", "Hip-Hop", "R&B", "Reggae", "Afrobeats", "Pop urbano", "Otro"];
export const OBJETIVOS = ["Lanzar mi primer sencillo", "Crecer en redes sociales", "Monetizar mi música", "Construir mi marca personal", "Producir un EP o álbum", "Registrar y proteger mi música", "Conseguir una distribuidora"];
export const DISTRIBUIDORAS = ["No tengo", "DistroKid", "TuneCore", "CD Baby", "Amuse", "ONErpm", "Otra"];

export const QUESTIONS = [
  { id: "nombre", label: "¿Cuál es tu nombre artístico?", type: "text", placeholder: "Tu alias o nombre de escenario...", required: true, section: "DATOS BÁSICOS" },
  { id: "nombreReal", label: "¿Y tu nombre completo?", type: "text", placeholder: "Nombre y apellidos...", required: true, section: "DATOS BÁSICOS" },
  { id: "email", label: "¿Cuál es tu correo electrónico?", type: "email", placeholder: "artista@email.com", required: true, section: "DATOS BÁSICOS", validate: validarEmail, errorMsg: "Ingresa un correo válido (ej: nombre@gmail.com)" },
  { id: "telefono", label: "¿Tu número de WhatsApp?", type: "tel", placeholder: "+57 300 000 0000", required: true, section: "DATOS BÁSICOS", validate: validarTelefono, errorMsg: "Ingresa un número válido (mínimo 7 dígitos)" },
  { id: "ciudad", label: "¿En qué ciudad y país estás?", type: "text", placeholder: "Ej: Medellín, Colombia / Miami, USA...", required: true, section: "DATOS BÁSICOS" },
  { id: "generos", label: "¿Con qué géneros te identificas?", type: "multicheck", options: GENEROS, required: true, hint: "Selecciona todos los que apliquen", section: "TU MÚSICA" },
  { id: "anosCarrera", label: "¿Cuánto tiempo llevas activo como artista?", type: "single", options: ["Menos de 1 año", "1 – 2 años", "2 – 5 años", "5 – 10 años", "Más de 10 años"], required: true, section: "TU CARRERA" },
  { id: "lanzamientos", label: "¿Cuántos lanzamientos oficiales has tenido?", type: "single", options: ["Ninguno todavía", "1 – 3", "4 – 10", "Más de 10"], required: true, section: "TU CARRERA" },
  { id: "registrado", label: "¿Tu música está registrada legalmente?", type: "yesno", required: true, section: "TU CARRERA", hint: "SAYCO, ACINPRO, copyright u otro" },
  { id: "distribuidora", label: "¿Tienes distribuidora digital?", type: "single", options: DISTRIBUIDORAS, required: true, section: "TU CARRERA" },
  { id: "asesoriaLegal", label: "¿Has tenido asesoría legal para tu música?", type: "yesno", required: true, section: "TU CARRERA" },
  { id: "management", label: "¿Tienes manager o equipo de management?", type: "single", options: ["No, trabajo solo", "Tengo manager personal", "Tengo equipo de management", "Estoy buscando management"], required: true, section: "TU CARRERA" },
  { id: "selloInversionista", label: "¿Estás vinculado a algún sello, inversionista o tienes respaldo financiero?", type: "single", options: ["No, soy independiente", "Tengo un inversionista o patrocinador", "Estoy firmado con otro sello", "Estoy en negociaciones", "Tuve respaldo antes, ahora soy independiente"], required: true, section: "TU CARRERA" },
  { id: "seguidoresIG", label: "¿Cuántos seguidores tienes en Instagram?", type: "single", options: ["No tengo Instagram", "Menos de 1,000", "1,000 – 5,000", "5,000 – 20,000", "20,000 – 100,000", "Más de 100,000"], required: true, section: "TUS REDES" },
  { id: "instagram", label: "¿Cuál es tu usuario de Instagram?", type: "text", placeholder: "@tuusuario", required: false, section: "TUS REDES", conditional: (a) => a.seguidoresIG && a.seguidoresIG !== "No tengo Instagram" },
  { id: "seguidoresTT", label: "¿Y en TikTok?", type: "single", options: ["No tengo TikTok", "Menos de 1,000", "1,000 – 10,000", "10,000 – 50,000", "50,000 – 200,000", "Más de 200,000"], required: true, section: "TUS REDES" },
  { id: "tiktok", label: "¿Cuál es tu usuario de TikTok?", type: "text", placeholder: "@tuusuario", required: false, section: "TUS REDES", conditional: (a) => a.seguidoresTT && a.seguidoresTT !== "No tengo TikTok" },
  { id: "contenidoActual", label: "¿Qué tan seguido publicas contenido?", type: "single", options: ["No publico", "Esporádicamente", "1-2 veces por semana", "Casi diario", "Tengo equipo de contenido"], required: true, section: "TUS REDES" },
  { id: "objetivos", label: "¿Cuáles son tus objetivos?", type: "multicheck", options: OBJETIVOS, required: true, hint: "Selecciona todos los que apliquen", section: "TUS OBJETIVOS" },
  { id: "serviciosInteres", label: "¿Qué servicios de Kapital te interesan?", type: "multicheck", options: ["Alquiler de estudios", "Asesoría legal", "Mezcla & Mastering (ya tengo grabado)", "Marketing 30", "Producción musical completa (incluye mezcla y master)"], required: true, hint: "Selecciona todos los que necesitas. La producción musical ya incluye mezcla y master.", section: "TUS OBJETIVOS",
    filterOptions: (answers) => {
      const sel = answers.serviciosInteres || [];
      if (sel.includes("Producción musical completa (incluye mezcla y master)")) {
        return ["Alquiler de estudios", "Asesoría legal", "Marketing 30", "Producción musical completa (incluye mezcla y master)"];
      }
      return ["Alquiler de estudios", "Asesoría legal", "Mezcla & Mastering (ya tengo grabado)", "Marketing 30", "Producción musical completa (incluye mezcla y master)"];
    }
  },
  { id: "presupuesto", label: "¿Cuánto puedes invertir en tu carrera?", type: "single", options: ["$2,000,000 – $4,000,000", "$4,000,000 – $7,000,000", "$7,000,000 – $12,000,000", "$12,000,000 – $20,000,000", "Más de $20,000,000"], required: true, section: "TUS OBJETIVOS" },
  { id: "descripcion", label: "Cuéntanos sobre tu proyecto", type: "textarea", placeholder: "¿De qué trata tu música? ¿Qué te hace diferente?...", required: false, section: "TUS OBJETIVOS" },
];

export const EXTRAS_QUESTIONS = {
  "Alquiler de estudios": [
    { id: "estudio", label: "¿Qué estudio te interesa?", options: ["Estudio A — $500K/hora (premium)", "Estudio B — $250K/hora"] },
    { id: "sesionesEstudio", label: "¿Cuántas sesiones aproximadamente?", options: ["1 sesión", "2 sesiones", "3 sesiones", "Más de 3 sesiones"] },
    { id: "sesionesEstudioExacto", label: "¿Cuántas sesiones exactamente?", type: "number", placeholder: "Ej: 5", conditional: (e) => e.sesionesEstudio === 4 },
    { id: "horasEstudio", label: "¿Cuántas horas por sesión? (mínimo 3h)", options: ["3 horas", "4 horas", "5 horas", "6+ horas"] },
  ],
  "Producción musical completa (incluye mezcla y master)": [
    { id: "productora", label: "¿Con qué productor quieres trabajar?", options: ["TunyD — $8M/sesión", "Money Makers — $10M/sesión"] },
    { id: "sesionesProduccion", label: "¿Cuántas sesiones necesitas?", options: ["1 sesión", "2 sesiones", "3 sesiones", "Más de 3 sesiones"] },
    { id: "sesionesProduccionExacto", label: "¿Cuántas sesiones exactamente?", type: "number", placeholder: "Ej: 6", conditional: (e) => e.sesionesProduccion === 4 },
  ],
  "Mezcla & Mastering (ya tengo grabado)": [
    { id: "canciones", label: "¿Cuántas canciones vas a mezclar?", options: ["1 canción", "2 canciones", "3 canciones", "Más de 3 canciones"] },
    { id: "cancionesExacto", label: "¿Cuántas canciones exactamente?", type: "number", placeholder: "Ej: 8", conditional: (e) => e.canciones === 4 },
  ],
};

export const CL = "https://res.cloudinary.com/dssujt8zt/image/upload/q_auto,f_auto/";
export const LOGO_URL = CL + "Diseño_sin_título_65_xtjw6m";
export const LOGO_NAV = CL + "Diseño_sin_título_66_zdp6ug";

export const PORTADAS_ROW1 = [
  "Captura_de_pantalla_2026-04-27_112616_ux4ms3","Captura_de_pantalla_2026-04-27_112809_fubr8r",
  "Captura_de_pantalla_2026-04-27_113033_peqsuz","Captura_de_pantalla_2026-04-27_113142_d4xyzw",
  "Captura_de_pantalla_2026-04-27_113108_dzxzer","Captura_de_pantalla_2026-04-27_112838_vhldvw",
  "Captura_de_pantalla_2026-04-27_113454_k6vwrq","Captura_de_pantalla_2026-04-27_113432_kfg8nt",
  "Captura_de_pantalla_2026-04-27_113209_aqlekx","Captura_de_pantalla_2026-04-27_113654_xprtta",
  "Captura_de_pantalla_2026-04-27_113626_fnq2e8","Captura_de_pantalla_2026-04-27_114135_s4jd1l",
  "Captura_de_pantalla_2026-05-25_153045_jacj0q","Captura_de_pantalla_2026-05-25_153354_doqcqt",
  "Captura_de_pantalla_2026-05-25_152043_qaljyb","Captura_de_pantalla_2026-05-25_152926_d7znaj",
  "Captura_de_pantalla_2026-05-25_150829_x1g9zi","Captura_de_pantalla_2026-05-25_153135_gkgdd8",
  "Captura_de_pantalla_2026-05-25_151607_hzchkt",
].map(id => CL + id);

export const PORTADAS_ROW2 = [
  "Captura_de_pantalla_2026-04-27_113727_th7yzx","Captura_de_pantalla_2026-04-27_114042_fwm1w7",
  "Captura_de_pantalla_2026-04-27_114413_pxjitu","Captura_de_pantalla_2026-04-27_114344_erxepg",
  "Captura_de_pantalla_2026-04-27_114320_mfsyja","Captura_de_pantalla_2026-04-27_114726_k3e0yi",
  "Captura_de_pantalla_2026-04-27_114650_baluid","Captura_de_pantalla_2026-04-27_114616_kmd9b1",
  "Captura_de_pantalla_2026-04-27_114956_wm6q99","Captura_de_pantalla_2026-04-27_114903_sricfi",
  "Captura_de_pantalla_2026-04-27_114929_wfbi7a","Captura_de_pantalla_2026-04-27_112653_kq3xn9",
  "Captura_de_pantalla_2026-05-25_151725_so3z8j","Captura_de_pantalla_2026-05-25_150952_iva9kg",
  "Captura_de_pantalla_2026-05-25_151503_fto1jw","Captura_de_pantalla_2026-05-25_151939_nso40t",
  "Captura_de_pantalla_2026-05-25_152821_gpjcul","Captura_de_pantalla_2026-05-25_150829_ktungd",
  "Captura_de_pantalla_2026-05-25_153232_jqxaol",
].map(id => CL + id);

export const ESTUDIO_A_INFO = [
  "Monitores Avantone Pro CLA-10 / Adam A77X",
  "Tarjeta de Sonido / Apollo 8",
  "Micrófono Manley + Pre-amplificador Manley",
  "Teclado Novation Impulse 49",
  "Controlador Big Knob 2",
  "Subwoofer KRK",
  "Parlantes Beta 3 - 2EP",
  "Máximo 6 personas",
];
export const ESTUDIO_B_INFO = [
  "Monitores Adam Audio T5V / Yamaha HS8",
  "Preamplificador Universal Audio 6176",
  "Micrófono Neumann TLM 102",
  "Tarjeta de Sonido Apollo Twin (Windows)",
  "Controlador Big Knob 1",
  "Subwoofer JBL",
  "Máximo 4 personas",
];

export const SERVICES = [
  {
    icon: "🎙️", title: "Alquiler de Estudios", tag: "GRABACIÓN",
    descLanding: "Dos estudios profesionales listos para que grabes con total comodidad. Cada uno con equipos de alta gama y el ambiente ideal para crear.",
    desc: "Dos espacios diseñados para que te concentres en lo que importa: crear. Nuestros estudios están equipados con lo mejor para garantizar un sonido impecable. El ingeniero de sonido lo coordinas tú — nosotros ponemos el espacio y el equipo.",
    subsections: [
      {
        label: "Estudio A", info: ESTUDIO_A_INFO,
        imgs3d: [CL+"estudio-a-1_yitif2", CL+"estudio-a-2_ax1jy5", CL+"estudio-a-3_wnlvfd", CL+"estudio-a-4_ypaaea"]
      },
      {
        label: "Estudio B", info: ESTUDIO_B_INFO,
        imgs3d: [CL+"estudio-b-1_hlduee", CL+"estudio-b-2_wpzby5", CL+"estudio-b-3_gqeg4h", CL+"estudio-b-4_asp8p4"]
      }
    ]
  },
  {
    icon: "⚖️", title: "Asesoría Legal", tag: "PROTECCIÓN",
    descLanding: "Tu música es tu patrimonio. Te ayudamos a protegerla y a entender tus derechos para que puedas moverte en la industria con seguridad.",
    desc: "Tu música vale, y merece estar protegida. Te acompañamos en todo el proceso legal para que puedas enfocarte en crear, sabiendo que tu trabajo está blindado.",
    legalInfo: [
      { title: "Registra y protege tu música", items: ["Registro de obra musical en la DNDA", "Registro de fonograma"] },
      { title: "Afíliate a las entidades que te pagan regalías", items: ["SAYCO", "ACINPRO", "ASCAP"] },
      { title: "Documentos para tu carrera artística", items: ["Contratos profesionales adaptados a tu realidad como artista", "Split Sheet — define desde el principio quién se lleva qué", "Acuerdos, releases y declaración de puntos de máster"] },
    ],
    imgs: []
  },
  { icon: "🎚️", title: "Mezcla & Mastering", tag: "PRODUCCIÓN", descLanding: "¿Ya tienes todo grabado? Lo llevamos al nivel que merece.", desc: "¿Ya tienes tus temas grabados? Nuestros ingenieros los llevan al nivel internacional que merecen. Entrega en 72h.", imgs: [] },
  { icon: "📲", title: "Marketing 30", tag: "CRECIMIENTO", descLanding: "Un mes completo de estrategia digital para que tu música llegue a quien tiene que llegar.", desc: "Análisis de contenido, crecimiento orgánico, pauta en Meta, parrilla mensual y asesoramiento de marca. Un mes completo de activación.", imgs: [] },
  {
    icon: "🎵", title: "Producción Musical", tag: "CREACIÓN",
    descLanding: "TunyD y Money Makers. Desde el concepto hasta el master, todo incluido.",
    desc: "TunyD y Money Makers. Desde el concepto hasta el master — beat, arreglos, grabación, mezcla y mastering incluidos.",
    subsections: [
      { label: "Money Makers", imgs3d: [CL+"money-makers-1_ezbtfk", CL+"money-makers-3_oba1ls", CL+"money-makers-2_oba1ls"] },
      { label: "TunyD", imgs3d: [CL+"tunyd-2_wo2quf", CL+"tunyd-1_sr6wde", CL+"tunyd-3_ai2n3c"] }
    ]
  },
];

export const CASA_IMGS = [
  "DSC05600_ylryqo","DSC04094_qbo1k1","DSC09145-2_n3jfk8","DSC09540_qo0mux",
  "DSC09545_lxfuej","DSC08964_pwxai2","DSC09487_yz2yj5","DSC09207_aj4rrw",
  "DSC09087_iygxrp","DSC09077_cs0xwa","DSC09091_gkd66d","DSC09026_qcghrz",
  "DSC09017_mxtnrf","DSC09001_zhqhff","DSC08210_snhb3p","DSC08200_unvjmy",
  "DSC08188_axo980"
].map(id => "https://res.cloudinary.com/dssujt8zt/image/upload/q_auto,f_auto/" + id);
