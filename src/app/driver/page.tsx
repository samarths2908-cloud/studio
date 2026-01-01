
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { busRoutes } from "@/data/busRoutes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { database } from "@/lib/firebase";
import { ref, set, onDisconnect } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { Power, PowerOff, ArrowLeft, LogOut, LocateFixed, MapPin } from "lucide-react";
import Link from "next/link";

export default function DriverPage() {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);
  const onDisconnectRef = useRef<any>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("driver_logged_in");
    if (isLoggedIn !== "true") {
      router.replace("/login");
    }
  }, [router]);

  const handleStartSharing = async () => {
    if (!selectedBus) {
      toast({ title: "Error", description: "Please select a bus first.", variant: "destructive" });
      setStatus("No bus selected.");
      return;
    }

    if (!("geolocation" in navigator)) {
      toast({ title: "Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      setStatus("Geolocation not supported in this browser.");
      return;
    }

    try {
      // optional permission check
      // @ts-ignore
      const permission = await (navigator as any).permissions?.query?.({ name: "geolocation" });
      if (permission && permission.state === "denied") {
        setStatus("Location permission denied. Please enable location permissions.");
        toast({ title: "Error", description: "Location permission denied.", variant: "destructive" });
        return;
      }
    } catch {
      // ignore permission API errors
    }

    setStatus("Starting location sharing...");
    const busRef = ref(database, `busLocations/${selectedBus}`);

    try {
      const od = onDisconnect(busRef);
      onDisconnectRef.current = od;
      od.remove().catch((e: any) => {
        console.warn("onDisconnect scheduling failed:", e);
      });
    } catch (err) {
      console.warn("onDisconnect not available or failed:", err);
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lat = typeof latitude === "number" ? latitude : Number(latitude);
        const lng = typeof longitude === "number" ? longitude : Number(longitude);

        const newLocation = {
          lat,
          lng,
          timestamp: Date.now(),
        };

        set(busRef, newLocation)
          .then(() => {
            setLocation({ lat, lng });
            setIsSharing(true);
            setStatus(`Sharing location for ${selectedBus}`);
          })
          .catch((err) => {
            console.error("Failed to write location:", err);
            setStatus("Failed to share location (write error).");
            toast({ title: "Write Error", description: "Failed to update location to server.", variant: "destructive" });
          });
      },
      (error) => {
        console.error("Geolocation watchPosition error:", error);
        let errorMessage = "An unknown geolocation error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setStatus(errorMessage);
        setIsSharing(false);
        toast({ title: "Location Error", description: errorMessage, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleStopSharing = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    if (!selectedBus) {
      setStatus("No bus selected.");
      return;
    }

    const busRef = ref(database, `busLocations/${selectedBus}`);

    try {
      if (onDisconnectRef.current && typeof onDisconnectRef.current.cancel === "function") {
        onDisconnectRef.current.cancel();
      }
    } catch (e) {
      console.warn("Failed to cancel onDisconnect:", e);
    }

    set(busRef, null)
      .then(() => {
        setIsSharing(false);
        setLocation(null);
        setStatus(`Stopped sharing for ${selectedBus}`);
      })
      .catch((err) => {
        console.error("Failed to remove bus location:", err);
        setStatus("Failed to stop sharing (write error).");
        toast({ title: "Write Error", description: "Failed to remove location from server.", variant: "destructive" });
      });
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (selectedBus) {
        const busRef = ref(database, `busLocations/${selectedBus}`);
        set(busRef, null).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("driver_logged_in");
    handleStopSharing();
    router.push("/");
  };

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
                {Object.keys(busRoutes).map((busName) => (
                  <SelectItem key={busName} value={busName}>
                    {busName.replace('Bus', 'Bus ')}
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
              <p className={cn("text-sm font-mono", isSharing ? 'text-green-600' : 'text-muted-foreground')}>
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

    