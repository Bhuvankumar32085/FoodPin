import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import {
  RiCloseLine,
  RiLoader4Line,
  RiMapPinUserFill,
  RiMotorbikeFill,
} from "react-icons/ri";
import type { IOrder } from "../../type";

// Custom Icons
const riderIcon = new L.DivIcon({
  className: "bg-transparent",
  html: `<div class="w-10 h-10 bg-orange-500 rounded-full shadow-xl border-[3px] border-white flex items-center justify-center text-white"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M11 20H6l-1-4-4-1V9l3-3h5l1 1v2h2v2h2v-1h5v4h-5v1h-2v3h-1zM5 14l2 3h3v-2H8l-1-1v-2H5v2zm12 0h-3v-2h-2v-2h2v1h3v3zm-5-8h-3v2h3V6z"></path></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const userIcon = new L.DivIcon({
  className: "bg-transparent",
  html: `<div class="w-10 h-10 bg-blue-600 rounded-full shadow-xl border-[3px] border-white flex items-center justify-center text-white"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="20px" width="20px" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"></path></svg></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const RoutingMachine = ({
  start,
  end,
}: {
  start: [number, number];
  end: [number, number];
}) => {
  const map = useMap();
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    if (!routingControlRef.current) {
      // TS error fix: Explicitly using (L as any) so TS doesn't complain about missing Routing property
      routingControlRef.current = (L as any).Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        routeWhileDragging: false,
        addWaypoints: false,
        show: false,
        fitSelectedRoutes: true,
        plan: (L as any).Routing.plan(
          [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
          {
            createMarker: (i: number, wp: any) => {
              return L.marker(wp.latLng, {
                icon: i === 0 ? riderIcon : userIcon,
              });
            },
          },
        ),
        lineOptions: {
          styles: [{ color: "#f97316", weight: 5, opacity: 0.9 }],
          extendToWaypoints: true,
          missingRouteTolerance: 10,
        },
      }).addTo(map);
    }

    return () => {
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [map]);

  // Automatically update route when rider location changes
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

const UserTrackingMap = ({
  order,
  riderLocation,
  onClose,
}: {
  order: IOrder;
  riderLocation: number[];
  onClose: () => void;
}) => {
  const deliveryLoc: [number, number] = [
    order.deliveryAddress.latitude,
    order.deliveryAddress.longitude,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-sm transition-all animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[80vh] relative">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-4 flex justify-between items-center text-white z-10 shadow-md">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <RiMotorbikeFill
                className="text-orange-500 animate-pulse"
                size={24}
              />{" "}
              Track Your Order
            </h2>
            <p className="text-xs text-gray-400 font-medium tracking-widest uppercase mt-0.5">
              Order #{order._id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-500 rounded-full transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 w-full relative bg-gray-100">
          {!riderLocation || riderLocation.length < 2 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <RiLoader4Line
                className="animate-spin text-orange-500 mb-3"
                size={40}
              />
              <p className="text-gray-500 font-bold tracking-widest uppercase text-sm animate-pulse">
                Connecting to Rider GPS...
              </p>
            </div>
          ) : (
            <MapContainer
              center={[riderLocation[0], riderLocation[1]]}
              zoom={15}
              className="w-full h-full z-0"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap"
              />
              <RoutingMachine
                start={[riderLocation[0], riderLocation[1]]}
                end={deliveryLoc}
              />
            </MapContainer>
          )}
        </div>

        {/* Footer Details */}
        <div className="bg-white p-5 border-t border-gray-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
              <RiMapPinUserFill size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Delivering To
              </p>
              <p className="text-sm font-bold text-gray-800 line-clamp-1">
                {order.deliveryAddress.formattedAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTrackingMap;
