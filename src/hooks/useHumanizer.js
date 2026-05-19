'use client';
import { useState, useCallback, useRef } from 'react';
import { splitIntoChunks, joinChunks } from '@/lib/chunker';

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
            const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(err.error || `HTTP ${res.status}`);
          }

          const data = await res.json();
          results[i] = data.result;

          const chunkDone = passBase + Math.round(((i + 1) / total) * passShare);
          setProgress(chunkDone);

          if (i < total - 1) await new Promise(r => setTimeout(r, 1000));
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
            const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(err.error || `HTTP ${res.status}`);
          }

          const data = await res.json();
          antiResults[i] = data.result;
          setProgress(93 + Math.round(((i + 1) / antiChunks.length) * 6));
        }

        currentText = joinChunks(antiResults)
          .replace(/—/g, ',').replace(/–/g, ',')
          .replace(/\*\*(.+?)\*\*/g, '$1')
          .replace(/\*(.+?)\*/g, '$1')
          .replace(/\*/g, '');
      }

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
