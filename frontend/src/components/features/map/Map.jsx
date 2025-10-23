import React, { useContext, useCallback, useState, useEffect, useMemo } from 'react';
import { MapContainer, GeoJSON, Rectangle } from 'react-leaflet';
import { Box, useColorMode, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import countriesData from '../../../data/map/countries.json';
import { AuthContext } from '../../../context/AuthContext';
import { CountriesContext } from '../../../context/CountriesContext';
import { createCountryStyleBase, getOceanStyles } from '../../../styles/mapStyles';
import { useCountryHighlight } from './hooks/useCountryHighlight';
import '../../../styles/leafletStyles.css';
import ConversionModal from '../../modals/ConversionModal';

// Componente memoizado para o oceano
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

// Componente memoizado para países
const CountriesGeoJSON = React.memo(({ geoJsonKey, countryStyle, onEachCountry }) => (
  <GeoJSON
    key={geoJsonKey}
    data={countriesData}
    style={(feature) => countryStyle(feature)}
    onEachFeature={onEachCountry}
  />
));

// Componente memoizado para o container do mapa
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
      overflow: 'hidden'
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

  // Zoom responsivo usando Chakra UI
  const initialZoom = useBreakpointValue({ base: 2.0, md: 2.6 });
  const initialMinZoom = useBreakpointValue({ base: 1.8, md: 2.3 });

  const colors = useMemo(() => ({ primary: '#3B82F6', secondary: '#10B981' }), []);

  // Hook customizado para gerenciar destaque de países
  const { highlightedCountries, isEffectActive, highlightIntensity } = useCountryHighlight(isLoggedIn, countriesWithPhotos);

  // Country styling function - agora usando a função centralizada
  const countryStyle = useCallback(
    createCountryStyleBase(colors, countriesWithPhotos, highlightedCountries, isLoggedIn, isEffectActive, highlightIntensity, colorMode),
    [colors, countriesWithPhotos, highlightedCountries, isLoggedIn, isEffectActive, highlightIntensity, colorMode]
  );

  // Estado para modal de conversão
  const [conversionModal, setConversionModal] = useState({ isOpen: false, countryId: null });
  const navigate = useNavigate();

  // Função para interações com países
  const onEachCountry = useCallback((feature, layer) => {
    const countryId = feature.properties.iso_a2?.toLowerCase();
    const isCountryWithPhotos = countriesWithPhotos?.includes(countryId);

    layer.on({
      click: () => {
        if (!isLoggedIn) {
          setConversionModal({ isOpen: true, countryId });
          return;
        }

        // Navegar sempre, mesmo se não há fotos
        navigate(`/countries/${countryId}`);
      },
      mouseover: () => {
        if (isCountryWithPhotos || !isLoggedIn) {
          layer.getElement().style.cursor = 'pointer';
        }
      },
      mouseout: () => {
        layer.getElement().style.cursor = '';
      }
    });
  }, [countriesWithPhotos, isLoggedIn, navigate]);

  // Update GeoJSON when countries change OR when highlighted countries change
  useEffect(() => {
    setGeoJsonKey(prevKey => prevKey + 1);
  }, [countriesWithPhotos, highlightedCountries]);

  // Configurações do mapa memoizadas (responsivas)
  const mapConfig = useMemo(() => ({
    bounds: [[-85, -180], [85, 180]],
    oceanBounds: [[-90, -180], [90, 180]],
    center: [20, 0],
    zoom: initialZoom || 2.6,
    minZoom: initialMinZoom || 2.3,
    maxZoom: 7.5,
    maxBoundsViscosity: 1.0,
    worldCopyJump: false
  }), [initialZoom, initialMinZoom]);

  // Estilos do oceano centralizados
  const oceanStyles = useMemo(() => getOceanStyles(colorMode), [colorMode]);

  return (
    <Box position="relative">
      <Box
        position="relative"
        data-theme={colorMode}
        h={{ base: "500px", sm: "600px", md: "700px", lg: "900px", xl: "1000px" }}
      >
        <MapContainerComponent {...mapConfig}>
          <OceanRectangle 
            oceanStyles={oceanStyles} 
            oceanBounds={mapConfig.oceanBounds} 
          />
          
          <CountriesGeoJSON
            geoJsonKey={geoJsonKey}
            countryStyle={countryStyle}
            onEachCountry={onEachCountry}
          />
        </MapContainerComponent>
      </Box>

      {/* Conversion Modal for non-logged users */}
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