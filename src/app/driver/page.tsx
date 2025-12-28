"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { busRoutes } from "@/lib/bus-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { database } from "@/lib/firebase";
import { ref, set, onDisconnect, remove } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { LocateFixed, MapPin, Power, PowerOff, ArrowLeft, LogOut } from "lucide-react";
import Link from 'next/link';

export default function DriverPage() {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("driver_logged_in");
    if (isLoggedIn !== "true") {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("driver_logged_in");
    handleStopSharing();
    router.push("/");
  };


  const handleStartSharing = () => {
    if (!selectedBus) {
      toast({ title: "Error", description: "Please select a bus first.", variant: "destructive" });
      return;
    }

    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }

    const busRef = ref(database, `busLocations/bus_${selectedBus}`);
    
    // Ensure location is removed if the driver disconnects unexpectedly
    onDisconnect(busRef).remove();

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude, timestamp: Date.now() };
        set(busRef, newLocation);
        setLocation({ lat: latitude, lng: longitude });
        setIsSharing(true);
        setStatus(`Sharing location for Bus ${selectedBus}`);
      },
      (error) => {
        let errorMessage = "An unknown error occurred.";
        if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
            errorMessage = "The request to get user location timed out.";
        }
        toast({ title: "Location Error", description: errorMessage, variant: "destructive" });
        setIsSharing(false);
        setStatus("Error");
        handleStopSharing();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleStopSharing = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (selectedBus) {
      const busRef = ref(database, `busLocations/bus_${selectedBus}`);
      remove(busRef); // Remove location from Firebase
      onDisconnect(busRef).cancel(); // Cancel the onDisconnect handler
    }
    setIsSharing(false);
    setStatus("Idle. Select a bus to start sharing.");
    setLocation(null);
  };
  
  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      handleStopSharing();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBus]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
       <div className="absolute top-4 left-4 flex gap-2">
         <Link href="/">
          <Button variant="outline" size="icon" aria-label="Go back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
         <Button variant="outline" size="icon" aria-label="Logout" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <LocateFixed className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Driver Control Panel</CardTitle>
              <CardDescription>Share your bus location in real-time</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">1. Select your bus</label>
            <Select onValueChange={setSelectedBus} disabled={isSharing}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a bus number..." />
              </SelectTrigger>
              <SelectContent>
                {busRoutes.map((route) => (
                  <SelectItem key={route.id} value={String(route.id)}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
             <label className="text-sm font-medium">2. Control location sharing</label>
            {!isSharing ? (
              <Button onClick={handleStartSharing} disabled={!selectedBus} className="w-full bg-green-500 hover:bg-green-600 text-white">
                <Power className="mr-2 h-4 w-4" /> Start Sharing Location
              </Button>
            ) : (
              <Button onClick={handleStopSharing} variant="destructive" className="w-full">
                <PowerOff className="mr-2 h-4 w-4" /> Stop Sharing Location
              </Button>
            )}
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-foreground/80">Status</p>
              <p className={`text-sm font-mono ${isSharing ? 'text-green-600' : 'text-muted-foreground'}`}>
                {status}
              </p>
              {location && isSharing && (
                <div className="mt-2 text-xs text-muted-foreground font-mono flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}