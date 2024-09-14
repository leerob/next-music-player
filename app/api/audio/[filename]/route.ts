import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  _: any,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  const audioDirectory = path.join(process.cwd(), 'tracks');
  const filePath = path.join(audioDirectory, filename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const response = new NextResponse(fileBuffer);

    response.headers.set('Content-Type', 'audio/mpeg');
    response.headers.set('Content-Length', fileBuffer.byteLength.toString());

    return response;
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
