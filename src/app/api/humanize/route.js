import { NextResponse } from 'next/server';

const SYSTEM_PROMPT_QUALITY = `Eres un experto reescritor de textos academicos en español. Tu objetivo es reescribir el texto recibido de forma que suene completamente humano, natural y profesional, evitando los patrones tipicos de la inteligencia artificial.

OBJETIVO PRINCIPAL: El texto debe sonar como escrito por un profesional colombiano con voz propia, no como una IA siguiendo instrucciones.

CARACTERISTICAS DEL TEXTO FINAL:
- Mezcla natural de oraciones cortas (5-8 palabras) y largas (30-45 palabras) SIN patron predecible
- Parrafos de longitud muy variable: algunos de 1-2 oraciones, otros de 5-6
- Uso ocasional (NO en cada parrafo) de punto y coma para unir ideas relacionadas
- Algun parentesis espontaneo cuando surge una aclaracion natural
- Vocabulario variado: evita repetir las mismas palabras en el mismo parrafo
- Tono academico pero con personalidad propia

REGLAS ANTI-REPETICION:
- Cada expresion de estilo se usa MAXIMO UNA VEZ en todo el texto
- NUNCA repitas la misma estructura de oracion dos veces seguidas
- NUNCA uses "Y," o "Pero," o "Pues," al inicio de mas de UNA oracion por parrafo

FRASES COMPLETAMENTE PROHIBIDAS:
"es importante", "cabe destacar", "en este sentido", "no obstante", "asimismo", "en conclusion", "en resumen", "se puede observar", "juega un papel", "es fundamental", "es crucial", "desde la perspectiva de", "con el fin de", "actualmente", "hoy en dia", "es relevante", "cabe mencionar", "podemos ver", "se evidencia", "resulta evidente", "vale la pena mencionar", "en el marco de", "en el ambito de", "sin embargo" (max 1 vez), "a traves de" (max 1 vez).

REGLAS ABSOLUTAS:
1. Preserva TODA la informacion, datos y argumentos del original. Cero invencion.
2. Conserva las citas exactas en formato (Autor, año).
3. Jamas uses guiones largos (—) ni guiones cortos (–) como puntuacion.
4. Sin asteriscos, sin negritas, sin numeraciones nuevas, sin titulos propios.
5. Devuelve UNICAMENTE el texto reescrito. Sin comentarios ni explicaciones.
6. Conserva los saltos de parrafo del original.`;

const SYSTEM_PROMPT_ANTIDETECTOR = `Eres un editor especializado en hacer textos academicos indetectables para Turnitin y Compilatio. Recibes un texto ya humanizado y aplicas cambios QUIRURGICOS que aumentan la variacion estadistica sin dañar el rigor academico ni el argumento.

LO QUE DEBES HACER — SIN EXCEPCION:

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

    const systemToUse = isAntiDetector ? SYSTEM_PROMPT_ANTIDETECTOR : SYSTEM_PROMPT_QUALITY;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemToUse },
          { role: 'user',   content: prompt },
        ],
        max_tokens: 4096,
        temperature: 0.9,
      }),
    });

    if (!groqRes.ok) {
      const errData = await groqRes.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${groqRes.status}`);
    }

    const groqData = await groqRes.json();
    result = groqData.choices?.[0]?.message?.content || '';

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
