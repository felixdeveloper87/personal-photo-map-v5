// worldbank.js — versão inteligente com ranking dinâmico por ano real
import { buildApiUrl } from '../utils/apiConfig';

const RANKING_CACHE_KEY = 'worldbank_rankings_cache_v4'; // v4: filtra por nome e código
const RANKING_CACHE_TTL_DAYS = 7;
const memoryRankingCache = {};

const indicatorOrdering = {
  'NY.GDP.MKTP.CD': true,
  'NY.GDP.PCAP.CD': true,
  'NY.GDP.MKTP.KD.ZG': true,
  'GC.DOD.TOTL.GD.ZS': false,
  'FP.CPI.TOTL.ZG': false,
  'SL.UEM.TOTL.ZS': false,
  'SP.DYN.LE00.IN': true,
  'IT.NET.USER.ZS': true,
  'SP.URB.TOTL.IN.ZS': false,
  'SE.ADT.LITR.ZS': true,
  'SM.POP.NETM': true,
  'EG.ELC.ACCS.ZS': true,
  'SH.XPD.CHEX.GD.ZS': true,
  'NY.GNP.PCAP.CD': true,
  'NY.GNP.PCAP.PP.CD': true,
  'SP.DYN.TFRT.IN': false,
};

// Limpar caches antigos ao iniciar
const clearOldCaches = () => {
  try {
    if (typeof localStorage !== 'undefined') {
      // Remover versões antigas do cache
      localStorage.removeItem('worldbank_rankings_cache_v3');
      localStorage.removeItem('worldbank_rankings_cache_v2');
      localStorage.removeItem('worldbank_rankings_cache_v1');
    }
  } catch {
    // Ignorar erros ao limpar cache
  }
};

// Executar limpeza uma vez ao carregar o módulo
clearOldCaches();

const readCache = () => {
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(RANKING_CACHE_KEY);
    return raw ? JSON.parse(raw) : (memoryRankingCache._cache || {});
  } catch {
    return memoryRankingCache._cache || {};
  }
};

const writeCache = (cache) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(RANKING_CACHE_KEY, JSON.stringify(cache));
    else memoryRankingCache._cache = cache;
  } catch {
    memoryRankingCache._cache = cache;
  }
};

// Mapeamento básico ISO2 -> ISO3 para os países mais comuns
const iso2ToIso3 = {
  'US': 'USA', 'GB': 'GBR', 'CA': 'CAN', 'BR': 'BRA', 'FR': 'FRA',
  'DE': 'DEU', 'IT': 'ITA', 'ES': 'ESP', 'NL': 'NLD', 'BE': 'BEL',
  'CH': 'CHE', 'AT': 'AUT', 'SE': 'SWE', 'NO': 'NOR', 'DK': 'DNK',
  'FI': 'FIN', 'PL': 'POL', 'CZ': 'CZE', 'HU': 'HUN', 'GR': 'GRC',
  'PT': 'PRT', 'IE': 'IRL', 'AU': 'AUS', 'NZ': 'NZL', 'JP': 'JPN',
  'CN': 'CHN', 'IN': 'IND', 'KR': 'KOR', 'SG': 'SGP', 'MY': 'MYS',
  'TH': 'THA', 'VN': 'VNM', 'ID': 'IDN', 'PH': 'PHL', 'MX': 'MEX',
  'AR': 'ARG', 'CL': 'CHL', 'CO': 'COL', 'PE': 'PER', 'ZA': 'ZAF',
  'EG': 'EGY', 'NG': 'NGA', 'KE': 'KEN', 'MA': 'MAR', 'DZ': 'DZA',
  'TR': 'TUR', 'SA': 'SAU', 'AE': 'ARE', 'IL': 'ISR', 'PK': 'PAK',
  'BD': 'BGD', 'RU': 'RUS', 'UA': 'UKR', 'RO': 'ROU', 'BG': 'BGR',
};

