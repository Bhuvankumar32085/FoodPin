import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import { BiLoader, BiTrash } from "react-icons/bi";
import {
  RiArrowLeftLine,
  RiMapPin2Fill,
  RiPhoneFill,
  RiMapPinLine,
  RiAddLine,
  RiMapPinAddLine,
} from "react-icons/ri";
import { restaurantService } from "../App";
import type { IAddress } from "../type";
import { useNavigate } from "react-router-dom";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationPicker = ({
  setLocation,
}: {
  setLocation: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
  }, [lat, lng, map]);

  return null;
};

const LocateMeButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const locateUser = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16);
        onLocate(latitude, longitude);
        setLocating(false);
      },
      () => {
        toast.error("Location permission denied");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  return (
    <div className="absolute bottom-6 right-6 z-1000">
      <button
        onClick={locateUser}
        disabled={locating}
        className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-70"
      >
        {locating ? (
          <BiLoader className="animate-spin text-orange-500" size={20} />
        ) : (
          <LuLocateFixed className="text-orange-500" size={20} />
        )}
        <span className="hidden sm:inline">
          {locating ? "Finding you..." : "Current Location"}
        </span>
      </button>
    </div>
  );
};

const Address = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchFormattedAddress = async (lat: number, lng: number) => {
    try {
      setIsFetchingAddress(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );
      const data = await res.json();
      setFormattedAddress(data.display_name || "");
    } catch {
      toast.error("Failed to fetch address");
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const setLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    fetchFormattedAddress(lat, lng);
  };

  const addAddress = async () => {
    if (
      !mobile ||
      !formattedAddress ||
      latitude === null ||
      longitude === null
    ) {
      toast.error("Please select a location on the map first");
      return;
    }

    if (mobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setAdding(true);

      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress,
          mobile,
          latitude,
          longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Address added successfully");

      setMobile("");
      setFormattedAddress("");
      setLatitude(null);
      setLongitude(null);

      fetchAddresses();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add address");
      } else {
        toast.error("Failed to add address");
      }
    } finally {
      setAdding(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;

    try {
      setDeletingId(id);

      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Address deleted");

      setAddresses((prev) => prev.filter((addr) => addr._id !== id));
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans relative">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200  shadow-sm px-4 py-3 sm:px-8 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
          >
            <RiArrowLeftLine size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
              Delivery Addresses
            </h1>
            <p className="text-xs font-medium text-gray-500 mt-0.5">
              Manage your saved locations
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT SIDE: Map & Add Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Map Container */}
            <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-gray-200 relative">
              <div className="absolute top-6 left-16 z-40 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-gray-100 pointer-events-none">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <RiMapPinAddLine className="text-orange-500" size={18} />
                  Tap on map to pin location
                </p>
              </div>

              <div className="h-87.5 sm:h-100 w-full rounded-xl overflow-hidden relative z-0">
                <MapContainer
                  center={[28.6139, 77.209]}
                  zoom={13}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationPicker setLocation={setLocation} />
                  <LocateMeButton onLocate={setLocation} />
                  {latitude && longitude && (
                    <>
                      <Marker position={[latitude, longitude]} />
                      <RecenterMap lat={latitude} lng={longitude} />
                    </>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Address Details Form */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-6">
                Add New Details
              </h2>

              <div className="space-y-6">
                {/* Selected Address Display */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Pinned Location
                  </label>
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                      formattedAddress
                        ? "bg-orange-50 border-orange-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div
                      className={`mt-0.5 shrink-0 ${formattedAddress ? "text-orange-500" : "text-gray-400"}`}
                    >
                      <RiMapPinLine size={20} />
                    </div>
                    <div className="flex-1">
                      {isFetchingAddress ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-orange-500">
                          <BiLoader className="animate-spin" size={18} />{" "}
                          Fetching accurate address...
                        </div>
                      ) : formattedAddress ? (
                        <p className="text-sm font-medium text-gray-800 leading-relaxed">
                          {formattedAddress}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Navigate map and tap to drop a pin.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Input - Clean & Standard */}
                <div>
                  <label
                    htmlFor="mobile"
                    className="block text-sm font-semibold text-gray-600 mb-2"
                  >
                    Mobile Number
                  </label>
                  <div className="flex items-center w-full bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all">
                    <div className="flex items-center justify-center px-4 bg-gray-50 border-r border-gray-300 text-gray-600 font-medium h-12">
                      +91
                    </div>
                    <input
                      type="tel"
                      id="mobile"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      maxLength={10}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-4 h-12 outline-none text-gray-800 placeholder-gray-400 text-sm md:text-base bg-transparent"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  disabled={adding || !formattedAddress || mobile.length !== 10}
                  onClick={addAddress}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm md:text-base transition-all flex items-center justify-center gap-2 mt-2 ${
                    adding || !formattedAddress || mobile.length !== 10
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-md active:scale-[0.98]"
                  }`}
                >
                  {adding ? (
                    <>
                      <BiLoader className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <RiAddLine size={20} />
                      Save This Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Saved Addresses */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <RiMapPin2Fill className="text-orange-500" size={20} />
                Saved Locations
              </h2>
              <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                {addresses.length}
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-200">
                <BiLoader
                  className="animate-spin text-orange-500 mb-3"
                  size={28}
                />
                <p className="text-sm font-medium text-gray-500">
                  Loading addresses...
                </p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RiMapPinLine size={32} />
                </div>
                <p className="text-base font-bold text-gray-800 mb-1">
                  No addresses found
                </p>
                <p className="text-sm text-gray-500">
                  Pin a location on the map to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0 mt-0.5">
                      <RiMapPin2Fill size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-2">
                        {addr.formattedAddress}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md">
                        <RiPhoneFill className="text-gray-400" size={14} /> +91{" "}
                        {addr.mobile}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteAddress(addr._id)}
                      disabled={deletingId === addr._id}
                      title="Delete Address"
                      className="shrink-0 p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === addr._id ? (
                        <BiLoader
                          size={18}
                          className="animate-spin text-red-500"
                        />
                      ) : (
                        <BiTrash size={18} />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
