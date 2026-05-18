/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base
        void:    '#08080D',
        ink:     '#0F0F17',
        surface: '#15151F',
        card:    '#1C1C28',
        border:  '#26263A',
        muted:   '#4A4A65',
        dim:     '#7070A0',
        text:    '#E2E2F0',
        bright:  '#F8F8FF',
        // Accent: electric mint
        mint: {
          300: '#86EFCD',
          400: '#4ADEB0',
          500: '#00C896',
          600: '#00A87A',
        },
        // Secondary: cobalt
        cobalt: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        // Status
        rose:   '#F43F5E',
        amber:  '#F59E0B',
        emerald:'#10B981',
      },
      fontFamily: {
        sans:  ['var(--font-sora)', 'system-ui', 'sans-serif'],
        mono:  ['var(--font-mono)', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-noise':  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':     'slideUp 0.4s ease-out',
        'fade-in':      'fadeIn 0.3s ease-out',
        'shimmer':      'shimmer 1.5s infinite',
        'spin-slow':    'spin 2s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(12px)', opacity: 0 },
          '100%': { transform: 'translateY(0)',    opacity: 1 },
        },
        fadeIn: {
          '0%':   { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      boxShadow: {
        'glow-mint':   '0 0 30px rgba(0,200,150,0.15)',
        'glow-cobalt': '0 0 30px rgba(59,130,246,0.15)',
        'inner-dark':  'inset 0 2px 8px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
