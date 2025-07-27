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

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      return NextResponse.json({ error: 'Unsplash API credentials not configured' }, { status: 500 });
    }

    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${per_page}&orientation=${orientation}`;

    const response = await fetch(unsplashUrl, {
      headers: {
        'Authorization': `Client-ID ${accessKey}`,
        'Accept-Version': 'v1'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Unsplash API error:', data);
      return NextResponse.json({ error: 'Unsplash API error', details: data }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unsplash Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 