import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName } = await request.json();

    if (!imageUrl || !fileName) {
      return NextResponse.json({ error: 'Image URL and filename are required' }, { status: 400 });
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

    // Determina il content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Restituisci l'immagine come blob per download diretto dal browser
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 