import { RiMapPinUserFill } from "react-icons/ri";
import type { IOrder } from "../../type";

type IItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case "placed":
      return {
        text: "Order Placed",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      };
    case "accepted":
      return {
        text: "Accepted by Restaurant",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: "M5 13l4 4L19 7",
      };
    case "preparing":
      return {
        text: "Food is Preparing",
        color: "bg-orange-50 text-orange-700 border-orange-200",
        icon: "M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2z",
      };
    case "ready_for_rider":
      return {
        text: "Waiting for Delivery Partner",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    case "rider_assigned":
    case "picked_up":
      return {
        text: "Out for Delivery",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
      };
    case "delivered":
      return {
        text: "Delivered",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    case "cancelled":
      return {
        text: "Cancelled",
        color: "bg-red-50 text-red-700 border-red-200",
        icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    default:
      return {
        text: status.toUpperCase(),
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      };
  }
};

const OrderMobileCards = ({
  orders,
  handleCancelOrder,
  cancellingId,
  setSelectedRefundOrder,
  setTrackingOrder,
}: {
  orders: IOrder[];
  handleCancelOrder: (orderId: string) => Promise<void>;
  cancellingId: string | null;
  setSelectedRefundOrder: React.Dispatch<React.SetStateAction<IOrder | null>>;
  setTrackingOrder: React.Dispatch<React.SetStateAction<IOrder | null>>;
}) => {
  return (
    <div className="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-6">
      {orders.map((order: IOrder) => {
        const theme = getStatusTheme(order.status);
        return (
          <div
            key={order._id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300"
          >
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start gap-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 line-clamp-1">
                  {order.restaurantName || "Restaurant Order"}
                </h3>
                <p className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-sm ${theme.color}`}
                >
                  {theme.text}
                </span>
              </div>
            </div>

            <div className="p-5">
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mb-4">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="space-y-1.5 mb-5">
                {order.items.slice(0, 3).map((item: IItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start text-sm text-gray-700"
                  >
                    <span className="font-bold text-gray-400 w-6">
                      {item.quantity}x
                    </span>
                    <span className="flex-1 font-medium truncate">
                      {item.name}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs font-semibold text-gray-400 mt-1">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-dashed border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">
                    Total
                  </p>
                  <p className="text-xl font-black text-gray-900">
                    ₹{order.totalAmount}
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* TRACK RIDER BUTTON */}
                  {(order.status === "rider_assigned" ||
                    order.status === "picked_up") && (
                    <button
                      onClick={() => setTrackingOrder(order)}
                      className="px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <RiMapPinUserFill size={16} /> Track
                    </button>
                  )}

                  {order.status !== "cancelled" &&
                    order.status !== "delivered" && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={cancellingId === order._id}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${cancellingId === order._id ? "border-gray-200 text-gray-400 bg-gray-50" : "border-red-200 text-red-500 hover:bg-red-50"}`}
                      >
                        {cancellingId === order._id ? "..." : "Cancel"}
                      </button>
                    )}
                  {order.status === "cancelled" && (
                    <button
                      onClick={() => setSelectedRefundOrder(order)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold"
                    >
                      Refund Info
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderMobileCards;
