# **App Name**: BusTrack

## Core Features:

- Role Selection: Allows users to choose between 'Driver' and 'Student' roles.
- Driver Location Sharing: Drivers can share their location in real-time via browser GPS, which updates a Firebase database.
- Real-time Location Updates: The app updates the location of buses every 3-5 seconds using the browser's GPS functionality.
- Student Bus Tracking: Students can select a bus and view its real-time location on a Leaflet/OpenStreetMap mini-map, along with a list of stops.
- Map Display: Display of the location using Leaflet.js and OpenStreetMap tiles, updated in real time.
- Firebase Integration: Utilizes Firebase Realtime Database for storing and syncing bus locations between drivers and students.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF) to evoke trust and direction.
- Background color: Light cyan (#E0FFFF), providing a clean and calm backdrop.
- Accent color: Light sea green (#20B2AA) for interactive elements and highlights, symbolizing reliability.
- Body and headline font: 'Inter', sans-serif, for a clean, objective, modern feel.
- Use simple, recognizable icons for buses and location markers.
- Clean and card-based layout, prioritizing clarity with the mini-map displayed prominently above the route list.
- Subtle transitions and smooth marker movements on the map to enhance the user experience.