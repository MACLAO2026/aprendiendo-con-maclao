/**
 * Text chunker — splits long documents into coherent segments.
 * Respects paragraph boundaries to preserve context.
 */

const DEFAULT_CHUNK_WORDS = parseInt(process.env.CHUNK_SIZE || '600', 10);

/**
 * Split text into chunks of approximately `maxWords` words each.
 * Splits at paragraph boundaries first, then at sentence boundaries.
 * @param {string} text
 * @param {number} maxWords
 * @returns {string[]}
 */
export function splitIntoChunks(text, maxWords = DEFAULT_CHUNK_WORDS) {
  if (!text || text.trim().length === 0) return [];

  // Normalise line endings
  const normalised = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split on double newlines (paragraph boundaries)
  const paragraphs = normalised.split(/\n\n+/).filter(p => p.trim().length > 0);

  const chunks = [];
  let current = [];
  let wordCount = 0;

  for (const para of paragraphs) {
    const paraWords = countWords(para);

    // If a single paragraph exceeds the limit, split it by sentences
    if (paraWords > maxWords) {
      if (current.length > 0) {
        chunks.push(current.join('\n\n'));
        current = [];
        wordCount = 0;
      }
      const subChunks = splitBySentence(para, maxWords);
      chunks.push(...subChunks);
      continue;
    }

    if (wordCount + paraWords > maxWords && current.length > 0) {
      chunks.push(current.join('\n\n'));
      current = [];
      wordCount = 0;
    }

    current.push(para);
    wordCount += paraWords;
  }

  if (current.length > 0) {
    chunks.push(current.join('\n\n'));
  }

  return chunks;
}

function splitBySentence(text, maxWords) {
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
  const chunks = [];
  let current = [];
  let wordCount = 0;

  for (const sentence of sentences) {
    const sw = countWords(sentence);
    if (wordCount + sw > maxWords && current.length > 0) {
      chunks.push(current.join(' ').trim());
      current = [];
      wordCount = 0;
    }
    current.push(sentence);
    wordCount += sw;
  }

  if (current.length > 0) chunks.push(current.join(' ').trim());
  return chunks;
}

/**
 * Count words in a string.
 */
export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Count characters in a string.
 */
export function countChars(text) {
  return text.length;
}

/**
 * Join chunks back together preserving paragraph separation.
 */
export function joinChunks(chunks) {
  return chunks.join('\n\n');
}
