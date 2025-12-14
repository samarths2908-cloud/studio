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

// Component to handle map view updates
function MapUpdater({ busLocation }: { busLocation: [number, number] | null }) {
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

interface MapComponentProps {
    center: [number, number];
    busLocation: [number, number] | null;
    busName?: string;
}

// Memoized map component to prevent re-renders
const MapComponent = memo(({ center, busLocation, busName }: MapComponentProps) => {
    return (
        <MapContainer 
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
                    <Popup>{busName} is here.</Popup>
                </Marker>
            )}
            <MapUpdater busLocation={busLocation} />
        </MapContainer>
    );
});
MapComponent.displayName = 'MapComponent';

// Main export component
const DynamicMap = (props: MapComponentProps) => {
    return <MapComponent {...props} />;
};

export default DynamicMap;
