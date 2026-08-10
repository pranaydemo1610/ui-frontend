import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapViewProps {
  latitude: number;
  longitude: number;
  label?: string;
  originLabel?: string;
  destinationLabel?: string;
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
}

export function MapView({
  latitude,
  longitude,
  label = 'Current Location',
  originLabel,
  destinationLabel,
  originLat,
  originLng,
  destLat,
  destLng,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
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
          <div style="width:28px;height:28px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
          ${isPulse ? `<div style="position:absolute;top:0;left:0;width:28px;height:28px;border-radius:50%;background:${color};opacity:0.4;animation:pulse 2s infinite;"></div>` : ''}
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

    // Current location marker
    const currentMarker = L.marker([latitude, longitude], { icon: createIcon('#2563eb', true) })
      .addTo(map)
      .bindPopup(`<strong>${label}</strong><br/>${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    markersRef.current.push(currentMarker);

    // Origin marker
    if (originLat && originLng) {
      const originMarker = L.marker([originLat, originLng], { icon: createIcon('#22c55e') })
        .addTo(map)
        .bindPopup(`<strong>Origin</strong><br/>${originLabel ?? ''}`);
      markersRef.current.push(originMarker);
    }

    // Destination marker
    if (destLat && destLng) {
      const destMarker = L.marker([destLat, destLng], { icon: createIcon('#ef4444') })
        .addTo(map)
        .bindPopup(`<strong>Destination</strong><br/>${destinationLabel ?? ''}`);
      markersRef.current.push(destMarker);
    }

    // Draw route line if both origin and dest exist
    if (originLat && originLng && destLat && destLng) {
      const route = L.polyline(
        [
          [originLat, originLng],
          [latitude, longitude],
          [destLat, destLng],
        ],
        { color: '#2563eb', weight: 3, dashArray: '8 6', opacity: 0.7 },
      ).addTo(map);
      markersRef.current.push(route as unknown as L.Marker);

      map.fitBounds(route.getBounds(), { padding: [40, 40] });
    } else {
      map.setView([latitude, longitude], 6);
    }
  }, [latitude, longitude, label, originLabel, destinationLabel, originLat, originLng, destLat, destLng]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-[300px] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800"
    />
  );
}
