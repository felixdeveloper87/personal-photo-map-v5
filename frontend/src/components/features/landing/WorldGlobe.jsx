import { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useLandingTokens } from './landingUI';

const DEG = Math.PI / 180;
const TAU = Math.PI * 2;

const CITIES = [
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'London', country: 'United Kingdom', lat: 51.5072, lon: -0.1276 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
];

function simplifyRing(ring) {
  if (!Array.isArray(ring)) return [];
  const step = ring.length > 900 ? 12 : ring.length > 420 ? 7 : ring.length > 180 ? 4 : 1;
  const out = [];
  for (let i = 0; i < ring.length; i += step) {
    const point = ring[i];
    if (Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1])) {
      out.push([point[0], point[1]]);
    }
  }
  const last = ring[ring.length - 1];
  if (last && out.length && (out[out.length - 1][0] !== last[0] || out[out.length - 1][1] !== last[1])) {
    out.push([last[0], last[1]]);
  }
  return out;
}

function extractRings(featureCollection) {
  const rings = [];
  for (const feature of featureCollection?.features || []) {
    const geometry = feature.geometry;
    if (!geometry) continue;
    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach((ring) => rings.push(simplifyRing(ring)));
    }
    if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => rings.push(simplifyRing(ring)));
      });
    }
  }
  return rings.filter((ring) => ring.length > 2);
}

function createProjector(cx, cy, radius, centerLon, centerLat) {
  const phi0 = centerLat * DEG;
  const sinPhi0 = Math.sin(phi0);
  const cosPhi0 = Math.cos(phi0);

  return (lon, lat) => {
    const lambda = (lon - centerLon) * DEG;
    const phi = lat * DEG;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);
    const cosLambda = Math.cos(lambda);

    const x = cosPhi * Math.sin(lambda);
    const y = cosPhi0 * sinPhi - sinPhi0 * cosPhi * cosLambda;
    const z = sinPhi0 * sinPhi + cosPhi0 * cosPhi * cosLambda;

    return {
      x: cx + radius * x,
      y: cy - radius * y,
      z,
    };
  };
}

function drawProjectedLine(ctx, points, project, visibleThreshold = 0) {
  let drawing = false;
  let hasLine = false;

  ctx.beginPath();
  for (const [lon, lat] of points) {
    const p = project(lon, lat);
    if (p.z > visibleThreshold) {
      if (!drawing) {
        ctx.moveTo(p.x, p.y);
        drawing = true;
      } else {
        ctx.lineTo(p.x, p.y);
        hasLine = true;
      }
    } else {
      drawing = false;
    }
  }

  if (hasLine) ctx.stroke();
}

