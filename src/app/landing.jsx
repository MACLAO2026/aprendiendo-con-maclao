'use client';
import { useState } from 'react';

const PLANS = [
  {
    name: 'Gratis',
    price: '$0',
    period: '',
    desc: 'Para probar el servicio',
    features: ['3 humanizaciones al mes', 'Hasta 500 palabras', 'Exportar a Word y PDF', 'Modo académico'],
    cta: 'Empezar gratis',
    highlight: false,
  },
  {
    name: 'Estudiante',
    price: '$15.000',
    period: '/mes',
    desc: 'Ideal para tesis y trabajos',
    features: ['50 humanizaciones al mes', 'Hasta 5.000 palabras', 'Exportar a Word y PDF', 'Todos los modos', 'Hasta 3 pasadas', 'Norma APA 7 automática'],
    cta: 'Suscribirme',
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$40.000',
    period: '/mes',
    desc: 'Para uso intensivo',
    features: ['Humanizaciones ilimitadas', 'Documentos ilimitados', 'Exportar a Word y PDF', 'Todos los modos', 'Hasta 3 pasadas', 'Norma APA 7 automática', 'Soporte prioritario'],
    cta: 'Suscribirme',
    highlight: false,
  },
];

const PILLARS = [
  { icon: '🎓', label: 'Educación' },
  { icon: '💡', label: 'Innovación' },
  { icon: '📈', label: 'Resultados' },
  { icon: '🤝', label: 'Comunidad' },
];

const FEATURES = [
  { icon: '🔁', title: 'Hasta 3 pasadas de humanización', desc: 'Cuantas más pasadas, más natural suena el texto. Reduce la detección de IA drásticamente.' },
  { icon: '🎓', title: 'Norma APA 7 automática', desc: 'Todos los documentos salen con formato APA 7: márgenes, tipografía, doble espacio y sangría correcta.' },
  { icon: '🏛️', title: '10 áreas de conocimiento', desc: 'Derecho, Medicina, Contaduría, Psicología, Ingeniería y más — vocabulario experto por profesión.' },
  { icon: '📄', title: 'Exporta a Word y PDF', desc: 'Descarga tu texto listo para entregar, con formato profesional incluido.' },
  { icon: '📚', title: 'Soporta documentos largos', desc: 'Procesa tesis completas de más de 20.000 palabras dividiéndolas en fragmentos automáticamente.' },
  { icon: '🔒', title: 'Privacidad total', desc: 'No guardamos tus textos en ningún servidor. Todo se procesa y se olvida.' },
];

const GOLD   = 'linear-gradient(90deg, #F59E0B, #FBBF24)';
const PURPLE = 'linear-gradient(135deg, #9B72CF, #C026D3)';

