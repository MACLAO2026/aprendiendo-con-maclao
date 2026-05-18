import './globals.css';

export const metadata = {
  title: 'Aprendiendo con Maclao — Humanizador de textos con IA',
  description: 'Transforma textos generados por IA en prosa fluida, natural y académicamente impecable. Norma APA 7. Exporta a Word y PDF.',
  keywords: 'humanizador de textos, humanizar IA, pasar turnitin, APA 7, texto académico, humanizar texto',
  openGraph: {
    title: 'Aprendiendo con Maclao — Humanizador de textos',
    description: 'Convierte texto de IA en escritura humana natural. Norma APA 7. Exporta a Word y PDF.',
    type: 'website',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aprendiendo con Maclao — Humanizador de textos',
    description: 'Convierte texto de IA en escritura humana natural. Norma APA 7.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const saved = localStorage.getItem('theme');
              const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (saved === 'dark' || (!saved && prefer)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
