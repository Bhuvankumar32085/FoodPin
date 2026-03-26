import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  RiStore2Line,
  RiPhoneLine,
  RiImageAddLine,
  RiMap2Line,
  RiFileTextLine,
  RiLoader4Line,
  RiMapPin2Line,
  RiCheckDoubleLine,
} from "react-icons/ri";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { restaurantService } from "../App";

const AddRestaurant = () => {
  const { location, loadingLocation } = useAppData();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select a restaurant image");
      return;
    }

    try {
      setLoading(true);
      if (!location) {
        toast.error("Location data is missing. Please allow location access.");
        return;
      }
      if (
        !location.latitude ||
        !location.longitude ||
        !location.formattedAddress ||
        location.formattedAddress === "Unknown Location"
      ) {
        toast.error("Invalid location data. Please try again.");
        return;
      }

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("phone", form.phone);
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("formatedAddress", location.formattedAddress);
      formData.append("image", image);

      const { data } = await axios.post(
        `${restaurantService}/api/resturant/add`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(data.message);
      setForm({
        name: "",
        description: "",
        phone: "",
      });
      setImage(null);
      setImagePreview(null);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error adding restaurant");
      } else {
        toast.error("Error adding restaurant");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>

      <div className="max-w-6xl w-full bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden z-10 relative">
        <div className="relative bg-linear-to-r from-orange-500 via-orange-600 to-red-600 px-6 py-12 md:py-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider uppercase mb-4 backdrop-blur-md border border-white/30">
              Grow Your Business
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Partner With FoodPin
            </h1>
            <p className="mt-4 text-orange-50 font-medium text-base md:text-lg opacity-90">
              Join thousands of restaurants. Setup your digital storefront in
              minutes and start receiving orders instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <label className="text-base font-bold text-gray-800 tracking-wide">
                  Storefront Image
                </label>
                {imagePreview && (
                  <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                    <RiCheckDoubleLine /> Uploaded
                  </span>
                )}
              </div>

              <div className="relative w-full h-72 md:h-100 rounded-3xl overflow-hidden group transition-all duration-500 ease-in-out">
                <div
                  className={`absolute inset-0 border-2 border-dashed rounded-3xl transition-colors duration-300 pointer-events-none z-20 ${imagePreview ? "border-transparent" : "border-gray-300 group-hover:border-orange-500"}`}
                ></div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                />

                {imagePreview ? (
                  <div className="w-full h-full relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-10">
                      <span className="text-white font-bold text-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <RiImageAddLine size={24} /> Change Photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-8 transition-colors duration-300 group-hover:bg-orange-50/50">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-400 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-300 mb-4">
                      <RiImageAddLine size={36} />
                    </div>
                    <p className="font-bold text-gray-700 text-lg">
                      Upload an image
                    </p>
                    <p className="text-sm text-gray-400 text-center mt-2 font-medium">
                      Drag & drop or click to browse. High-quality photos
                      increase sales by up to 30%.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                {location ? (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-4 transition-all hover:shadow-md">
                    <div className="bg-orange-500 text-white p-2.5 rounded-xl shrink-0 mt-0.5 shadow-sm">
                      <RiMapPin2Line size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-orange-600 uppercase tracking-wider mb-1">
                        Auto-Detected Location
                      </h4>
                      <p className="text-sm font-bold text-gray-800 leading-snug">
                        {loadingLocation
                          ? "Detecting location..."
                          : location.formattedAddress}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-[11px] font-semibold text-gray-500">
                          Lat:{" "}
                          {loadingLocation
                            ? "Detecting..."
                            : location.latitude?.toFixed(4)}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500">
                          Lng:{" "}
                          {loadingLocation
                            ? "Detecting..."
                            : location.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-center text-gray-400 text-sm font-medium">
                    <RiLoader4Line className="animate-spin mr-2" /> Detecting
                    your location...
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute top-4 left-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300">
                    <RiStore2Line size={22} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Restaurant Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none font-bold text-gray-800 placeholder:font-medium placeholder:text-gray-400 text-lg"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute top-5 left-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300">
                    <RiFileTextLine size={22} />
                  </div>
                  <textarea
                    name="description"
                    placeholder="Tell us about your specialties, cuisines, and vibe..."
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none font-bold text-gray-800 placeholder:font-medium placeholder:text-gray-400 resize-none text-base leading-relaxed"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute top-4 left-5 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300">
                    <RiPhoneLine size={22} />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Business Contact Number"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none font-bold text-gray-800 placeholder:font-medium placeholder:text-gray-400 text-lg"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-black text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden ${
                    loading
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-linear-to-r from-orange-500 to-red-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_25px_rgba(249,115,22,0.4)] hover:-translate-y-1 active:translate-y-0"
                  }`}
                >
                  {loading ? (
                    <>
                      <RiLoader4Line className="animate-spin" size={26} />
                      Setting up your store...
                    </>
                  ) : (
                    <>
                      <RiMap2Line size={24} />
                      Publish Restaurant
                      <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRestaurant;
