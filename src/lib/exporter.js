/**
 * Exporters APA 7 completos: portada, resumen, cuerpo y referencias.
 */

/* ══════════════════════════════════════════════════════════════════
   WORD EXPORT — APA 7 completo
══════════════════════════════════════════════════════════════════ */
export async function exportToWordApa7(text, filename = 'humanizado', meta = {}) {
  const {
    Document, Packer, Paragraph, TextRun,
    AlignmentType, LineRuleType,
    Header, PageNumber, NumberFormat,
  } = await import('docx');

  const TNR  = 'Times New Roman';
  const SZ   = 24;   // 12 pt en half-points
  const LINE = 480;  // doble espacio

  const margin = { top: 1440, right: 1440, bottom: 1440, left: 1440 }; // 1 inch

  /* ── Helpers ── */
  const blank = () => new Paragraph({
    spacing: { line: LINE, lineRule: LineRuleType.AUTO, before: 0, after: 0 },
    children: [new TextRun({ text: '', font: TNR, size: SZ })],
  });

  const centered = (txt, bold = false, sz = SZ) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE, lineRule: LineRuleType.AUTO, before: 0, after: 0 },
      children: [new TextRun({ text: txt, font: TNR, size: sz, bold })],
    });

  const body = (txt) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: 720 },
      spacing: { line: LINE, lineRule: LineRuleType.AUTO, before: 0, after: 0 },
      children: [new TextRun({ text: txt, font: TNR, size: SZ })],
    });

  const heading = (txt) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: LINE, lineRule: LineRuleType.AUTO, before: 0, after: 0 },
      children: [new TextRun({ text: txt, font: TNR, size: SZ, bold: true })],
    });

  /* Referencia con sangría francesa */
  const ref = (txt) =>
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 720, hanging: 720 },
      spacing: { line: LINE, lineRule: LineRuleType.AUTO, before: 0, after: 0 },
      children: [new TextRun({ text: txt, font: TNR, size: SZ })],
    });

  /* Header con número de página alineado a la derecha */
  const pageHeader = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ children: [PageNumber.CURRENT], font: TNR, size: SZ })],
      }),
    ],
  });

  /* ── Sección 1: Portada (página 1) ── */
  const coverChildren = [];
  // 6 líneas en blanco antes del título (APA 7 ≈ upper third)
  for (let i = 0; i < 6; i++) coverChildren.push(blank());
  coverChildren.push(centered(meta.titulo || 'Título del Trabajo', true));
  coverChildren.push(blank());
  if (meta.autor)       coverChildren.push(centered(meta.autor));
  if (meta.institucion) coverChildren.push(centered(meta.institucion));
  if (meta.facultad)    coverChildren.push(centered(meta.facultad));
  if (meta.curso)       coverChildren.push(centered(meta.curso));
  if (meta.docente)     coverChildren.push(centered(meta.docente));
  if (meta.ciudad)      coverChildren.push(centered(meta.ciudad));
  if (meta.fecha)       coverChildren.push(centered(meta.fecha));

  /* ── Sección 2: Resumen (si hay abstract) ── */
  const abstractChildren = [];
  if (meta.abstract && meta.abstract.trim()) {
    abstractChildren.push(heading('Resumen'));
    abstractChildren.push(blank());
    // El abstract no lleva sangría en APA 7
    abstractChildren.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: LINE, lineRule: LineRuleType.AUTO, before: 0, after: 0 },
      children: [new TextRun({ text: meta.abstract.trim(), font: TNR, size: SZ })],
    }));
  }

  /* ── Sección 3: Cuerpo del texto ── */
  const bodyChildren = [];
  bodyChildren.push(heading(meta.titulo || 'Título del Trabajo'));
  bodyChildren.push(blank());

  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
  for (const p of paragraphs) {
    bodyChildren.push(body(p.trim()));
  }

  /* ── Sección 4: Referencias (si hay) ── */
  const refChildren = [];
  if (meta.referencias && meta.referencias.trim()) {
    refChildren.push(heading('Referencias'));
    refChildren.push(blank());
    const refs = meta.referencias.split('\n').filter(r => r.trim());
    for (const r of refs) {
      refChildren.push(ref(r.trim()));
    }
  }

  /* ── Ensamblar secciones ── */
  const sections = [];

  // Portada
  sections.push({
    properties: {
      page: { size: { width: 12240, height: 15840 }, margin },
      pageNumberStart: 1,
      pageNumberFormatType: NumberFormat.DECIMAL,
    },
    headers: { default: pageHeader },
    children: coverChildren,
  });

  // Resumen
  if (abstractChildren.length) {
    sections.push({
      properties: { page: { size: { width: 12240, height: 15840 }, margin } },
      headers: { default: pageHeader },
      children: abstractChildren,
    });
  }

  // Cuerpo
  sections.push({
    properties: { page: { size: { width: 12240, height: 15840 }, margin } },
    headers: { default: pageHeader },
    children: bodyChildren,
  });

  // Referencias
  if (refChildren.length) {
    sections.push({
      properties: { page: { size: { width: 12240, height: 15840 }, margin } },
      headers: { default: pageHeader },
      children: refChildren,
    });
  }

  const doc  = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}_APA7.docx`);
}

/* ══════════════════════════════════════════════════════════════════
   PDF EXPORT — APA 7 completo
══════════════════════════════════════════════════════════════════ */
export async function exportToPdfApa7(text, filename = 'humanizado', meta = {}) {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const PW      = doc.internal.pageSize.getWidth();
  const PH      = doc.internal.pageSize.getHeight();
  const MARGIN  = 25.4;   // 1 inch
  const MAXW    = PW - MARGIN * 2;
  const LH      = 8.47;   // doble espacio 12pt
  const INDENT  = 12.7;   // 0.5 inch

  let page = 1;
  let y    = MARGIN;

  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  /* ── Helpers ── */
  const addPageNum = () => {
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text(String(page), PW - MARGIN, MARGIN - 6, { align: 'right' });
  };

  const newPage = () => {
    doc.addPage();
    page++;
    y = MARGIN + LH;
    addPageNum();
  };

  const checkY = (needed = LH) => { if (y + needed > PH - MARGIN) newPage(); };

  const printLine = (txt, x = MARGIN) => {
    checkY();
    doc.text(txt, x, y);
    y += LH;
  };

  const printWrapped = (txt, x = MARGIN, w = MAXW) => {
    const lines = doc.splitTextToSize(txt, w);
    for (const l of lines) { checkY(); doc.text(l, x, y); y += LH; }
  };

  /* Sangría francesa para referencias */
  const printRef = (txt) => {
    const all   = doc.splitTextToSize(txt, MAXW);
    const first = all[0];
    const rest  = all.slice(1);
    checkY(); doc.text(first, MARGIN, y); y += LH;
    for (const l of rest) { checkY(); doc.text(l, MARGIN + INDENT, y); y += LH; }
  };

  /* ── PORTADA ── */
  addPageNum();
  y = MARGIN + LH * 8; // upper third

  // Título centrado y negrita
  doc.setFont('times', 'bold');
  const titleLines = doc.splitTextToSize(meta.titulo || 'Título del Trabajo', MAXW);
  for (const l of titleLines) { doc.text(l, PW / 2, y, { align: 'center' }); y += LH; }

  doc.setFont('times', 'normal');
  y += LH;
  const coverFields = [
    meta.autor, meta.institucion, meta.facultad,
    meta.curso, meta.docente, meta.ciudad, meta.fecha,
  ].filter(Boolean);
  for (const f of coverFields) {
    doc.text(f, PW / 2, y, { align: 'center' });
    y += LH;
  }

  /* ── RESUMEN ── */
  if (meta.abstract && meta.abstract.trim()) {
    newPage();
    doc.setFont('times', 'bold');
    doc.text('Resumen', PW / 2, y, { align: 'center' });
    doc.setFont('times', 'normal');
    y += LH * 2;
    printWrapped(meta.abstract.trim());
  }

  /* ── CUERPO ── */
  newPage();
  doc.setFont('times', 'bold');
  const bodyTitleLines = doc.splitTextToSize(meta.titulo || 'Título del Trabajo', MAXW);
  for (const l of bodyTitleLines) { doc.text(l, PW / 2, y, { align: 'center' }); y += LH; }
  doc.setFont('times', 'normal');
  y += LH;

  const paras = text.split(/\n\n+/).filter(p => p.trim());
  for (const p of paras) {
    const lines = doc.splitTextToSize(p.trim(), MAXW - INDENT);
    // Primera línea con sangría
    checkY();
    doc.text(lines[0], MARGIN + INDENT, y);
    y += LH;
    // Resto sin sangría
    for (const l of lines.slice(1)) {
      checkY();
      doc.text(l, MARGIN, y);
      y += LH;
    }
    y += LH * 0.1; // sin espacio extra entre párrafos
  }

  /* ── REFERENCIAS ── */
  if (meta.referencias && meta.referencias.trim()) {
    newPage();
    doc.setFont('times', 'bold');
    doc.text('Referencias', PW / 2, y, { align: 'center' });
    doc.setFont('times', 'normal');
    y += LH * 2;
    const refs = meta.referencias.split('\n').filter(r => r.trim());
    for (const r of refs) {
      printRef(r.trim());
      y += LH * 0.5;
    }
  }

  doc.save(`${filename}_APA7.pdf`);
}

/* ══════════════════════════════════════════════════════════════════
   Exporters simples (sin portada) — se mantienen por compatibilidad
══════════════════════════════════════════════════════════════════ */
export async function exportToWord(text, filename = 'humanizado') {
  return exportToWordApa7(text, filename, {});
}

export async function exportToPdf(text, filename = 'humanizado') {
  return exportToPdfApa7(text, filename, {});
}

/* ── Helper ── */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
