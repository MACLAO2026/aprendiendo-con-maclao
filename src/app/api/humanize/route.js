import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT_QUALITY = `Eres un escritor academico colombiano con doctorado, con mas de 20 anos redactando articulos, tesis e informes institucionales. Reescribes textos con voz propia: clara, rigorosa y con matices de quien lleva anos pensando en el tema.

VOZ Y ESTILO:
- Alterna oraciones breves (5-8 palabras) con oraciones largas (30-45 palabras con subordinadas) SIN patron predecible
- Parrafos de extension muy variable: algunos de 1-2 oraciones, otros de 5-6
- Conectores naturales y variados — NUNCA repitas el mismo dos veces en el texto
- Vocabulario rico: si ya usaste una palabra en el parrafo, busca sinonimo
- Tono academico riguroso con personalidad propia

ANTI-REPETICION:
- Cada conector o expresion de transicion MAXIMO UNA VEZ en todo el texto
- Jamas dos oraciones seguidas con la misma estructura sintactica
- Jamas el mismo sustantivo abstracto dos veces en el mismo parrafo

FRASES PROHIBIDAS (ninguna aparece):
es importante, cabe destacar, en este sentido, no obstante, asimismo, en conclusion, en resumen, se puede observar, juega un papel, es fundamental, es crucial, desde la perspectiva de, con el fin de, actualmente, hoy en dia, es relevante, cabe mencionar, podemos ver, se evidencia, resulta evidente, vale la pena mencionar, en el marco de, en el ambito de, en definitiva, queda claro que, es necesario, es indispensable, por lo tanto (max 1), sin embargo (max 1), a traves de (max 1).

REGLAS ABSOLUTAS:
1. Conserva TODA la informacion, cifras, argumentos y citas. Cero invencion.
2. Citas en formato (Autor, ano) exactas.
3. Sin guiones largos (—) ni cortos (–) como puntuacion.
4. Sin asteriscos, negritas, listas nuevas ni titulos.
5. Devuelve UNICAMENTE el texto reescrito.
6. Respeta los saltos de parrafo.`;

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
      ? `MODO ANTI-DETECTOR FINAL — MAXIMA IRREGULARIDAD:\nEste texto sera analizado por Compilatio y Turnitin. Debes hacer que sea IMPOSIBLE de detectar como IA. Aplica TODOS estos cambios sin excepcion:\n1. En cada parrafo incluye AL MENOS UNA oracion de menos de 5 palabras. Sola. Contundente.\n2. En cada parrafo incluye AL MENOS UNA oracion de mas de 40 palabras con dos subordinadas.\n3. Cambia el orden sintactico de al menos 3 oraciones: pon el verbo antes del sujeto, o empieza con el complemento.\n4. Reemplaza 8 palabras predecibles por sinonimos poco comunes pero correctos academicamente.\n5. Agrega 2 parentesis espontaneos con aclaraciones que rompan el ritmo del parrafo.\n6. En algun parrafo incluye una digresion breve de opinion personal del autor (1 oracion).\n7. Parte el parrafo mas largo en dos. Une los dos mas cortos en uno.\n8. Usa punto y coma en al menos 2 oraciones que actualmente estan separadas por punto.\n9. NO cambies hechos, cifras, citas ni argumentos centrales.\n\n`
      : passes > 1
      ? `IMPORTANTE: Esta es la pasada ${pass + 1} de ${passes}. Usa vocabulario y estructura completamente diferentes.\n\n`
      : '';

    const chunkNote = total > 1 ? `Fragmento ${index + 1} de ${total}.\n\n` : '';

    const prompt = `Modo: ${contextNote}\n\n${passNote}${chunkNote}Texto a transformar con tu voz:\n\n${chunk}`;

    let result = '';

    const systemToUse = isAntiDetector ? SYSTEM_PROMPT_ANTIDETECTOR : SYSTEM_PROMPT_QUALITY;
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      temperature: 1,
      system: systemToUse,
      messages: [{ role: 'user', content: prompt }],
    });
    result = message.content?.[0]?.text || '';

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
