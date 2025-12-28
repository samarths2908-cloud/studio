
"use client";

import { useState, useEffect, useMemo } from 'react';
import { busRoutes } from '@/data/busRoutes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import DynamicMap from "@/components/DynamicMapWrapper";
import { ArrowLeft, Map, Route } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const ONLINE_THRESHOLD_MS = 15000; // 15 seconds
const ACTIVE_STOP_THRESHOLD_METERS = 500; // 500 meters

type Stop = { id: string; name: string; coords: [number, number] };
type BusLocation = [number, number];

// Haversine distance formula to calculate distance between two lat/lng points in meters
const haversineDistance = (coords1: BusLocation, coords2: [number, number]): number => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters

  const dLat = toRad(coords2[0] - coords1[0]);
  const dLon = toRad(coords2[1] - coords1[1]);
  const lat1 = toRad(coords1[0]);
  const lat2 = toRad(coords2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function StudentPage() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isBusOnline, setIsBusOnline] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Offline');
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const selectedBusRoute: Stop[] | undefined = useMemo(() => 
    selectedBusId ? busRoutes[selectedBusId] : undefined, 
  [selectedBusId]);

  // Effect to get data from Firebase
  useEffect(() => {
    if (!selectedBusId) {
      setBusLocation(null);
      setLastUpdated(null);
      return;
    }

    const busRef = ref(database, `busLocations/${selectedBusId}`);
    
    const listener = onValue(busRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.lat && data?.lng && data?.timestamp) {
        setBusLocation([data.lat, data.lng]);
        setLastUpdated(data.timestamp);
      } else {
        setBusLocation(null);
        setLastUpdated(null);
      }
    });

    return () => {
      off(busRef, 'value', listener);
    };
  }, [selectedBusId]);

  // Effect with timer to check if bus is online
  useEffect(() => {
    if (!lastUpdated) {
      setIsBusOnline(false);
      return;
    }

    const checkStatus = () => {
        const difference = Date.now() - lastUpdated;
        setIsBusOnline(difference <= ONLINE_THRESHOLD_MS);
    };

    checkStatus(); // Check immediately on first run
    const interval = setInterval(checkStatus, 2000); // check every 2 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Effect to find the nearest stop
  useEffect(() => {
    if (busLocation && selectedBusRoute) {
      let closestStop: Stop | null = null;
      let minDistance = Infinity;

      selectedBusRoute.forEach(stop => {
        const distance = haversineDistance(busLocation, stop.coords);
        if (distance < minDistance) {
          minDistance = distance;
          closestStop = stop;
        }
      });

      if (closestStop && minDistance <= ACTIVE_STOP_THRESHOLD_METERS) {
        setActiveStopId(closestStop.id);
      } else {
        setActiveStopId(null);
      }
    } else {
      setActiveStopId(null);
    }
  }, [busLocation, selectedBusRoute]);

  // Effect to update the human-readable status message
  useEffect(() => {
    if (isBusOnline && lastUpdated) {
      setStatusMessage(`Online (Updated: ${new Date(lastUpdated).toLocaleTimeString()})`);
    } else {
      setStatusMessage('Offline');
    }
  }, [isBusOnline, lastUpdated]);

  const defaultPosition: [number, number] = useMemo(() => [12.86, 74.93], []);

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
                setBusLocation(null);
                setLastUpdated(null);
                setIsBusOnline(false);
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
                  <div className={`text-sm flex items-center gap-2 ${isBusOnline ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`h-2 w-2 rounded-full ${isBusOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {statusMessage}
                  </div>
                )}
             </CardHeader>
             <CardContent className="h-[calc(100%-7rem)] p-0">
               {selectedBusId ? (
                <DynamicMap center={defaultPosition} busLocation={busLocation} busName={selectedBusId} />
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
