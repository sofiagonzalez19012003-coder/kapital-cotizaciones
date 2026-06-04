import React from 'react';
import { useFormStore } from '../store/useFormStore';
import { fmtFull, WA_NUMBER, esColombiano } from '../utils/businessLogic';

export default function ProposalView() {
  const { 
    answers, 
    cotizacion, 
    proposal, 
    savedOk, 
    booked, 
    setBooked, 
    reset 
  } = useFormStore();

  if (!proposal || !cotizacion) return null;

  const esIntl = answers.ciudad ? !esColombiano(answers.ciudad) : false;

  const nivelColor = { COMENZANDO: "#ff8080", CRECIENDO: "#CDC7BD", ESTABLECIDO: "#6be8a0" };
  const nivelBg = { COMENZANDO: "rgba(89,7,7,.22)", CRECIENDO: "rgba(115,109,102,.18)", ESTABLECIDO: "rgba(26,143,60,.18)" };
  const nivelBorder = { COMENZANDO: "rgba(89,7,7,.45)", CRECIENDO: "rgba(115,109,102,.38)", ESTABLECIDO: "rgba(26,143,60,.38)" };

  const nombre = answers.nombre || "artista";
  const waMsg = encodeURIComponent(`¡Hola ${nombre}! 👋 Soy del equipo de Kapital Music.\n\nVimos que completaste tu formulario y ya tenemos tu propuesta lista. Queremos conectar contigo personalmente para resolver todas tus dudas y mostrarte exactamente cómo podemos impulsar tu carrera.\n\n¿Cuándo tienes 20 minutos para una llamada rápida? 🎵\n\n— Equipo Kapital Music`);
  const waLink = `https://wa.me/${WA_NUMBER}?text=${waMsg}`;
  const mailLink = 'https://mail.google.com/mail/?view=cm&to=contacto@kapitalmusic.co&su=' + encodeURIComponent('Propuesta — ' + nombre) + '&body=' + encodeURIComponent('Hola equipo Kapital,\n\nSoy ' + nombre + ' y acabo de ver mi propuesta.\n\nWhatsApp: ' + (answers.telefono || ''));

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-4 flex flex-col gap-6 pointer-events-auto animate-[fu_0.38s_ease-out]">
      
      {/* Welcome Card */}
      <div className="relative bg-gradient-to-br from-[#590707] to-[#0d0d0d] border border-[#590707]/30 rounded-3xl p-7 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/[0.02] pointer-events-none" />
        
        <div className="flex flex-wrap gap-2.5 mb-4">
          <span className="bg-black/30 border border-white/10 text-white/50 text-[9px] font-extrabold tracking-wider px-3 py-1 rounded-md uppercase">
            {new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" }).toUpperCase()}
          </span>
          {savedOk && <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 text-[9px] font-extrabold tracking-wider px-3 py-1 rounded-md uppercase">✓ Guardado</span>}
          {esIntl && <span className="bg-[#5078c8]/20 border border-[#5078c8]/45 text-[#90b8ff] text-[9px] font-extrabold tracking-wider px-3 py-1 rounded-md uppercase">🌎 INTERNACIONAL</span>}
        </div>
        
        <h1 className="text-3xl font-black uppercase text-white tracking-tight leading-none mb-3">
          {answers.nombre || "Artista"}
        </h1>
        <p className="text-sm text-white/80 leading-relaxed">
          {proposal.bienvenida}
        </p>
      </div>

      {/* Deep Analysis Card */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-white/5 pb-4">
          <div>
            <span className="inline-block bg-white/5 border border-white/10 text-white/40 text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded uppercase mb-1.5">
              ANÁLISIS DE CARRERA
            </span>
            <h2 className="text-lg font-black text-white leading-none">Así vemos tu proyecto</h2>
          </div>
          {proposal.diagnostico?.nivel && (
            <span 
              style={{ 
                color: nivelColor[proposal.diagnostico.nivel] || "#CDC7BD", 
                backgroundColor: nivelBg[proposal.diagnostico.nivel] || "rgba(115,109,102,.18)", 
                borderColor: nivelBorder[proposal.diagnostico.nivel] || "rgba(115,109,102,.38)" 
              }} 
              className="text-xs font-black px-3 py-1 rounded border tracking-wider"
            >
              {proposal.diagnostico.nivel}
            </span>
          )}
        </div>

        <p className="text-sm text-white/70 leading-relaxed italic border-l-2 border-[#C0392B] pl-4">
          "{proposal.diagnostico?.donde_esta}"
        </p>

        {/* Diagnosis Table */}
        {proposal.diagnostico?.tabla?.length > 0 && (
          <div>
            <div className="text-[10px] font-black tracking-widest text-white/40 uppercase mb-3.5">📊 Tu panorama actual</div>
            <div className="flex flex-col gap-3">
              {proposal.diagnostico.tabla.map((row, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-2">
                  <div className="text-xs font-black text-white">{row.area}</div>
                  <div className="flex gap-2.5 flex-wrap items-center text-xs text-white/60">
                    <span className="text-[11px] font-bold text-red-300 bg-red-950/20 border border-red-500/30 rounded px-2 py-0.5">{row.estado}</span>
                    <span className="text-white/30">→</span>
                    <span className="text-emerald-400 font-medium leading-tight flex-1">{row.potencial}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blockers */}
        {proposal.diagnostico?.que_lo_frena?.length > 0 && (
          <div className="bg-[#590707]/12 border border-[#590707]/30 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-[10px] font-black tracking-widest text-[#ff8080] uppercase flex items-center gap-1.5">
              🚧 Lo que te está frenando hoy
            </div>
            <div className="flex flex-col gap-2">
              {proposal.diagnostico.que_lo_frena.map((f, i) => (
                <div key={i} className="flex gap-2 text-xs text-white/85 leading-relaxed align-start">
                  <span className="text-[#ff8080] font-bold">•</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {proposal.diagnostico?.fortalezas?.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-black tracking-widest text-[#6be8a0] uppercase">
              ✦ Lo que ya tienes a tu favor
            </div>
            <div className="flex flex-col gap-2.5">
              {proposal.diagnostico.fortalezas.map((f, i) => (
                <div key={i} className="flex gap-3 items-start text-xs text-white/80 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/35 flex items-center justify-center text-[10px] text-emerald-400 font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* First Steps */}
        {proposal.diagnostico?.pasos_a_seguir?.length > 0 && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
            <div className="text-[10px] font-black tracking-widest text-white/50 uppercase">
              → Por dónde arrancar
            </div>
            <div className="flex flex-col gap-3.5">
              {proposal.diagnostico.pasos_a_seguir.slice(0, 4).map((p, i) => (
                <div key={i} className="flex gap-3.5 items-start text-xs text-white/80 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-[#590707] flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Package Deal comparative table */}
      {cotizacion.items.length > 1 && (
        <div className="bg-gradient-to-br from-[#590707]/20 to-black/80 border border-[#590707]/30 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div>
              <span className="inline-block bg-[#C0392B]/20 border border-[#C0392B]/50 text-[#ff9999] text-[9px] font-black tracking-widest px-2.5 py-1 rounded uppercase mb-1.5">
                PAQUETE COMPLETO
              </span>
              <h3 className="text-base font-black text-white">Todos tus servicios juntos</h3>
            </div>
            {cotizacion.ahorro > 0 && (
              <div className="bg-[#f0d060]/10 border border-[#f0d060]/35 rounded px-2.5 py-1 text-right">
                <div className="text-[9px] text-[#f0d060] font-black tracking-widest leading-none">AHORRAS</div>
                <div className="text-base font-black text-[#f0d060] mt-1">{fmtFull(cotizacion.ahorro)}</div>
              </div>
            )}
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed mb-1">
            Al contratar todos los servicios juntos, aplican los precios con promoción automáticamente.
          </p>

          <div className="rounded-xl overflow-hidden border border-white/5">
            <div className="grid grid-cols-[1fr_auto_auto] bg-[#590707]/25 p-3 gap-3">
              <div className="text-[9px] font-black tracking-wider text-white/50">SERVICIO</div>
              <div className="text-[9px] font-black tracking-wider text-white/50 text-center">INDIVIDUAL</div>
              <div className="text-[9px] font-black tracking-wider text-[#f0d060] text-right">PAQUETE</div>
            </div>
            {cotizacion.items.map((item, i) => (
              <div key={i} className={`grid grid-cols-[1fr_auto_auto] p-3 border-t border-white/5 gap-3 items-center text-xs ${
                i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
              }`}>
                <div>
                  <div className="font-extrabold text-white leading-tight">{item.nombre}</div>
                  <div className="text-[10px] text-white/40 mt-1">{item.detalle}</div>
                </div>
                <div className="text-center">
                  {item.promo ? (
                    <span className="text-white/30 line-through">{item.precioIndividual}</span>
                  ) : (
                    <span className="text-white/60">{item.precioIndividual}</span>
                  )}
                </div>
                <div className="text-right">
                  <div className={`font-black ${item.promo ? 'text-[#f0d060]' : 'text-white'}`}>{item.totalConPromo}</div>
                  {item.promo && item.promoRazon && (
                    <div className="text-[9px] text-[#f0d060]/70 mt-1">↓ {item.promoRazon}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="h-[1px] bg-white/5 my-2" />
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[9px] font-black tracking-widest text-white/30 mb-1">TOTAL PAQUETE CON PROMOS</div>
              {cotizacion.ahorro > 0 && (
                <div className="text-xs text-white/35 line-through">{fmtFull(cotizacion.totalBase)} COP</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-white">{fmtFull(cotizacion.totalPromo)} COP</div>
            </div>
          </div>
        </div>
      )}

      {/* Particular/Individual prices */}
      <div className="bg-white/[0.02] border border-white/15 rounded-2xl p-6">
        <span className="inline-block bg-white/5 border border-white/10 text-white/40 text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded uppercase mb-2">
          PRECIOS PARTICULARES
        </span>
        <h3 className="text-sm font-black text-white mb-1.5">¿Quieres empezar con un solo servicio?</h3>
        <p className="text-[11px] text-white/40 leading-relaxed mb-4">
          Estos son los precios de cada servicio de manera individual, sin combinar con otros.
        </p>
        
        <div className="flex flex-col gap-3">
          {cotizacion.items.map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 flex justify-between gap-3 items-center">
              <div>
                <div className="font-extrabold text-xs text-white">{item.nombre}</div>
                <div className="text-[10px] text-white/45 mt-0.5">{item.detalle}</div>
                {item.precioUnitBase && (
                  <div className="text-[9px] text-white/30 mt-1">Tarifa: {item.precioUnitBase}</div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-black text-sm text-white">{item.precioIndividual}</div>
                <div className="text-[9px] text-white/30 mt-0.5">Sin combinar</div>
              </div>
            </div>
          ))}
        </div>

        {esIntl && (
          <div className="flex gap-2.5 bg-[#5078c8]/15 border border-[#5078c8]/35 rounded-xl p-3 mt-4 items-center">
            <span>🌎</span>
            <div className="text-xs text-white/60">Precios en COP. Para pagos en USD contáctanos directamente.</div>
          </div>
        )}
      </div>

      {/* Final message */}
      <div className="bg-gradient-to-r from-[#590707] to-[#2a0303] rounded-2xl p-6 text-center">
        <div className="text-lg mb-2">✦</div>
        <p className="text-xs font-semibold italic text-white/90 leading-relaxed">
          "{proposal.mensajeFinal}"
        </p>
      </div>

      {/* Action Schedule / Whatsapp */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-950/5 border border-emerald-500/30 rounded-2xl p-6 flex flex-col gap-4">
        <span className="self-start bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[9px] font-extrabold tracking-widest px-2.5 py-1 rounded uppercase">
          SIGUIENTE PASO
        </span>
        <h3 className="text-base font-black text-white">Hablemos y lo cerramos</h3>
        <p className="text-xs text-white/60 leading-relaxed">Esta propuesta es la base. En la asesoría ajustamos todo y arrancamos.</p>
        
        <div className="flex flex-col gap-2">
          {["Sin costo — sin compromiso", "Respondemos en menos de 24 horas", "Virtual o presencial"].map((b, i) => (
            <div key={i} className="flex gap-2.5 items-center text-xs text-white/70">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-3">
          {!booked ? (
            <>
              <a 
                href={waLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-gradient-to-r from-[#1a8f3c] to-[#0f6628] hover:from-[#20a348] hover:to-[#127730] text-white font-extrabold uppercase text-center tracking-wider py-4 rounded-xl text-xs transition-all pointer-events-auto"
                onClick={() => setBooked(true)}
              >
                💬 Agenda tu asesoría personalizada
              </a>
              <a 
                href={mailLink} 
                className="bg-gradient-to-r from-[#1a5090] to-[#0f3860] hover:from-[#2161ac] hover:to-[#124577] text-white font-extrabold uppercase text-center tracking-wider py-4 rounded-xl text-xs transition-all pointer-events-auto"
                onClick={() => setBooked(true)}
              >
                📧 Escríbenos por email
              </a>
            </>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-5 text-center flex flex-col items-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm font-bold text-emerald-400 mb-1">¡Listo!</div>
              <div className="text-xs text-white/40">Te contactamos en menos de 24 horas.</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-2 mb-6">
        <button 
          onClick={reset}
          className="backdrop-blur-sm bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl px-6 py-3 text-xs font-bold text-white/50 tracking-wider uppercase transition-all active:scale-95 pointer-events-auto"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  );
}
