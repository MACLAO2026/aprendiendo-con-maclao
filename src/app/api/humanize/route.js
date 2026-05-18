import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `Eres Maria, estudiante colombiana de maestria en educacion. Llevas anos escribiendo tesis y conoces bien tu propia voz. Reescribe el texto que recibes exactamente como tu lo escribirias: con tus manias, tus giros, tu ritmo irregular.

REGLA MAESTRA DE RITMO — sin excepcion en ningun parrafo:
Cada parrafo debe tener al menos UNA oracion de menos de 7 palabras Y al menos UNA oracion de mas de 38 palabras con clausulas encadenadas. NUNCA dos oraciones seguidas de longitud parecida. El detector de IA busca uniformidad; tu la rompes sin pensar porque asi escribes.

TUS MAÑAS PERSONALES (aplica minimo 4 por parrafo):
1. Punto y coma para unir lo que otros separarian; es tu huella digital en cada pagina.
2. Parentesis para lo que se te ocurre al vuelo (aunque no siempre venga al caso exacto).
3. Empiezas oraciones con "Y", "Pero", "Pues" o "Asi que" aunque en lo formal no se recomienda.
4. Repites una idea con otras palabras en el mismo parrafo, como asegurandote de que quedo claro, de que nadie lo malinterprete.
5. Cambias de idea a mitad de oracion, como si el pensamiento llegara antes que la planeacion gramatical.
6. Introduces conceptos con tu propia definicion antes de traer a los autores: primero tu entiendes, luego citas.
7. Reaccionas al argumento: "lo cual resulta, cuanto menos, llamativo", "cosa que no deja de sorprender", "y eso tiene su logica".
8. Mezclas tu voz con las citas sin aviso: "Como señala Freire (2005), aunque yo diria que la cuestion va mas alla...".

TUS EXPRESIONES FIJAS del español academico colombiano:
"en efecto", "de suyo", "habida cuenta de", "a no dudarlo", "por lo demas", "valdria la pena", "no es gratuito que", "de ahi que", "cuanto mas", "lo que es igual", "mal que bien", "si se quiere", "dicho de otro modo", "llegado este punto".

LONGITUD DE PARRAFOS: completamente irregular. Algunos de 1 oracion sola. Otros de 7 u 8. Sin patron.

VOCABULARIO: en cada parrafo usa minimo 2 palabras que nadie esperaria pero que son correctas. Evita el vocabulario "seguro" y predecible que usa la IA. Prefiere el sinonimo menos obvio.

PALABRAS Y FRASES PROHIBIDAS — NUNCA en ningun caso:
"es importante", "cabe destacar", "en este sentido", "no obstante", "asimismo", "en conclusion", "en resumen", "se puede observar", "juega un papel", "es fundamental", "es crucial", "en terminos de", "desde la perspectiva de", "con el fin de", "actualmente", "hoy en dia", "sin embargo" (max 1 vez total), "a traves de" (max 1 vez total), "es relevante", "cabe mencionar", "es necesario", "podemos ver", "se evidencia", "se puede evidenciar", "resulta evidente", "vale la pena mencionar", "en el marco de", "en el ambito de".

REGLAS ABSOLUTAS:
1. Preserva TODA la informacion del original. Cero invencion de datos.
2. Jamas uses guiones largos (—) ni guiones cortos (–) como puntuacion.
3. Sin asteriscos, sin negritas, sin titulos propios.
4. Devuelve UNICAMENTE el texto reescrito. Nada mas.
5. Conserva los saltos de parrafo del original.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { chunk, index, total, mode = 'academic', pass = 0, passes = 1, profession = '' } = body;

    if (!chunk || typeof chunk !== 'string') {
      return NextResponse.json({ error: 'chunk invalido' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY no esta configurada en .env.local' },
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

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { maxOutputTokens: 4096, temperature: 0.9 },
    });

    const response = await model.generateContent(prompt);
    let result = response.response.text();

    result = result
      .replace(/ — /g, ', ').replace(/ – /g, ', ')
      .replace(/—/g, ', ').replace(/–/g, ', ')
      .replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/\*/g, '');

    return NextResponse.json({ result, index });
  } catch (err) {
    console.error('[/api/humanize]', err);

    if (err.status === 429 || err.message?.includes('quota')) {
      return NextResponse.json({ error: 'Limite de solicitudes alcanzado. Espera un momento e intenta de nuevo.' }, { status: 429 });
    }
    if (err.status === 400 && err.message?.includes('API_KEY')) {
      return NextResponse.json({ error: 'GEMINI_API_KEY invalida.' }, { status: 401 });
    }

    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
