'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ApaModal = dynamic(() => import('@/components/ApaModal'), { ssr: false });

export default function ExportButtons({ text, filename = 'humanizado', originalDocxFile }) {
  const [open,           setOpen]           = useState(false);
  const [reconstructing, setReconstructing] = useState(false);
  const [dlWord,         setDlWord]         = useState(false);
  const [dlPdf,          setDlPdf]          = useState(false);

  if (!text) return null;

  /* ── Descarga directa Word (sin formulario APA) ── */
  const handleWordDirect = async () => {
    setDlWord(true);
    try {
      const { exportToWord } = await import('@/lib/exporter');
      await exportToWord(text, filename);
    } catch (err) {
      alert('Error al generar Word: ' + err.message);
    } finally {
      setDlWord(false);
    }
  };

  /* ── Descarga directa PDF (sin formulario APA) ── */
  const handlePdfDirect = async () => {
    setDlPdf(true);
    try {
      const { exportToPdf } = await import('@/lib/exporter');
      await exportToPdf(text, filename);
    } catch (err) {
      alert('Error al generar PDF: ' + err.message);
    } finally {
      setDlPdf(false);
    }
  };

  /* ── Word con tablas (reconstruye el .docx original) ── */
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
      {/* Word con tablas — solo si se subió un .docx */}
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
            ? <Spinner color="#60A5FA" />
            : '📄'}
          {reconstructing ? 'Generando...' : 'Word con tablas'}
        </button>
      )}

      {/* Descargar Word directo */}
      <button
        onClick={handleWordDirect}
        disabled={dlWord}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold
                   transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.15))',
          color: '#60A5FA',
          border: '1px solid rgba(96,165,250,0.35)',
        }}
      >
        {dlWord ? <Spinner color="#60A5FA" /> : '📝'}
        {dlWord ? 'Generando...' : 'Descargar Word'}
      </button>

      {/* Descargar PDF directo */}
      <button
        onClick={handlePdfDirect}
        disabled={dlPdf}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold
                   transition-all duration-200 hover:scale-105 active:scale-100 disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, rgba(0,200,150,0.15), rgba(0,180,130,0.15))',
          color: '#00C896',
          border: '1px solid rgba(0,200,150,0.35)',
        }}
      >
        {dlPdf ? <Spinner color="#00C896" /> : '🗒️'}
        {dlPdf ? 'Generando...' : 'Descargar PDF'}
      </button>

      {/* Exportar con portada APA 7 */}
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
        📥 Con portada APA 7
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

function Spinner({ color }) {
  return (
    <div className="w-4 h-4 rounded-full border-2 animate-spin"
         style={{ borderColor: color, borderTopColor: 'transparent' }} />
  );
}
