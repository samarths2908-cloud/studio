"use client";

import { useEffect, useState } from "react";
import { database as db } from "@/lib/firebase"; 
import { ref, set } from "firebase/database";

export default function DriverPage() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Starting location services...");

  useEffect(() => {
    let watchId: number | null = null;

    // Check for browser geolocation support
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser.");
      setStatus("Geolocation not supported.");
      return;
    }

    setStatus("Watching for location updates...");
    // Start watching the device position
    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Update location in Firebase Realtime Database
          await set(ref(db, "bus/currentLocation"), {
            lat: latitude,
            lng: longitude,
            timestamp: Date.now(),
          });
          setStatus(`Location updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setError(null);
        } catch (err) {
          console.error("Failed to update location:", err);
          setStatus("Failed to send location to server.");
        }
      },
      (posError) => {
        console.error("Geolocation error:", posError);
        setError(posError.message);
        setStatus(`Error: ${posError.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    );

    return () => {
      // Clean up the watcher on unmount
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-4 bg-card text-card-foreground rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold text-center text-primary">Driver Mode</h1>
          <p className="text-center text-muted-foreground">Location sharing is active.</p>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="font-mono text-sm break-all">
              {status}
            </p>
            {error && <p className="mt-2 font-mono text-sm text-destructive">Error: {error}</p>}
          </div>
          <p className="text-xs text-center text-muted-foreground pt-4">This page automatically shares your location. Keep this page open to continue broadcasting.</p>
      </div>
    </div>
  );
}
