import { NextResponse } from 'next/server';

const SYSTEM_PROMPT_QUALITY = `Eres un escritor academico colombiano con doctorado. Reescribes el texto con voz propia, rigorosa y genuinamente humana. Los detectores de IA como Turnitin y Compilatio analizan PATRONES estadisticos â€” tu trabajo es romperlos todos.

PATRONES QUE DEBES DESTRUIR (son los que detecta Turnitin):

1. PROHIBIDO: empezar dos parrafos seguidos con "La" o "El"
2. PROHIBIDO: usar "Esa/Ese/Esta/Este" para abrir mas de UNA oracion por parrafo
3. PROHIBIDO: el esquema "La primera... La segunda... La tercera..." â€” reemplazalo con construccion narrativa
4. PROHIBIDO: repetir "El Consejo de Estado ha senalado", "La Corte ha precisado", "La jurisprudencia ha" mas de dos veces en el mismo fragmento â€” varÃ­a con "el tribunal advirtiÃ³", "esa sala fue contundente", "la decision fue clara", etc.
5. PROHIBIDO: parrafos de longitud uniforme â€” si los ultimos dos tuvieron 3-4 oraciones, el siguiente debe tener 1 o 6+

ESTRUCTURA QUE EXIGE EL TEXTO HUMANO:

BURSTINESS REAL: en cada 3 parrafos debe haber al menos uno de 1 sola oracion (corta y contundente, menos de 10 palabras) y al menos uno de 5 o mas oraciones. No se trata solo de variar â€” se trata de que el patron sea IMPREDECIBLE.

VARIACION SINTACTICA: rota los inicios de oracion entre estas formas:
- Sustantivo directo: "Tres dÃ©cadas de jurisprudencia..."
- Verbo al inicio: "Persiste en la prÃ¡ctica un defecto..."
- Complemento primero: "Ante ese vacÃ­o normativo, el tribunal..."
- Numero o dato: "Cinco expedientes del Consejo de Estado..."
- Nombre propio: "Santofimio Gamboa precisÃ³ que..."
- Subordinada inicial: "Cuando la entidad contribuyÃ³ a crear..."
NUNCA dos parrafos consecutivos con el mismo tipo de apertura.

IMPERFECCIONES AUTENTICAS (obligatorio, minimo 2 por fragmento):
- Un parentesis espontaneo que rompe el ritmo: "(y eso, en la practica, no es menor)"
- Una digresion breve de valoracion: "Eso merece detenerse un momento."
- Una pregunta retorica embebida en el parrafo
- Una frase incompleta seguida de dos puntos que cierra sola

VOCABULARIO: Si una palabra abstracta (proceso, contexto, ambito, elemento, aspecto, mecanismo) ya aparecio en el parrafo anterior, no puede repetirse. Busca el sinonimo menos obvio.

FRASES PROHIBIDAS (ninguna aparece):
es importante, cabe destacar, en este sentido, no obstante, asimismo, en conclusion, en resumen, se puede observar, juega un papel, es fundamental, es crucial, desde la perspectiva de, con el fin de, actualmente, hoy en dia, es relevante, cabe mencionar, podemos ver, se evidencia, resulta evidente, vale la pena mencionar, en el marco de, en el ambito de, en definitiva, queda claro que, es necesario, es indispensable, por lo tanto (max 1), sin embargo (max 1), a traves de (max 1).

REGLAS ABSOLUTAS:
1. Conserva TODA la informacion, cifras, argumentos y citas. Cero invencion.
2. Citas en formato (Autor, ano) exactas.
3. Sin guiones largos (â€”) ni cortos (â€“) como puntuacion.
4. Sin asteriscos, negritas, listas nuevas ni titulos.
5. Devuelve UNICAMENTE el texto reescrito.
6. Respeta los saltos de parrafo del original.`;

