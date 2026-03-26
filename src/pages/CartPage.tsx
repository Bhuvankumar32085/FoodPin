import { useAppData } from "../context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../App";
import { useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiDeleteBin7Line,
  RiSubtractLine,
  RiAddLine,
  RiShoppingCart2Line,
  RiFileList3Line,
  RiSecurePaymentLine,
  RiLoader4Line,
} from "react-icons/ri";
import { useEffect, useState } from "react";

const CartPage = () => {
  const { carts, cartLoading, cartLenth, subtotal, fetchCart } = useAppData();
  const navigate = useNavigate();
  const [deleveryCharge, setdeleveryCharge] = useState(0);
  const [totalAmmount, setTotalAmmount] = useState(0);
  // const [platformFee, setplatformFee] = useState(0);
  const token = localStorage.getItem("token");

  const updateQuantity = async (itemId: string, type: "inc" | "dec") => {
    try {
      await axios.put(
        `${restaurantService}/api/cart/update`,
        { itemId, type },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchCart();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update cart");
      } else {
        toast.error("Failed to update cart");
      }
    }
  };

  useEffect(() => {
    const a = async () => {
      if (subtotal < 500) {
        setdeleveryCharge(30);
        setTotalAmmount(subtotal + deleveryCharge);
      } else {
        setdeleveryCharge(0);
        setTotalAmmount(subtotal);
      }
    };
    a();
  }, [subtotal, deleveryCharge]);

  const removeItem = async (itemId: string) => {
    try {
      await axios.delete(`${restaurantService}/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
      toast.success("Item removed from cart");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to remove item");
      } else {
        toast.error("Failed to remove item");
      }
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F7FE]">
        <div className="relative">
          <div className="absolute w-20 h-20 border-4 border-orange-200 rounded-full animate-ping opacity-75"></div>
          <div className="bg-white p-4 rounded-full shadow-xl z-10 relative">
            <RiLoader4Line className="animate-spin text-orange-500" size={36} />
          </div>
        </div>
        <p className="mt-6 text-gray-500 font-bold tracking-wide animate-pulse">
          Loading your cart...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] pb-32 md:pb-12 relative font-sans">
      {/* Decorative Header Background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-orange-100/50 to-transparent z-0 pointer-events-none"></div>

      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-4 py-4 sm:px-8 sm:py-5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 sm:p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 rounded-xl sm:rounded-2xl transition-all shadow-sm active:scale-95"
            >
              <RiArrowLeftLine size={22} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                Your Cart
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest mt-1">
                {cartLenth} {cartLenth === 1 ? "Item" : "Items"} selected
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 relative z-10">
        {!carts || carts.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-[2.5rem] p-10 sm:p-20 text-center border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] mt-6 max-w-2xl mx-auto relative overflow-hidden">
            <div className="w-32 h-32 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative z-10">
              <RiShoppingCart2Line size={64} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 relative z-10 tracking-tight">
              Your cart is empty!
            </h3>
            <p className="text-gray-500 font-medium mb-10 max-w-md mx-auto relative z-10 leading-relaxed">
              Looks like you haven't added anything yet. Explore top restaurants
              and find your next favorite meal.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-linear-to-r from-orange-500 to-red-600 text-white font-black px-10 py-4 rounded-2xl hover:shadow-[0_10px_20px_rgba(249,115,22,0.3)] transition-all shadow-lg active:scale-95"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 🛒 Cart Items List (Left Side) */}
            <div className="lg:col-span-8 space-y-5">
              {carts.map((cart) => {
                if (typeof cart.itemId === "string") return null;
                const item = cart.itemId;

                return (
                  <div
                    key={cart._id}
                    className="bg-white p-4 sm:p-5 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex flex-col sm:flex-row gap-5 items-start sm:items-center relative group transition-all hover:border-orange-100"
                  >
                    {/* Image */}
                    <div className="w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden bg-gray-50 shrink-0 relative">
                      {item.image?.url ? (
                        <img
                          src={item.image.url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <RiFileList3Line size={32} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent sm:hidden pointer-events-none"></div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight capitalize mb-1">
                            {item.name}
                          </h2>
                          <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed max-w-sm">
                            {item.description}
                          </p>
                        </div>
                        {/* Remove Button Desktop */}
                        <button
                          onClick={() => removeItem(item._id)}
                          className="hidden sm:flex text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0"
                          title="Remove item"
                        >
                          <RiDeleteBin7Line size={20} />
                        </button>
                      </div>

                      <div className="flex items-end justify-between mt-4 sm:mt-5">
                        <div className="flex items-center gap-1">
                          <span className="text-orange-500 font-bold text-sm">
                            ₹
                          </span>
                          <span className="text-2xl font-black text-gray-900 leading-none">
                            {item.price}
                          </span>
                        </div>

                        {/* 🔥 Quantity Controls */}
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-sm">
                          <button
                            onClick={() => updateQuantity(item._id, "dec")}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-orange-600 hover:shadow-sm transition-all active:scale-90"
                          >
                            {cart.quauntity === 1 ? (
                              <RiDeleteBin7Line
                                size={16}
                                className="text-red-400"
                              />
                            ) : (
                              <RiSubtractLine size={18} />
                            )}
                          </button>
                          <span className="w-10 text-center text-sm font-black text-gray-900 select-none">
                            {cart.quauntity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, "inc")}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg text-gray-600 hover:text-emerald-600 hover:shadow-sm transition-all active:scale-90"
                          >
                            <RiAddLine size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button Mobile */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="sm:hidden absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-gray-400 hover:text-red-500 shadow-sm"
                      >
                        <RiDeleteBin7Line size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 💳 Summary Section (Right Side / Sticky) */}
            <div className="lg:col-span-4 sticky top-28">
              <div className="bg-white p-6 sm:p-8 rounded-4xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <RiFileList3Line className="text-orange-500" /> Bill Details
                </h2>

                <div className="space-y-4 text-sm font-medium text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Item Total ({cartLenth} items)</span>
                    <span className="font-bold text-gray-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md text-xs uppercase tracking-wide">
                      {subtotal < 500 ? deleveryCharge : "Free"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-6 border-t border-dashed border-gray-300"></div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-base font-bold text-gray-800">
                    To Pay
                  </span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-gray-900 leading-none block mb-1">
                      ₹{totalAmmount}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Incl. of all taxes
                    </span>
                  </div>
                </div>

                {/* Desktop Checkout Button */}
                <button
                  onClick={() => navigate("/checkout")}
                  className="hidden md:flex w-full bg-linear-to-r from-orange-500 to-red-600 text-white py-4 rounded-2xl font-black text-lg items-center justify-center gap-2 shadow-[0_8px_15px_rgba(249,115,22,0.25)] hover:shadow-[0_12px_20px_rgba(249,115,22,0.35)] hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  <RiSecurePaymentLine size={24} />
                  Proceed to Pay
                </button>

                <div className="mt-6 bg-gray-50 p-4 rounded-2xl flex items-start gap-3 border border-gray-100">
                  <img
                    src="/logo.png"
                    alt="logo"
                    className="w-6 h-6 grayscale opacity-50 mt-0.5"
                  />
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Your payment is secured with industry-standard encryption.
                    By placing this order, you agree to our Terms of Service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Floating Checkout Bar */}
      {carts && carts.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-50 rounded-t-3xl">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Grand Total
              </span>
              <span className="text-2xl font-black text-gray-900 leading-none">
                ₹{totalAmmount}
              </span>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-linear-to-r from-orange-500 to-red-600 text-white px-8 py-3.5 rounded-2xl font-black text-base shadow-[0_8px_15px_rgba(249,115,22,0.25)] active:scale-95 flex items-center gap-2 transition-all"
            >
              Pay Now <RiArrowLeftLine className="rotate-180" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
