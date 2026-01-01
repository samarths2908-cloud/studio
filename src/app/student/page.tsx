"use client";

import { useState, useEffect } from "react";
import { database as db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

type Coords = { lat: number; lng: number };

export default function StudentPage() {
  const [location, setLocation] = useState<Coords | null>(null);

  // Load the Google Maps script
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    // Listen for changes to the bus location in Firebase
    const locationRef = ref(db, "bus/currentLocation");
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (
        data &&
        typeof data.lat === "number" &&
        typeof data.lng === "number"
      ) {
        setLocation({ lat: data.lat, lng: data.lng });
      } else {
        setLocation(null);
      }
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const renderContent = () => {
    if (loadError) {
      return <p className="text-destructive">Error loading maps. Please check your API key and configuration.</p>;
    }
    if (!isLoaded) {
      return <p className="text-muted-foreground">Loading Map...</p>;
    }

    const mapContainerStyle = { height: "100%", width: "100%" };
    // A default center in case location is not yet available
    const center = location ?? { lat: 12.9017, lng: 74.9995 }; 

    return (
       <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={location ? 16 : 12}>
        {location ? <Marker position={location} /> : <p className="text-muted-foreground">Waiting for bus location...</p>}
      </GoogleMap>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
         <h1 className="text-2xl font-bold text-primary">Student Dashboard</h1>
         <p className="text-muted-foreground">Live Bus Location</p>
      </header>
      <main className="flex-grow flex items-center justify-center bg-muted/20">
          <div className="w-full h-[80vh] bg-background shadow-lg">
             {renderContent()}
          </div>
      </main>
    </div>
  );
}
