/**
 * .docx XML manipulation for structure-preserving humanization.
 * Extracts only non-table paragraph text for humanization,
 * then reconstructs the .docx replacing those paragraphs with humanized text.
 */

function isTableOpen(xml, pos) {
  if (!xml.startsWith('<w:tbl', pos)) return false;
  const c = xml[pos + 6];
  return c === '>' || c === ' ' || c === '\t' || c === '\n' || c === '\r';
}

function isTableClose(xml, pos) {
  return xml.startsWith('</w:tbl>', pos);
}

function isParaOpen(xml, pos) {
  if (!xml.startsWith('<w:p', pos)) return false;
  if (xml.startsWith('</w:p', pos)) return false;
  const c = xml[pos + 4];
  return c === '>' || c === ' ' || c === '\t' || c === '\n' || c === '\r';
}

function extractParaText(pXml) {
  const texts = [];
  const regex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
  let m;
  while ((m = regex.exec(pXml)) !== null) texts.push(m[1]);
  return texts.join('');
}

function replaceParaText(pXml, newText) {
  const escaped = newText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const openMatch = pXml.match(/^<w:p[^>]*>/);
  const openTag = openMatch ? openMatch[0] : '<w:p>';

  const pPrMatch = pXml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/);
  const pPr = pPrMatch ? pPrMatch[0] : '';

  const rPrMatch = pXml.match(/<w:rPr>[\s\S]*?<\/w:rPr>/);
  const rPr = rPrMatch ? rPrMatch[0] : '';

  const newRun = `<w:r>${rPr}<w:t xml:space="preserve">${escaped}</w:t></w:r>`;
  return `${openTag}${pPr}${newRun}</w:p>`;
}

function walkParagraphs(xml, { onPara, onOther } = {}) {
  let pos = 0;
  let tableDepth = 0;

  while (pos < xml.length) {
    const nextLt = xml.indexOf('<', pos);
    if (nextLt === -1) { onOther?.(xml.slice(pos)); break; }

    onOther?.(xml.slice(pos, nextLt));
    pos = nextLt;

    if (isTableClose(xml, pos)) {
      tableDepth = Math.max(0, tableDepth - 1);
      onOther?.('</w:tbl>');
      pos += 8;
    } else if (isTableOpen(xml, pos)) {
      tableDepth++;
      const end = xml.indexOf('>', pos);
      if (end === -1) { onOther?.(xml.slice(pos)); break; }
      onOther?.(xml.slice(pos, end + 1));
      pos = end + 1;
    } else if (tableDepth === 0 && isParaOpen(xml, pos)) {
      const pEnd = xml.indexOf('</w:p>', pos);
      if (pEnd === -1) { onOther?.(xml.slice(pos)); break; }
      const pClose = pEnd + 6;
      const pXml = xml.slice(pos, pClose);
      onPara?.(pXml, tableDepth);
      pos = pClose;
    } else {
      const end = xml.indexOf('>', pos);
      if (end === -1) { onOther?.(xml.slice(pos)); break; }
      onOther?.(xml.slice(pos, end + 1));
      pos = end + 1;
    }
  }
}

/**
 * Extract only non-table paragraph text from .docx XML.
 * Used so the humanizer only processes prose, not table cell data.
 */
export async function extractNonTableText(buffer) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file('word/document.xml').async('text');

  const paragraphs = [];
  walkParagraphs(xml, {
    onPara(pXml) {
      const text = extractParaText(pXml).trim();
      if (text) paragraphs.push(text);
    },
  });

  return paragraphs.join('\n\n');
}

/**
 * Reconstruct .docx replacing non-table paragraphs with humanized text.
 * Tables, images, headers, footers are preserved untouched.
 */
export async function reconstructDocx(originalBuffer, humanizedText) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(originalBuffer);
  const xml = await zip.file('word/document.xml').async('text');

  const humanizedParas = humanizedText
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  let humanIdx = 0;
  let newXml = '';

  walkParagraphs(xml, {
    onPara(pXml) {
      const pText = extractParaText(pXml).trim();
      if (pText && humanIdx < humanizedParas.length) {
        newXml += replaceParaText(pXml, humanizedParas[humanIdx++]);
      } else {
        newXml += pXml;
      }
    },
    onOther(chunk) {
      newXml += chunk;
    },
  });

  zip.file('word/document.xml', newXml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}
