/**
 * Flag Normalizer - Sistema inteligente para padronizar bandeiras de diferentes APIs
 * 
 * Este utilitário resolve problemas comuns de bandeiras:
 * - Códigos de país incorretos
 * - Formatos diferentes (PNG, SVG, JPG)
 * - APIs que retornam formatos inconsistentes
 * - Fallbacks automáticos para melhor qualidade
 */

// Mapeamento completo de códigos de país para ISO 3166-1 alpha-2
const COUNTRY_CODE_CORRECTIONS = {
  // Códigos comuns que precisam de correção
  UK: 'GB', GB: 'GB', RUS: 'RU', USA: 'US', BRA: 'BR', CHN: 'CN', 
  IND: 'IN', JPN: 'JP', DEU: 'DE', FRA: 'FR', ITA: 'IT', ESP: 'ES', 
  CAN: 'CA', AUS: 'AU', NLD: 'NL', CHE: 'CH', SWE: 'SE', NOR: 'NO',
  DNK: 'DK', FIN: 'FI', POL: 'PL', CZE: 'CZ', HUN: 'HU', ROU: 'RO',
  BGR: 'BG', HRV: 'HR', SVN: 'SI', SVK: 'SK', LTU: 'LT', LVA: 'LV',
  EST: 'EE', IRL: 'IE', LUX: 'LU', MLT: 'MT', CYP: 'CY', GRC: 'GR',
  PRT: 'PT', AUT: 'AT', BEL: 'BE', MCO: 'MC', LIE: 'LI', SMR: 'SM',
  VAT: 'VA', AND: 'AD', ISL: 'IS', FRO: 'FO', GRL: 'GL', JEY: 'JE',
  IMN: 'IM', GGY: 'GG', ALA: 'AX', SJM: 'SJ', BVT: 'BV', ATF: 'TF',
  HMD: 'HM', IOT: 'IO', PCN: 'PN', CXR: 'CX', CCK: 'CC', NFK: 'NF',
  TKL: 'TK', NIU: 'NU', COK: 'CK', WLF: 'WF', PYF: 'PF', NCL: 'NC',
  VUT: 'VU', FJI: 'FJ', TON: 'TO', WSM: 'WS', KIR: 'KI', NRU: 'NR',
  MHL: 'MH', FSM: 'FM', PLW: 'PW', GUM: 'GU', MNP: 'MP', ASM: 'AS',
  MEX: 'MX', GTM: 'GT', BLZ: 'BZ', SLV: 'SV', HND: 'HN', NIC: 'NI', 
  CRI: 'CR', PAN: 'PA', COL: 'CO', VEN: 'VE', GUY: 'GY', SUR: 'SR', 
  GUF: 'GF', ECU: 'EC', PER: 'PE', BOL: 'BO', PRY: 'PY', CHL: 'CL', 
  ARG: 'AR', URY: 'UY', ZAF: 'ZA', NGA: 'NG', EGY: 'EG', DZA: 'DZ', 
  MAR: 'MA', TUN: 'TN', LBY: 'LY', SDN: 'SD', ETH: 'ET', KEN: 'KE', 
  TZA: 'TZ', UGA: 'UG', COD: 'CD', COG: 'CG', GAB: 'GA', CMR: 'CM', 
  CAF: 'CF', TCD: 'TD', NER: 'NE', MLI: 'ML', BFA: 'BF', GIN: 'GN', 
  GNB: 'GW', SLE: 'SL', LBR: 'LR', CIV: 'CI', GHA: 'GH', TOG: 'TG', 
  BEN: 'BJ', KOR: 'KR', PRK: 'KP', MNG: 'MN', KAZ: 'KZ', UZB: 'UZ', 
  TKM: 'TM', KGZ: 'KG', TJK: 'TJ', AFG: 'AF', PAK: 'PK', BGD: 'BD', 
  BTN: 'BT', NPL: 'NP', LKA: 'LK', MDV: 'MV', MMR: 'MM', THA: 'TH', 
  LAO: 'LA', VNM: 'VN', KHM: 'KH', MYS: 'MY', SGP: 'SG', IDN: 'ID', 
  PHL: 'PH', BRN: 'BN', TLS: 'TL', PNG: 'PG'
};

// Fontes de bandeiras em ordem de prioridade (qualidade)
const FLAG_SOURCES = [
  {
    name: 'FlagCDN-High',
    url: (code) => `https://flagcdn.com/w2560/${code.toLowerCase()}.png`,
    check: 'HEAD',
    priority: 1
  },
  {
    name: 'FlagCDN-Medium',
    url: (code) => `https://flagcdn.com/512x384/${code.toLowerCase()}.png`,
    check: 'HEAD',
    priority: 2
  },
  {
    name: 'FlagCDN-Standard',
    url: (code) => `https://flagcdn.com/256x192/${code.toLowerCase()}.png`,
    check: 'HEAD',
    priority: 3
  },
  {
    name: 'RestCountries-API',
    url: (code) => `https://restcountries.com/v3.1/alpha/${code}?fields=flags`,
    check: 'FULL',
    priority: 4
  },
  {
    name: 'FlagCDN-Small',
    url: (code) => `https://flagcdn.com/w320/${code.toLowerCase()}.png`,
    check: 'HEAD',
    priority: 5
  }
];

