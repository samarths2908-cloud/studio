"use client";

import { useState, useEffect, useMemo } from 'react';
import { busRoutes, type BusRoute } from '@/lib/bus-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { database } from '@/lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import DynamicMap from "@/components/DynamicMapWrapper";
import { ArrowLeft, Map, Route } from 'lucide-react';
import Link from 'next/link';

const ONLINE_THRESHOLD_MS = 20000; // Increased to 20 seconds for more tolerance

export default function StudentPage() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [busLocation, setBusLocation] = useState<[number, number] | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isBusOnline, setIsBusOnline] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Offline');

  const selectedBusRoute: BusRoute | undefined = useMemo(() => 
    busRoutes.find(route => route.id.toString() === selectedBusId), 
  [selectedBusId]);

  useEffect(() => {
    let busRef: any;
    let timer: NodeJS.Timeout;

    const clearState = () => {
      setBusLocation(null);
      setLastUpdated(null);
      setIsBusOnline(false);
      setStatusMessage('Offline');
    };

    if (selectedBusId) {
      busRef = ref(database, `busLocations/bus_${selectedBusId}`);
      
      const listener = onValue(busRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.timestamp) {
          const now = Date.now();
          const difference = now - data.timestamp;
          
          if (difference <= ONLINE_THRESHOLD_MS) {
            if (data.lat && data.lng) {
              setBusLocation([data.lat, data.lng]);
            }
            setLastUpdated(data.timestamp);
            setIsBusOnline(true);
            setStatusMessage(`Online (Updated: ${new Date(data.timestamp).toLocaleTimeString()})`);
          } else {
            clearState();
          }
        } else {
          clearState();
        }
      });

      // A safety timer. If we don't hear from Firebase for a while, mark as offline.
      timer = setInterval(() => {
        if (lastUpdated && (Date.now() - lastUpdated > ONLINE_THRESHOLD_MS)) {
          clearState();
        }
      }, 5000); // Checks every 5 seconds.


      // Cleanup function when component unmounts or selectedBusId changes
      return () => {
        off(busRef, 'value', listener);
        clearInterval(timer);
        clearState();
      };
    } else {
      // Clear all state when no bus is selected
      clearState();
    }
  }, [selectedBusId, lastUpdated]); // Rerun effect if lastUpdated changes to manage timer correctly

  const defaultPosition: [number, number] = useMemo(() => [12.86, 74.93], []); // Approx college location

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
            <Select onValueChange={setSelectedBusId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a bus to track..." />
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
                <DynamicMap center={defaultPosition} busLocation={busLocation} busName={selectedBusRoute?.name} />
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
                    <CardDescription className="mb-4">Showing stops for {selectedBusRoute.name}.</CardDescription>
                    <ScrollArea className="h-[calc(65vh-6rem)]">
                        <ul className="space-y-3">
                          {selectedBusRoute.stops.map((stop, index) => (
                            <li key={index} className="flex items-center gap-4">
                              <div className="flex flex-col items-center justify-center">
                                <div className="w-4 h-4 rounded-full border-2 border-primary bg-background" />
                                {index < selectedBusRoute.stops.length - 1 && (
                                  <div className="w-px h-6 bg-border" />
                                )}
                              </div>
                              <span className="font-medium text-sm text-foreground/90">{stop}</span>
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
