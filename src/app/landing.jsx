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

const FEATURES = [
  { icon: '🎓', title: 'Norma APA 7 automática', desc: 'Todos los documentos salen con formato APA 7: márgenes, tipografía, doble espacio y sangría correcta.' },
  { icon: '🔁', title: 'Hasta 3 pasadas de humanización', desc: 'Cuantas más pasadas, más natural suena el texto. Reduce la detección de IA drásticamente.' },
  { icon: '📄', title: 'Exporta a Word y PDF', desc: 'Descarga tu texto listo para entregar, con formato profesional incluido.' },
  { icon: '🔒', title: 'Privacidad total', desc: 'No guardamos tus textos en ningún servidor. Todo se procesa y se olvida.' },
  { icon: '📚', title: 'Soporta documentos largos', desc: 'Procesa tesis completas de más de 20.000 palabras dividiéndolas en fragmentos automáticamente.' },
  { icon: '⚡', title: 'Resultados en minutos', desc: 'Un documento de 3.000 palabras queda listo en menos de 2 minutos.' },
];

export default function Landing({ onEnterApp }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: '¿Funciona con Turnitin?', a: 'La app está diseñada para producir texto con patrones de escritura humana. Usa burstiness alta y reformulación estructural profunda. Los resultados varían según el texto original, pero con 2-3 pasadas la detección baja considerablemente.' },
    { q: '¿Mis textos quedan guardados en algún lado?', a: 'No. El texto se envía a la IA para procesarlo y nunca se almacena en nuestros servidores. El historial solo existe en tu navegador.' },
    { q: '¿Funciona para cualquier materia?', a: 'Sí. Tiene tres modos: Académico (tesis, artículos), Profesional (informes, propuestas) y Divulgativo (blogs, noticias).' },
    { q: '¿Puedo cargar archivos Word o PDF?', a: 'Sí. Acepta archivos .txt, .docx y .pdf de hasta 50 MB.' },
    { q: '¿Cómo pago?', a: 'Próximamente habilitaremos PSE, tarjeta débito/crédito y Nequi a través de Wompi.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b"
           style={{ background: 'rgba(253,244,255,0.85)', backdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #D946EF, #A855F7)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" opacity="0.95"/>
                <path d="M2 16l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
              </svg>
            </div>
            <div className="leading-none">
              <div className="font-bold text-base" style={{ color: 'var(--text)' }}>
                Aprendiendo con <span style={{ color: '#D946EF' }}>Maclao</span>
              </div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Humanizador de textos</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#precios" className="hidden sm:block text-sm font-medium"
               style={{ color: 'var(--muted)' }}>Precios</a>
            <button onClick={onEnterApp} className="btn-primary px-5 py-2 text-sm">
              Usar ahora — es gratis
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 badge badge-mint mb-6 text-sm px-4 py-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D946EF' }}/>
          Nuevo: norma APA 7 automática en todas las exportaciones
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight"
            style={{ color: 'var(--text)' }}>
          Tu texto de IA,{' '}
          <span style={{
            background: 'linear-gradient(135deg, #D946EF, #A855F7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            reescrito como humano
          </span>
        </h1>

        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
           style={{ color: 'var(--muted)' }}>
          Humaniza tesis, artículos y trabajos en minutos. Norma APA 7 automática,
          exportación a Word y PDF, y hasta 3 pasadas de humanización para resultados óptimos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={onEnterApp}
                  className="btn-primary px-10 py-4 text-base w-full sm:w-auto">
            Humanizar mi texto ahora
          </button>
          <a href="#precios"
             className="btn-ghost px-8 py-4 text-base w-full sm:w-auto text-center">
            Ver planes y precios
          </a>
        </div>

        <p className="mt-5 text-sm" style={{ color: 'var(--muted)' }}>
          Sin registro · 3 humanizaciones gratis · Resultados inmediatos
        </p>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12"
            style={{ color: 'var(--text)' }}>
          Todo lo que necesitas para entregar{' '}
          <span style={{ color: '#D946EF' }}>textos impecables</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className="card p-6 hover:scale-[1.02] transition-transform duration-200"
                 style={{ borderColor: 'var(--border)' }}>
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="precios" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4"
            style={{ color: 'var(--text)' }}>
          Planes y precios
        </h2>
        <p className="text-center mb-12" style={{ color: 'var(--muted)' }}>
          Empieza gratis. Actualiza cuando lo necesites.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <div key={i}
                 className="card p-7 flex flex-col transition-transform duration-200 hover:scale-[1.02]"
                 style={{
                   borderColor: plan.highlight ? '#D946EF' : 'var(--border)',
                   boxShadow:   plan.highlight ? '0 0 0 2px rgba(217,70,239,0.25)' : 'none',
                   position:    'relative',
                 }}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="badge badge-mint text-xs px-4 py-1">Más popular</span>
                </div>
              )}
              <div className="mb-4">
                <p className="font-bold text-lg" style={{ color: 'var(--text)' }}>{plan.name}</p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: plan.highlight ? '#D946EF' : 'var(--text)' }}>
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: 'var(--muted)' }}>{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                    <span style={{ color: '#D946EF', fontWeight: 'bold' }}>✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <button onClick={onEnterApp}
                      className={plan.highlight ? 'btn-primary py-3 text-sm' : 'btn-ghost py-3 text-sm'}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--text)' }}>
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-4 text-left flex items-center justify-between gap-3"
              >
                <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{faq.q}</span>
                <span style={{ color: '#D946EF', fontSize: 20, flexShrink: 0 }}>
                  {openFaq === i ? '−' : '+'}
                </span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm leading-relaxed animate-fade-in"
                     style={{ color: 'var(--muted)' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card p-10"
             style={{ borderColor: '#D946EF', boxShadow: '0 0 0 1px rgba(217,70,239,0.15)' }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>
            ¿Listo para empezar?
          </h2>
          <p className="mb-7" style={{ color: 'var(--muted)' }}>
            3 humanizaciones gratis. Sin registro. Sin tarjeta de crédito.
          </p>
          <button onClick={onEnterApp} className="btn-primary px-10 py-4 text-base">
            Humanizar mi texto ahora
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>
          Aprendiendo con <span style={{ color: '#D946EF' }}>Maclao</span>
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Humanizador de textos · Norma APA 7 · Privacidad total
        </p>
              <a href="https://wa.me/573152354199?text=Hola!%20quiero%20humanizar%20un%20texto" target="_blank" rel="noopener noreferrer" style={{ position:'fixed', bottom:24, right:24, zIndex:9999, background:'#25D366', color:'white', fontWeight:600, fontSize:14, borderRadius:50, padding:'12px 20px', textDecoration:'none', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>💬 ¡Escríbeme!</a>
      </footer>
    </div>
  );
}
