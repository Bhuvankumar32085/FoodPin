import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../App";
import type { IOrder } from "../type";
import { useSocket } from "../context/useSocket";

// --- MAP & ICONS IMPORTS --
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import OrderDesktopTable from "../components/user/OrderDesktopTable";
import OrderMobileCards from "../components/user/OrderMobileCards";
import UserTrackingMap from "../components/user/UserTrackingMap";


// ==========================================
// 1. HELPER FUNCTIONS & THEMES
// ==========================================


// Custom Map Icons

// ==========================================
// 2. REALTIME MAP & ROUTING COMPONENT
// ==========================================



// ==========================================
// 3. TABLE & CARDS COMPONENTS
// ==========================================




// ==========================================
// 4. MAIN PARENT COMPONENT
// ==========================================
const UserOrders = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Realtime Tracking States
  const [riderLocation, setRiderLocation] = useState<number[]>([]);
  const [trackingOrder, setTrackingOrder] = useState<IOrder | null>(null);

  // Refund state
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<IOrder | null>(
    null,
  );

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/my-orders`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setOrders(data.orders || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to load your orders",
        );
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmCancel) return;

    setCancellingId(orderId);
    try {
      await axios.put(
        `${restaurantService}/api/order/cancle/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order,
        ),
      );
      toast.success("Order cancelled successfully");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to cancel order");
      } else {
        toast.error("Failed to cancel order");
      }
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("order:statusUpdate", (data) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId
            ? { ...order, status: data.status }
            : order,
        ),
      );
    });

    socket.on("order:rider_assigned", (data) => {
      console.log(data);
      fetchMyOrders();
    });

    // Updated: Tracking real time rider location
    socket.on("rider:realtime_location", (data) => {
      console.log("Rider Location from Socket:", data.riderLocation);
      setRiderLocation(data.riderLocation);
    });

    return () => {
      socket.off("order:statusUpdate");
      socket.off("order:rider_assigned");
      socket.off("rider:realtime_location");
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-gray-50/50 pt-8 pb-24 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-all shadow-sm hover:shadow-md"
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
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              My Orders
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Track, manage and view your order history
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div>
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-10 bg-gray-100 rounded mb-4 w-full"></div>
              <div className="h-16 bg-gray-50 rounded mb-2 w-full"></div>
              <div className="h-16 bg-gray-50 rounded mb-2 w-full"></div>
              <div className="h-16 bg-gray-50 rounded w-full"></div>
            </div>
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
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 mt-8 max-w-3xl mx-auto">
            <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              No Orders Yet
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
              You haven't placed any orders yet. Explore our restaurants and
              order something delicious!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-0.5"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <OrderDesktopTable
              orders={orders}
              handleCancelOrder={handleCancelOrder}
              cancellingId={cancellingId}
              setSelectedRefundOrder={setSelectedRefundOrder}
              setTrackingOrder={setTrackingOrder}
            />
            {/* Mobile Cards View */}
            <OrderMobileCards
              orders={orders}
              handleCancelOrder={handleCancelOrder}
              cancellingId={cancellingId}
              setSelectedRefundOrder={setSelectedRefundOrder}
              setTrackingOrder={setTrackingOrder}
            />
          </>
        )}
      </div>

      {/* TRACKING MAP MODAL */}
      {trackingOrder && (
        <UserTrackingMap
          order={trackingOrder}
          riderLocation={riderLocation}
          onClose={() => setTrackingOrder(null)}
        />
      )}

      {/* REFUND MODAL (Unchanged) */}
      {selectedRefundOrder && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              Refund Details
            </h3>
            <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
              Order #{selectedRefundOrder._id.slice(-8).toUpperCase()}
            </p>

            <div className="bg-gray-50/80 rounded-2xl p-4 mb-6 text-left space-y-2.5 border border-gray-100">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">Total Paid</span>
                <span className="line-through font-semibold">
                  ₹{selectedRefundOrder.totalAmount}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">Delivery & Platform Fees</span>
                <span className="text-red-500 font-bold">
                  - ₹
                  {(selectedRefundOrder.deliveryFee || 0) +
                    (selectedRefundOrder.platformFee || 0)}
                </span>
              </div>
              <div className="pt-3 border-t border-dashed border-gray-200 flex justify-between items-center mt-1">
                <span className="font-bold text-gray-900 uppercase text-xs tracking-wider">
                  Final Refund
                </span>
                <span className="text-xl font-black text-green-500">
                  ₹{selectedRefundOrder.subTotal}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-medium text-gray-500 mb-6 px-2 leading-relaxed">
              <span className="text-red-500 font-bold">Note:</span> Delivery and
              platform fees are non-refundable for cancelled orders. Your refund
              of ₹{selectedRefundOrder.subTotal} will be credited soon.
            </p>
            <button
              onClick={() => setSelectedRefundOrder(null)}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
