"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, memo } from "react";

const busIcon = new L.Icon({
  iconUrl: "/bus-icon.svg",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

function MapUpdater({ busLocation }: { busLocation: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (busLocation) {
      map.flyTo(busLocation, map.getZoom(), {
        animate: true,
        duration: 1,
      });
    }
  }, [busLocation, map]);

  return null;
}

const DynamicMap = memo(({ center, busLocation, busName }: { center: [number, number], busLocation: [number, number] | null, busName?: string }) => {
  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      className="rounded-b-lg"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {busLocation && (
        <Marker position={busLocation} icon={busIcon}>
          <Popup>{busName || "Bus"} is here</Popup>
        </Marker>
      )}

      <MapUpdater busLocation={busLocation} />
    </MapContainer>
  );
});

DynamicMap.displayName = "DynamicMap";
export default DynamicMap;
