import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

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

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no esta configurada en .env.local' },
        { status: 500 }
      );
    }

    const professionInstructions = {
      abogado:      `Experto en Derecho. Usa terminologia juridica precisa: jurisprudencia, doctrina, ratio decidendi, obiter dictum, litis, acervo probatorio, tipicidad, antijuridicidad, culpabilidad. Cita normas como "segun el articulo X de la Ley Y" y referencias a sentencias de altas cortes. Razonamiento juridico deductivo: premisa mayor (norma), premisa menor (hecho), conclusion (consecuencia juridica).`,
      contador:     `Experto en Contaduria Publica y Finanzas. Usa terminologia contable y financiera precisa: NIIF, NIC, devengado, causacion, partida doble, conciliacion, estados financieros, flujo de caja, EBITDA, patrimonio neto, pasivo contingente. Razonamiento analitico con referencias a normas contables colombianas y estandares internacionales.`,
      medico:       `Experto en Medicina y Ciencias de la Salud. Usa terminologia clinica precisa: fisiopatologia, etiopatogenia, signos y sintomas, diagnostico diferencial, tratamiento farmacologico, evidencia clinica nivel I-II, ensayos clinicos aleatorizados, metaanalisis. Referencias a guias de practica clinica y literatura medica indexada.`,
      psicologo:    `Experto en Psicologia Clinica. Usa terminologia psicologica precisa: constructos, variables psicologicas, instrumentos psicometricos validados, teorias del aprendizaje, cognicion, conducta, afecto. Referencias al DSM-5, CIE-11, y autores clasicos y contemporaneos de la psicologia cientifica.`,
      ingeniero:    `Experto en Ingenieria. Usa terminologia tecnica precisa: especificaciones tecnicas, tolerancias, normas ISO/ASTM/NTC, analisis de sistemas, variables de diseno, eficiencia, optimizacion. Razonamiento cientifico-tecnico con referencias a estandares internacionales y metodologias de ingenieria.`,
      administrador:`Experto en Administracion de Empresas. Usa terminologia administrativa: planeacion estrategica, ventaja competitiva, cadena de valor, stakeholders, KPI, balanced scorecard, gestion del talento humano, estructura organizacional. Referencias a autores clasicos: Porter, Drucker, Mintzberg, Kaplan, y teorias administrativas contemporaneas.`,
      educador:     `Experto en Ciencias de la Educacion y Pedagogia. Usa terminologia pedagogica: didactica, curriculo, competencias, aprendizaje significativo, constructivismo, zona de desarrollo proximo, evaluacion formativa y sumativa. Referencias a Vygotsky, Piaget, Ausubel, Freire y autores contemporaneos de la pedagogia critica.`,
      comunicador:  `Experto en Comunicacion Social y Periodismo. Usa terminologia comunicacional: semiotica, discurso mediatico, agenda setting, encuadre noticioso, narrativa transmedia, opinion publica, teoria critica de la comunicacion. Referencias a la Escuela de Frankfurt, estudios culturales y autores como Habermas, Bourdieu, McLuhan.`,
      enfermero:    `Experto en Enfermeria y Ciencias de la Salud. Usa terminologia enfermera: proceso de atencion de enfermeria (PAE), diagnosticos NANDA, intervenciones NIC, resultados NOC, cuidado humanizado, practica basada en evidencia, seguridad del paciente. Referencias a teoricas de enfermeria: Orem, Henderson, Watson, Roy.`,
      trabajosocial:`Experto en Trabajo Social. Usa terminologia del trabajo social: intervencion social, sujeto de intervencion, vulnerabilidad, exclusion social, redes de apoyo, politica publica, derechos humanos, enfoque diferencial, resiliencia comunitaria. Referencias a teorias criticas del trabajo social y autores latinoamericanos.`,
    };

    const modeInstructions = {
      academic:     `Texto academico con norma APA 7. Tercera persona preferente, tiempo pasado para estudios. Conserva citas en formato (Autor, año). Lenguaje riguroso pero con la voz personal de Maria.`,
      professional: `Texto profesional/empresarial. Directo y convincente, con la voz personal de Maria.`,
      casual:       `Texto divulgativo. Accesible y fluido, con ejemplos concretos y la voz personal de Maria.`,
    };

    const profNote = profession && professionInstructions[profession]
      ? `\nVOZ EXPERTA REQUERIDA: ${professionInstructions[profession]}\n`
      : '';

    const contextNote = (modeInstructions[mode] || modeInstructions.academic) + profNote;
    // Pasada 99 = modo anti-detector final
    const isAntiDetector = pass === 99;
    const passNote = isAntiDetector
      ? `MODO ANTI-DETECTOR FINAL: El texto ya fue humanizado. Aplica TODOS estos cambios quirurgicos sin excepcion:\n1. ROMPE LA UNIFORMIDAD: localiza cualquier grupo de 2 oraciones seguidas de longitud similar y corta una a menos de 6 palabras. Brutal si hace falta.\n2. ARRANCA DIFERENTE: cambia el inicio de 3 oraciones para que empiecen con "Y ", "Pero ", "Pues bien," o "Asi que ".\n3. METE RUIDO HUMANO: agrega entre 2 y 3 aclaraciones entre parentesis en distintos parrafos, en mitad de oracion si es posible.\n4. VOCABULARIO INESPERADO: reemplaza 6 palabras predecibles por sinonimos que nadie esperaria pero que son correctos. Busca las palabras mas "seguras" y cambialas.\n5. FUSIONA Y PARTE: en cada parrafo de mas de 3 oraciones, une las dos mas cortas con punto y coma; parte la mas larga en dos con punto seguido.\n6. REACCION PERSONAL: en al menos un parrafo inserta una frase de reaccion: "lo cual resulta, cuanto menos, curioso", "cosa nada menor", "y eso tiene su peso".\n7. PARRAFO SOLITARIO: si no hay ningun parrafo de 1 sola oracion, convierte la oracion mas llamativa de cualquier parrafo en su propio parrafo.\n8. NO cambies hechos, cifras, citas ni el argumento central. Solo la forma.\n\n`
      : passes > 1
      ? `IMPORTANTE: Esta es la pasada ${pass + 1} de ${passes}. Usa vocabulario y estructura completamente diferentes a una reescritura anterior.\n\n`
      : '';
    const chunkNote = total > 1 ? `Fragmento ${index + 1} de ${total}.\n\n` : '';

    const message = await client.messages.create({
      model:      MODEL,
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages: [
        {
          role:    'user',
          content: `Modo: ${contextNote}\n\n${passNote}${chunkNote}Texto a transformar con tu voz:\n\n${chunk}`,
        },
      ],
    });

    let result = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    // Post-procesado: elimina guiones largos/cortos usados como puntuacion
    result = result
      .replace(/ — /g, ', ')
      .replace(/ – /g, ', ')
      .replace(/—/g, ', ')
      .replace(/–/g, ', ');

    return NextResponse.json({ result, index });
  } catch (err) {
    console.error('[/api/humanize]', err);

    if (err.status === 401) {
      return NextResponse.json({ error: 'API Key invalida. Verifica ANTHROPIC_API_KEY.' }, { status: 401 });
    }
    if (err.status === 429) {
      return NextResponse.json({ error: 'Limite de tasa excedido. Intenta en unos segundos.' }, { status: 429 });
    }

    return NextResponse.json(
      { error: err.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
