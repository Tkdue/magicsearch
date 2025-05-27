import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const num = searchParams.get('num') || '10';
    const imgSize = searchParams.get('imgSize') || 'medium';

    if (!q) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      return NextResponse.json({ error: 'Google API credentials not configured' }, { status: 500 });
    }

    const googleUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(q)}&searchType=image&num=${num}&imgSize=${imgSize}`;

    const response = await fetch(googleUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('Google API error:', data);
      
      // Gestione specifica per errori di referrer
      if (data.error?.code === 403 && data.error?.message?.includes('referer')) {
        return NextResponse.json({ 
          error: 'Google API referrer restriction', 
          details: 'La API key di Google ha restrizioni sui referrer. Configurare la API key per permettere richieste da localhost:3000',
          suggestion: 'Vai su Google Cloud Console > APIs & Services > Credentials > modifica la API key > HTTP referrers > aggiungi localhost:3000/*'
        }, { status: 403 });
      }
      
      return NextResponse.json({ error: 'Google API error', details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Google Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 