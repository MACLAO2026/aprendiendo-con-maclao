# 🤖 HumanizeAI

Aplicación web moderna inspirada en AIHumanize.io para transformar textos generados por IA en prosa fluida, natural y académicamente impecable.

## ✨ Características

- **Humanización inteligente** con Claude AI (Anthropic)
- **Procesamiento por fragmentos** — sin límite de tamaño (probado con +20.000 palabras)
- **Carga de archivos** .txt, .pdf y .docx
- **Panel comparativo** entre original y resultado
- **Modos de escritura**: Académico, Profesional y Divulgativo
- **Exportación** a Word (.docx) y PDF
- **Historial de versiones** en localStorage
- **Modo oscuro/claro** con persistencia
- **Responsive** para móvil y escritorio

## 🚀 Instalación y uso local

### 1. Clonar / descomprimir el proyecto

```bash
cd humanize-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega tu API key de Anthropic:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
CHUNK_SIZE=600
```

> **Obtén tu API key en:** https://console.anthropic.com

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre **http://localhost:3000** en tu navegador.

---

## 🏗️ Arquitectura

```
humanize-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── humanize/route.js   ← Llama a Claude API
│   │   │   └── upload/route.js     ← Parsea archivos PDF/DOCX/TXT
│   │   ├── globals.css             ← Design system + tokens CSS
│   │   ├── layout.jsx              ← Root layout con tema
│   │   └── page.jsx                ← Página principal (SPA)
│   ├── components/
│   │   ├── Header.jsx              ← Navegación + theme toggle
│   │   ├── FileUpload.jsx          ← Dropzone para archivos
│   │   ├── ProgressBar.jsx         ← Barra de progreso animada
│   │   ├── ComparePanel.jsx        ← Vista comparativa
│   │   ├── WordCounter.jsx         ← Contador palabras/caracteres
│   │   ├── ExportButtons.jsx       ← Exportar Word/PDF
│   │   └── HistoryPanel.jsx        ← Historial de versiones
│   ├── hooks/
│   │   ├── useHumanizer.js         ← Lógica de procesamiento
│   │   └── useHistory.js           ← Persistencia en localStorage
│   └── lib/
│       ├── chunker.js              ← Divide/une texto en fragmentos
│       ├── fileParser.js           ← Extrae texto de PDF/DOCX/TXT
│       └── exporter.js             ← Genera Word y PDF (cliente)
├── .env.example
├── next.config.js
├── tailwind.config.js
└── package.json
```

## ⚙️ Cómo funciona el procesamiento

1. **Entrada**: texto pegado o archivo cargado
2. **Chunking**: el texto se divide en fragmentos de ~600 palabras respetando párrafos
3. **Procesamiento**: cada fragmento se envía secuencialmente a Claude via `/api/humanize`
4. **Progreso**: la barra se actualiza en tiempo real (fragmento X de Y)
5. **Reunificación**: los fragmentos se unen manteniendo saltos de párrafo
6. **Exportación**: desde el cliente, sin pasar por el servidor

## 🎨 Design System

- **Fuente**: Sora (display) + JetBrains Mono
- **Paleta**: Slate oscuro + mint (#00C896) + cobalt (#3B82F6)
- **Modo**: dark por defecto, claro disponible
- **CSS vars**: `--bg`, `--surface`, `--card`, `--border`, `--text`, `--muted`, `--accent`

## 📦 Build para producción

```bash
npm run build
npm start
```

## 🔧 Variables de entorno

| Variable           | Descripción                                 | Default                        |
|--------------------|---------------------------------------------|--------------------------------|
| `ANTHROPIC_API_KEY`| Tu API key de Anthropic (obligatoria)        | —                              |
| `ANTHROPIC_MODEL`  | Modelo de Claude a usar                      | `claude-sonnet-4-20250514`    |
| `CHUNK_SIZE`       | Palabras por fragmento (ajusta según modelo) | `600`                          |

## 📋 Licencia

MIT — úsalo libremente.
