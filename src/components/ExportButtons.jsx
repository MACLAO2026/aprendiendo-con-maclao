'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ApaModal = dynamic(() => import('@/components/ApaModal'), { ssr: false });

export default function ExportButtons({ text, filename = 'humanizado', originalDocxFile }) {
  const [open,          setOpen]          = useState(false);
  const [reconstructing, setReconstructing] = useState(false);

  if (!text) return null;

  const handleReconstruct = async () => {
    setReconstructing(true);
    try {
      const form = new FormData();
      form.append('original', originalDocxFile);
      form.append('humanizedText', text);
      form.append('filename', filename);

      const res = await fetch('/api/reconstruct', { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Error al reconstruir');
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `${filename}_humanizado.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setReconstructing(false);
    }
  };

  return (
    <>
      {originalDocxFile && (
        <button
          onClick={handleReconstruct}
          disabled={reconstructing}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold
                     transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.15))',
            color: '#60A5FA',
            border: '1px solid rgba(96,165,250,0.35)',
          }}
        >
          {reconstructing
            ? <span className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: '#60A5FA', borderTopColor: 'transparent' }} />
            : '📄'}
          {reconstructing ? 'Generando...' : 'Word con tablas'}
        </button>
      )}

      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold
                   transition-all duration-200 hover:scale-105 active:scale-100"
        style={{
          background: 'linear-gradient(135deg, rgba(217,70,239,0.15), rgba(155,114,207,0.15))',
          color: '#E879F9',
          border: '1px solid rgba(217,70,239,0.35)',
        }}
      >
        📥 Exportar con APA 7
      </button>

      {open && (
        <ApaModal
          text={text}
          filename={filename}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