function drawGlobe(ctx, width, height, rings, time, isReducedMotion, t) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.39;
  const centerLon = isReducedMotion ? -18 : -18 + time * 0.0048;
  const centerLat = 12;
  const project = createProjector(cx, cy, radius, centerLon, centerLat);

  ctx.clearRect(0, 0, width, height);

  const atmosphere = ctx.createRadialGradient(cx - radius * 0.36, cy - radius * 0.38, radius * 0.1, cx, cy, radius * 1.32);
  atmosphere.addColorStop(0, 'rgba(111,208,196,0.34)');
  atmosphere.addColorStop(0.52, 'rgba(16,38,49,0.94)');
  atmosphere.addColorStop(1, 'rgba(5,8,12,0)');
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.22, 0, TAU);
  ctx.fill();

  const ocean = ctx.createRadialGradient(cx - radius * 0.26, cy - radius * 0.3, radius * 0.08, cx, cy, radius);
  ocean.addColorStop(0, '#203947');
  ocean.addColorStop(0.55, '#10242E');
  ocean.addColorStop(1, '#071119');

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.clip();
  ctx.fillStyle = ocean;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.lineWidth = 0.6;
  ctx.strokeStyle = 'rgba(236,231,220,0.11)';
  for (let lat = -60; lat <= 60; lat += 20) {
    const points = [];
    for (let lon = -180; lon <= 180; lon += 4) points.push([lon, lat]);
    drawProjectedLine(ctx, points, project, 0.01);
  }
  for (let lon = -180; lon < 180; lon += 20) {
    const points = [];
    for (let lat = -80; lat <= 80; lat += 4) points.push([lon, lat]);
    drawProjectedLine(ctx, points, project, 0.01);
  }

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const ring of rings) {
    let drawing = false;
    let hasShape = false;
    ctx.beginPath();
    for (const [lon, lat] of ring) {
      const p = project(lon, lat);
      if (p.z > 0.015) {
        if (!drawing) {
          ctx.moveTo(p.x, p.y);
          drawing = true;
        } else {
          ctx.lineTo(p.x, p.y);
          hasShape = true;
        }
      } else {
        drawing = false;
      }
    }
    if (hasShape) {
      ctx.fillStyle = 'rgba(111,208,196,0.18)';
      ctx.strokeStyle = 'rgba(111,208,196,0.38)';
      ctx.lineWidth = 0.8;
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.strokeStyle = 'rgba(235,181,114,0.34)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const shade = ctx.createRadialGradient(cx - radius * 0.28, cy - radius * 0.35, radius * 0.15, cx + radius * 0.35, cy + radius * 0.38, radius * 1.02);
  shade.addColorStop(0, 'rgba(255,255,255,0.13)');
  shade.addColorStop(0.6, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.44)');
  ctx.fillStyle = shade;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TAU);
  ctx.fill();

  const visibleCities = CITIES
    .map((city) => ({ ...city, point: project(city.lon, city.lat) }))
    .filter((city) => city.point.z > 0.03)
    .sort((a, b) => b.point.z - a.point.z);

  ctx.font = '600 11px "Spline Sans Mono", ui-monospace, SFMono-Regular, monospace';
  ctx.textBaseline = 'middle';

  visibleCities.forEach((city, index) => {
    const { x, y, z } = city.point;
    const pinRadius = 3 + z * 2.8;

    ctx.save();
    ctx.shadowColor = 'rgba(235,181,114,0.7)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = index < 4 ? t.primary : t.rose;
    ctx.beginPath();
    ctx.arc(x, y, pinRadius, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = index < 4 ? 'rgba(235,181,114,0.52)' : 'rgba(229,138,123,0.38)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, pinRadius + 5 + Math.sin(time * 0.004 + index) * 1.5, 0, TAU);
    ctx.stroke();

    if (index < 4) {
      const labelX = x + 10;
      const labelY = y - 13 + index * 2;
      const label = `${city.name}`;
      const labelW = ctx.measureText(label).width + 18;
      ctx.fillStyle = 'rgba(10,12,17,0.72)';
      ctx.strokeStyle = 'rgba(236,231,220,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(labelX, labelY - 11, labelW, 22, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = t.text;
      ctx.fillText(label, labelX + 9, labelY);
    }
  });
}

const WorldGlobe = () => {
  const t = useLandingTokens();
  const canvasRef = useRef(null);
  const [rings, setRings] = useState([]);

  useEffect(() => {
    let active = true;
    import('../../../data/map/countries.json')
      .then((module) => {
        if (active) setRings(extractRings(module.default || module));
      })
      .catch(() => {
        if (active) setRings([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId;
    let start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (now) => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width === 0 || canvas.height === 0) resize();
      drawGlobe(ctx, rect.width, rect.height, rings, now - start, reduced, t);
      if (!reduced) frameId = requestAnimationFrame(render);
    };

    resize();
    render(start);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [rings, t]);

  return (
    <Box position="relative" minH={{ base: '360px', md: '470px', lg: '560px' }} w="full">
      <Box
        ref={canvasRef}
        as="canvas"
        width="100%"
        height="100%"
        aria-label="Rotating 3D globe with famous city markers"
        position="absolute"
        inset={0}
        w="full"
        h="full"
      />
    </Box>
  );
};

export default WorldGlobe;
