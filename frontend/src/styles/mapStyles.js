/*
 * Map styles — Cartographic atlas with a local day / night mode.
 * Night: deep navy ocean, inked land, teal contour borders.
 * Day:   warm paper ocean, parchment land, sepia contour borders.
 * Visited countries glow amber in both modes. Driven by a per-map `mode`
 * ('night' | 'day') — independent from any global color mode.
 */

const PALETTES = {
  night: {
    land: '#2B3856',            // slate-blue land — clearly reads against the near-black sea
    landBorder: 'rgba(122,222,209,0.6)', // bright teal contour
    visitedFill: '#F3BC6B',     // warm vivid amber
    visitedBorder: '#E0A055',
    visitedGlow: '#F3BC6B',
    highlight: [
      { fill: '#F3BC6B', border: '#E0A055', shadow: '#F3BC6B' }, // amber
      { fill: '#7AE0D2', border: '#4FB3A6', shadow: '#7AE0D2' }, // teal
      { fill: '#F09385', border: '#D16B5B', shadow: '#F09385' }, // rose
    ],
  },
  day: {
    land: '#D9DDE1',            // light grey land
    landBorder: 'rgba(74,144,217,0.9)', // blue country outlines
    visitedFill: '#F2D06B',     // golden visited countries
    visitedBorder: '#E2BB55',
    visitedGlow: '#F2D06B',
    highlight: [
      { fill: '#F2D06B', border: '#E2BB55', shadow: '#F2D06B' }, // gold
      { fill: '#5AB0E0', border: '#3D8FC4', shadow: '#5AB0E0' }, // blue
      { fill: '#F2916B', border: '#D16B4A', shadow: '#F2916B' }, // coral
    ],
  },
};

const getPalette = (mode) => PALETTES[mode] || PALETTES.night;

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

// Ocean is transparent — the cartographic container background (CSS) shows through.
export const getOceanColor = () => 'transparent';
export const getOceanOpacity = () => 0;

export const getOceanStyles = (mode = 'night') => {
  if (oceanStylesCache.has(mode)) {
    return oceanStylesCache.get(mode);
  }

  const styles = {
    color: 'transparent',
    opacity: 0,
    background: 'transparent',
    fillColor: 'transparent',
    fillOpacity: 0,
  };

  oceanStylesCache.set(mode, styles);
  return styles;
};

export const createCountryStyleBase = (
  countriesWithPhotos,
  highlightedCountries,
  isLoggedIn,
  isEffectActive,
  highlightIntensity,
  mode
) => {
  const cacheKey = `${isLoggedIn}-${isEffectActive}-${highlightIntensity}-${mode}-${countriesWithPhotos.length}-${highlightedCountries.length}`;

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
      mode
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
    mode = 'night'
  ) => {
    const palette = getPalette(mode);
    const countryId = feature.properties.iso_a2.toLowerCase();
    const hasPhotos = countriesWithPhotos.some((country) => country.countryId === countryId);
    const isHighlighted = highlightedCountries.includes(countryId);

    // Logged-out "attract" effect: pulse a few countries through the brand trio.
    if (!isLoggedIn && isEffectActive && isHighlighted) {
      const colorSet = palette.highlight[Math.floor(Math.random() * palette.highlight.length)];
      const opacity = 0.55 + highlightIntensity * 0.2;

      return {
        fillColor: colorSet.fill,
        weight: 1.4,
        color: colorSet.border,
        fillOpacity: opacity,
        transition: 'all 0.6s ease-in-out',
        filter: `drop-shadow(0 0 8px ${colorSet.shadow}66) brightness(${1 + highlightIntensity * 0.08})`,
        className: 'country-highlight',
      };
    }

    // Your visited countries — glowing amber on the map.
    if (isLoggedIn && hasPhotos) {
      return {
        fillColor: palette.visitedFill,
        weight: 1.3,
        color: palette.visitedBorder,
        fillOpacity: 0.92,
        transition: 'all 0.3s ease',
        filter: `drop-shadow(0 0 7px ${palette.visitedGlow}59) brightness(1.02)`,
        className: 'country-with-photos',
      };
    }

    // Default land with a faint contour.
    return {
      fillColor: palette.land,
      weight: 0.7,
      color: palette.landBorder,
      fillOpacity: 1,
      transition: 'all 0.25s ease',
      className: 'country-ink',
    };
  };
};