// Códigos de regiões agregadas que devem ser excluídos do ranking
const AGGREGATE_REGIONS = new Set([
  '1W', '1A', '1E', '1G', '1Q', '1R', '1S', '1T', '1U', '1V', '1X', '1Y', '1Z', // World, Africa regions, etc.
  'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', // Income groups
  'B8', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', // Other aggregates
  'XC', 'XD', 'XE', 'XF', 'XG', 'XH', 'XI', 'XJ', 'XL', 'XM', 'XN', 'XO', 'XP', 'XQ', 'XR', 'XS', 'XT', 'XU', 'XV', 'XW', 'XY', 'XZ', // Other regions
  'OE', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', // Other aggregates
]);

// Padrões de nomes que indicam regiões agregadas (não países)
const AGGREGATE_NAME_PATTERNS = [
  /^world$/i,
  /^oecd/i,
  /post-demographic/i,
  /demographic dividend/i,
  /^ida/i,
  /^ibrd/i,
  /low.*income/i,
  /middle.*income/i,
  /high.*income/i,
  /upper.*income/i,
  /lower.*income/i,
  /east asia/i,
  /west asia/i,
  /south asia/i,
  /central asia/i,
  /southeast asia/i,
  /middle east/i,
  /north africa/i,
  /sub-saharan africa/i,
  /europe.*central asia/i,
  /europe.*asia/i,
  /latin america/i,
  /caribbean/i,
  /pacific/i,
  /european union/i,
  /euro area/i,
  /eurozone/i,
  /north america/i,
  /south america/i,
  /\(excluding/i,
  /\(ida/i,
  /\(ibrd/i,
  /countries\)$/i,
  /^arab world$/i,
  /^small island/i,
  /^fragile/i,
  /^heavily/i,
  /^least developed/i,
  /^other small/i,
  /^pre-demographic/i,
];

// Verifica se um nome de país/região é uma região agregada
const isAggregateByName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const nameUpper = name.trim();
  
  // Verificar padrões conhecidos
  return AGGREGATE_NAME_PATTERNS.some(pattern => pattern.test(nameUpper));
};

// Verifica se um código de país é um país real (não uma região agregada)
const isRealCountry = (code) => {
  if (!code) return false;
  const upperCode = String(code).toUpperCase();
  
  // Excluir códigos de regiões agregadas conhecidas
  if (AGGREGATE_REGIONS.has(upperCode)) return false;
  
  // Excluir códigos que começam com números (como "1W", "1A")
  if (/^\d/.test(upperCode)) return false;
  
  // Excluir códigos muito longos ou muito curtos que não são países
  if (upperCode.length < 2 || upperCode.length > 3) return false;
  
  // Aceitar códigos ISO2 (2 letras) e ISO3 (3 letras) que são alfabéticos
  return /^[A-Z]{2,3}$/.test(upperCode);
};

// Extrai códigos de país de uma entrada da API
const extractCountryCodes = (entry) => {
  const codes = new Set();
  
  if (entry.country) {
    if (typeof entry.country === 'object' && entry.country !== null) {
      if (entry.country.id) codes.add(String(entry.country.id).toUpperCase());
      if (entry.country.iso2Code) codes.add(entry.country.iso2Code.toUpperCase());
      if (entry.country.iso3Code) codes.add(entry.country.iso3Code.toUpperCase());
    } else if (typeof entry.country === 'string') {
      codes.add(entry.country.toUpperCase());
    }
  }
  
  if (entry.countryid) codes.add(String(entry.countryid).toUpperCase());
  if (entry.countryiso2code) codes.add(entry.countryiso2code.toUpperCase());
  if (entry.countryiso3code) codes.add(entry.countryiso3code.toUpperCase());
  
  return Array.from(codes).filter(isRealCountry);
};

// ========== Dynamic Ranking ==========
const getRankingForYear = async (indicatorCode, isoCode, year) => {
  const now = Date.now();
  const cache = readCache();
  const iso2 = isoCode?.toUpperCase();
  const iso3 = iso2ToIso3[iso2] || null;
  // Tentar diferentes variações do código ISO
  const isoVariations = [
    iso2, // ISO2 original
    iso3, // ISO3 se disponível
    iso2?.substring(0, 2), // Garantir que seja 2 caracteres
  ].filter(Boolean); // Remove null/undefined
  
  const cached = cache[indicatorCode]?.[year];
  const expired = cached ? (now - cached.timestamp > RANKING_CACHE_TTL_DAYS * 86400000) : true;

  if (cached && !expired) {
    // Tentar todas as variações
    for (const iso of isoVariations) {
      const rank = cached.ranks[iso];
      if (rank) return { rank, total: cached.total, year };
    }
  }

  try {
    // Buscar TODOS os países para o indicador no ano específico
    // Usar /country/all/ para obter todos os países
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=300&date=${year}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    
    // Verificar se há paginação
    const totalPages = data[0]?.pages || 1;
    let allEntries = data[1]?.filter(e => e.value !== null) || [];
    
    // Se houver mais páginas, buscar todas
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        const pageUrl = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=300&date=${year}&page=${page}`;
        pagePromises.push(
          fetch(pageUrl)
            .then(res => res.json())
            .then(pageData => pageData[1]?.filter(e => e.value !== null) || [])
            .catch(() => [])
        );
      }
      const additionalEntries = await Promise.all(pagePromises);
      allEntries = allEntries.concat(additionalEntries.flat());
    }
    
    // FILTRAR APENAS PAÍSES REAIS (excluir regiões agregadas)
    const entries = allEntries.filter(entry => {
      // Verificar pelo nome do país primeiro
      const countryName = entry.country?.value || entry.countryid || '';
      if (isAggregateByName(countryName)) {
        return false;
      }
      
      // Verificar pelos códigos ISO
      const codes = extractCountryCodes(entry);
      return codes.length > 0; // Apenas incluir se tiver pelo menos um código de país real
    });
    
    // Debug: contar quantas entradas foram filtradas
    const filteredCount = allEntries.length - entries.length;
    if (filteredCount > 0) {
      console.log(`📊 Filtradas ${filteredCount} regiões agregadas de ${allEntries.length} entradas. Países reais: ${entries.length}`);
    }
    
    if (!entries.length) {
      return null;
    }

    const higherBetter = indicatorOrdering[indicatorCode] !== false;
    const sorted = entries.sort((a, b) => higherBetter ? b.value - a.value : a.value - b.value);

    const ranks = {};
    sorted.forEach((e, i) => {
      const pos = i + 1;
      // Usar a função extractCountryCodes para obter apenas códigos de países reais
      const countryCodes = extractCountryCodes(e);
      
      // Armazenar posição para todos os códigos de país encontrados
      countryCodes.forEach(code => {
        ranks[code] = pos;
      });
    });
    

    const total = sorted.length;
    const newCache = {
      ...cache,
      [indicatorCode]: {
        ...(cache[indicatorCode] || {}),
        [year]: { timestamp: now, ranks, total },
      },
    };
    writeCache(newCache);

    // Tentar todas as variações do código ISO
    let rank = null;
    for (const iso of isoVariations) {
      rank = ranks[iso];
      if (rank) {
        console.log(`✅ Ranking encontrado para ${isoCode} usando código ${iso}: posição ${rank}/${total}`);
        break;
      }
    }
    
    if (!rank) {
      // Debug: ver quais códigos estão disponíveis
      const availableCodes = Object.keys(ranks).slice(0, 20);
      console.log(`❌ Ranking não encontrado para ${isoCode}. Tentou: ${isoVariations.join(', ')}. Primeiros códigos disponíveis:`, availableCodes);
    }
    
    return rank ? { rank, total, year } : null;
  } catch (error) {
    // Silenciosamente retornar null em caso de erro
    return null;
  }
};

// ========== Formatters ==========
const formatGDP = (value) => {
  const num = Number(value);
  if (num >= 1_000_000_000_000) return `$${(num / 1_000_000_000_000).toFixed(2)} Trillion`;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(2)} Billion`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)} Million`;
  return `$${num.toLocaleString('en-US')}`;
};

// Formatar valor baseado no tipo de indicador
const formatValueForIndicator = (indicatorCode, value) => {
  if (value === null || value === undefined) return 'N/A';
  
  // Indicadores monetários
  if (indicatorCode === 'NY.GDP.MKTP.CD' || indicatorCode === 'NY.GDP.PCAP.CD' || 
      indicatorCode === 'NY.GNP.PCAP.CD' || indicatorCode === 'NY.GNP.PCAP.PP.CD') {
    return formatGDP(value);
  }
  
  // Indicadores percentuais
  if (indicatorCode === 'NY.GDP.MKTP.KD.ZG' || indicatorCode === 'GC.DOD.TOTL.GD.ZS' ||
      indicatorCode === 'FP.CPI.TOTL.ZG' || indicatorCode === 'SL.UEM.TOTL.ZS' ||
      indicatorCode === 'IT.NET.USER.ZS' || indicatorCode === 'SP.URB.TOTL.IN.ZS' ||
      indicatorCode === 'SE.ADT.LITR.ZS' || indicatorCode === 'EG.ELC.ACCS.ZS' ||
      indicatorCode === 'SH.XPD.CHEX.GD.ZS') {
    return `${Number(value).toFixed(1)}%`;
  }
  
  // Indicadores de anos
  if (indicatorCode === 'SP.DYN.LE00.IN') {
    return `${Number(value).toFixed(1)} years`;
  }
  
  // Indicadores numéricos simples
  if (indicatorCode === 'SM.POP.NETM') {
    return Number(value).toLocaleString('en-US');
  }
  
  if (indicatorCode === 'SP.DYN.TFRT.IN') {
    return Number(value).toFixed(2);
  }
  
  return Number(value).toLocaleString('en-US');
};

// ========== Buscar ranking completo ==========
export const fetchFullRanking = async (indicatorCode, year) => {
  try {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=300&date=${year}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    
    // Verificar se há paginação
    const totalPages = data[0]?.pages || 1;
    let allEntries = data[1]?.filter(e => e.value !== null) || [];
    
    // Se houver mais páginas, buscar todas
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        const pageUrl = `https://api.worldbank.org/v2/country/all/indicator/${indicatorCode}?format=json&per_page=300&date=${year}&page=${page}`;
        pagePromises.push(
          fetch(pageUrl)
            .then(res => res.json())
            .then(pageData => pageData[1]?.filter(e => e.value !== null) || [])
            .catch(() => [])
        );
      }
      const additionalEntries = await Promise.all(pagePromises);
      allEntries = allEntries.concat(additionalEntries.flat());
    }
    
    // FILTRAR APENAS PAÍSES REAIS (excluir regiões agregadas)
    const entries = allEntries.filter(entry => {
      // Verificar pelo nome do país primeiro
      const countryName = entry.country?.value || entry.countryid || '';
      if (isAggregateByName(countryName)) {
        return false;
      }
      
      // Verificar pelos códigos ISO
      const codes = extractCountryCodes(entry);
      return codes.length > 0;
    });
    
    if (!entries.length) {
      return null;
    }

    const higherBetter = indicatorOrdering[indicatorCode] !== false;
    const sorted = entries.sort((a, b) => higherBetter ? b.value - a.value : a.value - b.value);

    // Retornar lista completa com nome do país, valor e posição
    const rankingList = sorted.map((entry, index) => {
      const position = index + 1;
      const countryCodes = extractCountryCodes(entry);
      // Extrair nome do país de diferentes formas possíveis
      let countryName = 'Unknown';
      if (entry.country) {
        if (typeof entry.country === 'object' && entry.country !== null) {
          countryName = entry.country.value || entry.country.name || countryName;
        } else if (typeof entry.country === 'string') {
          countryName = entry.country;
        }
      }
      if (countryName === 'Unknown' && entry.countryid) {
        countryName = String(entry.countryid);
      }
      
      return {
        position,
        countryName: countryName.trim(),
        countryCode: countryCodes[0] || '',
        value: entry.value,
        formattedValue: formatValueForIndicator(indicatorCode, entry.value),
      };
    });

    return {
      indicatorCode,
      year,
      total: rankingList.length,
      ranking: rankingList,
    };
  } catch (error) {
    console.error('Error fetching full ranking:', error);
    return null;
  }
};

