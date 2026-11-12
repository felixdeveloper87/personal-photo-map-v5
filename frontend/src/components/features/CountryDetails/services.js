import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { buildApiUrl } from '../../../utils/apiConfig';

// Register English locale
countries.registerLocale(en);

export const fetchCountryData = async (countryId) => {
  if (!countryId || countryId === 'undefined') {
    console.error('fetchCountryData: countryId is undefined or invalid');
    throw new Error('Invalid country ID provided');
  }
  
  // Primeiro tenta buscar do backend (que tem cache)
  try {
    const backendUrl = buildApiUrl(`/api/countries/${countryId}/info/basic`);
    const backendResponse = await fetch(backendUrl);
    
    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      
      // O backend retorna os dados no formato que precisamos
      return {
        officialLanguage: backendData.officialLanguage || 'N/A',
        currency: backendData.currency || 'N/A',
        currencyName: backendData.currencyName || 'Unknown Currency',
        capital: backendData.capital || 'N/A',
        population: backendData.population || 0,
        nativeName: backendData.nativeName || countryId.toUpperCase(),
        latitude: backendData.latitude || null,
        longitude: backendData.longitude || null,
      };
    } else {
      console.warn(`⚠️ [CountryData] Backend retornou status ${backendResponse.status}. Tentando GeoDB...`);
    }
  } catch (backendError) {
    console.warn('⚠️ [CountryData] Backend API failed. Trying GeoDB...', backendError);
  }
  
  // Fallback para GeoDB (RestCountries v5 exige API key, por isso só é chamada pelo backend)
  try {
    const geoDbUrl = `https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryId.toUpperCase()}`;
    const geoDbResponse = await fetch(geoDbUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'daf418934fmshf85c3a6a3375a4dp11c91ejsnd32ae998c868',
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
      },
    });
    if (!geoDbResponse.ok) throw new Error('GeoDB API also failed');
    const result = await geoDbResponse.json();
    const country = result.data;
    

    return {
      officialLanguage: 'N/A',
      currency: 'N/A',
      currencyName: 'Unknown Currency',
      capital: country.capital || 'N/A',
      population: country.population || 0,
      nativeName: countries.getName(countryId.toUpperCase(), 'en') || countryId.toUpperCase(),
      latitude: country.latitude || null,
      longitude: country.longitude || null,
    };
  } catch (fallbackError) {
    console.error('❌ [CountryData] All APIs failed:', fallbackError);
    throw new Error('Unable to fetch country data from any API');
  }
};



export const fetchWeatherData = async (capital, countryCode) => {
  const query = `${capital},${countryCode}`;
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(query)}&units=metric&appid=e95265ec87670e7e1d84bd49cff7e84c`
  );
  if (!response.ok) throw new Error('Weather data not found');
  const data = await response.json();
  return {
    temperature: data.main?.temp,
    timezone: data.timezone,
    description: data.weather?.[0]?.description,
    icon: data.weather?.[0]?.icon,
    coord: data.coord,
  };
};

// Returns every conversion rate relative to USD; cross rates are derived client-side
// so the user can pick their own base currency without another request.
export const fetchExchangeRates = async () => {
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/c70ba82c951cf6c5b6757ff5/latest/USD`
  );
  if (!response.ok) throw new Error('Exchange rate not found');
  const data = await response.json();
  return data.conversion_rates || {};
};

export const fetchFactbookData = async (countryId) => {
  try {
    // Dados base do Factbook (sem religião)
    const factbookData = {
      government: 'Democratic Republic',
      economy: 'Mixed Economy',
      population: 'Varies by country',
      geography: 'Diverse landscapes',
      people: 'Multi-ethnic population',
      culture: 'Cultural heritage information available',
      wikipediaSummary: null
    };
    
    return factbookData;
  } catch (error) {
    console.error('Error fetching Factbook data:', error);
    return {
      government: 'N/A',
      economy: 'N/A',
      population: 'N/A',
      geography: 'N/A',
      people: 'N/A',
      culture: 'N/A',
      wikipediaSummary: null
    };
  }
};

// Cache de traduções no frontend (evita chamadas repetidas)
const translationCache = new Map();

