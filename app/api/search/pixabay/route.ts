import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const per_page = searchParams.get('per_page') || '3';
    const image_type = searchParams.get('image_type') || 'all';
    const category = searchParams.get('category') || '';
    const safesearch = searchParams.get('safesearch') || 'true';

    if (!q) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.PIXABAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Pixabay API credentials not configured' }, { status: 500 });
    }

    const pixabayUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(q)}&image_type=${image_type}&per_page=${per_page}&category=${category}&safesearch=${safesearch}`;

    const response = await fetch(pixabayUrl);
    
    const responseText = await response.text();

    if (!response.ok) {
      console.error('Pixabay API error:', responseText);
      return NextResponse.json({ 
        error: 'Pixabay API error', 
        details: responseText,
        status: response.status 
      }, { status: response.status });
    }

    // Prova a parsare come JSON
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('Pixabay JSON parse error:', parseError);
      return NextResponse.json({ 
        error: 'Pixabay API returned invalid JSON', 
        details: responseText 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Pixabay Search API error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
} 