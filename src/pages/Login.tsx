import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  RiEBike2Fill,
  RiMapPinTimeFill,
  RiSecurePaymentFill,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useAppData } from "../context/AppContext";
import { authService } from "../App";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { setIsAuth, setUser } = useAppData();
  const navigate = useNavigate();

  const handleGoogleLogin = async (authResult: any) => {
    setLoading(true);
    try {
      const res = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });
      localStorage.setItem("token", res.data.token);
      toast.success(res.data.message);
      setUser(res.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Login failed. Please try again.",
        );
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: handleGoogleLogin,
    flow: "auth-code",
  });

  return (
    <div className="min-h-screen flex bg-white">
      {/* LEFT SIDE: Visuals & Branding (Hidden on mobile, visible on lg screens) */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
            alt="Food Background"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-br from-orange-600/90 to-red-900/90 mix-blend-multiply" />
        </div>

        {/* Content over image */}
        <div className="relative z-10 text-white p-12 max-w-lg space-y-8">
          <div className="animate-fade-in-up">
            <img
              src={"/logo.png"}
              alt="FoodPin Logo"
              className="h-16 mb-6 drop-shadow-lg"
            />
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight">
              Taste the speed.
              <br />
              <span className="text-orange-200">Track the heat.</span>
            </h2>
            <p className="mt-4 text-lg text-orange-100 font-light">
              Experience real-time order tracking, live navigation, and
              delicious food delivered to your doorstep.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="grid grid-cols-1 gap-4 mt-8">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <div className="p-3 bg-orange-500 rounded-full text-white">
                <RiMapPinTimeFill size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Real-time Tracking</h4>
                <p className="text-sm text-gray-200">
                  Watch your rider move on the map live.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <div className="p-3 bg-red-500 rounded-full text-white">
                <RiEBike2Fill size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Fast Delivery</h4>
                <p className="text-sm text-gray-200">
                  Optimized routes for hot & fresh food.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-6">
            <img src={"/logo.png"} alt="FoodPin" className="h-12 mx-auto" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500">
              Sign in to continue your food journey
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Login Button */}
            <button
              onClick={() => googleLogin()}
              disabled={loading}
              className={`
                relative w-full flex items-center justify-center gap-3 
                bg-white border-2 border-gray-200 text-gray-700 
                font-semibold py-4 rounded-xl 
                transition-all duration-300 ease-in-out
                hover:bg-gray-50 hover:border-orange-200 hover:shadow-lg hover:-translate-y-0.5
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                ${loading ? "opacity-70 cursor-not-allowed" : ""}
              `}
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FcGoogle size={24} />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400">
                  Secure Authentication
                </span>
              </div>
            </div>

            {/* Info Footer */}
            <div className="text-center">
              <p className="text-xs text-gray-400 mt-6">
                By continuing, you agree to our
                <span className="text-orange-600 hover:underline cursor-pointer ml-1">
                  Terms of Service
                </span>{" "}
                and
                <span className="text-orange-600 hover:underline cursor-pointer ml-1">
                  Privacy Policy
                </span>
                .
              </p>

              <div className="mt-8 flex justify-center gap-4 text-gray-300">
                <RiSecurePaymentFill
                  size={20}
                  title="Secure Payments (Stripe/Razorpay)"
                />
                <span className="text-xs self-center">
                  Powered by Microservices Architecture
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