// Função para traduzir texto usando API gratuita (MyMemory Translation)
export const translateText = async (text, targetLang, onLimitExceeded) => {
  if (!text || targetLang === 'en') {
    return text;
  }

  // Verificar cache
  const cacheKey = `${text.substring(0, 50)}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    
    // MyMemory tem limite de 500 caracteres por requisição (após encoding da URL)
    // Usar 400 caracteres para ter margem de segurança com o encoding
    const MAX_CHARS_PER_REQUEST = 400;
    
    // Sempre dividir em chunks se o texto for maior que o limite
    if (text.length > MAX_CHARS_PER_REQUEST) {
      
      // Dividir o texto em chunks menores
      const chunks = [];
      let startIndex = 0;
      
      while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + MAX_CHARS_PER_REQUEST, text.length);
        
        // Se não for o último chunk, tentar quebrar em um ponto natural (quebra de linha ou espaço)
        if (endIndex < text.length) {
          // Procurar pela última quebra de linha no chunk
          const lastNewline = text.lastIndexOf('\n', endIndex);
          if (lastNewline > startIndex + 100) { // Só usar se não for muito perto do início
            endIndex = lastNewline + 1;
          } else {
            // Se não encontrar quebra de linha, procurar pelo último espaço
            const lastSpace = text.lastIndexOf(' ', endIndex);
            if (lastSpace > startIndex + 100) { // Só usar se não for muito perto do início
              endIndex = lastSpace + 1;
            }
          }
        }
        
        const chunk = text.substring(startIndex, endIndex).trim();
        if (chunk.length > 0) {
          // Validar tamanho do chunk antes de adicionar
          if (chunk.length > MAX_CHARS_PER_REQUEST) {
            console.warn(`⚠️ [Translation] Chunk ${chunks.length + 1} is too large (${chunk.length} chars), forcing split at ${MAX_CHARS_PER_REQUEST}`);
            // Forçar divisão exata
            chunks.push(chunk.substring(0, MAX_CHARS_PER_REQUEST));
            startIndex = startIndex + MAX_CHARS_PER_REQUEST;
            continue;
          }
          chunks.push(chunk);
        }
        
        startIndex = endIndex;
      }
      
      
      // Validar todos os chunks antes de traduzir
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].length > MAX_CHARS_PER_REQUEST) {
          console.error(`❌ [Translation] Chunk ${i + 1} is too large: ${chunks[i].length} chars (max: ${MAX_CHARS_PER_REQUEST})`);
          return text; // Retornar texto original se algum chunk for muito grande
        }
      }
      
      // Traduzir chunks em paralelo com concorrência limitada (antes: sequencial + 200ms de espera
      // entre cada um, o que somava vários segundos em textos longos)
      const CONCURRENCY = 4;
      const translatedChunks = new Array(chunks.length);
      let nextIndex = 0;
      let failed = false;
      const worker = async () => {
        while (!failed && nextIndex < chunks.length) {
          const i = nextIndex++;
          const translatedChunk = await translateSingleChunk(chunks[i], targetLang, onLimitExceeded);
          if (translatedChunk === null) {
            console.warn(`⚠️ [Translation] Chunk ${i + 1} translation failed, returning original text`);
            failed = true;
            return;
          }
          translatedChunks[i] = translatedChunk;
        }
      };
      await Promise.all(Array.from({ length: Math.min(CONCURRENCY, chunks.length) }, worker));
      if (failed) return text;

      const translated = translatedChunks.join('\n\n');
      translationCache.set(cacheKey, translated);
      return translated;
    } else {
      // Texto pequeno, traduzir diretamente
      const translated = await translateSingleChunk(text, targetLang, onLimitExceeded);
      if (translated !== null) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
      return text;
    }
  } catch (error) {
    console.warn(`❌ [Translation] Error translating to ${targetLang}:`, error);
    return text; // Retorna texto original em caso de erro
  }
};

// Função auxiliar para traduzir um único chunk
const translateSingleChunk = async (text, targetLang, onLimitExceeded) => {
  try {
    // Validar tamanho do chunk antes de enviar (considerando encoding da URL)
    if (text.length > 400) {
      console.error(`❌ [Translation] Chunk too large: ${text.length} chars (max: 400). This should not happen!`);
      return null;
    }
    
    // Usar MyMemory Translation API (gratuita, com limite de 10000 caracteres/dia)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`⚠️ [Translation] Daily limit exceeded (HTTP 429)`);
        if (onLimitExceeded) {
          onLimitExceeded();
        }
        return null;
      }
      throw new Error(`Translation API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Verificar se o limite de caracteres por requisição foi excedido (403)
    if (data.responseStatus === 403 || (data.responseDetails && data.responseDetails.includes('QUERY LENGTH LIMIT EXCEEDED'))) {
      console.error(`❌ [Translation] Query length limit exceeded (max 500 chars per request). Chunk size: ${text.length} chars`);
      console.error(`❌ [Translation] Response details:`, data.responseDetails);
      // Retornar null para indicar falha, mas não chamar onLimitExceeded (isso é para limite diário)
      return null;
    }
    
    // Verificar se o limite diário foi excedido
    const isLimitExceeded = 
      data.responseStatus === 429 || 
      (data.responseData && data.responseData.translatedText && 
       (data.responseData.translatedText.includes('MYMEMORY WARNING') ||
        data.responseData.translatedText.includes('DAILY QUERY LIMIT EXCEEDED') ||
        data.responseData.translatedText.includes('QUERY LIMIT EXCEEDED')));
    
    if (isLimitExceeded) {
      console.warn(`⚠️ [Translation] Daily limit exceeded (10,000 characters/day)`);
      if (onLimitExceeded) {
        onLimitExceeded();
      }
      return null;
    }
    
    // Verificar resposta da API
    if (data.responseStatus === 200 && data.responseData) {
      const translated = data.responseData.translatedText;
      
      if (!translated) {
        console.warn(`⚠️ [Translation] No translated text in response:`, data);
        return null;
      }
      
      // Verificar se a tradução é válida (não é apenas o texto original ou uma mensagem de erro)
      if (translated.trim().length > 0 && 
          !translated.includes('MYMEMORY WARNING') &&
          !translated.includes('DAILY QUERY LIMIT EXCEEDED') &&
          !translated.includes('QUERY LIMIT EXCEEDED')) {
        return translated;
      } else {
        console.warn(`⚠️ [Translation] Invalid translation response (contains warning):`, translated.substring(0, 100));
        return null;
      }
    } else {
      console.warn(`⚠️ [Translation] Translation failed. Response status: ${data.responseStatus}`, data);
      return null;
    }
  } catch (error) {
    // Verificar se é erro de limite
    if (error.message && error.message.includes('429')) {
      console.warn(`⚠️ [Translation] Daily limit exceeded`);
      if (onLimitExceeded) {
        onLimitExceeded();
      }
    }
    console.warn(`❌ [Translation] Error translating chunk:`, error);
    return null;
  }
};

// Curiosidades geradas por IA (sempre em inglês) — endpoint dedicado e leve do backend.
// Retorna null quando não houver (404) para o componente cair no resumo da Wikipedia.
export const fetchCountryCuriosities = async (countryId, { signal } = {}) => {
  const response = await fetch(buildApiUrl(`/api/countries/${countryId}/curiosities`), { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Curiosities request failed: ${response.status}`);
  const data = await response.json();
  return data?.curiosities?.trim() ? { summary: data.curiosities, content_urls: null, source: 'ai' } : null;
};

// Descobre o título do artigo na Wikipedia do idioma pedido via langlinks da Wikipedia em inglês.
const resolveWikipediaTitle = async (englishTitle, lang, signal) => {
  if (lang === 'en') return englishTitle;
  const url =
    'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=langlinks' +
    `&lllang=${encodeURIComponent(lang)}&titles=${encodeURIComponent(englishTitle)}`;
  const response = await fetch(url, { signal });
  if (!response.ok) return null;
  const data = await response.json();
  const page = Object.values(data?.query?.pages || {})[0];
  return page?.langlinks?.[0]?.['*'] || null;
};

// Resumo da Wikipedia no idioma escolhido (rápido, ~200-400ms). Usado como texto imediato
// enquanto a IA/tradução não chegam, e como fallback quando a IA não está disponível.
// Se não existir artigo naquele idioma, cai para o inglês.
export const fetchWikipediaData = async (countryId, lang = 'en', { signal } = {}) => {
  const englishTitle = countries.getName(countryId.toUpperCase(), 'en');
  if (!englishTitle) return null;

  const fetchSummary = async (wikiLang, title) => {
    const response = await fetch(
      `https://${wikiLang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { signal }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.extract
      ? { summary: data.extract, content_urls: data.content_urls || null, source: 'wikipedia', lang: wikiLang }
      : null;
  };

  if (lang !== 'en') {
    try {
      const localTitle = await resolveWikipediaTitle(englishTitle, lang, signal);
      const localized = localTitle ? await fetchSummary(lang, localTitle) : null;
      if (localized) return localized;
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      console.warn(`Wikipedia (${lang}) lookup failed, falling back to English:`, error);
    }
  }
  return fetchSummary('en', englishTitle);
};
