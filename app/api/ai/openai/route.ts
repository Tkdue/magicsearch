import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '../../../../api-config';

export async function POST(request: NextRequest) {
  try {
    const { query, type = 'creative' } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    if (!API_CONFIG.OPENAI.API_KEY) {
      return NextResponse.json({ error: 'OpenAI API credentials not configured' }, { status: 500 });
    }

    const prompt = type === 'creative' 
      ? `Expand this image search query creatively for better visual results: "${query}". Generate 3-5 related, specific search terms that would find diverse, high-quality, relevant images. Include synonyms, related concepts, and visual descriptors. Return only the search terms separated by commas, no explanations.`
      : `Improve this image search query for more precise results: "${query}". Return only the improved search term, no explanations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.OPENAI.API_KEY}`,
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENAI.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at expanding image search queries to find the most relevant, high-quality visual content. Focus on specific, descriptive terms that will yield coherent results.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: API_CONFIG.OPENAI.MAX_TOKENS,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return NextResponse.json({ error: 'OpenAI API error', details: error }, { status: response.status });
    }

    const data = await response.json();
    const expandedQuery = data.choices?.[0]?.message?.content?.trim();

    if (!expandedQuery) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 });
    }

    return NextResponse.json({
      original_query: query,
      expanded_query: expandedQuery,
      type: type,
      provider: 'openai'
    });
  } catch (error) {
    console.error('OpenAI API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 