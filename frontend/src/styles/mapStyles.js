const STATIC_COLORS = {
  summerColors: {
    light: [
      { fill: '#FCD34D', border: '#F59E0B', shadow: '#FEF3C7', name: 'sun-yellow' },
      { fill: '#06B6D4', border: '#0891B2', shadow: '#67E8F9', name: 'ocean-blue' },
      { fill: '#10B981', border: '#059669', shadow: '#34D399', name: 'nature-green' },
      { fill: '#F97316', border: '#EA580C', shadow: '#FDBA74', name: 'coral-orange' },
      { fill: '#EC4899', border: '#DB2777', shadow: '#F9A8D4', name: 'summer-pink' },
      { fill: '#8B5CF6', border: '#7C3AED', shadow: '#A78BFA', name: 'violet-sunset' },
      { fill: '#EF4444', border: '#DC2626', shadow: '#F87171', name: 'sunset-red' },
      { fill: '#14B8A6', border: '#0D9488', shadow: '#5EEAD4', name: 'teal-ocean' },
    ],
    dark: [
      { fill: '#6366F1', border: '#4F46E5', shadow: '#8B5CF6', name: 'indigo' },
      { fill: '#10B981', border: '#059669', shadow: '#34D399', name: 'emerald' },
      { fill: '#F59E0B', border: '#D97706', shadow: '#FCD34D', name: 'amber' },
      { fill: '#EF4444', border: '#DC2626', shadow: '#F87171', name: 'red' },
      { fill: '#8B5CF6', border: '#7C3AED', shadow: '#A78BFA', name: 'violet' },
      { fill: '#06B6D4', border: '#0891B2', shadow: '#67E8F9', name: 'cyan' },
      { fill: '#F97316', border: '#EA580C', shadow: '#FDBA74', name: 'orange' },
      { fill: '#EC4899', border: '#DB2777', shadow: '#F9A8D4', name: 'pink' },
    ],
  },
};

const countryStyleCache = new Map();
const oceanStylesCache = new Map();

export const selectHighlightCountries = (countriesWithPhotos) => {
  const maxCountries = 3;

  if (countriesWithPhotos.length > 0) {
    return countriesWithPhotos
      .slice(0, maxCountries)
      .map((country) => country.countryId)
      .sort(() => Math.random() - 0.5);
  }

  const fallbackCountries = [
    'us', 'br', 'gb', 'fr', 'de', 'it', 'es', 'jp', 'ca', 'au',
    'mx', 'ar', 'za', 'in', 'cn', 'ru', 'kr', 'th', 've', 'co',
  ];

  return fallbackCountries
    .sort(() => Math.random() - 0.5)
    .slice(0, maxCountries);
};

export const getOceanColor = (colorMode) => {
  return colorMode === 'dark' ? 'transparent' : '#B3E5FC';
};

export const getOceanOpacity = (colorMode) => {
  return colorMode === 'dark' ? 0 : 0.4;
};

export const getOceanStyles = (colorMode) => {
  if (oceanStylesCache.has(colorMode)) {
    return oceanStylesCache.get(colorMode);
  }

  const styles = {
    color: getOceanColor(colorMode),
    opacity: getOceanOpacity(colorMode),
    background: getOceanColor(colorMode),
    fillColor: getOceanColor(colorMode),
    fillOpacity: getOceanOpacity(colorMode),
  };

  oceanStylesCache.set(colorMode, styles);
  return styles;
};

export const createCountryStyleBase = (
  countriesWithPhotos,
  highlightedCountries,
  isLoggedIn,
  isEffectActive,
  highlightIntensity,
  colorMode
) => {
  const cacheKey = `${isLoggedIn}-${isEffectActive}-${highlightIntensity}-${colorMode}-${countriesWithPhotos.length}-${highlightedCountries.length}`;

  if (countryStyleCache.has(cacheKey)) {
    return countryStyleCache.get(cacheKey);
  }

  const styleFunction = (feature) => {
    return createCountryStyle()(
      feature,
      countriesWithPhotos,
      highlightedCountries,
      isLoggedIn,
      isEffectActive,
      highlightIntensity,
      colorMode
    );
  };

  countryStyleCache.set(cacheKey, styleFunction);
  return styleFunction;
};

export const createCountryStyle = () => {
  return (
    feature,
    countriesWithPhotos,
    highlightedCountries,
    isLoggedIn,
    isEffectActive,
    highlightIntensity = 1,
    colorMode = 'light'
  ) => {
    const countryId = feature.properties.iso_a2.toLowerCase();
    const hasPhotos = countriesWithPhotos.some((country) => country.countryId === countryId);
    const isHighlighted = highlightedCountries.includes(countryId);

    if (!isLoggedIn && isEffectActive && isHighlighted) {
      const randomColor = Math.random();
      const colorSets = STATIC_COLORS.summerColors[colorMode === 'dark' ? 'dark' : 'light'];
      const colorIndex = Math.floor(randomColor * colorSets.length);
      const colorSet = colorSets[colorIndex];
      const opacity = 0.6 + highlightIntensity * 0.2;

      return {
        fillColor: colorSet.fill,
        weight: 2,
        color: colorSet.border,
        fillOpacity: opacity,
        transition: 'all 0.6s ease-in-out',
        filter: `drop-shadow(0 1px 4px ${colorSet.shadow}30) brightness(${1 + highlightIntensity * 0.1})`,
        transform: `scale(${1 + highlightIntensity * 0.01})`,
      };
    }

    if (isLoggedIn && hasPhotos) {
      return {
        fillColor: colorMode === 'dark' ? '#3B82F6' : '#FCD34D',
        weight: 2.5,
        color: colorMode === 'dark' ? '#1D4ED8' : '#F59E0B',
        fillOpacity: colorMode === 'dark' ? 0.8 : 0.7,
        transition: 'all 0.3s ease',
        filter: `drop-shadow(0 1px 3px ${colorMode === 'dark' ? '#1D4ED820' : '#F59E0B20'}) brightness(1.01)`,
      };
    }

    return {
      fillColor: colorMode === 'dark' ? '#4B5563' : '#E5E7EB',
      weight: 1.5,
      color: '#94A3B8',
      fillOpacity: colorMode === 'dark' ? 0.7 : 0.5,
      transition: 'all 0.2s ease',
      className: 'country-gradient-gray',
    };
  };
};
