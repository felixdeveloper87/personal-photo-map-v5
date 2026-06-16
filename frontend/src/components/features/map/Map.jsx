/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import React, { useContext, useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, GeoJSON, Rectangle, useMap } from 'react-leaflet';
import { Box, HStack, Icon, useBreakpointValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';
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

// ✅ Componente para gerenciar tooltips - fecha tooltips anteriores quando um novo é aberto
const TooltipManager = React.memo(() => {
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;

    let currentTooltip = null;

    const handleTooltipOpen = (e) => {
      // Fecha o tooltip anterior imediatamente
      if (currentTooltip && currentTooltip !== e.tooltip) {
        // Remove o tooltip anterior do DOM imediatamente
        if (currentTooltip._container) {
          currentTooltip._container.style.display = 'none';
          currentTooltip._container.style.opacity = '0';
          currentTooltip._container.style.visibility = 'hidden';
        }
        // Fecha o tooltip usando o método do Leaflet
        if (currentTooltip.close) {
          currentTooltip.close();
        }
      }
      currentTooltip = e.tooltip;
    };

    const handleTooltipClose = (e) => {
      if (currentTooltip === e.tooltip) {
        currentTooltip = null;
      }
    };

    map.on('tooltipopen', handleTooltipOpen);
    map.on('tooltipclose', handleTooltipClose);

    return () => {
      map.off('tooltipopen', handleTooltipOpen);
      map.off('tooltipclose', handleTooltipClose);
    };
  }, [map]);

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
const CountriesGeoJSON = React.memo(({ geoJsonKey, geoJsonRef, countryStyle, onEachCountry }) => (
  <GeoJSON
    key={geoJsonKey}
    ref={geoJsonRef}
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
  const geoJsonRef = useRef(null);
  // Local day/night simulation — independent from any global theme.
  const [mapMode, setMapMode] = useState('night');
  const navigate = useNavigate();

  // ✅ Zoom responsivo com fallback seguro
  const initialZoom = useBreakpointValue({ base: 2, md: 2.0, lg: 2.5, xl: 3 }) ?? 2.6;
  const initialMinZoom = useBreakpointValue({ base: 1.8, md: 3.0 }) ?? 2.3;

  // ✅ Hook customizado para efeito de destaque
  const { highlightedCountries, isEffectActive, highlightIntensity } = useCountryHighlight(
    isLoggedIn,
    countriesWithPhotos
  );

  // ✅ Estilos de país com memoização
  const countryStyle = useMemo(
    () => createCountryStyleBase(
      countriesWithPhotos,
      highlightedCountries,
      isLoggedIn,
      isEffectActive,
      highlightIntensity,
      mapMode
    ),
    [countriesWithPhotos, highlightedCountries, isLoggedIn, isEffectActive, highlightIntensity, mapMode]
  );

  // ✅ Estado do modal
  const [conversionModal, setConversionModal] = useState({ isOpen: false, country: null });

  // ✅ Interações com países
  const onEachCountry = useCallback(
    (feature, layer) => {
      const countryId = feature.properties.iso_a2?.toLowerCase();
      const countryName = feature.properties.name || feature.properties.NAME || 'Unknown';
      const isCountryWithPhotos = countriesWithPhotos?.includes(countryId);

      // Bind tooltip com o nome do país
      layer.bindTooltip(countryName, {
        permanent: false,
        direction: 'top',
        className: 'country-tooltip',
        offset: [0, -10],
        opacity: 1,
        interactive: false,
        sticky: false,
      });

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

  // ✅ Atualiza GeoJSON quando há mudança de dados/destaque (remonta a camada)
  useEffect(() => {
    setGeoJsonKey((prevKey) => prevKey + 1);
  }, [countriesWithPhotos, highlightedCountries]);

  // ✅ Troca dia/noite: reaplica estilos no lugar (instantâneo, sem remontar)
  useEffect(() => {
    const layer = geoJsonRef.current;
    if (layer?.setStyle) {
      layer.setStyle((feature) => countryStyle(feature));
    }
  }, [mapMode, countryStyle]);

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
  const oceanStyles = useMemo(() => getOceanStyles(mapMode), [mapMode]);

  const isNight = mapMode === 'night';

  return (
    <Box position="relative">
      <Box
        position="relative"
        data-theme={mapMode}
        h={{ base: '550px', sm: '650px', md: '800px', lg: '1000px', xl: '1000px' }}
      >
        {/* ☀️🌙 Day / Night segmented toggle */}
        <HStack
          position="absolute"
          top={{ base: 3, md: 4 }}
          right={{ base: 3, md: 4 }}
          zIndex={1000}
          spacing={1}
          p="4px"
          borderRadius="full"
          bg={isNight ? 'rgba(17,21,30,0.86)' : 'rgba(255,255,255,0.92)'}
          border="1px solid"
          borderColor={isNight ? 'rgba(122,224,210,0.30)' : 'rgba(90,140,170,0.30)'}
          backdropFilter="blur(8px)"
          boxShadow="0 10px 28px -16px rgba(0,0,0,0.7)"
        >
          <Box
            as="button"
            onClick={() => setMapMode('day')}
            aria-label="Day map"
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px={3.5}
            py={1.5}
            borderRadius="full"
            fontFamily="'Spline Sans Mono', ui-monospace, monospace"
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            transition="all .2s ease"
            bg={!isNight ? '#F2D06B' : 'transparent'}
            color={!isNight ? '#2A2008' : '#9AA0B0'}
            _hover={!isNight ? {} : { color: '#ECE7DC' }}
          >
            <Icon as={FaSun} boxSize={3} /> DAY
          </Box>
          <Box
            as="button"
            onClick={() => setMapMode('night')}
            aria-label="Night map"
            display="inline-flex"
            alignItems="center"
            gap="6px"
            px={3.5}
            py={1.5}
            borderRadius="full"
            fontFamily="'Spline Sans Mono', ui-monospace, monospace"
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            transition="all .2s ease"
            bg={isNight ? '#3A4668' : 'transparent'}
            color={isNight ? '#ECE7DC' : '#5E6B72'}
            _hover={isNight ? {} : { color: '#2A2008' }}
          >
            <Icon as={FaMoon} boxSize={3} /> NIGHT
          </Box>
        </HStack>

        <MapContainerComponent {...mapConfig}>
          {/* ✅ Ajuste dinâmico de zoom */}
          <ResponsiveZoom zoom={mapConfig.zoom} />
          
          {/* ✅ Gerenciador de tooltips */}
          <TooltipManager />

          <OceanRectangle oceanStyles={oceanStyles} oceanBounds={mapConfig.oceanBounds} />

          <CountriesGeoJSON
            geoJsonKey={geoJsonKey}
            geoJsonRef={geoJsonRef}
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
