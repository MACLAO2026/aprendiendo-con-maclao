'use client';

export default function ProgressBar({ progress, step, status }) {
  if (status === 'idle') return null;

  const isDone  = status === 'done';
  const isError = status === 'error';

  return (
    <div className="animate-slide-up space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: isDone ? '#00C896' : isError ? '#F43F5E' : 'var(--muted)' }}>
          {step || (isDone ? '¡Completado!' : 'Procesando…')}
        </p>
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          {progress}%
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
            background: isError
              ? 'linear-gradient(90deg, #F43F5E, #FB923C)'
              : isDone
              ? 'linear-gradient(90deg, #00C896, #00C896)'
              : 'linear-gradient(90deg, #00C896, #60A5FA)',
          }}
        />
      </div>

      {status === 'processing' && progress < 100 && (
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full animate-pulse-slow"
              style={{
                background: 'var(--border)',
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
