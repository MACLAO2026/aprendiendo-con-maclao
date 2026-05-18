/**
 * File text extraction utilities.
 * Runs server-side only (used in API routes).
 */

/**
 * Extract plain text from a Buffer depending on MIME type / extension.
 * @param {Buffer} buffer
 * @param {string} filename
 * @returns {Promise<string>}
 */
export async function extractText(buffer, filename) {
  const ext = filename.split('.').pop().toLowerCase();

  switch (ext) {
    case 'txt':
      return buffer.toString('utf-8');

    case 'pdf':
      return extractFromPdf(buffer);

    case 'docx':
    case 'doc':
      return extractFromDocx(buffer);

    default:
      throw new Error(`Formato no soportado: .${ext}. Use .txt, .pdf o .docx`);
  }
}

async function extractFromPdf(buffer) {
  try {
    // Dynamic import to avoid bundling issues
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (err) {
    throw new Error(`No se pudo leer el PDF: ${err.message}`);
  }
}

async function extractFromDocx(buffer) {
  try {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err) {
    throw new Error(`No se pudo leer el documento Word: ${err.message}`);
  }
}
