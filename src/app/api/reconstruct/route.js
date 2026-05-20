import { NextResponse } from 'next/server';
import { reconstructDocx } from '@/lib/docxReconstructor';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const originalFile = formData.get('original');
    const humanizedText = formData.get('humanizedText');
    const filename = formData.get('filename') || 'humanizado';

    if (!originalFile || !humanizedText) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const buffer = Buffer.from(await originalFile.arrayBuffer());
    const newDocxBuffer = await reconstructDocx(buffer, humanizedText);

    return new Response(newDocxBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}_humanizado.docx"`,
      },
    });
  } catch (err) {
    console.error('[/api/reconstruct]', err);
    return NextResponse.json(
      { error: err.message || 'Error al reconstruir el documento' },
      { status: 500 }
    );
  }
}