const formatters = {
  currencyUSD: (val) => formatGDP(val),
  percent: (val) => (val != null ? `${Number(val).toFixed(1)}%` : 'N/A'),
  years: (val) => (val != null ? `${Number(val).toFixed(1)} years` : 'N/A'),
};

// ========== API principal ==========
export const fetchWorldBankIndicators = async (isoCode) => {
  if (!isoCode) return {};

  // Primeiro tenta buscar do backend (que tem cache e rankings)
  try {
    const backendUrl = buildApiUrl(`/api/countries/${isoCode}/info`);
    console.log(`🌐 [WorldBank] Tentando buscar indicadores do backend: ${backendUrl}`);
    const fetchStartTime = performance.now();
    const backendResponse = await fetch(backendUrl);
    
    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      const fetchDuration = (performance.now() - fetchStartTime).toFixed(0);
      
      // Se demorou mais de 3 segundos, provavelmente foi buscar dados novos (não cache)
      // World Bank pode demorar mais porque busca muitos indicadores e calcula rankings
      const isFromCache = fetchDuration < 3000;
      
      const initialIndicatorsCount = Object.keys(backendData).filter(k => 
        ['gdp', 'gdpGrowth', 'lifeExpectancy', 'gniPerCapita', 'internetUsers'].includes(k)
      ).length;
      
      console.log(`${isFromCache ? '✅' : '⏳'} [WorldBank] Dados obtidos do BACKEND ${isFromCache ? '(cache)' : '(buscando dados novos - pode demorar 10-30s)'}:`, {
        countryId: isoCode,
        indicatorsFound: initialIndicatorsCount,
        hasRankings: !!(backendData.gdpRank || backendData.lifeExpectancyRank),
        source: isFromCache ? 'backend-cache' : 'backend-fresh-fetch',
        duration: `${fetchDuration}ms`
      });
      
      if (!isFromCache) {
        console.log(`⏳ [WorldBank] Aguarde... O backend está buscando dados do World Bank e calculando rankings. Isso pode levar 10-30 segundos na primeira vez.`);
      }
      
      // Converter dados do backend para o formato esperado pelo frontend
      const formatted = {};
      
      // Mapear dados econômicos
      if (backendData.gdp != null) {
        formatted.gdp = {
          value: backendData.gdpFormatted || formatGDP(backendData.gdp),
          raw: backendData.gdp,
          year: backendData.gdpYear
        };
      }
      
      if (backendData.gdpGrowth != null) {
        formatted.gdpGrowth = {
          value: `${backendData.gdpGrowth.toFixed(1)}%`,
          raw: backendData.gdpGrowth,
          year: backendData.gdpGrowthYear
        };
      }
      
      if (backendData.gdpPerCapitaCurrent != null) {
        formatted.gdpPerCapitaCurrent = {
          value: backendData.gdpPerCapitaCurrentFormatted || formatGDP(backendData.gdpPerCapitaCurrent),
          raw: backendData.gdpPerCapitaCurrent,
          year: backendData.gdpPerCapitaCurrentYear
        };
      }
      
      if (backendData.debtToGDP != null) {
        formatted.debtToGDP = {
          value: `${backendData.debtToGDP.toFixed(1)}%`,
          raw: backendData.debtToGDP,
          year: backendData.debtToGDPYear
        };
      }
      
      if (backendData.inflationCPI != null) {
        formatted.inflationCPI = {
          value: `${backendData.inflationCPI.toFixed(1)}%`,
          raw: backendData.inflationCPI,
          year: backendData.inflationCPIYear
        };
      }
      
      if (backendData.gniPerCapita != null) {
        formatted.gniPerCapita = {
          value: backendData.gniPerCapitaFormatted || formatGDP(backendData.gniPerCapita),
          raw: backendData.gniPerCapita,
          year: backendData.gniPerCapitaYear
        };
      }
      
      if (backendData.gniPerCapitaPPP != null) {
        formatted.gniPerCapitaPPP = {
          value: backendData.gniPerCapitaPPPFormatted || formatGDP(backendData.gniPerCapitaPPP),
          raw: backendData.gniPerCapitaPPP,
          year: backendData.gniPerCapitaPPPYear
        };
      }
      
      // Mapear dados sociais
      if (backendData.lifeExpectancy != null) {
        formatted.lifeExpectancy = {
          value: `${backendData.lifeExpectancy.toFixed(1)} years`,
          raw: backendData.lifeExpectancy,
          year: backendData.lifeExpectancyYear
        };
      }
      
      if (backendData.internetUsers != null) {
        formatted.internetUsers = {
          value: `${backendData.internetUsers.toFixed(1)}%`,
          raw: backendData.internetUsers,
          year: backendData.internetUsersYear
        };
      }
      
      if (backendData.urbanPopulation != null) {
        formatted.urbanPopulation = {
          value: `${backendData.urbanPopulation.toFixed(1)}%`,
          raw: backendData.urbanPopulation,
          year: backendData.urbanPopulationYear
        };
      }
      
      if (backendData.education != null) {
        formatted.education = {
          value: `${backendData.education.toFixed(1)}%`,
          raw: backendData.education,
          year: backendData.educationYear
        };
      }
      
      if (backendData.netMigration != null) {
        formatted.netMigration = {
          value: backendData.netMigrationFormatted || Number(backendData.netMigration).toLocaleString('en-US'),
          raw: backendData.netMigration,
          year: backendData.netMigrationYear
        };
      }
      
      if (backendData.unemployment != null) {
        formatted.unemployment = {
          value: `${backendData.unemployment.toFixed(1)}%`,
          raw: backendData.unemployment,
          year: backendData.unemploymentYear
        };
      }
      
      if (backendData.fertilityRate != null) {
        formatted.fertilityRate = {
          value: `${backendData.fertilityRate.toFixed(2)}%`,
          raw: backendData.fertilityRate,
          year: backendData.fertilityRateYear
        };
      }
      
      if (backendData.accessToEletricity != null) {
        formatted.accessToEletricity = {
          value: `${backendData.accessToEletricity.toFixed(1)}%`,
          raw: backendData.accessToEletricity,
          year: backendData.accessToEletricityYear
        };
      }
      
      if (backendData.healthExpenses != null) {
        formatted.healthExpenses = {
          value: `${backendData.healthExpenses.toFixed(1)}%`,
          raw: backendData.healthExpenses,
          year: backendData.healthExpensesYear
        };
      }
      
      // Mapear rankings
      formatted.rankings = {};
      
      if (backendData.gdpRank != null) {
        formatted.rankings.gdp = {
          rank: backendData.gdpRank,
          total: backendData.gdpTotalCountries,
          year: backendData.gdpYear
        };
      }
      
      if (backendData.gdpGrowthRank != null) {
        formatted.rankings.gdpGrowth = {
          rank: backendData.gdpGrowthRank,
          total: backendData.gdpGrowthTotalCountries,
          year: backendData.gdpGrowthYear
        };
      }
      
      if (backendData.gdpPerCapitaCurrentRank != null) {
        formatted.rankings.gdpPerCapitaCurrent = {
          rank: backendData.gdpPerCapitaCurrentRank,
          total: backendData.gdpPerCapitaCurrentTotalCountries,
          year: backendData.gdpPerCapitaCurrentYear
        };
      }
      
      if (backendData.debtToGDPRank != null) {
        formatted.rankings.debtToGDP = {
          rank: backendData.debtToGDPRank,
          total: backendData.debtToGDPTotalCountries,
          year: backendData.debtToGDPYear
        };
      }
      
      if (backendData.inflationCPIRank != null) {
        formatted.rankings.inflationCPI = {
          rank: backendData.inflationCPIRank,
          total: backendData.inflationCPITotalCountries,
          year: backendData.inflationCPIYear
        };
      }
      
      if (backendData.lifeExpectancyRank != null) {
        formatted.rankings.lifeExpectancy = {
          rank: backendData.lifeExpectancyRank,
          total: backendData.lifeExpectancyTotalCountries,
          year: backendData.lifeExpectancyYear
        };
      }
      
      if (backendData.internetUsersRank != null) {
        formatted.rankings.internetUsers = {
          rank: backendData.internetUsersRank,
          total: backendData.internetUsersTotalCountries,
          year: backendData.internetUsersYear
        };
      }
      
      if (backendData.urbanPopulationRank != null) {
        formatted.rankings.urbanPopulation = {
          rank: backendData.urbanPopulationRank,
          total: backendData.urbanPopulationTotalCountries,
          year: backendData.urbanPopulationYear
        };
      }
      
      if (backendData.educationRank != null) {
        formatted.rankings.education = {
          rank: backendData.educationRank,
          total: backendData.educationTotalCountries,
          year: backendData.educationYear
        };
      }
      
      if (backendData.netMigrationRank != null) {
        formatted.rankings.netMigration = {
          rank: backendData.netMigrationRank,
          total: backendData.netMigrationTotalCountries,
          year: backendData.netMigrationYear
        };
      }
      
      if (backendData.fertilityRateRank != null) {
        formatted.rankings.fertilityRate = {
          rank: backendData.fertilityRateRank,
          total: backendData.fertilityRateTotalCountries,
          year: backendData.fertilityRateYear
        };
      }
      
      if (backendData.accessToEletricityRank != null) {
        formatted.rankings.accessToEletricity = {
          rank: backendData.accessToEletricityRank,
          total: backendData.accessToEletricityTotalCountries,
          year: backendData.accessToEletricityYear
        };
      }
      
      if (backendData.healthExpensesRank != null) {
        formatted.rankings.healthExpenses = {
          rank: backendData.healthExpensesRank,
          total: backendData.healthExpensesTotalCountries,
          year: backendData.healthExpensesYear
        };
      }
      
      // Mapear dados de HDI
      if (backendData.hdi != null) {
        formatted.hdi = {
          value: backendData.hdi, // Valor numérico (0.0 a 1.0)
          year: backendData.hdiYear
        };
      }
      
      if (backendData.hdiRank != null) {
        formatted.rankings.hdi = {
          rank: backendData.hdiRank,
          total: backendData.hdiTotalCountries,
          year: backendData.hdiYear
        };
      }
      
      const indicatorsCount = Object.keys(formatted).length;
      const rankingsCount = Object.keys(formatted.rankings || {}).length;
      // Reutilizar isFromCache já calculado acima
      
      console.log(`📊 [WorldBank] Dados formatados do backend:`, {
        indicators: indicatorsCount,
        rankings: rankingsCount,
        source: isFromCache ? 'backend-cache' : 'backend-fresh-fetch',
        note: isFromCache ? 'Dados do cache (rápido!)' : 'Dados recém-buscados (salvos no cache para próxima vez)'
      });
      return formatted;
    } else {
      console.warn(`⚠️ [WorldBank] Backend retornou status ${backendResponse.status}. Tentando World Bank API diretamente...`);
    }
  } catch (backendError) {
    console.warn('⚠️ [WorldBank] Backend API failed. Trying World Bank API directly...', backendError);
  }

  // Fallback para World Bank API direta
  console.log(`🌐 [WorldBank] Buscando indicadores diretamente da World Bank API para: ${isoCode}`);
  const indicators = {
    gdp: "NY.GDP.MKTP.CD",
    lifeExpectancy: "SP.DYN.LE00.IN",
    gniPerCapita: "NY.GNP.PCAP.CD",
    gdpGrowth: "NY.GDP.MKTP.KD.ZG",
    internetUsers: "IT.NET.USER.ZS",
    urbanPopulation: "SP.URB.TOTL.IN.ZS",
    unemployment: "SL.UEM.TOTL.ZS",
    gniPerCapitaPPP: "NY.GNP.PCAP.PP.CD",
    fertilityRate: "SP.DYN.TFRT.IN",
    accessToEletricity: "EG.ELC.ACCS.ZS",
    education: "SE.ADT.LITR.ZS",
    healthExpenses: "SH.XPD.CHEX.GD.ZS",
    netMigration: "SM.POP.NETM",
    gdpPerCapitaCurrent: "NY.GDP.PCAP.CD",
    inflationCPI: "FP.CPI.TOTL.ZG",
    debtToGDP: "GC.DOD.TOTL.GD.ZS",
  };

  const fetchIndicator = async (code) => {
    const url = `https://api.worldbank.org/v2/country/${isoCode}/indicator/${code}?format=json&per_page=100`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data[1]
      ?.filter(e => e.value !== null)
      ?.sort((a, b) => parseInt(b.date) - parseInt(a.date))[0] || null;
  };

  const results = await Promise.all(
    Object.entries(indicators).map(async ([key, code]) => [key, await fetchIndicator(code)])
  );

  const formatted = {};
  for (const [key, entry] of results) {
    if (!entry) continue;
    const val = entry.value;
    const year = entry.date;

    switch (key) {
      case 'gdp':
        formatted.gdp = { value: formatters.currencyUSD(val), raw: val, year };
        break;
      case 'lifeExpectancy':
        formatted.lifeExpectancy = { value: formatters.years(val), year };
        break;
      case 'gniPerCapita':
        formatted.gniPerCapita = { value: formatters.currencyUSD(val), year };
        break;
      case 'gniPerCapitaPPP':
        formatted.hdiProxy = { value: formatters.currencyUSD(val), year };
        break;
      case 'gdpGrowth':
      case 'internetUsers':
      case 'urbanPopulation':
      case 'unemployment':
      case 'fertilityRate':
      case 'accessToEletricity':
      case 'education':
      case 'healthExpenses':
        formatted[key] = { value: formatters.percent(val), year };
        break;
      case 'netMigration':
        formatted.netMigration = { value: Number(val).toLocaleString('en-US'), year };
        break;
      case 'gdpPerCapitaCurrent':
        formatted.gdpPerCapitaCurrent = { value: formatters.currencyUSD(val), year };
        break;
      case 'inflationCPI':
      case 'debtToGDP':
        formatted[key] = { value: formatters.percent(val), year };
        break;
      default:
        break;
    }
  }

  // === Rankings sincronizados com o ano do dado real ===
  formatted.rankings = {};
  for (const [key, code] of Object.entries(indicators)) {
    const year = formatted[key]?.year;
    if (!year) continue;
    try {
      const rankData = await getRankingForYear(code, isoCode, year);
      if (rankData) {
        formatted.rankings[key] = rankData;
      }
    } catch (error) {
      // Silenciosamente continuar se houver erro ao buscar ranking
      continue;
    }
  }
  
  console.log(`✅ [WorldBank] Dados obtidos da WORLD BANK API (fallback):`, {
    countryId: isoCode,
    indicators: Object.keys(formatted).length,
    rankings: Object.keys(formatted.rankings).length,
    source: 'worldbank-api-direct'
  });
  
  return formatted;
};
