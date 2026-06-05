import { useEffect, useRef } from "react";

// Korean city/area coordinates lookup
const CITY_COORDS: Record<string, [number, number]> = {
  서울: [37.5665, 126.978],
  강남: [37.5172, 127.0473],
  강서: [37.5509, 126.8495],
  강동: [37.5301, 127.1238],
  강북: [37.6396, 127.0257],
  마포: [37.5637, 126.9084],
  종로: [37.5926, 126.9773],
  중구: [37.5641, 126.9979],
  영등포: [37.5264, 126.896],
  송파: [37.5145, 127.1059],
  성동: [37.5636, 127.037],
  부산: [35.1796, 129.0756],
  해운대: [35.1631, 129.1635],
  서면: [35.1579, 129.0594],
  김해: [35.2342, 128.8899],
  장유: [35.2194, 128.8604],
  울산: [35.5384, 129.3114],
  북구: [35.5664, 129.3353],
  울주: [35.52, 129.24],
  대구: [35.8714, 128.6014],
  대전: [36.3504, 127.3845],
  유성: [36.3624, 127.3564],
  세종: [36.48, 127.289],
  한솔: [36.4741, 127.2594],
  광주: [35.1595, 126.8526],
  인천: [37.4563, 126.7052],
  수원: [37.2636, 127.0286],
  영통: [37.2514, 127.0752],
  성남: [37.4449, 127.1388],
  분당: [37.3825, 127.1178],
  용인: [37.2411, 127.1776],
  평택: [36.9922, 127.1126],
  제주: [33.4996, 126.5312],
  전주: [35.8242, 127.1479],
  창원: [35.2279, 128.6811],
  청주: [36.6424, 127.489],
  천안: [36.8151, 127.1139],
};

function parseCityCoords(area: string): [number, number] {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (area.includes(city)) return coords;
  }
  return [36.5, 127.5]; // Korea center fallback
}

function interpolate(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

interface DeliveryMapProps {
  fromArea: string;
  toArea: string;
  status: "approved" | "driver_completed";
  approvedAt?: number;
}

export function DeliveryMap({ fromArea, toArea, status, approvedAt }: DeliveryMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const driverMarkerRef = useRef<unknown>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let L: typeof import("leaflet");

    async function init() {
      L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const from = parseCityCoords(fromArea);
      const to = parseCityCoords(toArea);
      const center: [number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];

      if (!containerRef.current) return;

      // Leaflet container must have height
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false }).setView(center, 9);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      // Route line
      L.polyline([from, to], { color: "#1a56db", weight: 3, opacity: 0.5, dashArray: "6 4" }).addTo(map);

      // Pickup marker
      const pickupIcon = L.divIcon({
        className: "",
        html: `<div style="width:13px;height:13px;background:#1a56db;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [13, 13],
        iconAnchor: [6, 6],
      });
      L.marker(from, { icon: pickupIcon }).addTo(map).bindPopup("📦 출발지");

      // Destination marker
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="width:13px;height:13px;background:#e3540a;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [13, 13],
        iconAnchor: [6, 6],
      });
      L.marker(to, { icon: destIcon }).addTo(map).bindPopup("🏁 도착지");

      // Driver marker (animated)
      const driverIcon = L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;background:#0f9f5a;border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);animation:pulse 1.5s ease-in-out infinite"></div><style>@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.55}}</style>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const startT = approvedAt ?? Date.now() - 60_000;
      const TOTAL_MS = 40 * 60 * 1000; // simulate 40-min delivery

      const getProgress = () => {
        if (status === "driver_completed") return 0.99;
        const elapsed = Date.now() - startT;
        return Math.min(elapsed / TOTAL_MS, 0.98);
      };

      const initPos = interpolate(from, to, getProgress());
      const driverMarker = L.marker(initPos as [number, number], { icon: driverIcon }).addTo(map);
      driverMarker.bindPopup("🚗 드라이버 위치");
      driverMarkerRef.current = driverMarker;

      const animate = () => {
        const t = getProgress();
        const pos = interpolate(from, to, t) as [number, number];
        driverMarker.setLatLng(pos);
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);

      // Fit bounds
      const bounds = L.latLngBounds([from, to]).pad(0.2);
      map.fitBounds(bounds);
    }

    init();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapRef.current) (mapRef.current as { remove: () => void }).remove();
      mapRef.current = null;
    };
  }, [fromArea, toArea, approvedAt, status]);

  return (
    <div
      ref={containerRef}
      className="h-[260px] w-full rounded-2xl overflow-hidden border border-border"
      style={{ zIndex: 0 }}
    />
  );
}
