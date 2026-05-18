'use client';
import { useMemo } from 'react';
import { countWords, countChars } from '@/lib/chunker';

export default function WordCounter({ text, label = '' }) {
  const words = useMemo(() => countWords(text || ''), [text]);
  const chars = useMemo(() => countChars(text || ''), [text]);

  if (!text) return null;

  return (
    <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
      {label && <span className="font-medium" style={{ color: 'var(--dim)' }}>{label}</span>}
      <span>
        <strong style={{ color: 'var(--text)' }}>{words.toLocaleString()}</strong>{' '}
        palabra{words !== 1 ? 's' : ''}
      </span>
      <span className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
      <span>
        <strong style={{ color: 'var(--text)' }}>{chars.toLocaleString()}</strong>{' '}
        car.
      </span>
    </div>
  );
}
