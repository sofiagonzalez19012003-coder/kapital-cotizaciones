import { useState, useEffect, useRef } from "react";

const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzU-SX_AGIPzqYCdigD5ZS3uj94uOH-GghfEz6KREVkqCSs1bzBMZlP4oFqLOz2Dfb0CQ/exec";
const WA_NUMBER = "573113143351";

async function guardarEnSheets(answers, extras, cotizacion) {
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

function fmt(n) { return n >= 1000000 ? `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M` : `$${(n / 1000).toFixed(0)}K`; }
function fmtFull(n) { return "$" + n.toLocaleString("es-CO"); }

function calcularPropuesta(serviciosElegidos, extras, esInternacional) {
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

function validarEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validarTelefono(tel) { const l = tel.replace(/[\s\-+()]/g, ""); return l.length >= 7 && /^\d+$/.test(l); }
function esColombiano(ciudad) {
  if (!ciudad) return true;
  const c = ciudad.toLowerCase();
  const colombia = ["colombia", "bogotá", "bogota", "medellin", "medellín", "cali", "barranquilla", "cartagena", "bucaramanga", "pereira", "manizales", "cucuta", "cúcuta", "ibague", "ibagué", "santa marta", "villavicencio", "monteria", "montería", "pasto", "neiva", "armenia", "sincelejo", "popayan", "popayán", "valledupar"];
  return colombia.some(x => c.includes(x));
}

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

// ─── DATA ─────────────────────────────────────────────────────────────────────
const GENEROS = ["Trap", "Reggaetón", "Rap", "Hip-Hop", "R&B", "Reggae", "Afrobeats", "Pop urbano", "Otro"];
const OBJETIVOS = ["Lanzar mi primer sencillo", "Crecer en redes sociales", "Monetizar mi música", "Construir mi marca personal", "Producir un EP o álbum", "Registrar y proteger mi música", "Conseguir una distribuidora"];
const DISTRIBUIDORAS = ["No tengo", "DistroKid", "TuneCore", "CD Baby", "Amuse", "ONErpm", "Otra"];

const QUESTIONS = [
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
  { id: "serviciosInteres", label: "¿Qué servicios de Kapital te interesan?", type: "multicheck", options: ["Alquiler de estudios", "Asesoría legal", "Mezcla & Mastering (ya tengo grabado)", "Marketing 30", "Producción musical completa (incluye mezcla y master)"], required: true, hint: "Selecciona todos los que necesitas", section: "TUS OBJETIVOS" },
  { id: "presupuesto", label: "¿Cuánto puedes invertir en tu carrera?", type: "single", options: ["$2,000,000 – $4,000,000", "$4,000,000 – $7,000,000", "$7,000,000 – $12,000,000", "$12,000,000 – $20,000,000", "Más de $20,000,000"], required: true, section: "TUS OBJETIVOS" },
  { id: "descripcion", label: "Cuéntanos sobre tu proyecto", type: "textarea", placeholder: "¿De qué trata tu música? ¿Qué te hace diferente?...", required: false, section: "TUS OBJETIVOS" },
];

const EXTRAS_QUESTIONS = {
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

const SERVICES = [
  {
    icon: "🎙️", title: "Alquiler de Estudios", tag: "GRABACIÓN",
    desc: "Estudio A (premium) y Estudio B disponibles, ambos con ingenieros certificados. Por hora o en paquetes. Los precios los conoces después de tu consulta personalizada.",
    subsections: [
      {
        label: "Estudio A",
        imgs: [
          "https://i.imgur.com/cqCF3pM.jpg",
          "https://i.imgur.com/UvqAzcK.jpg",
          "https://i.imgur.com/8JGeKR5.jpg",
          "https://i.imgur.com/YUtBX2z.jpg",
        ]
      },
      {
        label: "Estudio B",
        imgs: [
          "https://i.imgur.com/xVRMOjc.jpg",
          "https://i.imgur.com/dPh6psv.jpg",
          "https://i.imgur.com/VBVlgCJ.jpg",
          "https://i.imgur.com/XtPvyhe.jpg",
        ]
      }
    ]
  },
  {
    icon: "⚖️", title: "Asesoría Legal", tag: "PROTECCIÓN",
    desc: "Contratos, registro SAYCO/ACINPRO, distribuidoras y todo lo que necesitas para que tu carrera sea un negocio real.",
    imgs: []
  },
  {
    icon: "🎚️", title: "Mezcla & Mastering", tag: "PRODUCCIÓN",
    desc: "¿Ya tienes tus temas grabados? Nuestros ingenieros los llevan al nivel internacional que merecen. Entrega en 72h.",
    imgs: []
  },
  {
    icon: "📲", title: "Marketing 30", tag: "CRECIMIENTO",
    desc: "Análisis de contenido, crecimiento orgánico, pauta en Meta, parrilla mensual y asesoramiento de marca. Un mes completo de activación.",
    imgs: []
  },
  {
    icon: "🎵", title: "Producción Musical", tag: "CREACIÓN",
    desc: "TunyD y Money Makers. Desde el concepto hasta el master — beat, arreglos, grabación, mezcla y mastering incluidos.",
    subsections: [
      {
        label: "Money Makers",
        imgs: [
          "https://i.imgur.com/kSb5ZLu.jpg",
          "https://i.imgur.com/smy7UKj.jpg",
          "https://i.imgur.com/AsLrz7L.jpg",
        ]
      },
      {
        label: "TunyD",
        imgs: [
          "https://i.imgur.com/xffr2hd.jpg",
          "https://i.imgur.com/KRfDyvl.jpg",
        ]
      }
    ]
  },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #080808; color: #fff; font-family: 'Raleway', sans-serif; overflow-x: hidden; width: 100%; min-height: 100vh; -webkit-text-size-adjust: 100%; }
  .nav { position: sticky; top: 0; z-index: 100; background: rgba(8,8,8,.97); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(89,7,7,.3); padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; width: 100%; }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .nav-k { width: 32px; height: 32px; background: #590707; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; flex-shrink: 0; }
  .btn-red { background: #590707; color: #fff; border: none; padding: 16px 20px; border-radius: 10px; font-family: 'Raleway',sans-serif; font-weight: 800; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; -webkit-tap-highlight-color: transparent; }
  .btn-red:disabled { opacity: .38; }
  .btn-ghost { background: transparent; color: rgba(255,255,255,.6); border: 1px solid rgba(255,255,255,.2); padding: 10px 16px; border-radius: 8px; font-family: 'Raleway',sans-serif; font-weight: 700; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; -webkit-tap-highlight-color: transparent; }
  .btn-white { background: #fff; color: #590707; border: none; padding: 16px 20px; border-radius: 10px; font-family: 'Raleway',sans-serif; font-weight: 800; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; width: 100%; display: block; text-align: center; text-decoration: none; }
  .btn-wa { background: linear-gradient(135deg,#1a8f3c,#0f6628); color: #fff; border: none; padding: 16px 20px; border-radius: 10px; font-family: 'Raleway',sans-serif; font-weight: 800; font-size: 13px; letter-spacing: .5px; text-transform: uppercase; cursor: pointer; width: 100%; text-align: center; text-decoration: none; display: block; }
  .btn-mail { background: linear-gradient(135deg,#1a5090,#0f3860); color: #fff; border: none; padding: 16px 20px; border-radius: 10px; font-family: 'Raleway',sans-serif; font-weight: 800; font-size: 13px; letter-spacing: .5px; text-transform: uppercase; cursor: pointer; width: 100%; text-align: center; text-decoration: none; display: block; }
  .tag { display: inline-block; background: rgba(89,7,7,.26); border: 1px solid rgba(89,7,7,.5); color: #ff8080; font-size: 9px; font-weight: 800; letter-spacing: 2px; padding: 3px 10px; border-radius: 3px; text-transform: uppercase; }
  .tag-g { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.4); }
  .tag-n { background: rgba(26,143,60,.2); border: 1px solid rgba(26,143,60,.45); color: #6be8a0; }
  .tag-y { background: rgba(200,160,0,.18); border: 1px solid rgba(200,160,0,.38); color: #f0d060; }
  .tag-int { background: rgba(80,120,200,.2); border: 1px solid rgba(80,120,200,.45); color: #90b8ff; }
  .saved { background: rgba(26,143,60,.18); border: 1px solid rgba(26,143,60,.38); color: #6be8a0; font-size: 9px; font-weight: 700; padding: 4px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; }
  .fu { animation: fu .38s ease-out both; }
  @keyframes fu { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .spin { animation: spin .8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .pulse { animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .pb { height: 3px; background: rgba(255,255,255,.08); border-radius: 2px; overflow: hidden; margin-bottom: 28px; }
  .pf { height: 100%; background: linear-gradient(90deg,#590707,#e63333); border-radius: 2px; transition: width .35s ease; }
  .opt { background: rgba(255,255,255,.05); border: 1.5px solid rgba(255,255,255,.1); border-radius: 12px; padding: 15px 14px; cursor: pointer; color: rgba(255,255,255,.75); font-family: 'Raleway',sans-serif; font-size: 15px; display: flex; align-items: center; gap: 13px; width: 100%; text-align: left; -webkit-tap-highlight-color: transparent; transition: background .15s, border-color .15s; }
  .opt.sel { background: rgba(89,7,7,.22); border-color: #590707; color: #fff; }
  .ord { width: 22px; height: 22px; border-radius: 50%; border: 2px solid rgba(255,255,255,.25); flex-shrink: 0; transition: all .15s; }
  .opt.sel .ord { border-color: #590707; box-shadow: inset 0 0 0 5px #590707; }
  .ock { width: 22px; height: 22px; border-radius: 6px; border: 2px solid rgba(255,255,255,.25); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all .15s; }
  .opt.sel .ock { background: #590707; border-color: #590707; }
  .inp { width: 100%; background: rgba(255,255,255,.07); border: 1.5px solid rgba(255,255,255,.14); border-radius: 12px; padding: 16px; color: #fff; font-family: 'Raleway',sans-serif; font-size: 16px; outline: none; -webkit-appearance: none; transition: border-color .2s; }
  .inp:focus { border-color: #590707; background: rgba(89,7,7,.1); }
  .inp.err { border-color: #e63333; }
  .inp::placeholder { color: rgba(255,255,255,.28); }
  .err-msg { color: #ff8080; font-size: 12px; margin-top: 8px; display: flex; align-items: center; gap: 6px; }
  .int-banner { background: linear-gradient(135deg,rgba(80,120,200,.18),rgba(40,80,160,.12)); border: 1px solid rgba(80,120,200,.35); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: flex-start; gap: 10px; }
  .card { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 14px; padding: 18px; }
  .divl { height: 1px; background: rgba(255,255,255,.07); margin: 14px 0; }
  .cr { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 10px; }
  .ci { width: 18px; height: 18px; border-radius: 50%; background: rgba(89,7,7,.28); border: 1px solid rgba(89,7,7,.5); display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; margin-top: 2px; color: #ff9090; }
  .paso-num { width: 24px; height: 24px; border-radius: 50%; background: #590707; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; flex-shrink: 0; margin-top: 2px; }
  .hg { background-image: linear-gradient(rgba(89,7,7,.1) 1px,transparent 1px), linear-gradient(90deg,rgba(89,7,7,.1) 1px,transparent 1px); background-size: 40px 40px; }
  .promo-pill { display: inline-flex; align-items: center; gap: 5px; background: rgba(200,160,0,.15); border: 1px solid rgba(200,160,0,.3); color: #f0d060; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-top: 6px; }
  .ahorro { background: rgba(26,143,60,.12); border: 1px solid rgba(26,143,60,.3); border-radius: 10px; padding: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
  .srv-item { background: rgba(255,255,255,.04); border: 1.5px solid rgba(255,255,255,.09); border-radius: 12px; padding: 16px; cursor: pointer; width: 100%; text-align: left; transition: all .2s; -webkit-tap-highlight-color: transparent; }
  .srv-item.on { background: rgba(89,7,7,.18); border-color: rgba(89,7,7,.5); }
  .srv-detail { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 12px; padding: 20px; margin-top: 10px; }
  .carousel { display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 6px; scrollbar-width: none; }
  .carousel::-webkit-scrollbar { display: none; }
  .carousel-img { flex-shrink: 0; width: 200px; height: 130px; object-fit: cover; border-radius: 8px; scroll-snap-align: start; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.05); }
  .carousel-img:active { opacity: .85; }
  .sub-label { font-size: 10px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,.4); text-transform: uppercase; margin: 14px 0 8px; }
  .pkg-box { background: linear-gradient(135deg,rgba(89,7,7,.18),rgba(4,9,12,.8)); border: 1px solid rgba(89,7,7,.4); border-radius: 12px; padding: 18px; margin-bottom: 10px; }
  .ind-box { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 18px; }
`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [phase, setPhase] = useState("landing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fieldError, setFieldError] = useState("");
  const [extras, setExtras] = useState({});
  const [extrasStep, setExtrasStep] = useState(0);
  const [extrasQueue, setExtrasQueue] = useState([]);
  const [extrasCurrentQ, setExtrasCurrentQ] = useState(0);
  const [proposal, setProposal] = useState(null);
  const [cotizacion, setCotizacion] = useState(null);
  const [loadMsg, setLoadMsg] = useState(0);
  const [activeSrv, setActiveSrv] = useState(null);
  const [booked, setBooked] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const topRef = useRef(null);

  const LOAD_MSGS = ["Analizando tu perfil...", "Calculando tu cotización...", "Identificando qué te está frenando...", "Armando tu plan de carrera...", "Ya casi está lista..."];

  useEffect(() => {
    if (phase === "loading") {
      const iv = setInterval(() => setLoadMsg(p => (p + 1) % 5), 1900);
      return () => clearInterval(iv);
    }
  }, [phase]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase, currentQ, extrasStep, extrasCurrentQ]);

  // Filtrar preguntas según condicionales
  const visibleQuestions = QUESTIONS.filter(q => !q.conditional || q.conditional(answers));
  const q = visibleQuestions[currentQ];


  const getFieldError = () => {
    if (!q?.required) return "";
    const a = answers[q.id];
    if (!a || (typeof a === "string" && !a.trim()) || (Array.isArray(a) && !a.length)) return "Este campo es obligatorio";
    if (q.validate && !q.validate(a)) return q.errorMsg || "Valor inválido";
    return "";
  };

  const setAnswer = (val) => {
    setFieldError("");
    if (q.type === "multicheck") {
      const prev = answers[q.id] || [];
      if (prev.includes(val)) setAnswers(a => ({ ...a, [q.id]: prev.filter(x => x !== val) }));
      else setAnswers(a => ({ ...a, [q.id]: [...prev, val] }));
    } else setAnswers(a => ({ ...a, [q.id]: val }));
  };

  const nextQ = () => {
    const err = getFieldError();
    if (err) { setFieldError(err); return; }
    setFieldError("");
    if (currentQ < visibleQuestions.length - 1) setCurrentQ(c => c + 1);
    else startExtras();
  };

  const startExtras = () => {
    const servicios = answers.serviciosInteres || [];
    const queue = servicios.filter(s => EXTRAS_QUESTIONS[s]);
    if (!queue.length) { buildAndSubmit({}); return; }
    setExtrasQueue(queue); setExtrasStep(0); setExtrasCurrentQ(0); setPhase("extras");
  };

  const currentServiceExtras = extrasQueue[extrasStep];
  const allExtrasQs = EXTRAS_QUESTIONS[currentServiceExtras] || [];
  const currentExtrasQs = allExtrasQs.filter(eq => !eq.conditional || eq.conditional(extras));
  const currentEQ = currentExtrasQs[extrasCurrentQ];

  const setExtraAnswer = (val) => {
    let mk = val;
    if (currentEQ.id === "estudio") mk = val.startsWith("Estudio A") ? "A" : "B";
    if (currentEQ.id === "sesionesEstudio") mk = val.startsWith("Más") ? 4 : parseInt(val);
    if (currentEQ.id === "horasEstudio") mk = val.startsWith("6") ? 6 : parseInt(val);
    if (currentEQ.id === "productora") mk = val.startsWith("TunyD") ? "tunyD" : "moneyMakers";
    if (currentEQ.id === "sesionesProduccion") mk = val.startsWith("Más") ? 4 : parseInt(val);
    if (currentEQ.id === "canciones") mk = val.startsWith("Más") ? 4 : parseInt(val);
    setExtras(e => ({ ...e, [currentEQ.id]: mk }));
  };

  const setExtraText = (val) => {
    const num = parseInt(val) || 4;
    if (currentEQ.id === "sesionesEstudioExacto") setExtras(e => ({ ...e, sesionesEstudio: num }));
    if (currentEQ.id === "sesionesProduccionExacto") setExtras(e => ({ ...e, sesionesProduccion: num }));
    if (currentEQ.id === "cancionesExacto") setExtras(e => ({ ...e, canciones: num }));
    setExtras(e => ({ ...e, [currentEQ.id]: num }));
  };

  const canNextExtra = () => {
    if (!currentEQ) return false;
    if (currentEQ.type === "number") return (extras[currentEQ.id] || 0) > 3;
    return extras[currentEQ.id] !== undefined && extras[currentEQ.id] !== null;
  };

  const nextExtra = () => {
    if (extrasCurrentQ < currentExtrasQs.length - 1) { setExtrasCurrentQ(c => c + 1); return; }
    if (extrasStep < extrasQueue.length - 1) { setExtrasStep(s => s + 1); setExtrasCurrentQ(0); return; }
    buildAndSubmit(extras);
  };

  const buildAndSubmit = async (extrasData) => {
    setPhase("loading");
    const servicios = answers.serviciosInteres || [];
    const internacional = answers.ciudad ? !esColombiano(answers.ciudad) : false;
    const cot = calcularPropuesta(servicios, extrasData, internacional);
    setCotizacion(cot);
    await guardarEnSheets({ ...answers, esInternacional: internacional }, extrasData, cot);
    setSavedOk(true);
    // Generar análisis via Apps Script como GET con parámetros
    const params = new URLSearchParams({
      _tipo: "analisis",
      nombre: answers.nombre || "",
      anosCarrera: answers.anosCarrera || "",
      seguidoresIG: answers.seguidoresIG || "",
      seguidoresTT: answers.seguidoresTT || "",
      lanzamientos: answers.lanzamientos || "",
      registrado: answers.registrado || "",
      distribuidora: answers.distribuidora || "",
      generos: (answers.generos || []).join(", "),
      objetivos: (answers.objetivos || []).join(", "),
      serviciosInteres: (answers.serviciosInteres || []).join(", "),
      management: answers.management || "",
      contenidoActual: answers.contenidoActual || "",
      ciudad: answers.ciudad || "",
      asesoriaLegal: answers.asesoriaLegal || "",
      descripcion: answers.descripcion || "",
    });
    try {
      const res = await fetch(`${SHEETS_URL}?${params.toString()}`);
      const analisis = await res.json();
      setProposal(analisis);
    } catch {
      setProposal({ bienvenida: `${answers.nombre || "Artista"}, ya tenemos todo. Tu propuesta está lista.`, diagnostico: { nivel: "CRECIENDO", donde_esta: "Perfil guardado correctamente.", que_lo_frena: [], fortalezas: [], pasos_a_seguir: [] }, mensajeServicios: "Acá está tu cotización:", mensajeFinal: "El primer paso ya lo diste. Kapital está contigo." });
    }
    setPhase("proposal");
  };

  const reset = () => { setPhase("landing"); setCurrentQ(0); setAnswers({}); setExtras({}); setExtrasStep(0); setExtrasCurrentQ(0); setExtrasQueue([]); setProposal(null); setCotizacion(null); setBooked(false); setSavedOk(false); setFieldError(""); setActiveSrv(null); };

  const nivelColor = { COMENZANDO: "#ff8080", CRECIENDO: "#CDC7BD", ESTABLECIDO: "#6be8a0" };
  const nivelBg = { COMENZANDO: "rgba(89,7,7,.22)", CRECIENDO: "rgba(115,109,102,.18)", ESTABLECIDO: "rgba(26,143,60,.18)" };
  const nivelBorder = { COMENZANDO: "rgba(89,7,7,.45)", CRECIENDO: "rgba(115,109,102,.38)", ESTABLECIDO: "rgba(26,143,60,.38)" };

  const nombre = answers.nombre || "artista";
  const waMsg = encodeURIComponent(`¡Hola ${nombre}! 👋 Soy del equipo de Kapital Music.\n\nVimos que completaste tu formulario y ya tenemos tu propuesta lista. Queremos conectar contigo personalmente para resolver todas tus dudas y mostrarte exactamente cómo podemos impulsar tu carrera.\n\n¿Cuándo tienes 20 minutos para una llamada rápida? 🎵\n\n— Equipo Kapital Music`);
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;
  const mailLink = `mailto:contacto@kapitalmusic.co?subject=${encodeURIComponent(`Propuesta — ${nombre}`)}&body=${encodeURIComponent(`Hola equipo Kapital,\n\nSoy ${nombre} y acabo de ver mi propuesta.\n\nWhatsApp: ${answers.telefono || ""}`)}`;

  const progress = visibleQuestions.length > 0 ? (currentQ / visibleQuestions.length) * 100 : 0;
  const P = "18px";
  const esIntl = answers.ciudad ? !esColombiano(answers.ciudad) : false;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "'Raleway',sans-serif", width: "100%", overflowX: "hidden" }}>
      <style>{CSS}</style>
      <div ref={topRef} />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-k">K</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>Kapital Music</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,.3)", letterSpacing: 2 }}>SELLO INDEPENDIENTE</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {savedOk && <div className="saved">✓ Guardado</div>}
          {phase !== "landing" && <button className="btn-ghost" onClick={reset}>← Inicio</button>}
        </div>
      </nav>

      {/* ══ LANDING ══ */}
      {phase === "landing" && (
        <div style={{ width: "100%" }}>
          <div className="hg" style={{ position: "relative", padding: `48px ${P} 36px`, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(89,7,7,.45) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 65%, #080808 100%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div className="tag fu" style={{ marginBottom: 18 }}>BIENVENIDO AL MOVIMIENTO</div>
              <h1 className="fu" style={{ fontSize: 38, fontWeight: 900, lineHeight: .95, marginBottom: 18, textTransform: "uppercase", letterSpacing: -1 }}>
                Tu música.<br /><span style={{ color: "#590707" }}>Tu legado.</span><br />Tu momento.
              </h1>
              <p className="fu" style={{ fontSize: 14, color: "rgba(255,255,255,.58)", lineHeight: 1.72, marginBottom: 28 }}>
                Somos el equipo que te acompaña a construir una carrera real — estrategia, producción y respaldo legal desde el día uno.
              </p>
              <div className="fu" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 28 }}>
                {[{ n: "+50", l: "Artistas activos" }, { n: "+250", l: "Canciones producidas" }, { n: "15", l: "Años en el mercado" }, { n: "🌎", l: "Visibilidad internacional" }].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.09)", borderRadius: 10, padding: "12px 8px", textAlign: "center" }}>
                    <div style={{ fontWeight: 900, fontSize: 20, color: "#590707" }}>{s.n}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.38)", letterSpacing: 1, marginTop: 3, textTransform: "uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="btn-red" onClick={() => setPhase("form")}>Quiero mi propuesta →</button>
                <button className="btn-ghost" onClick={() => setPhase("services")} style={{ width: "100%" }}>Ver servicios</button>
              </div>
            </div>
          </div>
          <div style={{ padding: `32px ${P}` }}>
            <div className="tag tag-g" style={{ marginBottom: 12 }}>NUESTRA HISTORIA</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.1, marginBottom: 14, textTransform: "uppercase" }}>15 años construyendo<br />carreras <span style={{ color: "#590707" }}>reales.</span></h2>
            <p style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.78, fontSize: 14, marginBottom: 12 }}>Kapital Music lleva más de 15 años en la industria musical. Hemos trabajado con más de 50 artistas activos y producido más de 250 canciones — con visibilidad que va más allá de las fronteras colombianas.</p>
            <p style={{ color: "rgba(255,255,255,.55)", lineHeight: 1.78, fontSize: 14 }}>No somos solo un estudio o una agencia. Somos el equipo completo que tu carrera necesita: producción, estrategia, legal y marketing, todo bajo un mismo techo.</p>
          </div>

          {/* QUÉ HACEMOS */}
          <div style={{ padding: `0 ${P} 32px` }}>
            <div className="tag tag-g" style={{ marginBottom: 16 }}>SERVICIOS</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginBottom: 20, textTransform: "uppercase" }}>Todo lo que tu carrera<br /><span style={{ color: "#590707" }}>necesita.</span></h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "🎙️", title: "Alquiler de Estudios", desc: "Estudio A premium y Estudio B. Ingenieros certificados, equipos profesionales." },
                { icon: "🎵", title: "Producción Musical", desc: "Con TunyD y Money Makers. Beat, grabación, mezcla y master incluidos." },
                { icon: "🎚️", title: "Mezcla & Mastering", desc: "¿Ya tienes todo grabado? Lo llevamos al nivel internacional que merece." },
                { icon: "📲", title: "Marketing 30", desc: "Estrategia orgánica + pauta Meta + parrilla de contenidos + marca." },
                { icon: "⚖️", title: "Asesoría Legal", desc: "Contratos, registro SAYCO/ACINPRO, distribuidoras. Tu música protegida." },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.52)", lineHeight: 1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* POR QUÉ KAPITAL */}
          <div style={{ background: "rgba(89,7,7,.08)", borderTop: "1px solid rgba(89,7,7,.2)", borderBottom: "1px solid rgba(89,7,7,.2)", padding: `28px ${P}`, marginBottom: 0 }}>
            <div className="tag" style={{ marginBottom: 14 }}>POR QUÉ KAPITAL</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 22, textTransform: "uppercase", lineHeight: 1.1 }}>Lo que nos hace<br />diferentes</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { ico: "🏠", title: "Todo en un solo lugar", desc: "Studio, legal, marketing y producción. Un equipo, cero filas.", stat: "5 servicios", statLabel: "bajo un mismo techo" },
                { ico: "📈", title: "Resultados reales", desc: "Más de 250 canciones producidas con artistas activos.", stat: "+250", statLabel: "canciones producidas" },
                { ico: "🌎", title: "Alcance internacional", desc: "Artistas de toda Latinoamérica. Sesiones virtuales disponibles.", stat: "LATAM", statLabel: "presencia regional" },
                { ico: "⚡", title: "Entrega rápida", desc: "Mezcla y master en 72h. Estrategia lista en la primera semana.", stat: "72h", statLabel: "entrega mezcla & master" },
                { ico: "🤝", title: "Trato directo", desc: "Trabajas con el equipo real desde el primer día.", stat: "+50", statLabel: "artistas activos" },
                { ico: "🏆", title: "15 años de experiencia", desc: "Una década y media construyendo carreras en la industria.", stat: "15", statLabel: "años en el mercado" },
              ].map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 26 }}>{item.ico}</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#590707", lineHeight: 1 }}>{item.stat}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.35)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{item.statLabel}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PARA QUIÉN ES */}
          <div style={{ padding: `28px ${P}` }}>
            <div className="tag tag-g" style={{ marginBottom: 14 }}>¿ES PARA MÍ?</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 16, textTransform: "uppercase", lineHeight: 1.1 }}>Trabajamos con artistas<br />que van en serio</h2>
            {[
              "Artistas emergentes que quieren profesionalizarse",
              "Artistas independientes sin equipo de apoyo",
              "Artistas con fanbase que quieren escalar",
              "Artistas internacionales que buscan producción en Colombia",
              "Artistas con música lista que necesitan estrategia y visibilidad",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#590707", fontWeight: 900, fontSize: 16, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,.7)", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "linear-gradient(135deg,#590707,#2a0303)", padding: `36px ${P}` }}>
            <div className="tag" style={{ marginBottom: 12, background: "rgba(0,0,0,.3)", borderColor: "rgba(255,255,255,.18)", color: "rgba(255,255,255,.6)" }}>¿LISTO?</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, textTransform: "uppercase", lineHeight: 1.1 }}>Construyamos tu carrera juntos</h2>
            <p style={{ color: "rgba(255,255,255,.65)", marginBottom: 22, fontSize: 14, lineHeight: 1.65 }}>Completa el formulario y te armamos una propuesta personalizada con precios exactos. Sin compromisos.</p>
            <button className="btn-white" onClick={() => setPhase("form")}>Comenzar ahora →</button>
          </div>
        </div>
      )}

      {/* ══ SERVICES ══ */}
      {phase === "services" && (
        <div style={{ padding: `24px ${P}` }}>
          <div className="tag tag-g fu" style={{ marginBottom: 12 }}>SERVICIOS</div>
          <h2 className="fu" style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.05, marginBottom: 8 }}>
            Todo lo que necesitas<br /><span style={{ color: "#590707" }}>en un solo lugar.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,.44)", fontSize: 14, marginBottom: 22 }}>Desde grabar tu primera canción hasta lanzarte al mundo.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {SERVICES.map((s, i) => (
              <div key={i}>
                <button className={`srv-item ${activeSrv === i ? "on" : ""}`} onClick={() => setActiveSrv(activeSrv === i ? null : i)} style={{ width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</div>
                      <div style={{ fontSize: 10, color: activeSrv === i ? "rgba(255,120,120,.8)" : "rgba(255,255,255,.3)", marginTop: 2 }}>{s.tag}</div>
                    </div>
                    <span style={{ color: "rgba(255,255,255,.3)", fontSize: 12 }}>{activeSrv === i ? "▲" : "▼"}</span>
                  </div>
                </button>
                {activeSrv === i && (
                  <div className="srv-detail fu">
                    <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                      <div className="tag">{s.tag}</div>
                    </div>
                    <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, lineHeight: 1.75, marginBottom: 14 }}>{s.desc}</p>

                    {s.subsections && s.subsections.map((sub, si) => (
                      <div key={si}>
                        <div className="sub-label">{sub.label}</div>
                        {sub.imgs.length > 0 && (
                          <div className="carousel" style={{ marginBottom: 6 }}>
                            {sub.imgs.map((url, ii) => (
                              <img key={ii} src={url} alt={sub.label + " " + (ii+1)} className="carousel-img" onError={e => { e.target.style.display="none"; }} />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {!s.subsections && s.imgs && s.imgs.length > 0 && (
                      <div className="carousel" style={{ marginBottom: 14 }}>
                        {s.imgs.map((url, ii) => (
                          <img key={ii} src={url} alt={s.title + " " + (ii+1)} className="carousel-img" onError={e => { e.target.style.display="none"; }} />
                        ))}
                      </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                      <button className="btn-red" onClick={() => setPhase("form")}>Solicitar cotización →</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="btn-red" onClick={() => setPhase("form")}>Quiero mi cotización personalizada →</button>
        </div>
      )}

      {/* ══ FORM ══ */}
      {phase === "form" && q && (
        <div style={{ padding: `20px ${P}`, maxWidth: 500, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: 1.5 }}>{q.section} · {currentQ + 1}/{visibleQuestions.length}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{Math.round(progress)}%</div>
          </div>
          <div className="pb"><div className="pf" style={{ width: `${progress}%` }} /></div>

          {/* Banner internacional */}
          {esIntl && q.section === "TUS OBJETIVOS" && (
            <div className="int-banner">
              <span style={{ fontSize: 18 }}>🌎</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#90b8ff", letterSpacing: 1, marginBottom: 3 }}>CLIENTE INTERNACIONAL</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>Para artistas fuera de Colombia ofrecemos sesiones virtuales con precios especiales equivalentes a paquetes de +3 sesiones.</div>
              </div>
            </div>
          )}

          <div key={currentQ} className="fu">
            <div className="tag tag-g" style={{ marginBottom: 12 }}>{q.section}</div>
            <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: q.hint ? 6 : 20, lineHeight: 1.25 }}>
              {q.label}
              {!q.required && <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255,255,255,.28)", marginLeft: 8 }}>(opcional)</span>}
            </h2>
            {q.hint && <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 16 }}>{q.hint}</p>}

            {(q.type === "text" || q.type === "email" || q.type === "tel") && (
              <>
                <input className={`inp ${fieldError ? "err" : ""}`} type={q.type} placeholder={q.placeholder} value={answers[q.id] || ""} onChange={e => { setFieldError(""); setAnswers(a => ({ ...a, [q.id]: e.target.value })); }} autoFocus inputMode={q.type === "tel" ? "tel" : q.type === "email" ? "email" : "text"} />
                {fieldError && <div className="err-msg">⚠ {fieldError}</div>}
              </>
            )}
            {q.type === "textarea" && <textarea className="inp" rows={4} placeholder={q.placeholder} value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} style={{ resize: "none" }} />}
            {q.type === "yesno" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Sí", "No"].map(opt => (
                  <button key={opt} className={`opt ${answers[q.id] === opt ? "sel" : ""}`} onClick={() => setAnswer(opt)}>
                    <div className="ord" /><span style={{ fontWeight: 700 }}>{opt}</span>
                  </button>
                ))}
              </div>
            )}
            {q.type === "single" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map(opt => (
                  <button key={opt} className={`opt ${answers[q.id] === opt ? "sel" : ""}`} onClick={() => setAnswer(opt)}>
                    <div className="ord" /><span>{opt}</span>
                  </button>
                ))}
              </div>
            )}
            {q.type === "multicheck" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.options.map(opt => { const sel = (answers[q.id] || []).includes(opt); return (
                  <button key={opt} className={`opt ${sel ? "sel" : ""}`} onClick={() => setAnswer(opt)}>
                    <div className="ock">{sel ? "✓" : ""}</div><span>{opt}</span>
                  </button>
                ); })}
              </div>
            )}
            {fieldError && q.type !== "text" && q.type !== "email" && q.type !== "tel" && (
              <div className="err-msg" style={{ marginTop: 12 }}>⚠ {fieldError}</div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button className="btn-ghost" onClick={() => { setFieldError(""); setCurrentQ(c => c - 1); }} disabled={currentQ === 0} style={{ flexShrink: 0, padding: "16px 18px" }}>←</button>
            <button className="btn-red" onClick={nextQ} style={{ flex: 1 }}>
              {currentQ === visibleQuestions.length - 1 ? "Ver mi propuesta ✦" : "Siguiente →"}
            </button>
          </div>
        </div>
      )}

      {/* ══ EXTRAS ══ */}
      {phase === "extras" && currentServiceExtras && currentEQ && (
        <div style={{ padding: `20px ${P}`, maxWidth: 500, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", letterSpacing: 1.5 }}>DETALLES · {extrasStep + 1}/{extrasQueue.length}</div>
          </div>
          <div className="pb"><div className="pf" style={{ width: `${(extrasStep / Math.max(extrasQueue.length, 1)) * 100}%` }} /></div>

          <div key={`${extrasStep}-${extrasCurrentQ}`} className="fu">
            <div className="tag" style={{ marginBottom: 12 }}>{currentServiceExtras.split("(")[0].trim().toUpperCase()}</div>
            <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 20, lineHeight: 1.25 }}>{currentEQ.label}</h2>

            {currentEQ.type === "number" ? (
              <div>
                <input className="inp" type="number" placeholder={currentEQ.placeholder} min="4" onChange={e => setExtraText(e.target.value)} style={{ marginBottom: 8 }} inputMode="numeric" />
                <p style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>Mínimo 4 para aplicar el precio con descuento</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {currentEQ.options.map(opt => {
                  let mk = opt;
                  if (currentEQ.id === "estudio") mk = opt.startsWith("Estudio A") ? "A" : "B";
                  if (currentEQ.id === "sesionesEstudio") mk = opt.startsWith("Más") ? 4 : parseInt(opt);
                  if (currentEQ.id === "horasEstudio") mk = opt.startsWith("6") ? 6 : parseInt(opt);
                  if (currentEQ.id === "productora") mk = opt.startsWith("TunyD") ? "tunyD" : "moneyMakers";
                  if (currentEQ.id === "sesionesProduccion") mk = opt.startsWith("Más") ? 4 : parseInt(opt);
                  if (currentEQ.id === "canciones") mk = opt.startsWith("Más") ? 4 : parseInt(opt);
                  return (
                    <button key={opt} className={`opt ${extras[currentEQ.id] === mk ? "sel" : ""}`} onClick={() => setExtraAnswer(opt)}>
                      <div className="ord" /><span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            <button className="btn-ghost" onClick={() => { if (extrasCurrentQ > 0) setExtrasCurrentQ(c => c - 1); else if (extrasStep > 0) { setExtrasStep(s => s - 1); setExtrasCurrentQ(0); } else setPhase("form"); }} style={{ flexShrink: 0, padding: "16px 18px" }}>←</button>
            <button className="btn-red" onClick={nextExtra} disabled={!canNextExtra()} style={{ flex: 1 }}>
              {extrasStep === extrasQueue.length - 1 && extrasCurrentQ === currentExtrasQs.length - 1 ? "Ver mi propuesta ✦" : "Siguiente →"}
            </button>
          </div>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {phase === "loading" && (
        <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div className="spin" style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,.06)", borderTopColor: "#590707", borderRadius: "50%", marginBottom: 22 }} />
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }} className="pulse">{LOAD_MSGS[loadMsg]}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", letterSpacing: 2 }}>KAPITAL MUSIC</div>
        </div>
      )}

      {/* ══ PROPOSAL ══ */}
      {phase === "proposal" && proposal && cotizacion && (
        <div style={{ padding: `16px ${P}`, maxWidth: 500, margin: "0 auto" }}>

          {/* BIENVENIDA */}
          <div className="fu" style={{ position: "relative", background: "linear-gradient(135deg,#590707 0%,#2a0303 55%,#0d0d0d 100%)", borderRadius: 16, padding: "28px 20px", marginBottom: 14, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.02)", pointerEvents: "none" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              <div className="tag" style={{ background: "rgba(0,0,0,.28)", borderColor: "rgba(255,255,255,.16)", color: "rgba(255,255,255,.5)" }}>
                {new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" }).toUpperCase()}
              </div>
              {savedOk && <div className="saved">✓ Guardado</div>}
              {esIntl && <div className="tag tag-int">🌎 INTERNACIONAL</div>}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: "uppercase", lineHeight: .95, marginBottom: 12 }}>{answers.nombre || "Artista"}</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.78)", lineHeight: 1.75 }}>{proposal.bienvenida}</p>
          </div>

          {/* ── ANÁLISIS PROFUNDO ── */}
          <div className="card fu" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <div>
                <div className="tag tag-g" style={{ marginBottom: 6 }}>ANÁLISIS DE CARRERA</div>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>Así vemos tu proyecto</h2>
              </div>
              {proposal.diagnostico?.nivel && (
                <div className="nivel-badge" style={{ color: nivelColor[proposal.diagnostico.nivel] || "#CDC7BD", background: nivelBg[proposal.diagnostico.nivel] || "rgba(115,109,102,.18)", border: `1px solid ${nivelBorder[proposal.diagnostico.nivel] || "rgba(115,109,102,.38)"}` }}>
                  {proposal.diagnostico.nivel}
                </div>
              )}
            </div>

            <p style={{ color: "rgba(255,255,255,.68)", fontSize: 13, lineHeight: 1.75, marginBottom: 18 }}>{proposal.diagnostico?.donde_esta}</p>

            {/* TABLA DE DIAGNÓSTICO */}
            {proposal.diagnostico?.tabla?.length > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,.4)", textTransform: "uppercase", marginBottom: 10 }}>DIAGNÓSTICO POR ÁREA</div>
                <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
                  {/* Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(89,7,7,.25)", padding: "8px 10px" }}>
                    {["Área", "Estado actual", "Con Kapital"].map((h, i) => (
                      <div key={i} style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: "rgba(255,255,255,.55)", textTransform: "uppercase" }}>{h}</div>
                    ))}
                  </div>
                  {/* Rows */}
                  {proposal.diagnostico.tabla.map((row, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "10px", borderTop: "1px solid rgba(255,255,255,.06)", background: i % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent", gap: 4 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{row.area}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,120,120,.8)", lineHeight: 1.4 }}>{row.estado}</div>
                      <div style={{ fontSize: 11, color: "#6be8a0", lineHeight: 1.4 }}>{row.potencial}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LO QUE TE FRENA */}
            {proposal.diagnostico?.que_lo_frena?.length > 0 && (
              <div style={{ background: "rgba(89,7,7,.13)", border: "1px solid rgba(89,7,7,.28)", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#ff8080", marginBottom: 10 }}>🚧 LO QUE TE ESTÁ FRENANDO</div>
                {proposal.diagnostico.que_lo_frena.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, color: "rgba(255,255,255,.78)", fontSize: 13 }}>
                    <span style={{ color: "#590707", fontWeight: 900, flexShrink: 0 }}>→</span>{f}
                  </div>
                ))}
              </div>
            )}

            {/* FORTALEZAS */}
            {proposal.diagnostico?.fortalezas?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#6be8a0", textTransform: "uppercase", marginBottom: 10 }}>✦ LO QUE TIENES A TU FAVOR</div>
                {proposal.diagnostico.fortalezas.map((f, i) => (
                  <div key={i} className="cr">
                    <div className="ci" style={{ background: "rgba(26,143,60,.2)", borderColor: "rgba(26,143,60,.4)", color: "#6be8a0" }}>✓</div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.72)", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ANÁLISIS DE SERVICIOS */}
            {proposal.diagnostico?.analisis_servicios && (
              <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>💡 POR QUÉ ESTOS SERVICIOS</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.72)", lineHeight: 1.65 }}>{proposal.diagnostico.analisis_servicios}</p>
              </div>
            )}

            {/* PASOS A SEGUIR */}
            {proposal.diagnostico?.pasos_a_seguir?.length > 0 && (
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "#590707", textTransform: "uppercase", marginBottom: 12 }}>→ TUS PRÓXIMOS PASOS</div>
                {proposal.diagnostico.pasos_a_seguir.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                    <div className="paso-num">{i + 1}</div>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.78)", lineHeight: 1.6, paddingTop: 4 }}>{p}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── PAQUETE COMPLETO (solo si hay más de 1 servicio) ── */}
          {cotizacion.items.length > 1 && (
            <div className="pkg-box fu" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div className="tag" style={{ marginBottom: 6 }}>PAQUETE COMPLETO</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800 }}>Todos tus servicios juntos</h3>
                </div>
                {cotizacion.ahorro > 0 && (
                  <div style={{ background: "rgba(240,208,96,.15)", border: "1px solid rgba(240,208,96,.4)", borderRadius: 6, padding: "4px 10px", textAlign: "right" }}>
                    <div style={{ fontSize: 9, color: "#f0d060", fontWeight: 800, letterSpacing: 1 }}>AHORRAS</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#f0d060" }}>{fmtFull(cotizacion.ahorro)}</div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 14, lineHeight: 1.5 }}>Al contratar todos los servicios juntos, aplican los precios con promoción automáticamente.</p>

              {/* Tabla comparativa precio individual vs paquete */}
              <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)", marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", background: "rgba(89,7,7,.3)", padding: "8px 12px", gap: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "rgba(255,255,255,.55)" }}>SERVICIO</div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "rgba(255,255,255,.55)", textAlign: "center" }}>INDIVIDUAL</div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "#f0d060", textAlign: "right" }}>PAQUETE</div>
                </div>
                {cotizacion.items.map((item, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", padding: "10px 12px", borderTop: "1px solid rgba(255,255,255,.06)", background: i % 2 === 0 ? "rgba(255,255,255,.02)" : "transparent", gap: 8, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{item.nombre}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{item.detalle}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      {item.promo ? (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", textDecoration: "line-through" }}>{item.precioIndividual}</div>
                      ) : (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>{item.precioIndividual}</div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 900, color: item.promo ? "#f0d060" : "#fff" }}>{item.totalConPromo}</div>
                      {item.promo && item.promoRazon && (
                        <div style={{ fontSize: 9, color: "rgba(240,208,96,.7)", marginTop: 2 }}>↓ {item.promoRazon}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divl" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: "rgba(255,255,255,.38)", marginBottom: 4 }}>TOTAL PAQUETE CON PROMOS</div>
                  {cotizacion.ahorro > 0 && (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", textDecoration: "line-through" }}>{fmtFull(cotizacion.totalBase)} COP</div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{fmtFull(cotizacion.totalPromo)} COP</div>
                </div>
              </div>
            </div>
          )}

          {/* ── PRECIOS INDIVIDUALES (sin promos) ── */}
          <div className="ind-box fu" style={{ marginBottom: 14 }}>
            <div className="tag tag-g" style={{ marginBottom: 10 }}>PRECIOS PARTICULARES</div>
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>¿Quieres empezar con un solo servicio?</h3>
            <p style={{ color: "rgba(255,255,255,.4)", fontSize: 12, lineHeight: 1.6, marginBottom: 14 }}>
              Estos son los precios de cada servicio de manera individual, sin combinar con otros.
            </p>
            {cotizacion.items.map((item, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: 10, padding: "13px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3, color: "#fff" }}>{item.nombre}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginBottom: 4 }}>{item.detalle}</div>
                    {item.precioUnitBase && (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>Tarifa: {item.precioUnitBase}</div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{item.precioIndividual}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.3)", marginTop: 2 }}>Sin combinar</div>
                  </div>
                </div>
              </div>
            ))}
            {esIntl && (
              <div className="int-banner" style={{ marginTop: 10 }}>
                <span>🌎</span>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Precios en COP. Para pagos en USD contáctanos directamente.</div>
              </div>
            )}
          </div>

          {/* MENSAJE FINAL */}
          <div className="fu" style={{ background: "linear-gradient(135deg,#590707,#2a0303)", borderRadius: 14, padding: "24px 20px", textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 18, marginBottom: 10 }}>✦</div>
            <p style={{ fontSize: 15, fontWeight: 600, fontStyle: "italic", color: "rgba(255,255,255,.84)", lineHeight: 1.72 }}>"{proposal.mensajeFinal}"</p>
          </div>

          {/* AGENDAR */}
          <div style={{ background: "linear-gradient(135deg,rgba(26,143,60,.16),rgba(15,77,40,.12))", border: "1px solid rgba(26,143,60,.35)", borderRadius: 14, padding: "20px", marginBottom: 18 }}>
            <div className="tag tag-n" style={{ marginBottom: 10 }}>SIGUIENTE PASO</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>Hablemos y lo cerramos</h3>
            <p style={{ color: "rgba(255,255,255,.52)", fontSize: 13, lineHeight: 1.65, marginBottom: 14 }}>Esta propuesta es la base. En la asesoría ajustamos todo y arrancamos.</p>
            {["Sin costo — sin compromiso", "Respondemos en menos de 24 horas", "Virtual o presencial"].map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "rgba(255,255,255,.62)", marginBottom: 6 }}>
                <span style={{ color: "#6be8a0" }}>✓</span>{b}
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              {!booked ? (<>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-wa" onClick={() => setBooked(true)}>💬 Agenda tu asesoría personalizada</a>
                <a href={mailLink} className="btn-mail" onClick={() => setBooked(true)}>📧 Escríbenos por email</a>
              </>) : (
                <div style={{ background: "rgba(26,143,60,.14)", border: "1px solid rgba(26,143,60,.28)", borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#6be8a0", marginBottom: 4 }}>¡Listo!</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)" }}>Te contactamos en menos de 24 horas.</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <button className="btn-ghost" onClick={reset}>← Volver al inicio</button>
          </div>
        </div>
      )}

      <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: `14px ${P}`, textAlign: "center" }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,.16)", letterSpacing: 1.5 }}>KAPITAL MUSIC © 2026 — contacto@kapitalmusic.co</div>
      </div>
    </div>
  );
}
