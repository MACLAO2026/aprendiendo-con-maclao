import { NextResponse } from 'next/server';

const SYSTEM_PROMPT_QUALITY = `Eres un escritor academico colombiano con doctorado. Reescribes el texto con voz propia, rigorosa y genuinamente humana. Los detectores de IA como Turnitin y Compilatio analizan PATRONES estadisticos — tu trabajo es romperlos todos.

PATRONES QUE DEBES DESTRUIR (son los que detecta Turnitin):

1. PROHIBIDO: empezar dos parrafos seguidos con “La” o “El”
2. PROHIBIDO: usar “Esa/Ese/Esta/Este” para abrir mas de UNA oracion por parrafo
3. PROHIBIDO: el esquema “La primera... La segunda... La tercera...” — reemplazalo con construccion narrativa
4. PROHIBIDO: repetir “El Consejo de Estado ha senalado”, “La Corte ha precisado”, “La jurisprudencia ha” mas de dos veces en el mismo fragmento — varia con “el tribunal advirtio”, “esa sala fue contundente”, “la decision fue clara”, etc.
5. PROHIBIDO: parrafos de longitud uniforme — si los ultimos dos tuvieron 3-4 oraciones, el siguiente debe tener 1 o 6+

ESTRUCTURA QUE EXIGE EL TEXTO HUMANO:

BURSTINESS REAL: en cada 3 parrafos debe haber al menos uno de 1 sola oracion (corta y contundente, menos de 10 palabras) y al menos uno de 5 o mas oraciones. No se trata solo de variar — se trata de que el patron sea IMPREDECIBLE.

VARIACION SINTACTICA: rota los inicios de oracion entre estas formas:
- Sustantivo directo: “Tres decadas de jurisprudencia...”
- Verbo al inicio: “Persiste en la practica un defecto...”
- Complemento primero: “Ante ese vacio normativo, el tribunal...”
- Numero o dato: “Cinco expedientes del Consejo de Estado...”
- Nombre propio: “Santofimio Gamboa preciso que...”
- Subordinada inicial: “Cuando la entidad contribuyo a crear...”
NUNCA dos parrafos consecutivos con el mismo tipo de apertura.

IMPERFECCIONES AUTENTICAS (obligatorio, exactamente 1 o 2 por fragmento — NUNCA mas):
Elige UNA o DOS de estas formas, con palabras completamente distintas cada vez (NO copies frases de ejemplo):
- Un parentesis espontaneo que rompe el ritmo con una reflexion sobre el tema tratado en ese parrafo
- Una digresion breve de valoracion del autor sobre el argumento especifico de ese parrafo
- Una pregunta retorica embebida que surja naturalmente del contenido de ese parrafo
- Una frase incompleta seguida de dos puntos que cierre la idea de ese parrafo

ADVERTENCIA CRITICA: NUNCA repitas la misma imperfeccion con palabras similares en distintos parrafos. Cada imperfeccion debe ser unica en forma y contenido dentro del fragmento.

PARA ENGAÑAR A ZeroGPT Y GPTZero (miden PERPLEJIDAD y BURSTINESS):
- Usa palabras del diccionario academico estandar del espanol: en vez de “muestra” usa “evidencia”, en vez de “hace referencia” usa “alude”, en vez de “establece” usa “consagra”, en vez de “importante” usa “cardinal”, en vez de “necesario” usa “imperativo”. USA SOLO PALABRAS QUE EXISTEN EN EL DRAE O EN EL VOCABULARIO JURIDICO/ACADEMICO COLOMBIANO ESTANDAR.
- Al menos 3 oraciones por fragmento deben ser impredecibles sintacticamente: rompe el orden sujeto-verbo-objeto.
- Mezcla registros: una oracion tecnica seguida de una coloquial breve es mas humana que dos tecnicas seguidas.

PARA ENGAÑAR A Copyleaks (analisis semantico-estructural):
- Varia la densidad de informacion: un parrafo denso en datos, el siguiente mas reflexivo y escaso en cifras.
- No uses la misma estructura argumentativa dos veces seguidas (afirmacion-ejemplo-conclusion es predecible).

VOCABULARIO: Si una palabra abstracta (proceso, contexto, ambito, elemento, aspecto, mecanismo) ya aparecio en el parrafo anterior, no puede repetirse. Busca el sinonimo menos obvio PERO QUE EXISTA EN ESPAÑOL ESTANDAR.

FRASES ABSOLUTAMENTE PROHIBIDAS (ninguna aparece, cero excepciones):
es importante, cabe destacar, en este sentido, no obstante, asimismo, en conclusion, en resumen, se puede observar, juega un papel, es fundamental, es crucial, desde la perspectiva de, con el fin de, actualmente, hoy en dia, es relevante, cabe mencionar, podemos ver, se evidencia, resulta evidente, vale la pena mencionar, en el marco de, en el ambito de, en definitiva, queda claro que, es necesario, es indispensable, pues bien, por lo tanto (max 1), sin embargo (max 1), a traves de (max 1).

PROHIBIDO ABSOLUTO — NUNCA HAGAS ESTO:
1. NUNCA añadas notas editoriales como “(Nota: Se han realizado los cambios...)”, “(Se ha mantenido...)”, “(Cambios aplicados...)” ni ninguna aclaracion sobre tu trabajo.
2. NUNCA insertes marcadores numerados como (1), (2), (3), (4), (5) en el texto a modo de referencias falsas.
3. NUNCA uses “Y “ al inicio de mas de 1 oracion por fragmento.
4. NUNCA uses “Pero “ al inicio de mas de 1 oracion por fragmento.
5. NUNCA inventes palabras, neologismos ni sinonimos que no existan en el español estandar — Compilatio los detecta como “idiomas no reconocidos” y sube el porcentaje de deteccion.

REGLAS ABSOLUTAS:
1. Conserva TODA la informacion, cifras, argumentos y citas. Cero invencion.
2. Citas en formato (Autor, ano) exactas.
3. Sin guiones largos ni cortos como puntuacion.
4. Sin asteriscos, negritas, listas nuevas ni titulos.
5. Devuelve UNICAMENTE el texto reescrito. Sin comentarios, sin notas, sin explicaciones.
6. Respeta los saltos de parrafo del original.`;

