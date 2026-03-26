import {
  RiMotorbikeFill,
  RiStore2Line,
  RiMapPinUserLine,
  RiPhoneLine,
  RiCheckDoubleLine,
  RiFileList3Line,
  RiCheckboxBlankCircleFill,
  RiMoneyRupeeCircleLine,
  RiNavigationLine,
} from "react-icons/ri";
import type { IOrder } from "../../type";
import RiderOrderMap from "./RiderOrderMap";

type IItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

const ActiveOrderCard = ({
  myOrder,
  updateOrderStatus,
}: {
  myOrder: IOrder;
  updateOrderStatus: (newStatus: "picked_up" | "delivered") => Promise<void>;
}) => {
  
  return (
    <div className="mb-8 border-2 border-emerald-400 rounded-4xl overflow-hidden shadow-[0_15px_40px_rgba(16,185,129,0.15)] relative bg-white transition-all">
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <RiderOrderMap myOrder={myOrder} />

      {/* Header */}
      <div className="bg-linear-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex justify-between items-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-10 -translate-y-10"></div>
        <h2 className="text-2xl font-black flex items-center gap-3 relative z-10">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <RiMotorbikeFill className="animate-pulse" size={28} />
          </div>
          Active Delivery
        </h2>
        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs sm:text-sm font-black border border-white/30 uppercase tracking-widest relative z-10 shadow-sm">
          {myOrder.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="p-6 sm:p-8 md:p-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT: Location Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pickup Details */}
            <div className="bg-orange-50/50 p-6 rounded-3xl border border-orange-100 relative group hover:border-orange-200 hover:shadow-md transition-all">
              <div className="absolute -left-3 top-10 w-6 h-6 bg-white border-4 border-orange-200 rounded-full hidden sm:block"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <RiStore2Line size={24} />
                  </div>
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                    Pickup From
                  </h3>
                </div>
                <span className="bg-white text-orange-500 text-[10px] font-bold px-2 py-1 rounded-lg border border-orange-100 uppercase">
                  Restaurant
                </span>
              </div>
              <div className="pl-1 sm:pl-16">
                <p className="text-2xl font-black text-gray-900 mb-1 capitalize tracking-tight">
                  {myOrder.restaurantName}
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm font-bold text-gray-600 bg-white w-fit px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <RiNavigationLine className="text-orange-500" />
                  Navigate to Restaurant
                </div>
              </div>
            </div>

            {/* Connecting Line (Desktop only) */}
            <div className="hidden sm:block absolute left-11 top-50 w-1 h-32 bg-gray-200 border-l-2 border-dashed border-gray-300"></div>

            {/* Drop Details */}
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 relative group hover:border-blue-200 hover:shadow-md transition-all">
              <div className="absolute -left-3 top-10 w-6 h-6 bg-white border-4 border-blue-200 rounded-full hidden sm:block"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <RiMapPinUserLine size={24} />
                  </div>
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                    Deliver To
                  </h3>
                </div>
                <span className="bg-white text-blue-500 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-100 uppercase">
                  Customer
                </span>
              </div>
              <div className="pl-1 sm:pl-16">
                <p className="text-base sm:text-lg font-bold text-gray-800 leading-snug">
                  {myOrder.deliveryAddress?.formattedAddress}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm font-black text-gray-700 bg-white w-fit px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 cursor-pointer transition-colors">
                    <RiPhoneLine className="text-orange-500" size={18} />
                    +91 {myOrder.deliveryAddress?.mobile}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Order Info & Earnings */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Order Items Summary */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 h-full">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <RiFileList3Line size={18} /> Order Details
                </h3>
                <span className="text-xs font-bold font-mono bg-white px-2 py-1 rounded-md border border-gray-200 text-gray-500">
                  #{myOrder._id.slice(-6).toUpperCase()}
                </span>
              </div>

              <ul className="space-y-4 mb-6">
                {myOrder.items.map((item: IItem, index: number) => (
                  <li
                    key={index}
                    className="flex justify-between items-start text-sm"
                  >
                    <div className="flex items-start gap-2 max-w-[70%]">
                      <span className="font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md text-xs">
                        {item.quantity}x
                      </span>
                      <span className="font-bold text-gray-800 leading-snug">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-black text-gray-600">
                      ₹{item.price * item.quantity}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mt-auto">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">
                  Order Bill Amount
                </p>
                <p className="text-2xl font-black text-gray-900 text-center tracking-tight">
                  ₹{myOrder.totalAmount}
                </p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-dashed border-gray-200 text-xs font-bold text-gray-500">
                  <span>Payment Mode</span>
                  <span className="uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    {myOrder.paymentMethod}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200 border-t border-dashed border-gray-300 my-8 sm:my-10"></div>

        {/* Action Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-emerald-50/50 p-6 sm:p-8 rounded-4xl border border-emerald-100">
          <div className="text-center sm:text-left flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100">
              <RiMoneyRupeeCircleLine size={32} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-black text-emerald-700/70 uppercase tracking-widest mb-0.5">
                Your Expected Earning
              </p>
              <p className="text-4xl sm:text-5xl font-black text-emerald-600 tracking-tight leading-none">
                ₹{myOrder.riderAmount}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full sm:w-auto shrink-0">
            {myOrder.status !== "picked_up" && (
              <button
                onClick={() => updateOrderStatus("picked_up")}
                className="w-full sm:w-auto bg-linear-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-[0_10px_25px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_35px_rgba(249,115,22,0.4)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
              >
                <RiCheckboxBlankCircleFill
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                Confirm Pickup
              </button>
            )}
            {myOrder.status === "picked_up" && (
              <button
                onClick={() => updateOrderStatus("delivered")}
                className="w-full sm:w-auto bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-[0_10px_25px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group"
              >
                <RiCheckDoubleLine
                  size={28}
                  className="group-hover:scale-110 transition-transform"
                />
                Mark Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveOrderCard;
