import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { riderService } from "../../App";
import { useAppData } from "../../context/AppContext";

// React Icons imports
import { FiAlertCircle, FiEdit3, FiUploadCloud, FiPhone } from "react-icons/fi";
import { HiOutlineIdentification, HiOutlineCreditCard } from "react-icons/hi";
import { MdDeliveryDining } from "react-icons/md";
import { CgSpinner } from "react-icons/cg";

const AddRiderDetails = () => {
  const { location } = useAppData();
  const [image, setImage] = useState<File | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addharNummber, setAddharNummber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please upload image");
      return;
    }

    if (!location?.latitude || !location.longitude) {
      toast.error("Location access is required");
      return;
    }

    try {
      setLoading(true);
      const latitude = location?.latitude;
      const longitude = location?.longitude;
      const formData = new FormData();

      formData.append("image", image);
      formData.append("phoneNumber", phoneNumber);
      formData.append("addharNummber", addharNummber);
      formData.append("drivingLicenseNumber", drivingLicenseNumber);
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());

      const { data } = await axios.post(
        `${riderService}/api/rider/add-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success(data.message || "Profile created");

      window.location.reload();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Create Profile Error");
      } else {
        toast.error("Create Profile Error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden z-0">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-100 h-100 bg-orange-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-100 h-100 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] flex flex-col lg:flex-row overflow-hidden relative z-10 transition-all">
        {/* LEFT PANEL: Branding & Motivation (Hidden on small mobile, visible on desktop/tablet) */}
        <div className="lg:w-5/12 bg-linear-to-br from-gray-900 via-gray-800 to-black p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500 rounded-full blur-[80px] opacity-30"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-lg">
              <MdDeliveryDining className="w-10 h-10 text-orange-400 animate-pulse" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Join the <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-500">
                Elite Fleet
              </span>
            </h1>
            <p className="text-gray-400 mt-4 text-base font-medium leading-relaxed">
              Turn your miles into money. Complete your rider profile today and
              start delivering smiles to thousands of hungry customers.
            </p>
          </div>

          <div className="relative z-10 mt-12 lg:mt-0 hidden sm:block">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
              <p className="text-sm font-bold text-white mb-2">
                Why ride with us?
              </p>
              <ul className="space-y-2 text-sm text-gray-300 font-medium">
                <li className="flex items-center gap-2">
                  ✓ Flexible working hours
                </li>
                <li className="flex items-center gap-2">
                  ✓ Weekly fast payouts
                </li>
                <li className="flex items-center gap-2">
                  ✓ Performance bonuses
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Form */}
        <div className="lg:w-7/12 p-6 sm:p-10 lg:p-12 bg-white flex flex-col justify-center">
          <div className="mb-8 lg:hidden text-center">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Rider Application
            </h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              Fill details to start your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Location Warning Alert */}
            {(!location?.latitude || !location?.longitude) && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm animate-fade-in-down">
                <div className="bg-red-100 p-2 rounded-xl shrink-0 mt-0.5">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-red-800 uppercase tracking-wide">
                    Location Required
                  </h4>
                  <p className="text-xs text-red-600 mt-1 font-semibold leading-relaxed">
                    We need your precise location to assign you nearby
                    deliveries. Please allow location access in your browser.
                  </p>
                </div>
              </div>
            )}

            {/* Circular Profile Photo Upload */}
            <div className="flex flex-col items-center justify-center">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Profile Photo
              </label>
              <label className="group relative flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-dashed border-gray-200 cursor-pointer bg-gray-50 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 overflow-hidden shadow-sm">
                {image ? (
                  <>
                    <img
                      src={URL.createObjectURL(image)}
                      alt="Profile Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiEdit3 className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                      <FiUploadCloud className="w-6 h-6 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">
                      Upload
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Input Fields Container */}
            <div className="space-y-5 mt-2">
              {/* Phone Input */}
              <div className="relative group">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <span className="absolute inset-y-0 left-13 flex items-center text-gray-800 font-bold border-r border-gray-200 pr-3 my-3">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={10}
                    className="w-full pl-26 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none text-gray-900 font-bold placeholder:font-medium placeholder:text-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Aadhar Input */}
                <div className="relative group">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    Aadhar Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <HiOutlineIdentification className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      placeholder="12-digit number"
                      value={addharNummber}
                      onChange={(e) => setAddharNummber(e.target.value)}
                      maxLength={12}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none text-gray-900 font-bold placeholder:font-medium placeholder:text-gray-400 text-sm"
                    />
                  </div>
                </div>

                {/* Driving License Input */}
                <div className="relative group">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 pl-1">
                    Driving License
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
                      <HiOutlineCreditCard className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. UP14 202..."
                      value={drivingLicenseNumber}
                      onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-2xl transition-all outline-none text-gray-900 font-bold placeholder:font-medium placeholder:text-gray-400 text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !location?.latitude}
              className={`w-full py-4 mt-4 rounded-2xl font-black text-base tracking-wide flex items-center justify-center gap-2 transition-all relative overflow-hidden group ${
                loading || !location?.latitude
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-gray-900 to-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <CgSpinner className="animate-spin h-6 w-6 text-white" />
                  Processing Profile...
                </>
              ) : (
                <>
                  Submit Application
                  <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite] z-0"></div>
                </>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
              By submitting, you agree to our Rider Terms & Conditions
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRiderDetails;
