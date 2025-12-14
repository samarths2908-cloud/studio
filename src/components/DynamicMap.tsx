"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

const busIcon = new L.Icon({
    iconUrl: '/bus-icon.svg',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

interface MapUpdaterProps {
    position: [number, number];
}

function MapUpdater({ position }: MapUpdaterProps) {
    const map = useMap();
    useEffect(() => {
        // Check if position is valid (not default 0,0) before flying
        if (position && position[0] !== 0 && position[1] !== 0) {
            map.flyTo(position, 16, {
                animate: true,
                duration: 1.5
            });
        }
    }, [position, map]);

    return null;
}

interface DynamicMapProps {
    position: [number, number];
    busName?: string;
}

const DynamicMap = ({ position, busName = "Bus" }: DynamicMapProps) => {
    const isPositionValid = position && position[0] !== 0 && position[1] !== 0;

    return (
        <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }} className="rounded-b-lg">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isPositionValid && (
                <Marker position={position} icon={busIcon}>
                    <Popup>
                        {busName} is here.
                    </Popup>
                </Marker>
            )}
            <MapUpdater position={position} />
        </MapContainer>
    );
};

export default DynamicMap;
