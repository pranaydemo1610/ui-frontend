import { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
}

interface TollPlazaMapProps {
  points: MapPoint[];
  center?: { lat: number; lng: number };
}

export function TollPlazaMap({ points, center }: TollPlazaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const fallback = points[0] ?? { lat: 21.146633, lng: 79.08886 };
    const map = L.map(containerRef.current, {
      center: [center?.lat ?? fallback.lat, center?.lng ?? fallback.lng],
      zoom: 5,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const createIcon = (color: string, isPulse = false) =>
      L.divIcon({
        className: 'custom-marker',
        html: `<div style="position:relative;">
          <div style="width:26px;height:26px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          ${isPulse ? `<div style="position:absolute;top:0;left:0;width:26px;height:26px;border-radius:50%;background:${color};opacity:0.4;animation:pulse 2s infinite;"></div>` : ''}
        </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
      });

    points.forEach((p, i) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: createIcon(i === 0 ? '#2563eb' : '#f59e0b', i === 0),
      })
        .addTo(map)
        .bindPopup(`<strong>${p.label}</strong><br/>${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`);
      markersRef.current.push(marker);
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [points, center]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[300px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
    />
  );
}
