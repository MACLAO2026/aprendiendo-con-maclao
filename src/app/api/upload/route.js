import { NextResponse } from 'next/server';
import { extractText } from '@/lib/fileParser';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    const maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'El archivo supera el límite de 50 MB' }, { status: 413 });
    }

    const buffer   = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const text     = await extractText(buffer, filename);

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'El archivo está vacío o no se pudo extraer texto' }, { status: 422 });
    }

    return NextResponse.json({ text, filename });
  } catch (err) {
    console.error('[/api/upload]', err);
    return NextResponse.json(
      { error: err.message || 'Error procesando el archivo' },
      { status: 500 }
    );
  }
}
