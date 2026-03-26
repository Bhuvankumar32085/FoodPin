import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../App";
import type { IOrder } from "../type";
import { useSocket } from "../context/useSocket";

const ACTIVE_STATUES: IOrder["status"][] = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

// Status ke hisaab se color formatting
const getStatusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "accepted":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "preparing":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "ready_for_rider":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "rider_assigned":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "picked_up":
      return "bg-green-100 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const RestaurantOrders = () => {
  const { user } = useAppData();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [orders, setorders] = useState<IOrder[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  console.log(orders);

  // Popup ke liye state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.restaurantId) return;
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${restaurantService}/api/order/${user.restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setorders(data.orders);
        setOrdersCount(Number(data.count || data.orders.length));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data.message || "Failed to fetch orders");
        } else {
          toast.error("Fetch Orders Error");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    if (!socket) return;
    socket.on("order:new", (data) => {
      console.log(data);
      fetchOrders();
    });
    socket.on("order:cancelled", (data) => {
      console.log(data);
      fetchOrders();
    });
    socket.on("order:rider_assigned", (data) => {
      console.log(data);
      fetchOrders();
    });

    return () => {
      //***/
      socket.off("order:rider_assigned");
      socket.off("order:cancelled");
      socket.off("order:new");
    };
  }, [user?.restaurantId, socket]);

  useEffect(() => {
    if (!user?.restaurantId) {
      navigate("/");
    }
  }, [user, navigate]);

  // Status Update Function
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: IOrder["status"],
  ) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `${restaurantService}/api/order/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const updateOrder = orders.map((order) => {
        return order._id === orderId ? { ...order, status: newStatus } : order;
      });

      setorders(updateOrder);
      toast.success("Order status updated!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || "Failed to update status");
      } else {
        toast.error("Update Error");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user?.restaurantId) return null;

  const selectedOrder = orders.find((o) => o._id === selectedOrderId);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Navigation & Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium mb-6 w-fit bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Live Orders
              </h1>
              <p className="text-gray-500 mt-1">
                Manage and update your active deliveries
              </p>
            </div>
            <div className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="font-semibold text-gray-700">
                Active Orders: {ordersCount}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div>
            {/* Desktop Loading Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-10 bg-gray-100 rounded mb-4 w-full"></div>
              <div className="h-16 bg-gray-50 rounded mb-2 w-full"></div>
              <div className="h-16 bg-gray-50 rounded mb-2 w-full"></div>
              <div className="h-16 bg-gray-50 rounded w-full"></div>
            </div>
            {/* Mobile Loading Cards */}
            <div className="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded-xl w-full mb-3"></div>
                  <div className="h-10 bg-gray-200 rounded-xl w-full"></div>
                </div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 mt-8">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Active Orders Yet
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Waiting for hungry customers to place their orders. Stay tuned!
            </p>
          </div>
        ) : (
          <>
            {/* ----------------- DESKTOP TABLE VIEW (lg and above) ----------------- */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Order Info
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Update Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {orders.map((order) => {
                      const totalItems = order.items.reduce(
                        (acc, item) => acc + item.quantity,
                        0,
                      );
                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">
                                #{order._id.slice(-6).toUpperCase()}
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
                                {new Date(order.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center font-bold text-xs">
                                {totalItems}
                              </div>
                              <span className="text-sm text-gray-600 font-medium">
                                Item{totalItems > 1 ? "s" : ""}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{order.totalAmount}
                              </span>
                              <span
                                className={`mt-1 inline-flex w-fit items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                              >
                                {order.paymentStatus}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.status === "cancelled" ||
                            order.status === "delivered" ||
                            order.status === "picked_up" ||
                            order.status === "rider_assigned" ? (
                              <span
                                className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border shadow-sm transition-all ${
                                  order.status === "delivered"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                    : order.status === "cancelled"
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : order.status === "picked_up" ||
                                          order.status === "rider_assigned"
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "bg-gray-50 text-gray-600 border-gray-200"
                                }`}
                              >
                                {order.status.replace(/_/g, " ")}
                              </span>
                            ) : (
                              <div className="relative inline-block w-40 sm:w-48">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleStatusUpdate(
                                      order._id,
                                      e.target.value as IOrder["status"],
                                    )
                                  }
                                  disabled={updatingId === order._id}
                                  className={`w-full text-xs font-black uppercase tracking-wider rounded-xl px-4 py-2.5 border-2 shadow-sm focus:ring-4 focus:ring-opacity-20 appearance-none cursor-pointer outline-none transition-all ${getStatusColor(
                                    order.status,
                                  )} ${
                                    updatingId === order._id
                                      ? "opacity-50 cursor-wait"
                                      : "hover:-translate-y-0.5 active:translate-y-0"
                                  }`}
                                >
                                  {ACTIVE_STATUES.map((status) => (
                                    <option
                                      key={status}
                                      value={status}
                                      className="bg-white text-gray-800 font-bold text-sm normal-case tracking-normal"
                                    >
                                      {status.replace(/_/g, " ").toUpperCase()}
                                    </option>
                                  ))}
                                </select>

                                {/* Custom Dropdown Arrow */}
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-50">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="3"
                                      d="M19 9l-7 7-7-7"
                                    ></path>
                                  </svg>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <button
                              onClick={() => setSelectedOrderId(order._id)}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center gap-1.5 mx-auto"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ----------------- MOBILE/TABLET CARD VIEW (below lg) ----------------- */}
            <div className="grid lg:hidden grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((order) => {
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col"
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="font-semibold text-gray-900 text-lg">
                          ₹{order.totalAmount}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
                        >
                          {order.paymentStatus}
                        </span>
                        <p className="text-xs text-gray-400 font-medium mt-2 flex items-center gap-1 justify-end">
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
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between gap-5">
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
                        {order.status === "cancelled" ||
                        order.status === "delivered" ||
                        order.status === "picked_up" ||
                        order.status === "rider_assigned" ? (
                          <div
                            className={`flex-1 flex items-center justify-center text-sm font-black uppercase tracking-widest rounded-xl px-4 py-3.5 border shadow-sm transition-all ${
                              order.status === "delivered"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : order.status === "cancelled"
                                  ? "bg-red-50 text-red-600 border-red-200"
                                  : order.status === "picked_up" ||
                                      order.status === "rider_assigned"
                                    ? "bg-blue-50 text-blue-600 border-blue-200"
                                    : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </div>
                        ) : (
                          <div className="relative flex-1">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusUpdate(
                                  order._id,
                                  e.target.value as IOrder["status"],
                                )
                              }
                              disabled={updatingId === order._id}
                              className={`w-full text-sm font-black uppercase tracking-wider rounded-xl px-4 py-3.5 border-2 shadow-sm focus:ring-4 focus:ring-opacity-20 appearance-none cursor-pointer outline-none transition-all text-center ${getStatusColor(
                                order.status,
                              )} ${
                                updatingId === order._id
                                  ? "opacity-50 cursor-wait"
                                  : "hover:-translate-y-0.5 active:translate-y-0"
                              }`}
                            >
                              {ACTIVE_STATUES.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-white text-gray-800 font-bold text-base normal-case tracking-normal"
                                >
                                  {status.replace(/_/g, " ").toUpperCase()}
                                </option>
                              ))}
                            </select>
                            {/* Custom dropdown arrow for better UI */}
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-50">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedOrderId(order._id)}
                          className="flex-1 flex justify-center items-center gap-2 text-sm font-black text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                        >
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* --- MODAL / POPUP COMPONENT --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Order Details
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border ${selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                  >
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-1">
                  ID: {selectedOrder._id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-500 rounded-full transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Customer Information
                </h4>
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="mt-0.5 bg-blue-100 p-1.5 rounded-lg text-blue-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {selectedOrder.deliveryAddress?.formattedAddress}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-800 font-bold">
                      {selectedOrder.deliveryAddress?.mobile}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Order Items
                </h4>
                <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-start text-sm"
                    >
                      <div className="flex gap-3">
                        <span className="font-bold text-gray-500 bg-white border px-1.5 py-0.5 rounded shadow-sm">
                          {item.quantity}x
                        </span>
                        <span className="text-gray-800 font-medium pt-0.5">
                          {item.name}
                        </span>
                      </div>
                      <span className="text-gray-900 font-bold pt-0.5">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Payment Receipt
                </h4>
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 text-sm shadow-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-800">
                      ₹{selectedOrder.subTotal || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-gray-800">
                      ₹{selectedOrder.deliveryFee || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span className="font-medium text-gray-800">
                      ₹{selectedOrder.platformFee || 0}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-base">
                      Total Amount
                    </span>
                    <span className="font-extrabold text-red-500 text-lg">
                      ₹{selectedOrder.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conditional Refund Info Box for Cancelled Orders */}
              {selectedOrder.status === "cancelled" && (
                <div>
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Refund Information
                  </h4>
                  <div className="bg-red-50 rounded-xl border border-red-100 p-4 space-y-2 text-sm shadow-sm">
                    <p className="text-red-700 font-medium text-xs mb-2 leading-relaxed">
                      This order has been cancelled by the user. Only the
                      subtotal amount is eligible for a refund.
                    </p>
                    <div className="flex justify-between items-center text-gray-700 font-semibold border-t border-red-200/50 pt-2">
                      <span>Refund Amount (Subtotal)</span>
                      <span className="text-lg font-black text-red-600">
                        ₹{selectedOrder.subTotal}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
