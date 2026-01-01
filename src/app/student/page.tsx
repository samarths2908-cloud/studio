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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// constants
const ONLINE_THRESHOLD_MS = 15000; // 15s
const ACTIVE_STOP_THRESHOLD_METERS = 500; // 500m

// types
type BusLocation = [number, number]; // [lat, lng]

// haversine: returns meters
const haversineDistance = (coords1: BusLocation, coords2: BusLocation): number => {
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
  const [statusMessage, setStatusMessage] = useState("Select a bus to begin.");
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
      if (!lastUpdated || !selectedBusId) {
        setIsBusOnline(false);
        return;
      }
      const diff = Date.now() - lastUpdated;
      const online = diff <= ONLINE_THRESHOLD_MS;
      setIsBusOnline(online);
    };

    // run once immediately then every 2s
    checkStatus();
    if(checkTimerRef.current) clearInterval(checkTimerRef.current);
    checkTimerRef.current = window.setInterval(checkStatus, 2000);

    return () => {
      if (checkTimerRef.current !== null) {
        clearInterval(checkTimerRef.current);
        checkTimerRef.current = null;
      }
    };
  }, [lastUpdated, selectedBusId]);

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
    if(!selectedBusId) {
      setStatusMessage("Select a bus to begin.");
      return;
    }
    if (isBusOnline && lastUpdated) {
      const ageSec = Math.round((Date.now() - lastUpdated) / 1000);
      setStatusMessage(`Online — last seen ${ageSec}s ago`);
    } else {
      setStatusMessage("Offline — No recent location data");
    }
  }, [isBusOnline, lastUpdated, selectedBusId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b p-4">
        <div className="container mx-auto flex justify-between items-center gap-4">
            <Link href="/" passHref>
                <Button variant="outline" size="icon">
                    <ArrowLeft/>
                </Button>
            </Link>
          <h1 className="text-2xl font-bold text-primary hidden sm:block">Student Dashboard</h1>

          <div className="w-full max-w-xs">
            <Select
              onValueChange={(v) => {
                setSelectedBusId(v as string);
                setActiveStopId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bus to track..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(busRoutes).map((busName) => (
                  <SelectItem key={busName} value={busName}>
                    {busName.replace("Bus", "Bus ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Live Bus Location</CardTitle>
                <Badge variant={isBusOnline ? "default" : "destructive"} className="w-fit">
                    {statusMessage}
                </Badge>
            </CardHeader>
            <CardContent className="h-[65vh] p-0">
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
          <Card className="shadow-lg max-h-[75vh] overflow-hidden">
            <CardHeader>
              <CardTitle>Bus Route</CardTitle>
              <CardDescription>Showing stops for {selectedBusId ?? "—"}</CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[62vh]">
                <div className="p-4 space-y-4">
                  {selectedBusRoute ? (
                    selectedBusRoute.map((stop) => {
                      const isActive = stop.id === activeStopId;
                      return (
                        <div key={stop.id} className={`flex items-start gap-4 p-3 rounded-lg transition-all ${isActive ? "bg-primary/10 border-primary/50 border" : ""}`}>
                          <div className={`mt-1 w-4 h-4 rounded-full border-2 ${isActive ? "bg-primary border-primary-foreground ring-4 ring-primary/30" : "border-border"}`} />
                          <div>
                            <div className={`font-medium ${isActive ? "text-primary" : ""}`}>{stop.name}</div>
                            <div className="text-sm text-muted-foreground">{stop.coords[0].toFixed(5)}, {stop.coords[1].toFixed(5)}</div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground p-4">Select a bus to show its route here.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
