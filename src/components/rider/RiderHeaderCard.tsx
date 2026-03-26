import {
  RiMotorbikeFill,
  RiVerifiedBadgeFill,
  RiErrorWarningFill,
  RiLoader4Line,
} from "react-icons/ri";
import type { IOrder, IRider, User } from "../../type";

const RiderHeaderCard = ({
  user,
  riderData,
  myOrder,
  togglingStatus,
  handleToggleAvailability,
}: {
  user: User | null;
  riderData: IRider;
  myOrder: IOrder | null;
  togglingStatus: boolean;
  handleToggleAvailability: () => Promise<string | undefined>;
}) => {
  return (
    <div className="p-8 sm:p-12 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-64 h-64 rounded-bl-full opacity-10 pointer-events-none transition-colors duration-700 ${riderData.isAvailble ? "bg-emerald-500" : "bg-red-500"}`}
      ></div>

      <div className="flex items-center gap-5 sm:gap-6 flex-1 relative z-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-gray-100 border-4 border-white shadow-lg shrink-0 relative">
          {riderData.picture?.url ? (
            <img
              src={riderData.picture.url}
              alt="Rider Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-500">
              <RiMotorbikeFill size={40} />
            </div>
          )}
          <div
            className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${riderData.isAvailble ? "bg-emerald-500" : "bg-gray-400"}`}
          ></div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 capitalize tracking-tight leading-none">
              {user?.name || "Rider Partner"}
            </h1>
            {riderData.isVerified ? (
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold border border-blue-100 shadow-sm mt-1">
                <RiVerifiedBadgeFill size={16} /> Verified
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold border border-amber-200 shadow-sm mt-1 animate-pulse">
                <RiErrorWarningFill size={16} /> Pending
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
            <div
              className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 shadow-sm transition-colors ${riderData.isAvailble ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}
            >
              {riderData.isAvailble
                ? "🟢 Online & Ready"
                : "🔴 Currently Offline"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full lg:w-auto shrink-0 relative z-10">
        <button
          onClick={handleToggleAvailability}
          disabled={
            togglingStatus ||
            (!riderData.isAvailble && !riderData.isVerified) ||
            !!myOrder
          }
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-md hover:-translate-y-0.5 group ${togglingStatus || (!riderData.isAvailble && !riderData.isVerified) || !!myOrder ? "bg-gray-200 text-gray-400 cursor-not-allowed" : riderData.isAvailble ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}
        >
          {togglingStatus ? (
            <RiLoader4Line className="animate-spin" size={24} />
          ) : (
            <RiMotorbikeFill size={24} />
          )}
          {togglingStatus
            ? "Updating..."
            : !!myOrder
              ? "Order in Progress"
              : riderData.isAvailble
                ? "Go Offline"
                : "Go Online"}
        </button>
      </div>
    </div>
  );
};
export default RiderHeaderCard;
