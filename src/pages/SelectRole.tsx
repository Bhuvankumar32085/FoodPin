import { useState } from "react";
import { useAppData } from "../context/AppContext";
import {
  RiUserHeartFill,
  RiStore2Fill,
  RiEBike2Fill,
  RiCheckFill,
} from "react-icons/ri";
import axios from "axios";
import toast from "react-hot-toast";
import { authService } from "../App";

const SelectRole = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { user, setUser } = useAppData();

  const roles = [
    {
      id: "customer",
      label: "Customer",
      desc: "Order food and track it live.",
      icon: <RiUserHeartFill />,
      color: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-rose-500",
    },
    {
      id: "seller",
      label: "Restaurant Owner",
      desc: "Manage menu & live orders.",
      icon: <RiStore2Fill />,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-500",
    },
    {
      id: "rider",
      label: "Delivery Boy",
      desc: "Deliver food & use live map.",
      icon: <RiEBike2Fill />,
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-500",
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;
    console.log("Selected Role:", selectedRole);

    try {
      const res = await axios.put(
        `${authService}/api/auth/add/role`,
        {
          role: selectedRole,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(res.data.message || "Role updated successfully!");
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
    } catch (error) {
      console.error("Error ", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update role.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-6 relative overflow-x-hidden">
      {/* Decorative Background - Chota on mobile (h-40), bada on desktop (md:h-64) */}
      <div className="absolute top-0 left-0 w-full h-40 md:h-64 bg-linear-to-br from-orange-500 to-red-600 rounded-b-4xl md:rounded-b-[4rem] shadow-md z-0"></div>

      {/* Main Container - Padding aur margin mobile ke hisaab se adjust kiya hai */}
      <div className="relative z-10 w-full max-w-5xl bg-white rounded-2xl md:rounded-3xl shadow-xl p-5 sm:p-8 md:p-12 border border-gray-100 mt-8 md:mt-10">
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-10">
          <img
            src={"/logo.png"}
            alt="FoodPin Logo"
            className="h-10 md:h-14 mx-auto mb-4 md:mb-6 drop-shadow-sm"
          />
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-500">
              {user?.name || "Guest"}!
            </span>
          </h1>
          <p className="text-gray-500 mt-1 md:mt-3 text-sm md:text-lg">
            Choose how you want to use FoodPin.
          </p>
        </div>

        {/* Roles Section - Mobile pe Flex Row (Left/Right), Desktop pe Flex Col (Top/Bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;

            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`
                  relative cursor-pointer rounded-xl md:rounded-2xl p-4 md:p-8 transition-all duration-300 ease-out group
                  border-2 flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-0
                  ${
                    isSelected
                      ? `${role.border} ${role.bg} shadow-md md:scale-[1.02] transform`
                      : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                  }
                `}
              >
                {/* Active Checkmark - Mobile pe chota aur top-right */}
                {isSelected && (
                  <div
                    className={`absolute top-2 right-2 md:top-4 md:right-4 ${role.color}`}
                  >
                    <RiCheckFill className="text-xl md:text-2xl" />
                  </div>
                )}

                {/* Icon - Mobile pe chota (w-14) aur left mein */}
                <div
                  className={`
                  shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-4xl transition-colors duration-300 md:mb-6
                  ${isSelected ? "bg-white shadow-sm " + role.color : "bg-gray-100 text-gray-400 group-hover:bg-white group-hover:shadow-sm group-hover:" + role.color}
                `}
                >
                  {role.icon}
                </div>

                {/* Text Section - Mobile pe text-left, Desktop pe text-center */}
                <div className="flex-1 text-left md:text-center pr-4 md:pr-0">
                  <h2
                    className={`text-base md:text-xl font-bold md:mb-2 ${isSelected ? "text-gray-900" : "text-gray-700"}`}
                  >
                    {role.label}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 leading-snug md:leading-relaxed">
                    {role.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="max-w-md mx-auto">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`
              w-full py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg tracking-wide transition-all duration-300
              flex items-center justify-center gap-2
              ${
                selectedRole
                  ? "bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg md:hover:-translate-y-1"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
