'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ApaModal = dynamic(() => import('@/components/ApaModal'), { ssr: false });

export default function ExportButtons({ text, filename = 'humanizado' }) {
  const [open, setOpen] = useState(false);

  if (!text) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold
                   transition-all duration-200 hover:scale-105 active:scale-100"
        style={{
          background: 'linear-gradient(135deg, rgba(217,70,239,0.15), rgba(168,85,247,0.15))',
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
