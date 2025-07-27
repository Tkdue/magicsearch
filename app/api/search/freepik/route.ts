import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    const limit = searchParams.get('limit') || '2';
    const orientation = searchParams.get('orientation') || 'horizontal';

    if (!term) {
      return NextResponse.json({ error: 'Term parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.FREEPIK_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Freepik API credentials not configured' }, { status: 500 });
    }

    const freepikUrl = `https://api.freepik.com/v1/resources?term=${encodeURIComponent(term)}&limit=${limit}&orientation=${orientation}`;

    const response = await fetch(freepikUrl, {
      headers: {
        'X-Freepik-API-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Freepik API error:', data);
      return NextResponse.json({ error: 'Freepik API error', details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Freepik Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 