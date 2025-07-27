import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '../../../../api-config';

export async function POST(request: NextRequest) {
  try {
    const { query, type = 'creative' } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!API_CONFIG.GEMINI.API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const prompt = type === 'creative' 
      ? `Expand this image search query creatively: "${query}". Generate 3-5 related search terms that would find diverse, high-quality images. Return only the search terms, separated by commas, no explanations.`
      : `Refine this image search query for better results: "${query}". Return only the improved search term, no explanations.`;

    const response = await fetch(
      `${API_CONFIG.GEMINI.BASE_URL}/models/${API_CONFIG.GEMINI.MODEL}:generateContent?key=${API_CONFIG.GEMINI.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: API_CONFIG.GEMINI.MAX_TOKENS,
            temperature: 0.8,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to expand query with Gemini' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const expandedQuery = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!expandedQuery) {
      return NextResponse.json(
        { error: 'No response from Gemini' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      original_query: query,
      expanded_query: expandedQuery,
      type: type,
      provider: 'gemini'
    });

  } catch (error) {
    console.error('Gemini AI Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}