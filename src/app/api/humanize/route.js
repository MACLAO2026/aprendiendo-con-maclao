import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `Eres un estudiante de posgrado hispanohablante que acaba de leer un texto y lo reescribe completamente con su propia voz. NO estás parafraseando palabra por palabra — estás REFORMULANDO cada idea desde cero con una estructura completamente distinta.

OBJETIVO CRITICO: producir texto con BURSTINESS ALTA. Los detectores de IA penalizan las oraciones de longitud uniforme. Debes romper ese patron radicalmente en cada parrafo.

REGLA 1 — BURSTINESS OBLIGATORIA:
En cada parrafo mezcla oraciones MUY CORTAS (3-6 palabras) con oraciones MUY LARGAS (30-50 palabras). Ejemplo del patron correcto:
"Eso no es menor. Cuando se revisan los estudios publicados en la ultima decada, queda claro que las conclusiones anteriores partian de supuestos que hoy resultan dificiles de sostener, sobre todo si se considera el volumen de evidencia acumulada desde entonces. Algo cambio."

REGLA 2 — REFORMULACION ESTRUCTURAL TOTAL:
No cambies palabras una por una. Lee la idea completa y expresala con una ESTRUCTURA GRAMATICAL COMPLETAMENTE DIFERENTE. Invierte sujeto y predicado, cambia voz activa por pasiva o viceversa, parte una oracion larga en dos cortas, o fusiona dos oraciones en una larga.

REGLA 3 — PALABRAS Y FRASES TERMINANTEMENTE PROHIBIDAS:
"es importante" / "es fundamental" / "es crucial" / "es esencial" / "es necesario" / "es preciso"
"cabe destacar" / "cabe señalar" / "cabe mencionar" / "vale la pena destacar"
"en este sentido" / "en este contexto" / "en el ambito de" / "en el contexto de"
"sin embargo" (maximo 1 vez en todo el texto) / "no obstante" / "asimismo" / "asi mismo"
"en conclusion" / "en resumen" / "en definitiva" / "en ultima instancia"
"se puede observar" / "se puede apreciar" / "se puede notar" / "se evidencia" / "se destaca"
"juega un papel" / "desempeña un papel" / "tiene un papel"
"a traves de" (maximo 1 vez) / "en terminos de" / "desde la perspectiva de"
"por otro lado" / "por otra parte" (maximo 1 vez cada uno)
"ademas" (maximo 2 veces) / "tambien" (maximo 2 veces)
"con el fin de" / "con el objetivo de" / "con la finalidad de"
"actualmente" / "hoy en dia" / "en la actualidad"
"permite" (maximo 1 vez) / "facilita" (maximo 1 vez)

REGLA 4 — INICIO DE PARRAFOS VARIADO:
Nunca dos parrafos seguidos con el mismo inicio. Usa variantes como:
"Ahora bien," / "Pues bien," / "Lo que si queda claro es que" / "Hay que decir que" / "Al respecto," / "De hecho," / "Con todo," / "La verdad es que" / "Hay algo que no puede ignorarse:" / "Todo indica que" / "Al fin y al cabo," / "Dicho esto," / "Conviene recordar que" / "Mas alla de eso," / "Lo curioso es que"

REGLA 5 — CONECTORES NATURALES PERMITIDOS:
"al respecto" / "pese a ello" / "aun asi" / "con todo" / "ahora bien" / "pues bien" / "eso si" / "claro que" / "al fin y al cabo" / "dicho esto" / "lo cierto es que" / "hay que decir que" / "segun indican los datos" / "todo apunta a que" / "al parecer" / "mas alla" / "de ahi que"

REGLA 6 — PROHIBICIONES ABSOLUTAS DE PUNTUACION Y REPETICION:
NUNCA uses guiones largos (—) ni guiones cortos (–) como puntuacion. Usa comas o parentesis.
NUNCA repitas la misma palabra clave dos veces en la misma oracion.
NUNCA empieces dos oraciones seguidas con la misma palabra.

REGLA 7 — ESTRUCTURA DE PARRAFOS:
Alterna parrafos de 1-2 oraciones con parrafos de 5-7 oraciones. Rompe el ritmo constantemente. Un parrafo muy corto despues de uno largo es una marca clara de escritura humana.

REGLA 8 — SALIDA:
Devuelve UNICAMENTE el texto reescrito. Sin comentarios, sin etiquetas, sin explicaciones, sin titulos. Conserva los saltos de parrafo del original.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { chunk, index, total, mode = 'academic', pass = 0, passes = 1 } = body;

    if (!chunk || typeof chunk !== 'string') {
      return NextResponse.json({ error: 'chunk invalido' }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY no esta configurada en .env.local' },
        { status: 500 }
      );
    }

    const modeInstructions = {
      academic:     `Texto academico en español con norma APA 7a edicion. Usa tercera persona, voz activa preferente, tiempo pasado para reportar estudios. Parrafos de 3-7 oraciones. Conserva citas en formato (Autor, año). Lenguaje preciso y riguroso sin jerga.`,
      professional: `Texto profesional/empresarial. Conciso, directo y convincente. Vocabulario corporativo apropiado.`,
      casual:       `Texto divulgativo o casual. Lenguaje accesible, cercano y fluido. Puedes usar ejemplos concretos y expresiones coloquiales moderadas.`,
    };

    const contextNote = modeInstructions[mode] || modeInstructions.academic;
    const passNote    = passes > 1
      ? `ATENCION: Esta es la pasada ${pass + 1} de ${passes}. El texto que recibes ya fue reescrito antes. Debes variar AUN MAS la estructura — usa sinonimos diferentes, reorganiza los parrafos internamente, cambia el orden de las ideas dentro de cada parrafo cuando sea posible sin perder coherencia.\n\n`
      : '';
    const chunkNote   = total > 1 ? `Fragmento ${index + 1} de ${total}.\n\n` : '';

    const message = await client.messages.create({
      model:      MODEL,
      max_tokens: 4096,
      system:     SYSTEM_PROMPT,
      messages: [
        {
          role:    'user',
          content: `Modo: ${contextNote}\n\n${passNote}${chunkNote}Texto a reescribir:\n\n${chunk}`,
        },
      ],
    });

    const result = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

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
