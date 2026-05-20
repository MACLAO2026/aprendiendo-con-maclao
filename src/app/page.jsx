'use client';
import { useState, useCallback } from 'react';
import Header       from '@/components/Header';
import FileUpload   from '@/components/FileUpload';
import ProgressBar  from '@/components/ProgressBar';
import ComparePanel from '@/components/ComparePanel';
import WordCounter  from '@/components/WordCounter';
import ExportButtons from '@/components/ExportButtons';
import HistoryPanel from '@/components/HistoryPanel';
import Landing      from '@/app/landing';
import { useHumanizer } from '@/hooks/useHumanizer';
import { useHistory   } from '@/hooks/useHistory';
import { splitIntoChunks } from '@/lib/chunker';

const MODES = [
  { id: 'academic',     label: 'Académico',   icon: '🎓', desc: 'Tesis, artículos, informes' },
  { id: 'professional', label: 'Profesional', icon: '💼', desc: 'Reportes, propuestas, emails' },
  { id: 'casual',       label: 'Divulgativo', icon: '📖', desc: 'Blogs, noticias, divulgación' },
];

const PROFESSIONS = [
  { id: '',             label: 'General',        icon: '📝' },
  { id: 'abogado',      label: 'Derecho',         icon: '⚖️' },
  { id: 'contador',     label: 'Contaduría',      icon: '📊' },
  { id: 'medico',       label: 'Medicina',        icon: '🩺' },
  { id: 'psicologo',    label: 'Psicología',      icon: '🧠' },
  { id: 'ingeniero',    label: 'Ingeniería',      icon: '⚙️' },
  { id: 'administrador',label: 'Administración',  icon: '🏢' },
  { id: 'educador',     label: 'Educación',       icon: '📚' },
  { id: 'comunicador',  label: 'Comunicación',    icon: '📡' },
  { id: 'enfermero',    label: 'Enfermería',      icon: '💉' },
  { id: 'trabajosocial',label: 'Trabajo Social',  icon: '🤝' },
];