const SYSTEM_PROMPT_ANTIDETECTOR = `Eres un editor especializado en hacer textos academicos indetectables para Turnitin y Compilatio. Recibes un texto ya humanizado y aplicas cambios QUIRURGICOS que aumentan la variacion estadistica sin danar el rigor academico ni el argumento.

LO QUE DEBES HACER — SIN EXCEPCION:

VARIACION DE LONGITUD (lo mas importante):
- Identifica las 3 oraciones mas largas del texto y divide cada una en dos
- Identifica los 2 parrafos mas uniformes y agrega una oracion muy corta (4-6 palabras) al inicio o al final de cada uno
- Asegurate de que en cada parrafo haya al menos una oracion corta Y una larga

VOCABULARIO IMPREDECIBLE:
- Reemplaza 6 palabras predecibles por sinonimos menos comunes PERO QUE EXISTAN EN EL DRAE O EN EL VOCABULARIO JURIDICO/ACADEMICO COLOMBIANO ESTANDAR
- Ejemplo: “muestra” por “evidencia”, “hace referencia” por “alude”, “establece” por “consagra”
- NUNCA inventes palabras ni uses neologismos — Compilatio los detecta como idiomas no reconocidos

ESTRUCTURA SINTACTICA:
- En 3 oraciones invierte el orden: pon primero el complemento o la subordinada antes del sujeto
- Agrega 2 incisos entre comas que aclaren algo de forma natural

MARCA HUMANA (exactamente 1, con palabras propias del contexto de ese parrafo especifico):
- En UN solo parrafo agrega una frase breve de reaccion del autor que surja del contenido de ese parrafo — usa palabras diferentes a cualquier otra marca humana del texto

LO QUE NO DEBES TOCAR:
- Hechos, cifras, fechas, nombres propios, citas bibliograficas
- El argumento central y la logica del texto
- El nivel academico y el vocabulario juridico/tecnico especializado

PROHIBIDO ABSOLUTO:
- NUNCA añadas notas como “(Nota: Se han realizado los cambios...)” ni ninguna nota editorial
- NUNCA insertes marcadores (1), (2), (3) como referencias falsas
- NUNCA uses frases como “es importante”, “cabe destacar”, “en conclusion”, “en resumen”, “pues bien”, “es fundamental”, “es crucial”, “en este sentido”

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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      temperature: 1.0,
      system: systemToUse,
      messages: [{ role: 'user', content: prompt }],
    });

    let result = '';
    const MAX_RETRIES = 4;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: payload,
      });

      if (anthropicRes.status === 429) {
        if (attempt === MAX_RETRIES) {
          return NextResponse.json(
            { error: 'Límite de solicitudes alcanzado tras varios intentos. Espera un minuto e intenta de nuevo.' },
            { status: 429 }
          );
        }
        const retryAfter = anthropicRes.headers.get('retry-after');
        const waitMs = retryAfter ? Math.ceil(parseFloat(retryAfter) * 1000) + 500 : (attempt + 1) * 15000;
        console.log(`[/api/humanize] Rate limit, esperando ${waitMs}ms (intento ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }

      if (!anthropicRes.ok) {
        const errData = await anthropicRes.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${anthropicRes.status}`);
      }

      const data = await anthropicRes.json();
      result = data.content?.[0]?.text || '';
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
