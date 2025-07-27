import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    const page_size = searchParams.get('page_size') || '2';

    if (!term) {
      return NextResponse.json({ error: 'Term parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.ENVATO_API_TOKEN;

    if (!apiKey) {
      return NextResponse.json({ error: 'Envato API credentials not configured' }, { status: 500 });
    }

    const envatoUrl = `https://api.envato.com/v1/discovery/search/search/item?term=${encodeURIComponent(term)}&page_size=${page_size}`;

    const response = await fetch(envatoUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (compatible; MagicSearch/1.0)'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Envato API error:', error);
      return NextResponse.json({ error: 'Envato API error', details: error }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Envato Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 