export default function Home() {
  const [showApp,    setShowApp]    = useState(false);
  const [activeTab,  setActiveTab]  = useState('editor');
  const [inputText,  setInputText]  = useState('');
  const [mode,       setMode]       = useState('academic');
  const [passes,     setPasses]     = useState(1);
  const [profession, setProfession] = useState('');
  const [filename,   setFilename]   = useState('humanizado');
  const [originalDocxFile, setOriginalDocxFile] = useState(null);

  const { humanize, cancel, reset, status, progress, step, result, error } = useHumanizer();
  const { history, saveEntry, deleteEntry, clearHistory } = useHistory();

  const isProcessing = status === 'processing';
  const isDone       = status === 'done';
  const isError      = status === 'error';

  const chunks       = splitIntoChunks(inputText);
  const chunkCount   = chunks.length;

  /* ── handlers ───────────────────────────────────────────────────── */
  const handleFileLoaded = useCallback((text, fname, file) => {
    setInputText(text);
    if (fname) setFilename(fname.replace(/\.[^/.]+$/, ''));
    setOriginalDocxFile(file && /\.docx$/i.test(fname || '') ? file : null);
    reset();
  }, [reset]);

  const handleHumanize = useCallback(async () => {
    if (!inputText.trim()) return;
    await humanize(inputText, mode, passes, profession);
  }, [inputText, mode, passes, profession, humanize]);

  const handleDone = useCallback(() => {
    if (result && inputText) {
      saveEntry(inputText, result, mode);
    }
  }, [result, inputText, mode, saveEntry]);

  // Save to history when done (only once)
  const [saved, setSaved] = useState(false);
  if (isDone && !saved) {
    setSaved(true);
    handleDone();
  }
  if (!isDone && saved) setSaved(false);

  const loadFromHistory = useCallback((original, _res) => {
    setInputText(original);
    // Inject result: we need to trick the humanizer state
    // Instead, switch to editor tab and show the result
    setActiveTab('editor');
  }, []);

  const handleReset = () => {
    reset();
    setInputText('');
    setFilename('humanizado');
  };

  if (!showApp) return <Landing onEnterApp={() => setShowApp(true)} />;

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        {activeTab === 'editor' && !inputText && (
          <div className="text-center mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-sm font-bold"
                 style={{ background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.5)', color:'#FBBF24' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:'#FBBF24' }}/>
              Elude Turnitin · ZeroGPT · GPTZero · Copyleaks · Compilatio
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
                style={{ color: 'var(--text)' }}>
              Tu texto suena a IA.{' '}
              <span style={{
                background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Nosotros lo hacemos humano.
              </span>
            </h1>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
              Pega tu texto, elige tu área y humanizamos todo — norma APA 7, exportación a Word y PDF incluidos.
            </p>
          </div>
        )}

        {/* ── Editor Tab ───────────────────────────────────────────── */}
        {activeTab === 'editor' && (
          <div className="space-y-6 animate-fade-in">

            {/* Mode selector */}
            <div className="grid grid-cols-3 gap-3">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  disabled={isProcessing}
                  className="rounded-xl p-4 text-left transition-all duration-200
                             hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background:  mode === m.id ? 'var(--card)' : 'var(--surface)',
                    border:      `1px solid ${mode === m.id ? '#D946EF' : 'var(--border)'}`,
                    boxShadow:   mode === m.id ? '0 0 0 1px rgba(217,70,239,0.25)' : 'none',
                  }}
                >
                  <div className="text-xl mb-1">{m.icon}</div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{m.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{m.desc}</div>
                </button>
              ))}
            </div>

            {/* Passes selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Pasadas de humanización:
              </span>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    onClick={() => setPasses(n)}
                    disabled={isProcessing}
                    className="w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200
                               hover:scale-105 disabled:opacity-50"
                    style={{
                      background: passes === n ? 'linear-gradient(135deg, #D946EF, #9B72CF)' : 'var(--card)',
                      color:      passes === n ? '#FFFFFF' : 'var(--muted)',
                      border:     `1px solid ${passes === n ? '#D946EF' : 'var(--border)'}`,
                    }}
                  >
                    {n}x
                  </button>
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {passes === 1 ? 'Estándar' : passes === 2 ? 'Más natural' : 'Máxima humanización'}
              </span>
            </div>

            {/* Profession selector */}
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--muted)' }}>
                Área de conocimiento:
              </p>
              <div className="flex flex-wrap gap-2">
                {PROFESSIONS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setProfession(p.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                               transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    style={{
                      background: profession === p.id ? 'linear-gradient(135deg, #D946EF, #9B72CF)' : 'var(--card)',
                      color:      profession === p.id ? '#FFFFFF' : 'var(--muted)',
                      border:     `1px solid ${profession === p.id ? '#D946EF' : 'var(--border)'}`,
                    }}
                  >
                    <span>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                  Texto a humanizar
                </h2>
                <div className="flex items-center gap-3">
                  {chunkCount > 1 && (
                    <span className="badge badge-cobalt text-xs">
                      {chunkCount} fragmentos
                    </span>
                  )}
                  <WordCounter text={inputText} />
                </div>
              </div>

              <textarea
                className="textarea-base"
                placeholder="Pega aquí tu texto generado por IA... o carga un archivo abajo."
                value={inputText}
                onChange={e => { setInputText(e.target.value); if (isDone) reset(); }}
                disabled={isProcessing}
                style={{ minHeight: 280 }}
              />

              {/* File upload */}
              <FileUpload onTextLoaded={handleFileLoaded} disabled={isProcessing} />
            </div>

            {/* Progress */}
            <ProgressBar progress={progress} step={step} status={status} />

            {/* Error */}
            {isError && (
              <div className="rounded-xl px-4 py-3 text-sm animate-slide-up"
                   style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E' }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {!isProcessing ? (
                <button
                  onClick={handleHumanize}
                  disabled={!inputText.trim() || isProcessing}
                  className="btn-primary flex items-center gap-2 px-8 py-3"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  </svg>
                  {isDone ? 'Humanizar de nuevo' : 'Humanizar texto'}
                </button>
              ) : (
                <button onClick={cancel} className="btn-ghost flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                  Cancelar
                </button>
              )}

              {(inputText || isDone) && !isProcessing && (
                <button onClick={handleReset} className="btn-ghost">
                  Limpiar
                </button>
              )}

              {isDone && <ExportButtons text={result} filename={filename} originalDocxFile={originalDocxFile} />}
            </div>

            {/* Compare panel */}
            {isDone && result && (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold" style={{ color: 'var(--text)' }}>
                    Resultado
                  </h2>
                  <span className="badge badge-mint">✓ Completado</span>
                </div>
                <ComparePanel original={inputText} result={result} />
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ─────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Historial de versiones
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                Los últimos 20 textos humanizados, guardados localmente en tu navegador.
              </p>
            </div>
            <HistoryPanel
              history={history}
              onLoad={loadFromHistory}
              onDelete={deleteEntry}
              onClear={clearHistory}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-20 pb-8 text-center">
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          © Aprendiendo con Maclao · María Claudia Ortiz Jaramillo · Conocimiento que inspira, acciones que transforman
        </p>
      </footer>
    </div>
  );
}
