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
    let expandedQueries = [tema]; // fallback principale
    
    try {
      const aiResponse = await fetch(`${request.nextUrl.origin}/api/ai/openai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: tema,
          type: 'creative'
        })
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        if (aiData.expanded_query) {
          expandedQueries = aiData.expanded_query.split(',').map((q: string) => q.trim()).filter((q: string) => q.length > 0);
          console.log('✅ AI expansion successful');
        }
      } else {
        console.warn('⚠️ AI expansion failed, using original query');
      }
    } catch (error) {
      console.error('❌ AI expansion error:', error);
      // Fallback: creiamo variazioni manuali del tema
      const keywords = tema.toLowerCase().split(' ');
      if (keywords.length > 1) {
        expandedQueries = [
          tema,
          keywords[0],
          keywords.slice(0, 2).join(' '),
          `${tema} photography`,
          `${tema} images`
        ].slice(0, 4);
      }
    }

    // Assicuriamoci di avere almeno la query originale
    if (expandedQueries.length === 0 || !expandedQueries.some(q => q.length > 0)) {
      expandedQueries = [tema];
    }

    console.log('📝 Final queries:', expandedQueries);

    // Step 2: Multi-API Search parallelo
    console.log('🔍 Step 2: Multi-API Search...');
    const searchPromises = [];
    const providers = ['google', 'unsplash', 'pixabay', 'pexels'];
    
    // Distribuiamo le query tra i provider con parametri corretti
    for (let i = 0; i < Math.min(expandedQueries.length, 4); i++) {
      const query = expandedQueries[i];
      const provider = providers[i % providers.length];
      
      let searchUrl = '';
      switch (provider) {
        case 'google':
          searchUrl = `${request.nextUrl.origin}/api/search/google?q=${encodeURIComponent(query)}&num=5`;
          break;
        case 'unsplash':
          searchUrl = `${request.nextUrl.origin}/api/search/unsplash?query=${encodeURIComponent(query)}&per_page=5`;
          break;
        case 'pixabay':
          searchUrl = `${request.nextUrl.origin}/api/search/pixabay?q=${encodeURIComponent(query)}&per_page=5`;
          break;
        case 'pexels':
          searchUrl = `${request.nextUrl.origin}/api/search/pexels?query=${encodeURIComponent(query)}&per_page=5`;
          break;
        default:
          searchUrl = `${request.nextUrl.origin}/api/search/${provider}?q=${encodeURIComponent(query)}`;
      }
      
      searchPromises.push(
        fetch(searchUrl, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(res => {
          console.log(`${provider} search response status:`, res.status);
          return res.ok ? res.json() : { results: [], error: `HTTP ${res.status}` };
        }).catch(error => {
          console.error(`${provider} search error:`, error);
          return { results: [], error: error.message };
        })
      );
    }

    const searchResults = await Promise.all(searchPromises);
    
    // Step 3: Aggregazione e selezione risultati
    console.log('📊 Step 3: Results aggregation...');
    let allResults: SearchResult[] = [];
    
    searchResults.forEach((result, index) => {
      const provider = providers[index % providers.length];
      console.log(`Processing ${provider} results:`, result);
      
      let items = [];
      
      // Strutture dati diverse per ogni provider
      switch (provider) {
        case 'google':
          items = result.items || [];
          break;
        case 'unsplash':
          items = result.results || [];
          break;
        case 'pixabay':
          items = result.hits || [];
          break;
        case 'pexels':
          items = result.photos || [];
          break;
        default:
          items = result.results || [];
      }
      
      if (Array.isArray(items)) {
        const providerResults = items.map((item: any, idx: number) => {
          let imageData = {
            id: `${provider}-${index}-${idx}`,
            title: '',
            url: '',
            thumbnail: '',
            source: provider,
            width: 0,
            height: 0,
            description: ''
          };
          
          // Mapping specifico per provider
          switch (provider) {
            case 'google':
              imageData = {
                ...imageData,
                title: item.title || `Google Image ${idx + 1}`,
                url: item.link || '',
                thumbnail: item.image?.thumbnailLink || item.link || '',
                width: item.image?.width || 0,
                height: item.image?.height || 0,
                description: item.snippet || ''
              };
              break;
            case 'unsplash':
              imageData = {
                ...imageData,
                title: item.alt_description || item.description || `Unsplash Image ${idx + 1}`,
                url: item.urls?.regular || item.urls?.full || '',
                thumbnail: item.urls?.small || item.urls?.thumb || '',
                width: item.width || 0,
                height: item.height || 0,
                description: item.description || item.alt_description || ''
              };
              break;
            case 'pixabay':
              imageData = {
                ...imageData,
                title: item.tags || `Pixabay Image ${idx + 1}`,
                url: item.webformatURL || item.largeImageURL || '',
                thumbnail: item.previewURL || item.webformatURL || '',
                width: item.imageWidth || 0,
                height: item.imageHeight || 0,
                description: item.tags || ''
              };
              break;
            case 'pexels':
              imageData = {
                ...imageData,
                title: item.alt || `Pexels Image ${idx + 1}`,
                url: item.src?.large || item.src?.original || '',
                thumbnail: item.src?.medium || item.src?.small || '',
                width: item.width || 0,
                height: item.height || 0,
                description: item.alt || ''
              };
              break;
          }
          
          return imageData;
        }).filter(item => item.url && item.thumbnail); // Solo immagini con URL validi
        
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