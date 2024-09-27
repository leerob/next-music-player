import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(
  _: any,
  { params }: { params: Promise<{ filename: string }> }
) {
  let filename = (await params).filename;
  let audioDirectory = path.join(process.cwd(), 'tracks');
  let filePath = path.join(audioDirectory, filename);

  try {
    let fileBuffer = await fs.readFile(filePath);
    let response = new NextResponse(fileBuffer);

    response.headers.set('Content-Type', 'audio/mpeg');
    response.headers.set('Content-Length', fileBuffer.byteLength.toString());

    return response;
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
