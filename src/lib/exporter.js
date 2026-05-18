/**
 * Client-side exporters for Word (.docx) and PDF.
 */

/* ── Word Export ────────────────────────────────────────────────────── */
export async function exportToWord(text, filename = 'humanizado') {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, LineRuleType } = await import('docx');

  // APA 7: Times New Roman 12pt, doble espacio, sangría 1.27 cm, márgenes 2.54 cm
  const paragraphs = text
    .split(/\n\n+/)
    .filter(p => p.trim().length > 0)
    .map(p =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 720 },          // 0.5 inch = 1.27 cm
        spacing: {
          line: 480,                          // doble espacio (240 = simple)
          lineRule: LineRuleType.AUTO,
          before: 0,
          after: 0,
        },
        children: [
          new TextRun({
            text: p.trim(),
            font: 'Times New Roman',
            size: 24,                         // 12pt (unidades en medios puntos)
          }),
        ],
      })
    );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },     // Letter
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 2.54 cm
          },
        },
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}

/* ── PDF Export ─────────────────────────────────────────────────────── */
export async function exportToPdf(text, filename = 'humanizado') {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',   // APA 7 usa carta (8.5×11 in)
  });

  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin     = 25.4;                    // 1 inch = 25.4 mm (APA 7)
  const maxWidth   = pageWidth - margin * 2;
  const lineHeight = 8.47;                    // doble espacio ≈ 12pt × 2 / 2.835
  const indent     = 12.7;                    // 0.5 inch sangría primera línea
  let y = margin + lineHeight;
  let pageNum = 1;

  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  const addPageNumber = () => {
    doc.setFontSize(12);
    doc.text(String(pageNum), pageWidth - margin, margin - 5, { align: 'right' });
  };

  addPageNumber();

  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  for (const para of paragraphs) {
    // Primera línea con sangría, resto sin sangría
    const firstLineWidth  = maxWidth - indent;
    const firstLineText   = doc.splitTextToSize(para.trim(), firstLineWidth);
    const restText        = firstLineText.slice(1).join(' ');
    const restLines       = restText ? doc.splitTextToSize(restText, maxWidth) : [];
    const allLines        = [firstLineText[0], ...restLines].filter(Boolean);

    const blockHeight = allLines.length * lineHeight;

    if (y + blockHeight > pageHeight - margin) {
      doc.addPage();
      pageNum++;
      y = margin + lineHeight;
      addPageNumber();
    }

    // Primera línea con sangría
    doc.text(firstLineText[0], margin + indent, y);
    y += lineHeight;

    // Resto de líneas sin sangría
    for (const line of restLines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        pageNum++;
        y = margin + lineHeight;
        addPageNumber();
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
  }

  doc.save(`${filename}.pdf`);
}

/* ── Helpers ────────────────────────────────────────────────────────── */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
