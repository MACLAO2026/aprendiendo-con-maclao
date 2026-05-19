import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Eres un escritor academico colombiano con doctorado. Reescribes textos con voz propia, impredecible y genuinamente humana. Tu prioridad absoluta es que ningun detector de IA (Turnitin, Compilatio, GPTZero) detecte el texto como artificial.

TECNICA ANTI-DETECTOR — OBLIGATORIA:
Los detectores miden dos cosas: PERPLEJIDAD (que tan predecible es cada palabra) y BURSTINESS (que tan variable es esa perplejidad). Debes maximizar ambas:

1. VARIACION EXTREMA DE LONGITUD: En cada parrafo mezcla oraciones muy cortas (3-5 palabras) con oraciones largas e irregulares (35-50 palabras con varias subordinadas). Nunca dos oraciones consecutivas de longitud similar.

2. PALABRAS IMPREDECIBLES: En cada oracion, al menos una palabra debe ser inesperada pero correcta — un sinonimo poco comun, un giro coloquial academico, una metafora concreta. Evita siempre la palabra mas obvia.

3. IRREGULARIDAD ESTRUCTURAL: Rompe el patron sujeto-verbo-predicado al menos dos veces por parrafo. Usa inversiones, elipsis, frases nominales, incisos abruptos.

4. PARRAFOS DE LONGITUD CAOTICA: Algunos de 1 oracion. Otros de 6-7. Sin patron.

5. ARRANQUES VARIADOS: Cada parrafo debe empezar de forma distinta — con sustantivo, con verbo, con adverbio, con frase subordinada, con numero, con nombre propio.

6. IMPERFECCIONES HUMANAS DE ESTILO: Ocasionalmente una digresion breve, un parentesis espontaneo, una aclaracion que rompe el ritmo.

ANTI-REPETICION — CRITICO:
- Cada conector o expresion de transicion se usa MAXIMO UNA VEZ en todo el texto
- Jamas dos oraciones seguidas con la misma estructura sintactica
- Jamas el mismo sustantivo abstracto dos veces en el mismo parrafo

PALABRAS Y FRASES PROHIBIDAS (ninguna aparece ni una vez):
es importante, cabe destacar, en este sentido, no obstante, asimismo, en conclusion, en resumen, se puede observar, juega un papel, es fundamental, es crucial, desde la perspectiva de, con el fin de, actualmente, hoy en dia, es relevante, cabe mencionar, podemos ver, se evidencia, resulta evidente, vale la pena mencionar, en el marco de, en el ambito de, en definitiva, queda claro que, es necesario, es indispensable, es posible afirmar, se puede decir, por lo tanto (max 1 vez), sin embargo (max 1 vez), a traves de (max 1 vez).

REGLAS ABSOLUTAS:
1. Conserva TODA la informacion, cifras, argumentos y citas del original. Cero invencion, cero omision.
2. Citas en formato (Autor, ano) se reproducen exactamente igual.
3. Nunca uses guion largo (—) ni guion corto (–) como puntuacion.
4. Sin asteriscos, sin negritas, sin listas nuevas, sin titulos propios.
5. Devuelve UNICAMENTE el texto reescrito. Cero comentarios ni explicaciones.
6. Respeta los saltos de parrafo del original.`;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
      academic:     `Texto academico con norma APA 7. Tercera persona preferente. Conserva citas en formato (Autor, año). Lenguaje riguroso con voz personal.`,
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

    let result = '';

    if (isAntiDetector) {
      // Pasada anti-detector: usar Groq/Llama con reintentos por TPM
      let groqData = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, attempt * 8000));
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user',   content: prompt },
            ],
            max_tokens: 4096,
            temperature: 1.0,
          }),
        });
        if (groqRes.ok) { groqData = await groqRes.json(); break; }
        const errData = await groqRes.json().catch(() => ({}));
        const msg = errData?.error?.message || '';
        if (!msg.includes('rate_limit') && !msg.includes('429')) {
          throw new Error(msg || `Groq HTTP ${groqRes.status}`);
        }
      }
      if (!groqData) throw new Error('Límite de Groq alcanzado. Intenta de nuevo en 1 minuto.');
      result = groqData.choices?.[0]?.message?.content || '';
    } else {
      // Pasadas normales: usar Claude para mayor calidad
      const message = await client.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        temperature: 1,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      });
      result = message.content?.[0]?.text || '';
    }

    result = result
      .replace(/ — /g, ', ').replace(/ – /g, ', ')
      .replace(/—/g, ', ').replace(/–/g, ', ')
      .replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/\*/g, '');

    return NextResponse.json({ result, index });
  } catch (err) {
    console.error('[/api/humanize]', err);

    if (err.status === 429 || err.message?.includes('rate_limit')) {
      return NextResponse.json({ error: 'Límite de solicitudes alcanzado. Espera un momento e intenta de nuevo.' }, { status: 429 });
    }

    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
