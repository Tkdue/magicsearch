import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  source: string;
  width?: number;
  height?: number;
  description?: string;
}

interface AutomatedSearchRequest {
  tema: string;
  numeroImmagini: number;
  preset?: string;
  uploadToGDrive?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { tema, numeroImmagini, preset = 'COMMERCIAL_PROJECT', uploadToGDrive = true }: AutomatedSearchRequest = await request.json();

    if (!tema || !numeroImmagini) {
      return NextResponse.json(
        { error: 'Tema and numeroImmagini are required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Starting automated search for: "${tema}" - ${numeroImmagini} images`);

    // Step 1: AI Analysis e Query Expansion
    console.log('🤖 Step 1: AI Analysis...');
    const aiResponse = await fetch(`${request.nextUrl.origin}/api/ai/openai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: tema,
        type: 'creative'
      })
    });

    let expandedQueries = [tema]; // fallback
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      expandedQueries = aiData.expanded_query.split(',').map((q: string) => q.trim());
    }

    console.log('📝 Expanded queries:', expandedQueries);

    // Step 2: Multi-API Search parallelo
    console.log('🔍 Step 2: Multi-API Search...');
    const searchPromises = [];
    const providers = ['google', 'unsplash', 'pixabay', 'pexels'];
    
    // Distribuiamo le query tra i provider
    for (let i = 0; i < Math.min(expandedQueries.length, 4); i++) {
      const query = expandedQueries[i];
      const provider = providers[i % providers.length];
      
      searchPromises.push(
        fetch(`${request.nextUrl.origin}/api/search/${provider}?q=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => res.ok ? res.json() : { results: [] })
          .catch(() => ({ results: [] }))
      );
    }

    const searchResults = await Promise.all(searchPromises);
    
    // Step 3: Aggregazione e selezione risultati
    console.log('📊 Step 3: Results aggregation...');
    let allResults: SearchResult[] = [];
    
    searchResults.forEach((result, index) => {
      if (result.results && Array.isArray(result.results)) {
        const providerResults = result.results.map((item: any, idx: number) => ({
          id: `${providers[index % providers.length]}-${index}-${idx}`,
          title: item.title || item.alt_description || `Image ${idx + 1}`,
          url: item.webformatURL || item.urls?.regular || item.src?.large || item.link,
          thumbnail: item.webformatURL || item.urls?.small || item.src?.medium || item.link,
          source: providers[index % providers.length],
          width: item.imageWidth || item.width,
          height: item.imageHeight || item.height,
          description: item.tags || item.description || ''
        }));
        allResults = [...allResults, ...providerResults];
      }
    });

    // Selezione migliori risultati
    const selectedResults = allResults.slice(0, numeroImmagini);
    
    console.log(`✅ Found ${selectedResults.length} images`);

    // Step 4: Upload GDrive (se richiesto)
    let gdriveInfo = null;
    if (uploadToGDrive && selectedResults.length > 0) {
      console.log('☁️ Step 4: GDrive Upload...');
      
      try {
        const gdriveResponse = await fetch(`${request.nextUrl.origin}/api/gdrive/upload-batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tema: tema,
            images: selectedResults,
            timestamp: Date.now()
          })
        });

        if (gdriveResponse.ok) {
          gdriveInfo = await gdriveResponse.json();
          console.log('✅ GDrive upload completed');
        } else {
          console.warn('⚠️ GDrive upload failed');
        }
      } catch (error) {
        console.error('❌ GDrive upload error:', error);
      }
    }

    // Response finale
    return NextResponse.json({
      success: true,
      tema: tema,
      numeroImmagini: numeroImmagini,
      expandedQueries: expandedQueries,
      results: selectedResults,
      totalFound: selectedResults.length,
      gdrive: gdriveInfo,
      timestamp: new Date().toISOString(),
      processingTime: Date.now()
    });

  } catch (error) {
    console.error('❌ Automated search error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during automated search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}