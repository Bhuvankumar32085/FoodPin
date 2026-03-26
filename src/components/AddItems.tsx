import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../App";
import { useState } from "react";
import {
  RiImageAddLine,
  RiLoader4Line,
  RiPriceTag3Line,
  RiRestaurantLine,
  RiFileTextLine,
  RiEdit2Fill,
  RiCheckLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";

const AddItems = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !description || !price || !image) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("image", image);

      const res = await axios.post(`${restaurantService}/api/item/add`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(res.data.message || "Item added successfully!");
      navigate("/");
      // reset form
      setName("");
      setDescription("");
      setPrice("");
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add item");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F4F7FE] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      
      {/* Back Button */}
      <div className="w-full max-w-4xl mb-6">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold transition-colors group"
        >
          <div className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-all group-hover:-translate-x-1">
            <RiArrowLeftLine size={20} />
          </div>
          Back to Dashboard
        </button>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row transition-all">
        {/* Left Side: Image Uploader */}
        <div className="w-full md:w-5/12 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 p-6 md:p-8 flex flex-col justify-center relative overflow-hidden">
          {/* Decorative Blob */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          
          <div className="mb-8 relative z-10 text-center md:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 text-[10px] font-black tracking-widest uppercase mb-3">Menu Management</span>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
              Add New Dish
            </h2>
            <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
              Upload a mouth-watering picture to attract more orders and showcase your culinary skills.
            </p>
          </div>

          <div className="relative w-full aspect-square max-w-65 mx-auto rounded-3xl overflow-hidden group shadow-sm z-10">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {imagePreview ? (
              <div className="w-full h-full relative bg-white">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2.5 rounded-full text-white font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <RiEdit2Fill /> Change Photo
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg z-10 border-2 border-white">
                  <RiCheckLine size={18} />
                </div>
              </div>
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center bg-white group-hover:border-orange-500 group-hover:bg-orange-50 transition-all duration-300 cursor-pointer">
                <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-100 group-hover:text-orange-500 transition-all duration-300 shadow-inner">
                  <RiImageAddLine size={32} />
                </div>
                <span className="font-bold text-gray-700 group-hover:text-orange-600 transition-colors">Upload Image</span>
                <span className="text-xs text-gray-400 mt-1.5 font-medium px-4 text-center">
                  Drag and drop or click here
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form Details */}
        <div className="w-full md:w-7/12 p-6 md:p-8 lg:p-10 bg-white relative">
          <form onSubmit={handleSubmit} className="h-full flex flex-col gap-6">
            
            <div className="grid grid-cols-1 gap-6">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Dish Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <RiRestaurantLine size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Garlic Butter Naan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none font-bold text-gray-800 placeholder:font-medium placeholder:text-gray-400 text-base"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Price
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <RiPriceTag3Line size={20} />
                  </div>
                  <span className="absolute inset-y-0 left-12 flex items-center text-gray-500 font-bold z-10 pointer-events-none text-base">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="250"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-16 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none font-bold text-gray-800 placeholder:font-medium placeholder:text-gray-400 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Description
              </label>
              <div className="relative group flex-1">
                <div className="absolute top-4 left-5 text-gray-400 group-focus-within:text-orange-500 transition-colors">
                  <RiFileTextLine size={20} />
                </div>
                <textarea
                  placeholder="Briefly describe the ingredients, preparation, and taste..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-full min-h-30 pl-12 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none font-semibold text-gray-700 placeholder:text-gray-400 text-base resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
                  loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-linear-to-r from-orange-500 to-red-600 text-white shadow-[0_8px_16px_-4px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_20px_-4px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {loading ? (
                  <>
                    <RiLoader4Line className="animate-spin" size={22} />
                    Adding...
                  </>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-2">
                        Add Dish to Menu
                    </span>
                    <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-shine z-0"></div>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItems;