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
    console.log(`🌐 [CountryData] Tentando buscar dados básicos do backend: ${backendUrl}`);
    const fetchStartTime = performance.now();
    const backendResponse = await fetch(backendUrl);
    
    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      const fetchDuration = (performance.now() - fetchStartTime).toFixed(0);
      
      // Se demorou mais de 2 segundos, provavelmente foi buscar dados novos (não cache)
      const isFromCache = fetchDuration < 2000;
      
      console.log(`${isFromCache ? '✅' : '⏳'} [CountryData] Dados obtidos do BACKEND ${isFromCache ? '(cache)' : '(buscando dados novos - pode demorar)'}:`, {
        countryId,
        capital: backendData.capital,
        language: backendData.officialLanguage,
        source: isFromCache ? 'backend-cache' : 'backend-fresh-fetch',
        duration: `${fetchDuration}ms`
      });
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
      console.warn(`⚠️ [CountryData] Backend retornou status ${backendResponse.status}. Tentando RestCountries...`);
    }
  } catch (backendError) {
    console.warn('⚠️ [CountryData] Backend API failed. Trying RestCountries...', backendError);
  }
  
  // Fallback para RestCountries
  try {
    console.log(`🌐 [CountryData] Buscando dados básicos do RestCountries API para: ${countryId}`);
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryId}`);
    if (!response.ok) throw new Error('Primary API failed');
    const data = await response.json();
    const countryData = data[0];

    const nativeNameObj = countryData.name.nativeName;
    const firstLangKey = nativeNameObj ? Object.keys(nativeNameObj)[0] : null;
    const nativeName = firstLangKey ? nativeNameObj[firstLangKey].common : countryData.name.common;

    console.log(`✅ [CountryData] Dados obtidos do RESTCOUNTRIES API (fallback):`, {
      countryId,
      capital: countryData.capital?.[0],
      language: Object.values(countryData.languages || {})[0],
      source: 'restcountries-api'
    });

    return {
      officialLanguage: Object.values(countryData.languages || {})[0] || 'N/A',
      currency: Object.keys(countryData.currencies || {})[0] || 'N/A',
      currencyName: countryData.currencies
        ? Object.values(countryData.currencies)[0].name
        : 'Unknown Currency',
      capital: countryData.capital ? countryData.capital[0] : 'N/A',
      population: countryData.population || 0,
      nativeName: nativeName,
      latitude: countryData.latlng ? countryData.latlng[0] : null,
      longitude: countryData.latlng ? countryData.latlng[1] : null,
    };
  } catch (error) {
    console.warn('⚠️ [CountryData] RestCountries API failed. Trying GeoDB API...', error);
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
      
      console.log(`✅ [CountryData] Dados obtidos do GEODB API (fallback final):`, {
        countryId,
        capital: country.capital,
        source: 'geodb-api'
      });

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

export const fetchExchangeRate = async (currency) => {
  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/c70ba82c951cf6c5b6757ff5/latest/GBP`
  );
  if (!response.ok) throw new Error('Exchange rate not found');
  const data = await response.json();
  const rate = data.conversion_rates?.[currency];
  return rate ? Number(rate).toFixed(2) : null;
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
const translateText = async (text, targetLang, onLimitExceeded) => {
  if (!text || targetLang === 'en') {
    return text;
  }

  // Verificar cache
  const cacheKey = `${text.substring(0, 50)}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    console.log(`📦 [Translation] Using cached translation for: ${targetLang}`);
    return translationCache.get(cacheKey);
  }

  try {
    console.log(`🌐 [Translation] Translating to ${targetLang}...`);
    console.log(`📏 [Translation] Text length: ${text.length} characters`);
    
    // MyMemory tem limite de 500 caracteres por requisição (após encoding da URL)
    // Usar 400 caracteres para ter margem de segurança com o encoding
    const MAX_CHARS_PER_REQUEST = 400;
    
    // Sempre dividir em chunks se o texto for maior que o limite
    if (text.length > MAX_CHARS_PER_REQUEST) {
      console.log(`📝 [Translation] Text too long (${text.length} chars), splitting into chunks (max ${MAX_CHARS_PER_REQUEST} chars per chunk)...`);
      
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
          console.log(`📦 [Translation] Chunk ${chunks.length}: ${chunk.length} chars`);
        }
        
        startIndex = endIndex;
      }
      
      console.log(`📦 [Translation] Split into ${chunks.length} chunks (total: ${text.length} chars)`);
      
      // Validar todos os chunks antes de traduzir
      for (let i = 0; i < chunks.length; i++) {
        if (chunks[i].length > MAX_CHARS_PER_REQUEST) {
          console.error(`❌ [Translation] Chunk ${i + 1} is too large: ${chunks[i].length} chars (max: ${MAX_CHARS_PER_REQUEST})`);
          return text; // Retornar texto original se algum chunk for muito grande
        }
      }
      
      // Traduzir cada chunk sequencialmente
      const translatedChunks = [];
      for (let i = 0; i < chunks.length; i++) {
        console.log(`🔄 [Translation] Translating chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
        const translatedChunk = await translateSingleChunk(chunks[i], targetLang, onLimitExceeded);
        if (translatedChunk === null) {
          // Se falhar, retornar texto original
          console.warn(`⚠️ [Translation] Chunk ${i + 1} translation failed, returning original text`);
          return text;
        }
        translatedChunks.push(translatedChunk);
        // Pequeno delay entre requisições para evitar rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      const translated = translatedChunks.join('\n\n');
      translationCache.set(cacheKey, translated);
      console.log(`✅ [Translation] Translation completed for: ${targetLang} (${chunks.length} chunks, ${translated.length} chars)`);
      return translated;
    } else {
      // Texto pequeno, traduzir diretamente
      console.log(`📝 [Translation] Text is small enough (${text.length} chars), translating directly...`);
      const translated = await translateSingleChunk(text, targetLang, onLimitExceeded);
      if (translated !== null) {
        translationCache.set(cacheKey, translated);
        console.log(`✅ [Translation] Translation completed for: ${targetLang}`);
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
    console.log(`🌐 [Translation] Sending chunk to API: ${text.length} chars`);
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
    console.log(`📥 [Translation] API response status: ${data.responseStatus}`, data);
    
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
        console.log(`✅ [Translation] Chunk translated successfully (${translated.length} chars)`);
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

// Função para buscar curiosidades geradas por IA do backend
// VERSION: 3.0 - Frontend translation support
export const fetchCountryCuriosities = async (countryId, lang = 'en', onLimitExceeded = null) => {
  try {
    // Sempre buscar em inglês do backend
    const endpoint = `/api/countries/${countryId}/info?includeCuriosities=true`;
    const backendUrl = buildApiUrl(endpoint);
    console.log(`🤖 [AI Curiosities] Fetching English text from backend: ${backendUrl}`);
    
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      console.warn(`⚠️ [AI Curiosities] Backend API error for ${countryId}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Retornar curiosidades se existirem
    if (data.curiosities && data.curiosities.trim().length > 0) {
      let finalText = data.curiosities;
      
      // Se o idioma solicitado não for inglês, traduzir no frontend
      if (lang && lang !== 'en') {
        console.log(`🌐 [Translation] Translating text to ${lang} in frontend...`);
        finalText = await translateText(data.curiosities, lang, onLimitExceeded);
      }
      
      console.log(`✅ [AI Curiosities] Text ready for ${countryId} (lang: ${lang || 'en'}, ${finalText.length} characters)`);
      
      return {
        summary: finalText,
        content_urls: null,
        culture: 'Cultural heritage information available',
        source: 'ai' // Flag para identificar origem
      };
    }
    
    console.log(`⚠️ [AI Curiosities] Not available yet for ${countryId}. The backend will generate it on next request (may take 5-10 seconds).`);
    return null;
  } catch (error) {
    console.warn('❌ [AI Curiosities] Error fetching from backend:', error);
    return null;
  }
};

// Função para buscar dados da Wikipedia (fallback, caso curiosidades não estejam disponíveis)
export const fetchWikipediaData = async (countryId) => {
  try {
    // Obter o nome do país para buscar na Wikipedia
    const countryName = countries.getName(countryId.toUpperCase(), 'en');
    if (!countryName) {
      console.warn(`Country name not found for ID: ${countryId}`);
      return null;
    }

    console.log(`📚 [Wikipedia] Fetching fallback data for: ${countryName}`);

    // Buscar dados da Wikipedia usando a API pública
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`;
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.warn(`Wikipedia API error for ${countryName}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    
    // Extrair resumo e URLs
    const summary = data.extract || null;
    const contentUrls = data.content_urls || null;
    
    return {
      summary,
      content_urls: contentUrls,
      culture: 'Cultural heritage information available',
      source: 'wikipedia' // Flag para identificar origem
    };
  } catch (error) {
    console.warn('Wikipedia API error:', error);
    return null;
  }
};
