'use client';
import { useState } from 'react';
import WordCounter from './WordCounter';

export default function ComparePanel({ original, result }) {
  const [view, setView] = useState('split'); // split | original | result

  const tabs = [
    { id: 'split',    label: 'Comparar' },
    { id: 'original', label: 'Original' },
    { id: 'result',   label: 'Humanizado' },
  ];

  const Panel = ({ text, label, accent }) => (
    <div className="flex flex-col flex-1 min-w-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold tracking-wide uppercase"
              style={{ color: accent }}>
          {label}
        </span>
        <WordCounter text={text} />
      </div>
      <div
        className="flex-1 rounded-xl p-4 text-sm leading-relaxed overflow-y-auto"
        style={{
          background: 'var(--surface)',
          border: `1px solid var(--border)`,
          minHeight: 320,
          maxHeight: 520,
          color: 'var(--text)',
          whiteSpace: 'pre-wrap',
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '12pt',
          lineHeight: 2,
        }}
      >
        {text || <span style={{ color: 'var(--muted)' }}>Sin contenido</span>}
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up space-y-4">
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl self-start"
           style={{ background: 'var(--card)', border: '1px solid var(--border)', display: 'inline-flex' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setView(t.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: view === t.id ? 'var(--surface)' : 'transparent',
              color:      view === t.id ? 'var(--text)'    : 'var(--muted)',
              boxShadow:  view === t.id ? '0 1px 4px rgba(0,0,0,0.2)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`flex gap-4 ${view === 'split' ? 'flex-row' : 'flex-col'}`}>
        {(view === 'split' || view === 'original') && (
          <Panel text={original} label="Texto original" accent="var(--muted)" />
        )}
        {(view === 'split' || view === 'result') && (
          <Panel text={result}   label="Humanizado"     accent="#00C896"       />
        )}
      </div>

      {/* Copy result button */}
      {result && (
        <div className="flex justify-end">
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="flex items-center gap-2 btn-ghost text-xs"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="#00C896" strokeWidth="2.5" strokeLinecap="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          <span style={{ color: '#00C896' }}>Copiado</span>
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
          Copiar resultado
        </>
      )}
    </button>
  );
}
