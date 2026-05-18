'use client';
import { useState, useEffect } from 'react';

const GOLD   = 'linear-gradient(90deg, #F59E0B, #FBBF24)';
const PURPLE = 'linear-gradient(135deg, #7C3AED, #C026D3)';

export default function Header({ activeTab, onTabChange }) {
  const [dark, setDark]         = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved ? saved === 'dark' : true;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const tabs = [
    { id: 'editor',  label: 'Editor' },
    { id: 'history', label: 'Historial' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b' : ''}`}
      style={{
        background: scrolled ? 'rgba(13,0,32,0.95)' : 'rgba(13,0,32,0.7)',
        borderColor: 'rgba(192,38,211,0.3)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo Maclao */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="url(#hdrGrad)"/>
              <circle cx="20" cy="20" r="18.5" stroke="#C026D3" strokeWidth="1.5" fill="none" opacity="0.7"/>
              <polygon points="16,13 28,20 16,27" fill="white"/>
              <defs>
                <radialGradient id="hdrGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#5B21B6"/>
                  <stop offset="100%" stopColor="#0D0020"/>
                </radialGradient>
              </defs>
            </svg>
            <span style={{
              position:'absolute', bottom:1, right:1,
              width:8, height:8, borderRadius:'50%',
              background:'linear-gradient(135deg,#F59E0B,#FBBF24)',
              boxShadow:'0 0 6px #F59E0B',
            }}/>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-sm tracking-tight text-white" style={{ lineHeight:1.2 }}>
              Aprendiendo con{' '}
              <span style={{ background:GOLD, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', fontStyle:'italic' }}>
                Maclao
              </span>
            </span>
            <span className="text-xs" style={{ color:'rgba(245,230,255,0.5)' }}>
              Conocimiento que inspira · Humanizador IA
            </span>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 p-1 rounded-xl"
             style={{ background:'rgba(124,58,237,0.2)', border:'1px solid rgba(192,38,211,0.3)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === tab.id ? 'rgba(124,58,237,0.5)' : 'transparent',
                color:      activeTab === tab.id ? '#F5E6FF' : 'rgba(245,230,255,0.5)',
                boxShadow:  activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background:'rgba(124,58,237,0.25)', border:'1px solid rgba(192,38,211,0.3)', color:'rgba(245,230,255,0.7)' }}
            title={dark ? 'Modo claro' : 'Modo oscuro'}
          >
            {dark ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