/**
 * Normaliza o código do país para ISO 3166-1 alpha-2
 * @param {string} countryCode - Código do país (pode ser incorreto)
 * @returns {string} Código normalizado
 */
export const normalizeCountryCode = (countryCode) => {
  if (!countryCode) return null;
  
  const upperCode = countryCode.toUpperCase();
  return COUNTRY_CODE_CORRECTIONS[upperCode] || upperCode;
};

/**
 * Tenta obter uma bandeira de múltiplas fontes
 * @param {string} countryCode - Código do país
 * @param {Object} options - Opções de configuração
 * @returns {Promise<string|null>} URL da bandeira ou null se não encontrada
 */
export const getFlagFromMultipleSources = async (countryCode, options = {}) => {
  const {
    maxRetries = 3,
    timeout = 5000,
    preferFormat = 'png',
    fallbackToLowerQuality = true
  } = options;

  const normalizedCode = normalizeCountryCode(countryCode);
  if (!normalizedCode) return null;

  // Ordena fontes por prioridade
  const sortedSources = [...FLAG_SOURCES].sort((a, b) => a.priority - b.priority);
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    for (const source of sortedSources) {
      try {
        const url = source.url(normalizedCode);
        let isValid = false;

        if (source.check === 'HEAD') {
          // Verificação rápida com HEAD request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          const response = await fetch(url, { 
            method: 'HEAD',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          isValid = response.ok;
        } else if (source.check === 'FULL') {
          // Verificação completa para APIs que retornam dados
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            // Verifica se tem a bandeira no formato preferido
            if (data.flags && data.flags[preferFormat]) {
              return data.flags[preferFormat];
            }
            // Fallback para outros formatos disponíveis
            if (data.flags) {
              const availableFormats = Object.keys(data.flags);
              if (availableFormats.includes('png')) return data.flags.png;
              if (availableFormats.includes('svg')) return data.flags.svg;
              if (availableFormats.length > 0) return data.flags[availableFormats[0]];
            }
          }
          continue;
        }

        if (isValid) {
          return url;
        }
      } catch (error) {
        console.debug(`Flag source ${source.name} failed for ${normalizedCode}:`, error.message);
        continue;
      }
    }

    // Se não encontrou na primeira tentativa e não deve usar qualidade menor, para
    if (!fallbackToLowerQuality) break;
    
    // Aguarda um pouco antes da próxima tentativa
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return null;
};

/**
 * Valida se uma URL de bandeira é acessível
 * @param {string} url - URL da bandeira
 * @param {number} timeout - Timeout em ms
 * @returns {Promise<boolean>} True se acessível
 */
export const validateFlagUrl = async (url, timeout = 3000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Gera um fallback visual para quando não há bandeira
 * @param {string} countryCode - Código do país
 * @param {Object} options - Opções de estilo
 * @returns {Object} Dados para renderizar o fallback
 */
export const generateFlagFallback = (countryCode, options = {}) => {
  const {
    size = 'medium',
    theme = 'light',
    showCode = true,
    showText = true
  } = options;

  const sizes = {
    small: { icon: 12, text: 'sm', code: 'xs' },
    medium: { icon: 16, text: 'lg', code: 'sm' },
    large: { icon: 20, text: 'xl', code: 'md' }
  };

  const themes = {
    light: { bg: '#f1f5f9', border: '#cbd5e1', text: '#64748b', icon: '#94a3b8' },
    dark: { bg: '#1e293b', border: '#475569', text: '#cbd5e1', icon: '#64748b' }
  };

  const currentSize = sizes[size] || sizes.medium;
  const currentTheme = themes[theme] || themes.light;

  return {
    size: currentSize,
    theme: currentTheme,
    countryCode: countryCode?.toUpperCase() || 'UN',
    showCode,
    showText
  };
};

/**
 * Cache simples para bandeiras já carregadas
 */
const flagCache = new Map();

/**
 * Obtém uma bandeira com cache
 * @param {string} countryCode - Código do país
 * @param {Object} options - Opções
 * @returns {Promise<string|null>} URL da bandeira
 */
export const getCachedFlag = async (countryCode, options = {}) => {
  const cacheKey = `${countryCode}-${JSON.stringify(options)}`;
  
  // Verifica cache
  if (flagCache.has(cacheKey)) {
    const cached = flagCache.get(cacheKey);
    if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24h
      return cached.url;
    }
    flagCache.delete(cacheKey);
  }

  // Busca nova bandeira
  const flagUrl = await getFlagFromMultipleSources(countryCode, options);
  
  if (flagUrl) {
    flagCache.set(cacheKey, {
      url: flagUrl,
      timestamp: Date.now()
    });
  }

  return flagUrl;
};

/**
 * Limpa o cache de bandeiras
 */
export const clearFlagCache = () => {
  flagCache.clear();
};

/**
 * Obtém estatísticas do cache
 * @returns {Object} Estatísticas do cache
 */
export const getFlagCacheStats = () => {
  return {
    size: flagCache.size,
    entries: Array.from(flagCache.entries()).map(([key, value]) => ({
      key,
      timestamp: value.timestamp,
      age: Date.now() - value.timestamp
    }))
  };
};

export default {
  normalizeCountryCode,
  getFlagFromMultipleSources,
  validateFlagUrl,
  generateFlagFallback,
  getCachedFlag,
  clearFlagCache,
  getFlagCacheStats
};
