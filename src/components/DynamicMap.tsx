"use client";

import React, { useEffect, useRef, memo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
      map.flyTo(busLocation, map.getZoom(), { animate: true, duration: 1.0 });
    }
  }, [busLocation, map]);
  return null;
}

interface MapComponentProps {
  center: [number, number];
  busLocation: [number, number] | null;
  busName?: string;
}

const MapComponent = memo(function MapComponent({
  center,
  busLocation,
  busName,
}: MapComponentProps) {
  // Hooks must be at top level
  const mapRef = useRef<L.Map | null>(null);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          /* ignore */
        }
        mapRef.current = null;
      }
    };
  }, []);

  // Optional: force new mount when center changes (helps in strict/development)
  const mapKey = `${center[0]}-${center[1]}`;

  return (
    <MapContainer
      key={mapKey}
      center={center}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      className="rounded-b-lg"
      whenCreated={(mapInstance) => {
        // If an older instance exists, remove it first
        if (mapRef.current && mapRef.current !== mapInstance) {
          try {
            mapRef.current.remove();
          } catch (e) {
            /* ignore */
          }
        }
        mapRef.current = mapInstance;
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {busLocation && (
        <Marker position={busLocation} icon={busIcon}>
          <Popup>{busName ?? "Bus"} is here.</Popup>
        </Marker>
      )}
      <MapUpdater busLocation={busLocation} />
    </MapContainer>
  );
});
MapComponent.displayName = "MapComponent";

export default MapComponent;
