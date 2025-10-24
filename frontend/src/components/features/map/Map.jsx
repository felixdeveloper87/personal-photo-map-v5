import React, { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, Rectangle, useMap } from 'react-leaflet';
import { Box, useColorMode, useBreakpointValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import countriesData from '../../../data/map/countries.json';
import { AuthContext } from '../../../context/AuthContext';
import { CountriesContext } from '../../../context/CountriesContext';
import { createCountryStyleBase, getOceanStyles } from '../../../styles/mapStyles';
import { useCountryHighlight } from './hooks/useCountryHighlight';
import '../../../styles/leafletStyles.css';
import ConversionModal from '../../modals/ConversionModal';

// ✅ Componente auxiliar para ajustar o zoom dinamicamente após render
const ResponsiveZoom = React.memo(({ zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map && zoom) map.setZoom(zoom);
  }, [map, zoom]);
  return null;
});

// ✅ Oceano memoizado
const OceanRectangle = React.memo(({ oceanStyles, oceanBounds }) => (
  <Rectangle
    bounds={oceanBounds}
    pathOptions={{
      fillColor: oceanStyles.fillColor,
      fillOpacity: oceanStyles.fillOpacity,
      stroke: false,
    }}
  />
));

// ✅ GeoJSON memoizado
const CountriesGeoJSON = React.memo(({ geoJsonKey, countryStyle, onEachCountry }) => (
  <GeoJSON
    key={geoJsonKey}
    data={countriesData}
    style={(feature) => countryStyle(feature)}
    onEachFeature={onEachCountry}
  />
));

// ✅ Container do mapa memoizado
const MapContainerComponent = React.memo(({
  bounds,
  center,
  zoom,
  minZoom,
  maxZoom,
  maxBoundsViscosity,
  worldCopyJump,
  children
}) => (
  <MapContainer
    center={center}
    zoom={zoom}
    minZoom={minZoom}
    maxZoom={maxZoom}
    maxBounds={bounds}
    maxBoundsViscosity={maxBoundsViscosity}
    worldCopyJump={worldCopyJump}
    style={{
      height: '100%',
      width: '100%',
      overflow: 'hidden',
    }}
  >
    {children}
  </MapContainer>
));

const Map = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const { countriesWithPhotos } = useContext(CountriesContext);
  const [geoJsonKey, setGeoJsonKey] = useState(0);
  const { colorMode } = useColorMode();
  const navigate = useNavigate();

  // ✅ Zoom responsivo com fallback seguro
  const initialZoom = useBreakpointValue({ base: 2, md: 2.0, lg: 2, xl: 3 }) ?? 2.6;
  const initialMinZoom = useBreakpointValue({ base: 1.8, md: 3.0 }) ?? 2.3;

  const colors = useMemo(() => ({ primary: '#3B82F6', secondary: '#10B981' }), []);

  // ✅ Hook customizado para efeito de destaque
  const { highlightedCountries, isEffectActive, highlightIntensity } = useCountryHighlight(
    isLoggedIn,
    countriesWithPhotos
  );

  // ✅ Estilos de país com memoização
  const countryStyle = useCallback(
    createCountryStyleBase(
      colors,
      countriesWithPhotos,
      highlightedCountries,
      isLoggedIn,
      isEffectActive,
      highlightIntensity,
      colorMode
    ),
    [colors, countriesWithPhotos, highlightedCountries, isLoggedIn, isEffectActive, highlightIntensity, colorMode]
  );

  // ✅ Estado do modal
  const [conversionModal, setConversionModal] = useState({ isOpen: false, country: null });

  // ✅ Interações com países
  const onEachCountry = useCallback(
    (feature, layer) => {
      const countryId = feature.properties.iso_a2?.toLowerCase();
      const isCountryWithPhotos = countriesWithPhotos?.includes(countryId);

      layer.on({
        click: () => {
          if (!isLoggedIn) {
            setConversionModal({ isOpen: true, country: countryId });
            return;
          }
          navigate(`/countries/${countryId}`);
        },
        mouseover: () => {
          if (isCountryWithPhotos || !isLoggedIn) layer.getElement().style.cursor = 'pointer';
        },
        mouseout: () => {
          layer.getElement().style.cursor = '';
        },
      });
    },
    [countriesWithPhotos, isLoggedIn, navigate]
  );

  // ✅ Atualiza GeoJSON quando há mudança
  useEffect(() => {
    setGeoJsonKey((prevKey) => prevKey + 1);
  }, [countriesWithPhotos, highlightedCountries]);

  // ✅ Configurações do mapa
  const mapConfig = useMemo(
    () => ({
      bounds: [[-80, -180], [85, 180]],
      oceanBounds: [[-80, -180], [90, 180]],
      center: [20, 0],
      zoom: initialZoom,
      minZoom: initialMinZoom,
      maxZoom: 7.5,
      maxBoundsViscosity: 1.0,
      worldCopyJump: false,
    }),
    [initialZoom, initialMinZoom]
  );

  // ✅ Estilos do oceano
  const oceanStyles = useMemo(() => getOceanStyles(colorMode), [colorMode]);

  return (
    <Box position="relative">
      <Box
        position="relative"
        data-theme={colorMode}
        h={{ base: '550px', sm: '650px', md: '800px', lg: '1000px', xl: '1000px' }}
      >
        <MapContainerComponent {...mapConfig}>
          {/* ✅ Ajuste dinâmico de zoom */}
          <ResponsiveZoom zoom={mapConfig.zoom} />

          <OceanRectangle oceanStyles={oceanStyles} oceanBounds={mapConfig.oceanBounds} />

          <CountriesGeoJSON
            geoJsonKey={geoJsonKey}
            countryStyle={countryStyle}
            onEachCountry={onEachCountry}
          />
        </MapContainerComponent>
      </Box>

      {/* ✅ Modal para usuários não logados */}
      {conversionModal.isOpen && (
        <ConversionModal
          isOpen={conversionModal.isOpen}
          onClose={() => setConversionModal({ isOpen: false, country: null })}
          country={conversionModal.country}
        />
      )}
    </Box>
  );
};

export default React.memo(Map);
