import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import { MapContainer, GeoJSON, useMap, Rectangle } from 'react-leaflet';
import { Box, useColorMode, Spinner, Center } from '@chakra-ui/react';
import 'leaflet/dist/leaflet.css';

import countriesData from '../../../data/map/countries.json';
import { getOceanStyles, createMiniMapStyle } from '../../../styles/mapStyles';

// Componentes memoizados para evitar re-renderizações
const ResizeInvalidator = React.memo(() => {
  const map = useMap();
  useEffect(() => {
    const handle = () => map.invalidateSize();
    const t1 = setTimeout(handle, 50);
    const t2 = setTimeout(handle, 250);
    window.addEventListener('resize', handle);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', handle);
    };
  }, [map]);
  return null;
});

// Componente memoizado para o oceano
const OceanRectangle = React.memo(({ oceanStyles }) => (
  <Rectangle
    bounds={[[-90, -180], [90, 180]]}
    pathOptions={{
      fillColor: oceanStyles.fillColor,
      fillOpacity: oceanStyles.fillOpacity,
      stroke: false,
    }}
  />
));

// Componente memoizado para países
const CountriesGeoJSON = React.memo(({ geoJsonRef, countryStyle, onEachFeature, colorMode }) => (
  <GeoJSON
    ref={geoJsonRef}
    data={countriesData}
    style={countryStyle}
    onEachFeature={onEachFeature}
    interactive={true}
    key={`minimap-${colorMode}`}
  />
));

// Componente memoizado para o spinner de loading
const LoadingSpinner = React.memo(({ isLoading, colorMode, oceanStyles }) => {
  if (!isLoading) return null;
  
  return (
    <Center
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={10}
      bg={oceanStyles.background}
    >
      <Spinner size="lg" color={colorMode === 'dark' ? 'blue.300' : 'blue.500'} />
    </Center>
  );
});

// Componente memoizado para o mapa
const MapComponent = React.memo(({ 
  center, 
  zoom, 
  minZoom, 
  maxZoom, 
  oceanStyles, 
  countryStyle, 
  onEachFeature, 
  geoJsonRef,
  onMapReady,
  onMapError,
  onMouseLeave,
  colorMode
}) => {
  // MapMouseLeaveGuard otimizado com useCallback
  const MapMouseLeaveGuard = useCallback(() => {
    const map = useMap();
    useEffect(() => {
      const container = map.getContainer();
      const handleLeave = () => {
        if (onMouseLeave) {
          onMouseLeave();
        }
      };
      container.addEventListener('mouseleave', handleLeave);
      return () => container.removeEventListener('mouseleave', handleLeave);
    }, [map, onMouseLeave]);
    return null;
  }, [onMouseLeave]);

  // MapEventHandler otimizado com useCallback
  const MapEventHandler = useCallback(() => {
    const map = useMap();
    useEffect(() => {
      if (onMapReady) {
        const handleLoad = () => onMapReady();
        const handleError = () => onMapError();
        
        map.whenReady(handleLoad);
        map.on('error', handleError);
        
        return () => {
          map.off('error', handleError);
        };
      }
    }, [map, onMapReady, onMapError]);
    return null;
  }, [onMapReady, onMapError]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      style={{
        height: '100%',
        width: '100%',
      }}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      dragging={true}
      touchZoom={false}
      preferCanvas={true}
      attributionControl={false}
      fadeAnimation={false}
      zoomAnimation={false}
      markerZoomAnimation={false}
    >
      <ResizeInvalidator />
      <MapMouseLeaveGuard />
      <MapEventHandler />
      
      <OceanRectangle oceanStyles={oceanStyles} />
      <CountriesGeoJSON 
        geoJsonRef={geoJsonRef}
        countryStyle={countryStyle}
        onEachFeature={onEachFeature}
        colorMode={colorMode}
      />
    </MapContainer>
  );
});

const MiniMap = ({ width, height }) => {
  const { colorMode } = useColorMode();
  const geoJsonRef = useRef(null);
  const lastHoveredRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Estilos estáticos - não mudam com colorMode para MiniMap
  const countryStyle = useMemo(
    () => createMiniMapStyle(colorMode),
    [colorMode]
  );

  // Estilo de hover estático - nunca muda
  const hoverStyle = useMemo(
    () => ({
      fillColor: '#22C55E',
      weight: 1.75,
      color: '#16A34A',
      fillOpacity: 0.75,
    }),
    []
  );

  // onEachFeature otimizado com useCallback
  const onEachFeature = useCallback((feature, layer) => {
    // Set cursor style apenas uma vez
    layer.on('add', () => {
      if (layer.getElement) {
        const element = layer.getElement();
        if (element) {
          element.style.cursor = 'pointer';
        }
      }
    });

    // Event handlers otimizados
    layer.on('mouseover', (e) => {
      if (e.target && e.target.setStyle) {
        e.target.setStyle(hoverStyle);
        lastHoveredRef.current = e.target;
      }
    });

    layer.on('mouseout', (e) => {
      if (e.target && e.target.setStyle) {
        e.target.setStyle(countryStyle(e.target.feature));
        if (lastHoveredRef.current === e.target) {
          lastHoveredRef.current = null;
        }
      }
    });
  }, [hoverStyle, countryStyle]);

  // Estilos do oceano centralizados
  const oceanStyles = useMemo(() => getOceanStyles(colorMode), [colorMode]);

  // Configurações do mapa memoizadas
  const mapConfig = useMemo(() => ({
    center: [20, 0],
    zoom: 2.3,
    minZoom: 2,
    maxZoom: 5
  }), []);

  // Handlers memoizados para o mapa
  const handleMapReady = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleMapError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (lastHoveredRef.current) {
      lastHoveredRef.current.setStyle(countryStyle(lastHoveredRef.current.feature));
      lastHoveredRef.current = null;
    }
  }, [countryStyle]);

  if (hasError) {
    return (
      <Box
        position="relative"
        borderRadius="2xl"
        overflow="hidden"
        w={width}
        h={height}
        bg={colorMode === 'dark' ? '#1A202C' : '#F7FAFC'}
        border="1px solid"
        borderColor={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(203, 213, 224, 0.3)'}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Center>
          <Box textAlign="center" color={colorMode === 'dark' ? 'white' : 'gray.600'}>
            <Box fontSize="2xl" mb={2}>🌍</Box>
            <Box fontSize="sm">Map temporarily unavailable</Box>
          </Box>
        </Center>
      </Box>
    );
  }

  return (
    <Box
      position="relative"
      borderRadius="2xl"
      overflow="hidden"
      w={width}
      h={height}
      bg={colorMode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.6)'}
      border="1px solid"
      borderColor={colorMode === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(203, 213, 224, 0.3)'}
    >
      <LoadingSpinner 
        isLoading={isLoading} 
        colorMode={colorMode} 
        oceanStyles={oceanStyles} 
      />

      <MapComponent
        {...mapConfig}
        oceanStyles={oceanStyles}
        countryStyle={countryStyle}
        onEachFeature={onEachFeature}
        geoJsonRef={geoJsonRef}
        onMapReady={handleMapReady}
        onMapError={handleMapError}
        onMouseLeave={handleMouseLeave}
        colorMode={colorMode}
      />
    </Box>
  );
};

export default React.memo(MiniMap);
