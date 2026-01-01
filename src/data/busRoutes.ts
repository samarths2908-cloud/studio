
export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface BusRoute {
  id: number;
  name: string;
  path: RoutePoint[];
}

export const busRoutes: BusRoute[] = [
  {
    id: 1,
    name: "Route A",
    path: [
      { lat: 37.7749, lng: -122.4194 },
      { lat: 37.7840, lng: -122.4090 },
      { lat: 37.7930, lng: -122.4000 },
      // ...additional points
    ],
  },
  {
    id: 2,
    name: "Route B",
    path: [
      { lat: 37.7649, lng: -122.4294 },
      { lat: 37.7540, lng: -122.4390 },
      { lat: 37.7430, lng: -122.4500 },
      // ...additional points
    ],
  },
  // ...more routes
];
