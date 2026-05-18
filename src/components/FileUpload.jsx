'use client';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ACCEPTED = {
  'text/plain':                ['.txt'],
  'application/pdf':           ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export default function FileUpload({ onTextLoaded, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState(null);

  const processFile = useCallback(async (file) => {
    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al procesar el archivo');

      onTextLoaded(data.text, data.filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }, [onTextLoaded]);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      setError('Formato no soportado. Usa .txt, .pdf o .docx');
      return;
    }
    if (accepted.length > 0) processFile(accepted[0]);
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   ACCEPTED,
    multiple: false,
    disabled: disabled || uploading,
    maxSize:  50 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer
                    transition-all duration-200 select-none
                    ${isDragActive ? 'scale-[1.01]' : ''}
                    ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
        style={{
          borderColor: isDragActive ? '#00C896' : 'var(--border)',
          background:  isDragActive ? 'rgba(0,200,150,0.05)' : 'var(--card)',
        }}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                 style={{ borderColor: '#00C896', borderTopColor: 'transparent' }}/>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Procesando archivo…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'var(--border)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="var(--muted)" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                .txt · .pdf · .docx — máx. 50 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs rounded-lg px-3 py-2 animate-fade-in"
           style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E' }}>
          {error}
        </p>
      )}
    </div>
  );
}
