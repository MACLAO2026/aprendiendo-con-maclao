'use client';
import { useState, useCallback, useRef } from 'react';
import { splitIntoChunks, joinChunks } from '@/lib/chunker';

/**
 * Remove editorial notes and deduplicate repeated signature phrases added by the model.
 * Each imperfection phrase should appear at most once in the full document.
 */
function removeRepeatedPatterns(text) {
  // Remove editorial notes the model sometimes adds
  let cleaned = text
    .replace(/\(Nota:[^)]{0,300}\)/gi, '')
    .replace(/\(Se ha[^)]{0,200}\)/gi, '')
    .replace(/\(Cambios[^)]{0,200}\)/gi, '')
    .replace(/\(Los cambios[^)]{0,200}\)/gi, '')
    .replace(/\(Se han realizado[^)]{0,300}\)/gi, '');

  // Remove fake numbered footnote markers like (1), (2), (3) that aren't real citations
  // Real citations look like (Author, year) — we only remove standalone single-digit markers
  cleaned = cleaned.replace(/\((\d)\)(?!\s*[A-Za-záéíóúÁÉÍÓÚñÑ])/g, '');

  // Deduplicate repeated imperfection phrases — keep only the first occurrence
  const signaturePhrases = [
    /[Yy] eso,?\s+en la pr[aá]ctica,?\s+no es (un detalle|menor)[^.]*\./g,
    /[Ee]so merece detenerse[^.]*\./g,
    /[Yy] eso,?\s+en la pr[aá]ctica,?\s+no es (poco|trivial|menor)[^.]*\./g,
    /[Nn]o es (un detalle|un asunto|una cuestión) menor[^.]*\./g,
    /[Ee]so,?\s+en t[eé]rminos pr[aá]cticos,?\s+no es[^.]*\./g,
  ];

  for (const pattern of signaturePhrases) {
    let count = 0;
    cleaned = cleaned.replace(pattern, (match) => {
      count++;
      return count === 1 ? match : '';
    });
  }

  // Clean up any double spaces or blank lines created by removals
  cleaned = cleaned
    .replace(/  +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

/**
 * Core humanization hook.
 * Handles chunking, sequential API calls, progress tracking and cancellation.
 */
export function useHumanizer() {
  const [status,   setStatus]   = useState('idle');   // idle | processing | done | error
  const [progress, setProgress] = useState(0);        // 0–100
  const [step,     setStep]     = useState('');        // human-readable current step
  const [result,   setResult]   = useState('');
  const [error,    setError]    = useState(null);

  const abortRef = useRef(false);

  /**
   * Main humanization entry point.
   * @param {string} text   Full input text
   * @param {string} mode   'academic' | 'professional' | 'casual'
   */
  const humanize = useCallback(async (text, mode = 'academic', passes = 1, profession = '') => {
    if (!text.trim()) return;

    abortRef.current = false;
    setStatus('processing');
    setProgress(0);
    setError(null);
    setResult('');

    try {
      let currentText = text;

      for (let pass = 0; pass < passes; pass++) {
        if (abortRef.current) {
          setStatus('idle');
          setStep('Cancelado por el usuario.');
          return;
        }

        const passLabel = passes > 1 ? ` (pasada ${pass + 1} de ${passes})` : '';

        // 1. Split text into chunks
        setStep(`Dividiendo texto en fragmentos…${passLabel}`);
        const chunks = splitIntoChunks(currentText);
        const total  = chunks.length;

        setStep(`${total} fragmento${total !== 1 ? 's' : ''} detectado${total !== 1 ? 's' : ''}. Iniciando procesamiento…${passLabel}`);

        const results = new Array(total).fill('');

        // 2. Process each chunk sequentially
        for (let i = 0; i < total; i++) {
          if (abortRef.current) {
            setStatus('idle');
            setStep('Cancelado por el usuario.');
            return;
          }

          setStep(`Humanizando fragmento ${i + 1} de ${total}…${passLabel}`);

          // Progress: distribute evenly across all passes
          const passBase    = (pass / passes) * 90;
          const passShare   = (1 / passes) * 90;
          const chunkProgress = passBase + Math.round((i / total) * passShare);
          setProgress(chunkProgress);

          const res = await fetch('/api/humanize', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ chunk: chunks[i], index: i, total, mode, pass, passes, profession }),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => '');
            let msg = `HTTP ${res.status}`;
            try { msg = JSON.parse(text).error || msg; } catch { if (text) msg = text.slice(0, 150); }
            throw new Error(msg);
          }

          const data = await res.json();
          results[i] = data.result;

          const chunkDone = passBase + Math.round(((i + 1) / total) * passShare);
          setProgress(chunkDone);

          if (i < total - 1) await new Promise(r => setTimeout(r, 6000));
        }

        // 3. Join results — output becomes input for next pass
        setStep(`Uniendo fragmentos…${passLabel}`);
        const joined = joinChunks(results);
        currentText = joined
          .replace(/—/g, ',').replace(/–/g, ',')
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\*(.+?)\*/g, '$1')
          .replace(/\*/g, '');
      }

      // 4. Pasada final anti-detector (siempre, independiente de las pasadas elegidas)
      if (!abortRef.current) {
        setStep('Aplicando filtro anti-detector…');
        setProgress(93);

        const antiChunks = splitIntoChunks(currentText);
        const antiResults = new Array(antiChunks.length).fill('');

        for (let i = 0; i < antiChunks.length; i++) {
          if (abortRef.current) break;

          const res = await fetch('/api/humanize', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              chunk:   antiChunks[i],
              index:   i,
              total:   antiChunks.length,
              mode,
              pass:    99,
              passes:  100,
              profession,
            }),
          });

          if (!res.ok) {
            const text = await res.text().catch(() => '');
            let msg = `HTTP ${res.status}`;
            try { msg = JSON.parse(text).error || msg; } catch { if (text) msg = text.slice(0, 150); }
            throw new Error(msg);
          }

          const data = await res.json();
          antiResults[i] = data.result;
          setProgress(93 + Math.round(((i + 1) / antiChunks.length) * 6));
          if (i < antiChunks.length - 1) await new Promise(r => setTimeout(r, 6000));
        }

        currentText = joinChunks(antiResults)
          .replace(/—/g, ',').replace(/–/g, ',')
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\*(.+?)\*/g, '$1')
          .replace(/\*/g, '');
      }

      // 5. Post-process: remove editorial notes and deduplicate repeated signature phrases
      currentText = removeRepeatedPatterns(currentText);

      setProgress(100);
      setResult(currentText);
      setStatus('done');
      setStep(`✓ Listo — filtro anti-detector aplicado`);
    } catch (err) {
      console.error('[useHumanizer]', err);
      setError(err.message);
      setStatus('error');
      setStep('');
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setStatus('idle');
    setProgress(0);
    setStep('');
    setResult('');
    setError(null);
  }, []);

  return { humanize, cancel, reset, status, progress, step, result, error };
}
