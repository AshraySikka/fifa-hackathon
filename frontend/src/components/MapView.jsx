import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";

const TORONTO_CENTER = [43.6453, -79.3806];

function pinIcon(active) {
  const color = active ? "#5FFFAF" : "#22E584";
  const size = active ? 34 : 26;
  return L.divIcon({
    className: "glow-marker",
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
      <path d="M12 0C6.9 0 2.8 4.1 2.8 9.2c0 6.9 8.1 14.1 8.5 14.4a1 1 0 0 0 1.4 0c.4-.3 8.5-7.5 8.5-14.4C21.2 4.1 17.1 0 12 0z" fill="${color}"/>
      <circle cx="12" cy="9.2" r="3.6" fill="#0A0F0D"/>
    </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function FlyToActive({ bar }) {
  const map = useMap();
  useEffect(() => {
    if (bar) map.flyTo([bar.lat, bar.lng], 15, { duration: 0.6 });
  }, [bar, map]);
  return null;
}

export default function MapView({ bars, activeBarId, onMarkerHover }) {
  const activeBar = bars.find((b) => b.id === activeBarId);

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-pitch-600/70 shadow-floodlight">
      <MapContainer
        center={TORONTO_CENTER}
        zoom={13}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors, &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {bars.map((bar) => (
          <Marker
            key={bar.id}
            position={[bar.lat, bar.lng]}
            icon={pinIcon(bar.id === activeBarId)}
            eventHandlers={{
              mouseover: () => onMarkerHover?.(bar.id),
              mouseout: () => onMarkerHover?.(null),
            }}
          >
            <Popup>
              <div className="font-body">
                <p className="font-semibold text-pitch-900">{bar.name}</p>
                <p className="text-xs text-pitch-700">{bar.address}</p>
                <a href={`tel:${bar.phone}`} className="mt-1 inline-block text-xs font-semibold text-signal-dim">
                  {bar.phone}
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
        <FlyToActive bar={activeBar} />
      </MapContainer>
    </div>
  );
}
