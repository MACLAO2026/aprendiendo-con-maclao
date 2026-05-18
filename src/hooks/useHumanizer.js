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
  const humanize = useCallback(async (text, mode = 'academic', passes = 1) => {
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
            body:    JSON.stringify({ chunk: chunks[i], index: i, total, mode, pass, passes }),
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(err.error || `HTTP ${res.status}`);
          }

          const data = await res.json();
          results[i] = data.result;

          const chunkDone = passBase + Math.round(((i + 1) / total) * passShare);
          setProgress(chunkDone);
        }

        // 3. Join results — output becomes input for next pass
        setStep(`Uniendo fragmentos…${passLabel}`);
        const joined = joinChunks(results);
        // Reemplaza guiones largos/cortos usados como puntuación por comas
        currentText = joined
          .replace(/ —+ /g, ', ')
          .replace(/ –+ /g, ', ');
      }

      setProgress(100);
      setResult(currentText);
      setStatus('done');
      setStep(`✓ Listo — ${passes} pasada${passes !== 1 ? 's' : ''} completada${passes !== 1 ? 's' : ''}`);
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
