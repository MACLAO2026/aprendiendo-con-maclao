'use client';
import { useState } from 'react';

const FIELD = ({ label, id, value, onChange, placeholder, required }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold mb-1"
           style={{ color: 'var(--muted)' }}>
      {label}{required && <span style={{ color: '#E879F9' }}> *</span>}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      }}
    />
  </div>
);

export default function ApaModal({ text, filename, onClose }) {
  const [loading, setLoading] = useState(null);
  const [meta, setMeta] = useState({
    titulo:      '',
    autor:       '',
    institucion: '',
    facultad:    '',
    curso:       '',
    docente:     '',
    ciudad:      '',
    fecha:       new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
    abstract:    '',
    referencias: '',
  });

  const set = key => val => setMeta(m => ({ ...m, [key]: val }));

  const handle = async (type) => {
    setLoading(type);
    try {
      if (type === 'word') {
        const { exportToWordApa7 } = await import('@/lib/exporter');
        await exportToWordApa7(text, filename, meta);
      } else {
        const { exportToPdfApa7 } = await import('@/lib/exporter');
        await exportToPdfApa7(text, filename, meta);
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error al exportar: ' + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-xl rounded-2xl p-6 overflow-y-auto"
           style={{ maxHeight: '90vh', background: 'var(--surface)', border: '1px solid var(--border)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text)' }}>
              Exportar con Norma APA 7
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Completa los datos para la portada. Solo Título y Autor son obligatorios.
            </p>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:scale-110 transition-all"
                  style={{ background: 'var(--card)', color: 'var(--muted)' }}>
            ✕
          </button>
        </div>

        {/* Portada fields */}
        <div className="space-y-3 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E879F9' }}>
            Datos de portada
          </p>
          <FIELD label="Título del trabajo"       id="titulo"      value={meta.titulo}      onChange={set('titulo')}      placeholder="Ej: Análisis del impacto socioeconómico..."  required />
          <FIELD label="Nombre del autor"         id="autor"       value={meta.autor}       onChange={set('autor')}       placeholder="Ej: María Claudia Ortiz Jaramillo"           required />
          <FIELD label="Universidad / Institución" id="institucion" value={meta.institucion} onChange={set('institucion')} placeholder="Ej: Universidad de Antioquia" />
          <FIELD label="Facultad / Departamento"  id="facultad"    value={meta.facultad}    onChange={set('facultad')}    placeholder="Ej: Facultad de Ciencias de la Educación" />
          <FIELD label="Nombre del curso"         id="curso"       value={meta.curso}       onChange={set('curso')}       placeholder="Ej: Metodología de la Investigación" />
          <FIELD label="Nombre del docente"       id="docente"     value={meta.docente}     onChange={set('docente')}     placeholder="Ej: Dr. Carlos Pérez" />
          <FIELD label="Ciudad"                   id="ciudad"      value={meta.ciudad}      onChange={set('ciudad')}      placeholder="Ej: Medellín, Colombia" />
          <FIELD label="Fecha"                    id="fecha"       value={meta.fecha}        onChange={set('fecha')}       placeholder="Ej: 18 de mayo de 2026" />
        </div>

        {/* Abstract */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#E879F9' }}>
            Resumen / Abstract <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform:'none', letterSpacing:0 }}>(opcional)</span>
          </p>
          <textarea
            value={meta.abstract}
            onChange={e => set('abstract')(e.target.value)}
            placeholder="Escribe aquí el resumen del trabajo (150-250 palabras)..."
            rows={4}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all resize-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit' }}
          />
        </div>

        {/* Referencias */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#E879F9' }}>
            Referencias <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform:'none', letterSpacing:0 }}>(opcional — una por línea)</span>
          </p>
          <textarea
            value={meta.referencias}
            onChange={e => set('referencias')(e.target.value)}
            placeholder={'García, M. (2020). Título del libro. Editorial.\nLópez, A. (2019). Artículo. Revista, 10(2), 45–60.'}
            rows={5}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all resize-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Times New Roman', serif" }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Se aplicará sangría francesa automáticamente (APA 7).
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={() => handle('word')}
            disabled={!!loading || !meta.titulo || !meta.autor}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                       transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'rgba(96,165,250,0.15)', color: 'rgb(96,165,250)', border: '1px solid rgba(96,165,250,0.3)' }}
          >
            {loading === 'word' ? <Spinner color="rgb(96,165,250)" /> : '📄'}
            Descargar Word (.docx)
          </button>
          <button
            onClick={() => handle('pdf')}
            disabled={!!loading || !meta.titulo || !meta.autor}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold
                       transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: 'rgba(0,200,150,0.15)', color: 'rgb(0,200,150)', border: '1px solid rgba(0,200,150,0.3)' }}
          >
            {loading === 'pdf' ? <Spinner color="rgb(0,200,150)" /> : '🗒️'}
            Descargar PDF
          </button>
        </div>

        {(!meta.titulo || !meta.autor) && (
          <p className="text-xs text-center mt-3" style={{ color: '#E879F9' }}>
            Completa Título y Autor para habilitar la descarga.
          </p>
        )}
      </div>
    </div>
  );
}

function Spinner({ color }) {
  return (
    <div className="w-4 h-4 rounded-full border-2 animate-spin"
         style={{ borderColor: color, borderTopColor: 'transparent' }} />
  );
}
