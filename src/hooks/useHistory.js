'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'humanize_history';
const MAX_ITEMS   = 20;

/**
 * Manages the version history of humanized texts.
 * Persists to localStorage.
 */
export function useHistory() {
  const [history, setHistory] = useState([]);

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const persist = useCallback((items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (_) {}
  }, []);

  /**
   * Save a new entry.
   * @param {string} original  Input text
   * @param {string} result    Humanized text
   * @param {string} mode      Processing mode
   */
  const saveEntry = useCallback((original, result, mode) => {
    const entry = {
      id:        Date.now().toString(),
      timestamp: new Date().toISOString(),
      mode,
      wordCount: result.trim().split(/\s+/).filter(Boolean).length,
      preview:   result.substring(0, 120).trim() + (result.length > 120 ? '…' : ''),
      original,
      result,
    };

    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, MAX_ITEMS);
      persist(updated);
      return updated;
    });

    return entry.id;
  }, [persist]);

  /**
   * Delete a specific history entry.
   */
  const deleteEntry = useCallback((id) => {
    setHistory(prev => {
      const updated = prev.filter(e => e.id !== id);
      persist(updated);
      return updated;
    });
  }, [persist]);

  /**
   * Clear all history.
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }, []);

  return { history, saveEntry, deleteEntry, clearHistory };
}
