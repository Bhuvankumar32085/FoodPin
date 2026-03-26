import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppContext";
import type { IRestaurant } from "../../type";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../../App";
import { Link } from "react-router-dom";
import {
  RiMapPin2Fill,
  RiLoader4Line,
  RiStore2Line,
  RiVerifiedBadgeFill,
  RiMapPinUserLine,
  RiDirectionLine,
  RiArrowRightSLine,
  RiSearch2Line,
} from "react-icons/ri";

const UserHomePage = () => {
  const { user, location } = useAppData();
  const [resturants, setResturants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [restaurantCount, setRestaurantCount] = useState(0);
  const [searchReastaurantWithName, setSearchReastaurantWithName] =
    useState("");

  // Helper function to format distance
  const formatDistance = (distanceInMeters?: number) => {
    if (!distanceInMeters) return "Nearby";
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    }
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  //fetch nearby resturants
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }
    const fetchResturant = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${restaurantService}/api/resturant/nearby?latitude=${location?.latitude}&longitude=${location?.longitude}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setRestaurantCount(data.count);
        setResturants(data.restaurants);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
              "Error fetching nearby restaurants",
          );
        } else {
          toast.error("Error fetching nearby restaurants");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResturant();
  }, [location?.latitude, location?.longitude]);

  //   search resturant by name
  useEffect(() => {
    if (!location?.latitude || !location?.longitude) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      const fetchResturant = async () => {
        try {
          setLoading(true);

          const { data } = await axios.get(
            `${restaurantService}/api/resturant/nearby`,
            {
              params: {
                latitude: location.latitude,
                longitude: location.longitude,
                search: searchReastaurantWithName,
              },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          setRestaurantCount(data.count);
          setResturants(data.restaurants);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            toast.error(
              error.response?.data?.message ||
                "Error fetching nearby restaurants",
            );
          } else {
            toast.error("Error fetching nearby restaurants");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchResturant();
    }, 500); // debounce time

    //  Correct cleanup
    return () => clearTimeout(delayDebounceFn);
  }, [searchReastaurantWithName, location?.latitude, location?.longitude]);

  if (user?.role !== "customer") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center">
          <RiStore2Line size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-800">Access Denied</h2>
          <p className="text-gray-500 font-medium mt-2">
            Only customers can view this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="relative">
          <div className="absolute w-24 h-24 border-4 border-orange-200 rounded-full animate-ping opacity-75"></div>
          <div className="bg-white p-5 rounded-full shadow-2xl z-10 relative">
            <RiLoader4Line className="animate-spin text-orange-500" size={48} />
          </div>
        </div>
        <p className="mt-8 text-gray-500 font-bold tracking-wide animate-pulse">
          Finding best food near you...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] pb-24">
      {/* Hero Header Section */}
      <div className="bg-linear-to-r from-orange-500 via-orange-600 to-red-600 rounded-b-[2.5rem] sm:rounded-b-[3rem] px-4 pt-8 pb-16 sm:px-8 sm:pt-12 sm:pb-20 relative overflow-hidden shadow-lg">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 text-white text-xs font-black tracking-widest uppercase mb-4 backdrop-blur-md border border-white/30">
                {getGreeting()}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Hi, {user?.name?.split(" ")[0]}! 👋
              </h1>
              <p className="mt-3 text-orange-100 font-medium text-base sm:text-lg max-w-xl">
                Hungry? Let's find some delicious food around you today.
              </p>
            </div>

            {/* Location Pill */}
            {location?.formattedAddress && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-start gap-3 max-w-sm">
                <div className="bg-white text-orange-600 p-2 rounded-xl shrink-0">
                  <RiMapPinUserLine size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5">
                    Delivering To
                  </p>
                  <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                    {location.formattedAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Filter & Count Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shrink-0">
              <RiStore2Line size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">
                Nearby Restaurants
              </h2>
              <p className="text-sm font-medium text-gray-500">
                {restaurantCount} {restaurantCount === 1 ? "place" : "places"}{" "}
                found within 5km
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
              <RiSearch2Line size={18} />
            </div>
            <input
              type="text"
              value={searchReastaurantWithName}
              onChange={(e) => setSearchReastaurantWithName(e.target.value)}
              placeholder="Search a restaurant..."
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 outline-none text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Empty State */}
        {resturants.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-gray-100 shadow-sm mt-8">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RiMapPin2Fill size={56} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-black text-gray-800 mb-2">
              No restaurants nearby!
            </h3>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              We couldn't find any restaurants within a 5km radius of your
              current location. Try changing your delivery address.
            </p>
            <button className="bg-gray-900 hover:bg-black text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-colors">
              Change Location
            </button>
          </div>
        ) : (
          /* Restaurant Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {resturants.map((rest) => (
              <Link
                to={`/restaurant/${rest._id}`}
                key={rest._id}
                className="bg-white rounded-4xl overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:border-orange-200 hover:shadow-[0_15px_40px_rgba(249,115,22,0.12)] transition-all duration-300 group flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                  {rest.image?.url ? (
                    <img
                      src={rest.image.url}
                      alt={rest.name}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!rest.isOpen ? "grayscale-50" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <RiStore2Line size={48} />
                    </div>
                  )}

                  {/* Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

                  {/* Status Badge (Open/Closed) */}
                  <div className="absolute top-4 left-4 z-10">
                    {rest.isOpen ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 border border-emerald-400">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>{" "}
                        Open Now
                      </span>
                    ) : (
                      <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md border border-red-400">
                        Closed
                      </span>
                    )}
                  </div>

                  {/* Distance Badge */}
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-gray-100/50">
                    <RiDirectionLine className="text-orange-500" size={16} />
                    <span className="text-gray-900 font-black text-xs">
                      {formatDistance(rest.distance)}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex-1 flex flex-col bg-white relative">
                  {/* Title & Verification */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-black text-gray-900 leading-tight line-clamp-1 group-hover:text-orange-600 transition-colors capitalize">
                      {rest.name}
                    </h3>
                    {rest.isVerified && (
                      <RiVerifiedBadgeFill
                        className="text-blue-500 shrink-0 mt-0.5"
                        size={22}
                        title="Verified Partner"
                      />
                    )}
                  </div>

                  {/* Description Snippet */}
                  <p className="text-sm font-medium text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {rest.description ||
                      "Authentic and delicious food prepared with fresh ingredients."}
                  </p>

                  {/* Explore Button Section */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-bold mt-auto">
                    <span className="text-gray-400 group-hover:text-orange-500 transition-colors">
                      View full menu
                    </span>
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:translate-x-1">
                      <RiArrowRightSLine size={20} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomePage;
