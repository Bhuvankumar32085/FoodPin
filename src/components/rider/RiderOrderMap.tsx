import { useEffect, useMemo, useRef, useState } from "react";
import type { IOrder } from "../../type";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { RiMotorbikeFill, RiLoader4Line, RiTimeLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { useSocket } from "../../context/useSocket";
import axios from "axios";

// --- CUSTOM ICONS ---
const riderIcon = new L.DivIcon({
  className: "bg-transparent",
  html: `<div class="w-12 h-12 bg-orange-500 rounded-full shadow-xl border-[3px] border-white flex items-center justify-center text-white"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg"><path d="M11 20H6l-1-4-4-1V9l3-3h5l1 1v2h2v2h2v-1h5v4h-5v1h-2v3h-1zM5 14l2 3h3v-2H8l-1-1v-2H5v2zm12 0h-3v-2h-2v-2h2v1h3v3zm-5-8h-3v2h3V6z"></path></svg></div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const destinationIcon = new L.DivIcon({
  className: "bg-transparent",
  html: `<div class="w-12 h-12 bg-blue-600 rounded-full shadow-xl border-[3px] border-white flex items-center justify-center text-white"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></svg></div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
});

// --- ROUTING MACHINE COMPONENT ---
// Ye component map ke andar route draw karega aur ETA/Distance update karega
const RoutingMachine = ({
  start,
  end,
  onRouteFound,
}: {
  start: [number, number];
  end: [number, number];
  onRouteFound: (distance: number, time: number) => void;
}) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    // 1. Initialization (Sirf ek baar banega)
    if (!routingControlRef.current) {
      routingControlRef.current = (L as any).Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        routeWhileDragging: false,
        addWaypoints: false,
        show: false, // Default instructions hide karne ke liye
        fitSelectedRoutes: true,
        plan: (L as any).Routing.plan(
          [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
          {
            createMarker: (i: number, wp: any) => {
              return L.marker(wp.latLng, {
                icon: i === 0 ? riderIcon : destinationIcon,
              });
            },
          },
        ),
        lineOptions: {
          styles: [{ color: "#f97316", weight: 6, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
      }).addTo(map);

      // Event listener to extract distance and time

      routingControlRef.current.on("routesfound", (e: any) => {
        if (e.routes && e.routes.length > 0) {
          const summary = e.routes[0].summary;
          onRouteFound(summary.totalDistance, summary.totalTime); // Distance in meters, Time in seconds
        }
      });
    }

    // Cleanup on component unmount
    return () => {
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]); // Map par depend karega, start/end par nahi

  // 2. Update waypoints dynamically when rider moves (No flickering)
  useEffect(() => {
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints([
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1]),
      ]);
    }
  }, [start, end]);

  return null;
};

// --- MAIN MAP COMPONENT ---
const RiderOrderMap = ({ myOrder }: { myOrder: IOrder }) => {
  // Real-time local state for rider
  const [riderPos, setRiderPos] = useState<[number, number] | null>(null);
  console.log(riderPos);

  useEffect(() => {
    const fun = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_REALTIME_SERVICES}/api/v1/internal/emit`,
          {
            event: "rider:realtime_location",
            room: `user:${myOrder.userId}`,
            payload: { riderLocation: riderPos },
          },
          {
            headers: {
              "x-internal-key": import.meta.env.VITE_INTERNAL_SERVICE_KEY,
            },
          },
        );
      } catch (error) {
        console.error(
          `Error Find in Realtime share location on RiderOrderMap Line 127 ${error}`,
        );
      }
    };

    fun();
  }, [riderPos, myOrder.userId]);

  // Real-time route info from OSRM (Routing Machine)
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    time: number;
  } | null>(null);

  const destPos = useMemo<[number, number] | null>(() => {
    if (
      myOrder?.deliveryAddress?.latitude !== undefined &&
      myOrder?.deliveryAddress?.longitude !== undefined
    ) {
      return [
        myOrder.deliveryAddress.latitude,
        myOrder.deliveryAddress.longitude,
      ];
    }
    return null;
  }, [myOrder]);

  // Handle Real-Time Location Tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setRiderPos([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("GPS Error: ", error);
        toast.error("Connecting to GPS...");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000, // Accepts 2 second old location
        timeout: 10000,
      },
    );

    // Cleanup watch when component unmounts or order completes
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  if (!riderPos || !destPos) {
    return (
      <div className="w-full h-75 sm:h-100 bg-gray-50 flex flex-col items-center justify-center border-b border-gray-200">
        <RiLoader4Line
          className="animate-spin text-orange-500 mb-4"
          size={40}
        />
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
          Fetching Live GPS...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-87.5 sm:h-112.5 bg-gray-100 z-0">
      {/* Route Info Overlay Pill (Only shows if routing machine has found a route) */}
      {routeInfo && (
        <div className="absolute top-4 left-4 z-1000 bg-white/95 backdrop-blur-md px-4 py-3 rounded-3xl shadow-lg border border-gray-100 flex gap-4 pointer-events-none animate-fade-in-down">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <RiMotorbikeFill size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Distance
              </p>
              <p className="text-base font-black text-gray-900 leading-none">
                {(routeInfo.distance / 1000).toFixed(1)} km
              </p>
            </div>
          </div>

          <div className="w-px bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-xl">
              <RiTimeLine size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Est. Time
              </p>
              <p className="text-base font-black text-blue-600 leading-none">
                {Math.ceil(routeInfo.time / 60)} mins
              </p>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={riderPos}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <RoutingMachine
          start={riderPos}
          end={destPos}
          onRouteFound={(dist, time) =>
            setRouteInfo({ distance: dist, time: time })
          }
        />
      </MapContainer>

      {/* Bottom Fade Gradient for smooth transition into card content */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-linear-to-t from-white to-transparent pointer-events-none z-1000"></div>
    </div>
  );
};

export default RiderOrderMap;