const SYSTEM_PROMPT_ANTIDETECTOR = `Eres un editor especializado en hacer textos academicos indetectables para Turnitin y Compilatio. Recibes un texto ya humanizado y aplicas cambios QUIRURGICOS que aumentan la variacion estadistica sin daÃ±ar el rigor academico ni el argumento.

LO QUE DEBES HACER â€” SIN EXCEPCION:

VARIACION DE LONGITUD (lo mas importante):
- Identifica las 3 oraciones mas largas del texto y divide cada una en dos
- Identifica los 2 parrafos mas uniformes y agrega una oracion muy corta (4-6 palabras) al inicio o al final de cada uno
- Asegurate de que en cada parrafo haya al menos una oracion corta Y una larga

VOCABULARIO IMPREDECIBLE:
- Reemplaza 6 palabras predecibles por sinonimos menos comunes pero academicamente correctos
- Ejemplo: "muestra" por "evidencia", "hace referencia" por "alude", "establece" por "consagra"

ESTRUCTURA SINTACTICA:
- En 3 oraciones invierte el orden: pon primero el complemento o la subordinada antes del sujeto
- Agrega 2 incisos entre comas que aclaren algo de forma natural

MARCA HUMANA:
- En un parrafo agrega una frase corta de valoracion del autor (ej: "Y eso, en la practica, no es un detalle menor.")
- En otro parrafo agrega un parentesis espontaneo con una aclaracion

LO QUE NO DEBES TOCAR:
- Hechos, cifras, fechas, nombres propios, citas bibliograficas
- El argumento central y la logica del texto
- El nivel academico y el vocabulario juridico/tecnico especializado

Devuelve UNICAMENTE el texto modificado. Sin comentarios ni explicaciones.`;



