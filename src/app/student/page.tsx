
"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { busRoutes, Stop } from "@/data/busRoutes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { database } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import DynamicMap from "@/components/DynamicMapWrapper";
import Link from "next/link";
import { ArrowLeft, Map, Route } from "lucide-react";
import { cn } from "@/lib/utils";

// constants
const ONLINE_THRESHOLD_MS = 15000; // 15s
const ACTIVE_STOP_THRESHOLD_METERS = 500; // 500m

// types
type BusLocation = [number, number]; // [lat, lng]

// haversine: returns meters
const haversineDistance = (coords1: BusLocation, coords2: [number, number]): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371e3; // earth radius in meters

  const lat1 = toRad(coords1[0]);
  const lat2 = toRad(coords2[0]);
  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// custom hook: listens for bus location in Firebase
function useBusLocation(selectedBusId: string | null) {
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedBusId) {
      setBusLocation(null);
      setLastUpdated(null);
      return;
    }

    const busRef = ref(database, `busLocations/${selectedBusId}`);

    const callback = (snapshot: any) => {
      const data = snapshot.val();
      const isValidNumber = (v: any) => typeof v === "number" && Number.isFinite(v);

      if (data && isValidNumber(data.lat) && isValidNumber(data.lng) && isValidNumber(data.timestamp)) {
        const markerPosition: BusLocation = [Number(data.lat), Number(data.lng)];
        // debug
        console.log("Firebase busLocation:", data, "-> markerPosition:", markerPosition);
        setBusLocation(markerPosition);
        setLastUpdated(data.timestamp);
      } else {
        setBusLocation(null);
        setLastUpdated(null);
      }
    };

    onValue(busRef, callback);

    return () => {
      // remove all listeners from this ref (safe cleanup)
      off(busRef);
    };
  }, [selectedBusId]);

  return { busLocation, lastUpdated };
}

export default function StudentPage() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const { busLocation, lastUpdated } = useBusLocation(selectedBusId);
  const [isBusOnline, setIsBusOnline] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Offline");
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const checkTimerRef = useRef<number | null>(null);

  const selectedBusRoute: Stop[] | undefined = useMemo(
    () => (selectedBusId ? busRoutes[selectedBusId] : undefined),
    [selectedBusId]
  );

  // default center (campus / reasonable default)
  const defaultPosition: BusLocation = useMemo(() => [12.9017, 74.9995], []);

  // online/offline status check (run periodically)
  useEffect(() => {
    const checkStatus = () => {
      if (!lastUpdated) {
        setIsBusOnline(false);
        return;
      }
      const diff = Date.now() - lastUpdated;
      const online = diff <= ONLINE_THRESHOLD_MS;
      setIsBusOnline(online);
    };

    // run once immediately then every 2s
    checkStatus();
    checkTimerRef.current = window.setInterval(checkStatus, 2000);

    return () => {
      if (checkTimerRef.current !== null) {
        clearInterval(checkTimerRef.current);
        checkTimerRef.current = null;
      }
    };
  }, [lastUpdated]);

  // find nearest stop to the busLocation and set active stop id
  useEffect(() => {
    if (!busLocation || !selectedBusRoute) {
      setActiveStopId(null);
      return;
    }

    let closestStop: Stop | null = null;
    let minDistance = Infinity;

    for (const stop of selectedBusRoute) {
      const distance = haversineDistance(busLocation, stop.coords);
      if (distance < minDistance) {
        minDistance = distance;
        closestStop = stop;
      }
    }

    if (closestStop && minDistance <= ACTIVE_STOP_THRESHOLD_METERS) {
      setActiveStopId(closestStop.id);
    } else {
      setActiveStopId(null);
    }
  }, [busLocation, selectedBusRoute]);

  // human readable status
  useEffect(() => {
    if (isBusOnline && lastUpdated) {
      const ageSec = Math.round((Date.now() - lastUpdated) / 1000);
      setStatusMessage(`Online — ${ageSec}s ago`);
    } else {
      setStatusMessage("Offline");
    }
  }, [isBusOnline, lastUpdated]);

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
             <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-primary font-headline">Student Dashboard</h1>
          </div>
          <div className="w-full max-w-xs">
            <Select onValueChange={(value) => {
                setSelectedBusId(value);
                setActiveStopId(null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bus to track..." />
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
        </div>
      </header>

      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg h-[60vh] lg:h-[75vh]">
             <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Map className="w-6 h-6 text-primary" />
                  <CardTitle>Live Bus Location</CardTitle>
                </div>
                {selectedBusId && (
                  <div className={cn("text-sm flex items-center gap-2", isBusOnline ? 'text-green-600' : 'text-red-500')}>
                    <span className={cn("h-2 w-2 rounded-full", isBusOnline ? 'bg-green-500' : 'bg-red-500')}></span>
                    {statusMessage}
                  </div>
                )}
             </CardHeader>
             <CardContent className="h-[calc(100%-7rem)] p-0">
               {selectedBusId ? (
                <DynamicMap center={busLocation ?? defaultPosition} busLocation={busLocation} busName={selectedBusId} />
               ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center rounded-b-lg">
                  <p className="text-muted-foreground">Select a bus to see its location on the map.</p>
                </div>
               )}
             </CardContent>
          </Card>
        </div>
        
        <div>
           <Card className="shadow-lg h-full max-h-[75vh]">
              <CardHeader className="flex flex-row items-center gap-3">
                  <Route className="w-6 h-6 text-primary" />
                  <CardTitle>Bus Route</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedBusRoute ? (
                  <>
                    <CardDescription className="mb-4">Showing stops for {selectedBusId?.replace('Bus', 'Bus ')}.</CardDescription>
                    <ScrollArea className="h-[calc(65vh-6rem)]">
                        <ul className="space-y-3">
                          {selectedBusRoute.map((stop, index) => (
                            <li key={stop.id} className={cn("flex items-center gap-4 p-2 rounded-md transition-colors", {
                                "bg-primary/10": stop.id === activeStopId
                            })}>
                              <div className="flex flex-col items-center justify-center">
                                <div className={cn("w-4 h-4 rounded-full border-2 border-primary", {
                                    "bg-primary ring-4 ring-primary/20": stop.id === activeStopId
                                })} />
                                {index < selectedBusRoute.length - 1 && (
                                  <div className="w-px h-6 bg-border" />
                                )}
                              </div>
                              <span className={cn("font-medium text-sm text-foreground/90", {
                                "font-bold text-primary": stop.id === activeStopId
                              })}>{stop.name}</span>
                            </li>
                          ))}
                        </ul>
                    </ScrollArea>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                      <p className="text-muted-foreground">Please select a bus to view its route.</p>
                  </div>
                )}
              </CardContent>
           </Card>
        </div>
      </main>
    </div>
  );
}

    