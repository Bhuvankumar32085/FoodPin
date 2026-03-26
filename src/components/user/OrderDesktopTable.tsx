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

const OrderDesktopTable = ({
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
    <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Restaurant & Date
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {orders.map((order: IOrder) => {
              const theme = getStatusTheme(order.status);
              const itemString = order.items
                .map((i: IItem) => `${i.quantity}x ${i.name}`)
                .join(", ");

              return (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {order.restaurantName || "Restaurant Order"}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-600 font-medium max-w-62.5 truncate"
                      title={itemString}
                    >
                      {itemString}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-extrabold text-gray-900">
                      ₹{order.totalAmount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.color}`}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={theme.icon}
                        />
                      </svg>
                      {theme.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* TRACK RIDER BUTTON */}
                      {(order.status === "rider_assigned" ||
                        order.status === "picked_up") && (
                        <button
                          onClick={() => setTrackingOrder(order)}
                          className="px-4 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <RiMapPinUserFill /> Track Rider
                        </button>
                      )}

                      {order.status !== "cancelled" &&
                        order.status !== "delivered" && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingId === order._id}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${cancellingId === order._id ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}
                          >
                            {cancellingId === order._id
                              ? "Cancelling..."
                              : "Cancel"}
                          </button>
                        )}
                      {order.status === "cancelled" && (
                        <button
                          onClick={() => setSelectedRefundOrder(order)}
                          className="px-4 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition-colors"
                        >
                          Refund Info
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderDesktopTable;