export default function Landing({ onEnterApp }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: '¿Funciona con Turnitin?', a: 'La app está diseñada para producir texto con patrones de escritura humana. Usa burstiness alta y reformulación estructural profunda. Con 2-3 pasadas y el filtro anti-detector, los resultados mejoran considerablemente.' },
    { q: '¿Mis textos quedan guardados?', a: 'No. El texto se envía a la IA para procesarlo y nunca se almacena en nuestros servidores. El historial solo existe en tu navegador.' },
    { q: '¿Funciona para cualquier materia?', a: 'Sí. Tiene modos Académico, Profesional y Divulgativo, más 10 áreas de conocimiento con vocabulario experto por profesión.' },
    { q: '¿Puedo cargar archivos Word o PDF?', a: 'Sí. Acepta archivos .txt, .docx y .pdf de hasta 50 MB.' },
    { q: '¿Cómo pago?', a: 'Por Nequi al 315 235 4199. Escríbenos por WhatsApp y te confirmamos el plan activado.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0D0020', color: '#F5E6FF' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(13,0,32,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(192,38,211,0.25)',
      }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="url(#navG)"/>
              <circle cx="20" cy="20" r="18.5" stroke="#C026D3" strokeWidth="1.5" fill="none" opacity="0.7"/>
              <polygon points="16,13 28,20 16,27" fill="white"/>
              <defs>
                <radialGradient id="navG" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#5B21B6"/>
                  <stop offset="100%" stopColor="#0D0020"/>
                </radialGradient>
              </defs>
            </svg>
            <div className="leading-none">
              <div className="font-black text-sm text-white">
                Aprendiendo con{' '}
                <span style={{ background: GOLD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>
                  Maclao
                </span>
              </div>
              <div className="text-xs" style={{ color: 'rgba(245,230,255,0.5)' }}>Humanizador de textos con IA</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#precios" className="hidden sm:block text-sm font-bold" style={{ color: 'rgba(245,230,255,0.6)' }}>Precios</a>
            <button onClick={onEnterApp}
                    className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                    style={{ background: PURPLE, boxShadow: '0 0 16px rgba(192,38,211,0.4)' }}>
              Usar ahora — es gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 16px 60px' }}>
        <div style={{ position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:600, height:400, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(ellipse, rgba(155,114,207,0.35) 0%, transparent 70%)', filter:'blur(40px)' }}/>
        <div style={{ position:'absolute', top:40, right:'5%', width:280, height:280, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(ellipse, rgba(192,38,211,0.2) 0%, transparent 70%)', filter:'blur(30px)' }}/>
        <div style={{ position:'absolute', bottom:0, left:'5%', width:220, height:220, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)', filter:'blur(25px)' }}/>

        <div className="max-w-4xl mx-auto text-center" style={{ position:'relative' }}>
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-sm font-bold"
               style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.5)', color:'#FBBF24' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:'#FBBF24' }}/>
            Humanizador de Textos con IA — 0% detección en Turnitin
          </div>

          <h1 className="font-black tracking-tight mb-4 leading-tight"
              style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: 'white' }}>
            Tu texto suena a IA.{' '}
            <span style={{ background: GOLD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Nosotros</span>
            <br/>lo convertimos en{' '}
            <span style={{ background: GOLD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>humano.</span>
          </h1>

          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
             style={{ color: 'rgba(245,230,255,0.7)' }}>
            Humaniza tesis, artículos y trabajos en minutos. Norma APA 7 automática,
            exportación a Word y PDF, filtro anti-detector y vocabulario experto por profesión.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button onClick={onEnterApp}
                    className="w-full sm:w-auto px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105"
                    style={{ background: PURPLE, boxShadow: '0 0 24px rgba(192,38,211,0.5)' }}>
              Humanizar mi texto ahora
            </button>
            <a href="#precios"
               className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-center transition-all hover:scale-105"
               style={{ border:'1px solid rgba(192,38,211,0.45)', color:'rgba(245,230,255,0.8)', background:'rgba(155,114,207,0.12)' }}>
              Ver planes y precios
            </a>
          </div>
          <p className="text-sm" style={{ color:'rgba(245,230,255,0.45)' }}>
            Sin registro · 3 humanizaciones gratis · Resultados inmediatos
          </p>
        </div>
      </section>

      {/* ── 4 Pilares ── */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-3">
          {PILLARS.map(p => (
            <div key={p.label} className="flex flex-col items-center gap-2 py-5 px-2 rounded-2xl text-center transition-all hover:scale-105"
                 style={{ background:'rgba(155,114,207,0.18)', border:'1px solid rgba(192,38,211,0.3)' }}>
              <span className="text-3xl">{p.icon}</span>
              <span className="text-xs font-bold tracking-wide" style={{ color:'#E879F9' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-white">
          Todo lo que necesitas para entregar{' '}
          <span style={{ background: GOLD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>textos impecables</span>
        </h2>
        <p className="text-center text-sm mb-12" style={{ color:'rgba(245,230,255,0.5)' }}>
          Tu éxito es mi compromiso · María Claudia Ortiz Jaramillo
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl transition-all hover:scale-[1.02]"
                 style={{ background:'rgba(155,114,207,0.14)', border:'1px solid rgba(192,38,211,0.25)' }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:'rgba(245,230,255,0.6)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="precios" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-white">Planes y precios</h2>
        <p className="text-center mb-12 text-sm" style={{ color:'rgba(245,230,255,0.5)' }}>Empieza gratis. Actualiza cuando lo necesites.</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <div key={i} className="p-7 rounded-2xl flex flex-col transition-all hover:scale-[1.02]"
                 style={{ position:'relative', background: plan.highlight ? 'rgba(155,114,207,0.28)' : 'rgba(155,114,207,0.12)', border:`1px solid ${plan.highlight ? '#C026D3' : 'rgba(192,38,211,0.25)'}`, boxShadow: plan.highlight ? '0 0 32px rgba(192,38,211,0.3)' : 'none' }}>
              {plan.highlight && (
                <div style={{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)' }}>
                  <span className="px-4 py-1 rounded-full text-xs font-bold"
                        style={{ background:PURPLE, color:'white', boxShadow:'0 0 12px rgba(192,38,211,0.5)' }}>⭐ Más popular</span>
                </div>
              )}
              <div className="mb-4">
                <p className="font-bold text-lg text-white">{plan.name}</p>
                <p className="text-sm mt-0.5" style={{ color:'rgba(245,230,255,0.5)' }}>{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-black" style={{ color: plan.highlight ? '#FBBF24' : 'white' }}>{plan.price}</span>
                <span className="text-sm ml-1" style={{ color:'rgba(245,230,255,0.5)' }}>{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm" style={{ color:'rgba(245,230,255,0.8)' }}>
                    <span style={{ color:'#FBBF24', fontWeight:'bold' }}>✓</span>{feat}
                  </li>
                ))}
              </ul>
              <button onClick={onEnterApp}
                      className="py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:scale-105"
                      style={{ background: plan.highlight ? PURPLE : 'rgba(155,114,207,0.35)', border: plan.highlight ? 'none' : '1px solid rgba(192,38,211,0.4)' }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-white">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden"
                 style={{ background:'rgba(155,114,207,0.14)', border:'1px solid rgba(192,38,211,0.25)' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-3">
                <span className="font-semibold text-sm text-white">{faq.q}</span>
                <span style={{ color:'#E879F9', fontSize:20, flexShrink:0 }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm leading-relaxed" style={{ color:'rgba(245,230,255,0.65)' }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Pago ── */}
      <section className="max-w-2xl mx-auto px-4 py-8">
        <div className="p-8 rounded-2xl text-center"
             style={{ background:'rgba(155,114,207,0.18)', border:'1px solid #C026D3', boxShadow:'0 0 32px rgba(192,38,211,0.2)' }}>
          <h2 className="text-xl font-bold mb-2 text-white">¿Cómo pagar?</h2>
          <p className="text-sm mb-6" style={{ color:'rgba(245,230,255,0.6)' }}>Escríbenos por WhatsApp y te confirmamos el plan activado.</p>
          <div className="inline-block mb-6 px-8 py-4 rounded-2xl"
               style={{ background:'rgba(13,0,32,0.5)', border:'1px solid rgba(192,38,211,0.4)' }}>
            <div className="font-bold text-base text-white">Nequi</div>
            <div className="text-xl font-black mt-1"
                 style={{ background:GOLD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              315 235 4199
            </div>
          </div>
          <br/>
          <a href="https://wa.me/573152354199?text=Hola!%20quiero%20humanizar%20un%20texto%20con%20Aprendiendo%20con%20Maclao"
             target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
             style={{ background:'#25D366', boxShadow:'0 0 16px rgba(37,211,102,0.35)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.554 4.1 1.523 5.828L0 24l6.341-1.498A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.726.879.936-3.617-.235-.372A9.818 9.818 0 1112 21.818z"/>
            </svg>
            Escribir por WhatsApp
          </a>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="max-w-2xl mx-auto px-4 py-10 text-center">
        <button onClick={onEnterApp}
                className="px-10 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-105"
                style={{ background: PURPLE, boxShadow:'0 0 24px rgba(192,38,211,0.5)' }}>
          Humanizar mi texto ahora — es gratis
        </button>
        <p className="mt-3 text-sm" style={{ color:'rgba(245,230,255,0.4)' }}>
          Sin registro · 3 humanizaciones gratis · Resultados inmediatos
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 text-center" style={{ borderTop:'1px solid rgba(192,38,211,0.2)' }}>
        <div className="font-black text-base mb-1 text-white">
          Aprendiendo con{' '}
          <span style={{ background:GOLD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontStyle:'italic' }}>Maclao</span>
        </div>
        <p className="text-xs mb-1" style={{ color:'rgba(245,230,255,0.4)' }}>María Claudia Ortiz Jaramillo · Asesorías Académicas y Empresariales</p>
        <p className="text-xs mb-2" style={{ color:'rgba(245,230,255,0.3)' }}>Conocimiento que inspira, acciones que transforman</p>
        <a href="https://wa.me/573152354199" target="_blank" rel="noopener noreferrer"
           className="text-xs font-semibold" style={{ color:'#E879F9' }}>WhatsApp: 315 235 4199</a>
      </footer>

      {/* ── WhatsApp flotante ── */}
      <a href="https://wa.me/573152354199?text=Hola!%20quiero%20humanizar%20un%20texto%20con%20Aprendiendo%20con%20Maclao"
         target="_blank" rel="noopener noreferrer"
         className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 shadow-lg transition-all hover:scale-105"
         style={{ background:'#25D366', color:'white', fontWeight:600, fontSize:14, boxShadow:'0 4px 20px rgba(37,211,102,0.4)' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.554 4.1 1.523 5.828L0 24l6.341-1.498A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.726.879.936-3.617-.235-.372A9.818 9.818 0 1112 21.818z"/>
        </svg>
        ¡Escríbeme!
      </a>
    </div>
  );
}
