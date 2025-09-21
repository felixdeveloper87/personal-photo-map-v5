import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

// Register English locale
countries.registerLocale(en);

export const fetchCountryData = async (countryId) => {
  if (!countryId || countryId === 'undefined') {
    console.error('fetchCountryData: countryId is undefined or invalid');
    throw new Error('Invalid country ID provided');
  }
  
  try {
    const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryId}`);
    if (!response.ok) throw new Error('Primary API failed');
    const data = await response.json();
    const countryData = data[0];

    const nativeNameObj = countryData.name.nativeName;
    const firstLangKey = nativeNameObj ? Object.keys(nativeNameObj)[0] : null;
    const nativeName = firstLangKey ? nativeNameObj[firstLangKey].common : countryData.name.common;

    return {
      officialLanguage: Object.values(countryData.languages || {})[0] || 'N/A',
      currency: Object.keys(countryData.currencies || {})[0] || 'N/A',
      currencyName: countryData.currencies
        ? Object.values(countryData.currencies)[0].name
        : 'Unknown Currency',
      capital: countryData.capital ? countryData.capital[0] : 'N/A',
      population: countryData.population || 0,
      nativeName: nativeName,
    };
  } catch (error) {
    console.warn('RestCountries API failed. Trying GeoDB API...', error);
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
      };
    } catch (fallbackError) {
      console.error('Both APIs failed:', fallbackError);
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

// Função para buscar dados da Wikipedia (simplificada, sem religião)
export const fetchWikipediaData = async (countryId) => {
  try {
    // Obter o nome do país para buscar na Wikipedia
    const countryName = countries.getName(countryId.toUpperCase(), 'en');
    if (!countryName) {
      console.warn(`Country name not found for ID: ${countryId}`);
      return null;
    }

    console.log(`Fetching Wikipedia data for: ${countryName}`);

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
      culture: 'Cultural heritage information available'
    };
  } catch (error) {
    console.warn('Wikipedia API error:', error);
    return null;
  }
};
