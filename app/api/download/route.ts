import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName, downloadPath } = await request.json();

    if (!imageUrl || !fileName) {
      return NextResponse.json({ error: 'Image URL and filename are required' }, { status: 400 });
    }

    // Gestisci percorsi assoluti e relativi
    let basePath: string;
    if (downloadPath && path.isAbsolute(downloadPath)) {
      basePath = downloadPath;
    } else {
      basePath = path.join(process.cwd(), downloadPath || 'downloads/magic-search');
    }
    
    // Assicuriamoci che la directory esista
    try {
      await mkdir(basePath, { recursive: true });
      console.log(`Directory created/verified: ${basePath}`);
    } catch (error) {
      console.log('Directory creation error:', error);
    }

    // Download dell'immagine
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
      return NextResponse.json({ error: 'Failed to download image', details: `${imageResponse.status} ${imageResponse.statusText}` }, { status: 400 });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Genera un nome file sicuro
    const safeFileName = fileName.replace(/[^a-z0-9.-]/gi, '_');
    const timestamp = Date.now();
    const finalFileName = `${timestamp}_${safeFileName}`;
    const filePath = path.join(basePath, finalFileName);

    // Salva il file
    await writeFile(filePath, buffer);
    console.log(`File saved successfully: ${filePath}`);

    return NextResponse.json({ 
      success: true, 
      filePath: filePath,
      fileName: finalFileName,
      directory: basePath,
      size: buffer.length,
      message: 'Image downloaded successfully' 
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 