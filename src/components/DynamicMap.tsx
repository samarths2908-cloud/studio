"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, memo } from 'react';

// Using a public asset for the icon
const busIcon = new L.Icon({
    iconUrl: '/bus-icon.svg',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

interface DynamicMapProps {
    center: [number, number];
    busLocation: [number, number] | null;
    busName?: string;
}

const DynamicMap = ({ center, busLocation, busName = "Bus" }: DynamicMapProps) => {
    // A unique key is used here to force a re-render of the map when the center changes.
    // This is the simplest way to fix the "Map container is already initialized" error.
    const mapKey = `${center[0]}-${center[1]}`;

    return (
        <MapContainer 
            key={mapKey} 
            center={center} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }} 
            className="rounded-b-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {busLocation && (
                <Marker position={busLocation} icon={busIcon}>
                    <Popup>
                        {busName} is here.
                    </Popup>
                </Marker>
            )}
            <MapUpdaterController busLocation={busLocation} />
        </MapContainer>
    );
};

// This component uses useMap and will not be re-rendered unless its props change.
function MapUpdaterController({ busLocation }: { busLocation: [number, number] | null }) {
    const map = useMap();
    
    useEffect(() => {
        if (busLocation) {
            map.flyTo(busLocation, map.getZoom(), {
                animate: true,
                duration: 1.0,
            });
        }
    }, [busLocation, map]);

    return null;
}

// Memoize the component to prevent re-renders unless props change
export default memo(DynamicMap);