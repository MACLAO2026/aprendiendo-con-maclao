'use client';
import { useState } from 'react';

export default function ExportButtons({ text, filename = 'humanizado' }) {
  const [loading, setLoading] = useState(null);

  if (!text) return null;

  const handle = async (type) => {
    setLoading(type);
    try {
      if (type === 'word') {
        const { exportToWord } = await import('@/lib/exporter');
        await exportToWord(text, filename);
      } else {
        const { exportToPdf } = await import('@/lib/exporter');
        await exportToPdf(text, filename);
      }
    } catch (err) {
      console.error(err);
      alert('Error al exportar: ' + err.message);
    } finally {
      setLoading(null);
    }
  };

  const Btn = ({ type, icon, label, color }) => (
    <button
      onClick={() => handle(type)}
      disabled={!!loading}
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium
                 transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-100"
      style={{
        background: `rgba(${color},0.12)`,
        color:      `rgb(${color})`,
        border:     `1px solid rgba(${color},0.2)`,
      }}
    >
      {loading === type ? (
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
             style={{ borderColor: `rgb(${color})`, borderTopColor: 'transparent' }}/>
      ) : (
        <span>{icon}</span>
      )}
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-medium mr-1" style={{ color: 'var(--muted)' }}>Exportar:</span>
      <Btn type="word" icon="📄" label="Word (.docx)" color="96,165,250" />
      <Btn type="pdf"  icon="🗒️" label="PDF"          color="0,200,150"  />
    </div>
  );
}
