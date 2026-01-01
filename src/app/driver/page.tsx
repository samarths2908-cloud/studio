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
import { Power, PowerOff, ArrowLeft, LogOut } from "lucide-react";
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
  }, [selectedBus]);

  const handleLogout = () => {
    sessionStorage.removeItem("driver_logged_in");
    handleStopSharing();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
       <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Driver Control Panel</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
          <CardDescription>Select a bus and start sharing its live location.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="flex flex-col sm:flex-row items-center gap-4">
              <Select onValueChange={(value) => setSelectedBus(value as string)} disabled={isSharing}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Bus..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(busRoutes).map((busName) => (
                    <SelectItem key={busName} value={busName}>
                      {busName.replace("Bus", "Bus ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            <div className="flex items-center gap-2">
                <Button onClick={handleStartSharing} disabled={!selectedBus || isSharing} className="w-full sm:w-auto">
                  <Power className="mr-2" /> Start Sharing
                </Button>
                <Button onClick={handleStopSharing} disabled={!isSharing} variant="destructive" className="w-full sm:w-auto">
                  <PowerOff className="mr-2"/> Stop Sharing
                </Button>
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
             <h3 className="font-semibold">Live Status</h3>
              <p>
                <span className="font-medium text-muted-foreground w-24 inline-block">Selected Bus:</span> 
                <span className="font-mono">{selectedBus ?? "—"}</span>
              </p>
               <p>
                <span className="font-medium text-muted-foreground w-24 inline-block">Sharing:</span> 
                <span className={`font-mono font-semibold ${isSharing ? 'text-green-500' : 'text-red-500'}`}>{isSharing ? "Yes" : "No"}</span>
              </p>
              <p>
                <span className="font-medium text-muted-foreground w-24 inline-block">Current GPS:</span> 
                <span className="font-mono">{location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "—"}</span>
              </p>
               <p>
                <span className="font-medium text-muted-foreground w-24 inline-block">System Info:</span> 
                <span className="font-mono text-sm">{status}</span>
              </p>
          </div>
        </CardContent>
         <div className="p-4 border-t text-center">
            <Link href="/" passHref>
                <Button variant="link">
                    <ArrowLeft className="mr-2"/> Back to Home
                </Button>
            </Link>
        </div>
      </Card>
    </div>
  );
}
