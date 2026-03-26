import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { IRestaurant } from "../type";
import { useNavigate } from "react-router-dom";
import {
  RiMapPin2Line,
  RiPhoneLine,
  RiStore2Line,
  RiVerifiedBadgeFill,
  RiErrorWarningFill,
  RiTimeLine,
  RiLoader4Line,
  RiEditBoxLine,
  RiNavigationLine,
  RiCloseLine,
  RiFileTextLine,
  RiSave3Line,
} from "react-icons/ri";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { restaurantService } from "../App";
import { useAppData } from "../context/AppContext";

const Resturant = () => {
  const [resturant, setResturant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user, setUser } = useAppData(); ///

  console.log(user); ///

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchResturant = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          `${restaurantService}/api/resturant/my-resturant`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        if (data?.token) {
          localStorage.setItem("token", data.token);
        }
        setResturant(data.resturant);
        console.log(data);

        if (user) {
          setUser({ ...user, restaurantId: data.resturant._id });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Error fetching resturant",
          );
        } else {
          toast.error("Error fetching resturant");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResturant();
  }, []);

  const handlerOpenClose = async () => {
    setTogglingStatus(true);
    try {
      const res = await axios.put(
        `${restaurantService}/api/resturant/toggle-open`,
        { status: !resturant?.isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (resturant) {
        setResturant({ ...resturant, isOpen: !resturant.isOpen });
      }
      toast.success(res.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to toggle open status.",
        );
      } else {
        toast.error("Failed to toggle open status.");
      }
    } finally {
      setTogglingStatus(false);
    }
  };

  const openEditModal = () => {
    if (resturant) {
      setName(resturant.name);
      setDescription(resturant.description || "");
      setPhone(String(resturant.phone));
      setIsEditModalOpen(true);
    }
  };

  const handlerRestaurantEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const res = await axios.put(
        `${restaurantService}/api/resturant/edit`,
        { name, description, phone },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (resturant) {
        setResturant({
          ...resturant,
          name,
          description,
          phone: Number(phone),
          updatedAt: new Date().toISOString(),
        });
      }
      setIsEditModalOpen(false);
      toast.success(res.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to edit restaurant details.",
        );
      } else {
        toast.error("Failed to edit restaurant details.");
      }
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 border-4 border-orange-200 rounded-full animate-ping opacity-75"></div>
          <div className="bg-white p-4 rounded-full shadow-2xl z-10">
            <RiLoader4Line className="animate-spin text-orange-500" size={40} />
          </div>
        </div>
        <p className="mt-6 text-gray-500 font-bold tracking-wide animate-pulse">
          Preparing your dashboard...
        </p>
      </div>
    );
  }

  if (!resturant) {
    navigate("/add-restaurant");
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-100 z-0">
          {resturant.image?.url ? (
            <img
              src={resturant.image.url}
              alt={resturant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
              <RiStore2Line size={80} className="text-gray-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-[#F8FAFC]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32 sm:pt-48">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/60 overflow-hidden">
            <div className="p-8 sm:p-12 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
                  <h1 className="text-4xl sm:text-5xl font-black text-gray-900 capitalize tracking-tight leading-tight">
                    {resturant.name}
                  </h1>
                  {resturant.isVerified ? (
                    <div className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold border border-blue-100 shadow-sm">
                      <RiVerifiedBadgeFill size={20} />
                      Verified
                    </div>
                  ) : (
                    <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold border border-amber-200 shadow-sm animate-pulse">
                      <RiErrorWarningFill size={20} />
                      Pending Verification
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-4">
                  <div
                    className={`px-5 py-2 rounded-2xl text-sm font-black flex items-center gap-2.5 shadow-sm transition-colors ${
                      resturant.isOpen
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    <span className="relative flex h-3 w-3">
                      {resturant.isOpen && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${
                          resturant.isOpen ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      ></span>
                    </span>
                    {resturant.isOpen
                      ? "Accepting Orders"
                      : "Currently Offline"}
                  </div>
                  <div className="text-sm font-semibold text-gray-500 flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                    <RiTimeLine size={18} className="text-gray-400" />
                    Partner since{" "}
                    {new Date(resturant.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 shrink-0">
                <button
                  onClick={openEditModal}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 border-2 border-gray-100 hover:border-orange-200 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-sm"
                >
                  <RiEditBoxLine size={22} />
                  Edit Profile
                </button>

                <button
                  onClick={handlerOpenClose}
                  disabled={togglingStatus}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black transition-all shadow-md hover:-translate-y-0.5 ${
                    resturant.isOpen
                      ? "bg-linear-to-r from-red-500 to-rose-600 text-white hover:shadow-red-500/30 border border-transparent"
                      : "bg-linear-to-r from-emerald-500 to-teal-500 text-white hover:shadow-emerald-500/30 border border-transparent"
                  } ${togglingStatus ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {togglingStatus ? (
                    <RiLoader4Line className="animate-spin" size={20} />
                  ) : resturant.isOpen ? (
                    <FaRegEyeSlash size={20} />
                  ) : (
                    <FaRegEye size={20} />
                  )}
                  {togglingStatus
                    ? "Processing..."
                    : resturant.isOpen
                      ? "Close Store"
                      : "Open Store"}
                </button>
              </div>
            </div>

            <div className="p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 xl:col-span-8 space-y-10">
                <div className="bg-gray-50/50 p-6 sm:p-8 rounded-3xl border border-gray-100 hover:border-orange-100 transition-colors">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                      <RiStore2Line size={24} />
                    </div>
                    About the Restaurant
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                    {resturant.description ||
                      "You haven't added a description yet. Tell customers what makes your food special!"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border-2 border-gray-50 hover:border-orange-100 transition-colors shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shrink-0">
                      <RiPhoneLine size={28} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Business Phone
                      </span>
                      <p className="text-xl font-black text-gray-800 tracking-wide">
                        +91 {resturant.phone}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border-2 border-gray-50 hover:border-orange-100 transition-colors shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shrink-0">
                      <RiTimeLine size={28} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Last Updated
                      </span>
                      <p className="text-xl font-black text-gray-800 tracking-wide">
                        {new Date(resturant.updatedAt).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 xl:col-span-4 space-y-8">
                <div className="bg-white border-2 border-gray-100 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40 relative hover:border-orange-100 transition-colors">
                  <div className="h-2 bg-linear-to-r from-orange-400 to-red-500 w-full absolute top-0 left-0"></div>
                  <div className="p-6 sm:p-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-3">
                      <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                        <RiMapPin2Line size={22} />
                      </div>
                      Location Map
                    </h3>

                    <div className="bg-gray-50 p-5 rounded-2xl mb-6 border border-gray-100">
                      <p className="text-sm font-bold text-gray-700 leading-relaxed">
                        {resturant.autoLocation?.formatedAddress ||
                          "Address not provided"}
                      </p>
                    </div>

                    {resturant.autoLocation?.coordinates && (
                      <div className="flex items-center justify-between p-5 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-lg text-orange-500 shadow-sm border border-orange-100">
                            <RiNavigationLine size={20} />
                          </div>
                          <div>
                            <span className="block text-[10px] font-black text-orange-500/80 uppercase tracking-wider mb-0.5">
                              Latitude
                            </span>
                            <span className="text-sm font-bold text-gray-800">
                              {resturant.autoLocation.coordinates[1].toFixed(5)}
                            </span>
                          </div>
                        </div>
                        <div className="w-px h-10 bg-orange-200"></div>
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block text-[10px] font-black text-orange-500/80 uppercase tracking-wider mb-0.5 text-right">
                              Longitude
                            </span>
                            <span className="text-sm font-bold text-gray-800">
                              {resturant.autoLocation.coordinates[0].toFixed(5)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!resturant.isVerified && (
                  <div className="bg-linear-to-br from-red-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl shadow-red-500/20 relative overflow-hidden group">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                    <h4 className="font-black text-xl mb-3 flex items-center gap-2.5 relative z-10">
                      <RiErrorWarningFill size={28} className="text-red-200" />
                      Action Required
                    </h4>
                    <p className="text-sm font-medium text-red-50 mb-6 leading-relaxed relative z-10">
                      Your restaurant is currently under review by our
                      onboarding team. We will verify your details shortly to
                      make your store live.
                    </p>
                    <button className="w-full py-3.5 bg-white text-red-600 font-black rounded-2xl text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all relative z-10">
                      Contact Support Team
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !editLoading && setIsEditModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-fade-in-up">
            <div className="bg-linear-to-r from-orange-500 to-red-600 px-6 py-6 flex items-center justify-between text-white">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <RiEditBoxLine size={28} />
                Edit Restaurant Profile
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={editLoading}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-50"
              >
                <RiCloseLine size={24} />
              </button>
            </div>

            <form
              onSubmit={handlerRestaurantEdit}
              className="p-6 sm:p-8 space-y-6"
            >
              <div className="relative group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Restaurant Name
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <RiStore2Line size={22} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter restaurant name"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-orange-500 rounded-xl transition-all outline-none font-bold text-gray-800"
                    required
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Business Phone
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <RiPhoneLine size={22} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter contact number"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-orange-500 rounded-xl transition-all outline-none font-bold text-gray-800"
                    required
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description & Specialties
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-4 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <RiFileTextLine size={22} />
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about your specialties, cuisines, and vibe..."
                    rows={4}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 focus:bg-white focus:border-orange-500 rounded-xl transition-all outline-none font-semibold text-gray-800 resize-none"
                    required
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={editLoading}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className={`flex-1 py-4 rounded-xl font-black tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                    editLoading
                      ? "bg-orange-400 text-white cursor-not-allowed"
                      : "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5"
                  }`}
                >
                  {editLoading ? (
                    <>
                      <RiLoader4Line className="animate-spin" size={24} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <RiSave3Line size={24} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Resturant;
