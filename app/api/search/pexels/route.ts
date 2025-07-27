import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const per_page = searchParams.get('per_page') || '2';
    const orientation = searchParams.get('orientation') || 'landscape';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.PEXELS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Pexels API credentials not configured' }, { status: 500 });
    }

    const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${per_page}&orientation=${orientation}`;

    const response = await fetch(pexelsUrl, {
      headers: {
        'Authorization': apiKey
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Pexels API error:', data);
      return NextResponse.json({ error: 'Pexels API error', details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Pexels Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 