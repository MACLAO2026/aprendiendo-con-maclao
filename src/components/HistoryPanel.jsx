'use client';
import { useState } from 'react';

const MODE_LABELS = {
  academic:     { label: 'Académico',     color: '96,165,250' },
  professional: { label: 'Profesional',   color: '0,200,150'  },
  casual:       { label: 'Divulgativo',   color: '245,158,11' },
};

export default function HistoryPanel({ history, onLoad, onDelete, onClear }) {
  const [selected, setSelected] = useState(null);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
             style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
               stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Sin historial aún</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Los textos humanizados aparecerán aquí automáticamente.
          </p>
        </div>
      </div>
    );
  }

  const entry = selected ? history.find(h => h.id === selected) : null;

  return (
    <div className="flex gap-6 animate-fade-in" style={{ minHeight: 400 }}>

      {/* List */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
            {history.length} entrada{history.length !== 1 ? 's' : ''}
          </h3>
          <button onClick={onClear} className="text-xs btn-ghost px-3 py-1.5"
                  style={{ color: '#F43F5E', borderColor: 'rgba(244,63,94,0.2)' }}>
            Limpiar todo
          </button>
        </div>

        {history.map(item => {
          const m = MODE_LABELS[item.mode] || MODE_LABELS.academic;
          const date = new Date(item.timestamp).toLocaleDateString('es-CO', {
            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
          });

          return (
            <div
              key={item.id}
              onClick={() => setSelected(item.id === selected ? null : item.id)}
              className="rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
              style={{
                background:   item.id === selected ? 'var(--surface)' : 'var(--card)',
                border:       `1px solid ${item.id === selected ? '#00C896' : 'var(--border)'}`,
                boxShadow:    item.id === selected ? '0 0 0 1px rgba(0,200,150,0.2)' : 'none',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text)' }}>
                    {item.preview}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="badge" style={{
                      background: `rgba(${m.color},0.1)`,
                      color: `rgb(${m.color})`,
                      fontSize: '11px', padding: '2px 8px'
                    }}>
                      {m.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {item.wordCount.toLocaleString()} palabras
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{date}</span>
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                             hover:bg-red-500/10 transition-colors"
                  style={{ color: 'var(--muted)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              {item.id === selected && (
                <div className="mt-3 pt-3 flex gap-2 animate-fade-in"
                     style={{ borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => onLoad(item.original, item.result)}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Cargar en editor
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview panel */}
      {entry && (
        <div className="hidden lg:flex flex-col w-80 xl:w-96 gap-3 animate-fade-in">
          <div className="card p-4 flex-1 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide mb-3"
               style={{ color: 'var(--muted)' }}>
              Vista previa
            </p>
            <p className="text-sm leading-relaxed flex-1 overflow-y-auto"
               style={{ color: 'var(--text)', whiteSpace: 'pre-wrap', maxHeight: 340 }}>
              {entry.result}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