export async function POST(request) {
  try {
    const body = await request.json();
    const { chunk, index, total, mode = 'academic', pass = 0, passes = 1, profession = '' } = body;

    if (!chunk || typeof chunk !== 'string') {
      return NextResponse.json({ error: 'chunk invalido' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no esta configurada en .env.local' },
        { status: 500 }
      );
    }

    const professionInstructions = {
      abogado:      `Experto en Derecho. Usa terminologia juridica precisa: jurisprudencia, doctrina, ratio decidendi, obiter dictum, litis, acervo probatorio, tipicidad, antijuridicidad, culpabilidad. Cita normas como "segun el articulo X de la Ley Y" y referencias a sentencias de altas cortes.`,
      contador:     `Experto en Contaduria Publica y Finanzas. Usa terminologia contable precisa: NIIF, NIC, devengado, causacion, partida doble, conciliacion, estados financieros, flujo de caja, EBITDA, patrimonio neto, pasivo contingente.`,
      medico:       `Experto en Medicina. Usa terminologia clinica: fisiopatologia, etiopatogenia, diagnostico diferencial, tratamiento farmacologico, ensayos clinicos aleatorizados, metaanalisis. Referencias a guias de practica clinica.`,
      psicologo:    `Experto en Psicologia Clinica. Usa terminologia psicologica: constructos, variables psicologicas, instrumentos psicometricos, teorias del aprendizaje, cognicion, conducta. Referencias al DSM-5, CIE-11.`,
      ingeniero:    `Experto en Ingenieria. Usa terminologia tecnica: especificaciones, tolerancias, normas ISO/ASTM/NTC, analisis de sistemas, eficiencia, optimizacion. Razonamiento cientifico-tecnico.`,
      administrador:`Experto en Administracion de Empresas. Usa: planeacion estrategica, ventaja competitiva, cadena de valor, stakeholders, KPI, balanced scorecard. Referencias a Porter, Drucker, Mintzberg.`,
      educador:     `Experto en Pedagogia. Usa: didactica, curriculo, competencias, aprendizaje significativo, constructivismo, zona de desarrollo proximo, evaluacion formativa. Referencias a Vygotsky, Piaget, Ausubel, Freire.`,
      comunicador:  `Experto en Comunicacion Social. Usa: semiotica, discurso mediatico, agenda setting, encuadre noticioso, opinion publica. Referencias a Habermas, Bourdieu, McLuhan.`,
      enfermero:    `Experto en Enfermeria. Usa: proceso de atencion de enfermeria (PAE), diagnosticos NANDA, intervenciones NIC, resultados NOC, cuidado humanizado, practica basada en evidencia.`,
      trabajosocial:`Experto en Trabajo Social. Usa: intervencion social, vulnerabilidad, exclusion social, redes de apoyo, politica publica, derechos humanos, enfoque diferencial, resiliencia comunitaria.`,
    };

    const modeInstructions = {
      academic:     `Texto academico con norma APA 7. Tercera persona preferente. Conserva citas en formato (Autor, aÃ±o). Lenguaje riguroso con voz personal.`,
      professional: `Texto profesional/empresarial. Directo y convincente con voz personal.`,
      casual:       `Texto divulgativo. Accesible y fluido con ejemplos concretos.`,
    };

    const profNote = profession && professionInstructions[profession]
      ? `\nVOZ EXPERTA REQUERIDA: ${professionInstructions[profession]}\n`
      : '';

    const contextNote = (modeInstructions[mode] || modeInstructions.academic) + profNote;

    const isAntiDetector = pass === 99;
    const passNote = isAntiDetector
      ? `MODO ANTI-DETECTOR FINAL: Aplica TODOS estos cambios quirurgicos:\n1. Corta una oracion de cada grupo similar a menos de 6 palabras.\n2. Empieza 3 oraciones con "Y ", "Pero ", "Pues bien," o "Asi que ".\n3. Agrega 2-3 aclaraciones entre parentesis en distintos parrafos.\n4. Reemplaza 6 palabras predecibles por sinonimos inesperados pero correctos.\n5. Une las dos oraciones mas cortas de cada parrafo con punto y coma; parte la mas larga en dos.\n6. Inserta una frase de reaccion personal en algun parrafo.\n7. Si no hay parrafo de 1 sola oracion, crea uno con la idea mas llamativa.\n8. NO cambies hechos, cifras ni el argumento central.\n\n`
      : passes > 1
      ? `IMPORTANTE: Esta es la pasada ${pass + 1} de ${passes}. Usa vocabulario y estructura completamente diferentes.\n\n`
      : '';

    const chunkNote = total > 1 ? `Fragmento ${index + 1} de ${total}.\n\n` : '';

    const prompt = `Modo: ${contextNote}\n\n${passNote}${chunkNote}Texto a transformar con tu voz:\n\n${chunk}`;

    const systemToUse = isAntiDetector ? SYSTEM_PROMPT_ANTIDETECTOR : SYSTEM_PROMPT_QUALITY;

    const payload = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemToUse },
        { role: 'user',   content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.9,
    });

    let result = '';
    const MAX_RETRIES = 4;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: payload,
      });

      if (groqRes.status === 429) {
        if (attempt === MAX_RETRIES) {
          return NextResponse.json(
            { error: 'LÃ­mite de solicitudes alcanzado tras varios intentos. Espera un minuto e intenta de nuevo.' },
            { status: 429 }
          );
        }
        const errData = await groqRes.json().catch(() => ({}));
        const msg = errData?.error?.message || '';
        const match = msg.match(/try again in ([0-9.]+)s/);
        const waitMs = match ? Math.ceil(parseFloat(match[1]) * 1000) + 500 : (attempt + 1) * 15000;
        console.log(`[/api/humanize] Rate limit, esperando ${waitMs}ms (intento ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (!groqRes.ok) {
        const errData = await groqRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${groqRes.status}`);
      }

      const groqData = await groqRes.json();
      result = groqData.choices?.[0]?.message?.content || '';
      break;
    }

    result = result
      .replace(/ â€” /g, ', ').replace(/ â€“ /g, ', ')
      .replace(/â€”/g, ', ').replace(/â€“/g, ', ')
      .replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/\*/g, '');

    return NextResponse.json({ result, index });
  } catch (err) {
    console.error('[/api/humanize]', err);

    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
