import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { restaurantService, riderService } from "../../App";
import type { IOrder, IRider } from "../../type";
import { useAppData } from "../../context/AppContext";
import { useSocket } from "../../context/useSocket";
import { RiLoader4Line } from "react-icons/ri";

// Sub-components
import RiderHeaderCard from "./RiderHeaderCard";
import ActiveOrderCard from "./ActiveOrderCard";
import NewOrderRequests from "./NewOrderRequests";
import RiderProfileDetails from "./RiderProfileDetails";

const RiderHomePage = () => {
  const [riderData, setRiderData] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [receviedOrders, setReceviedOrders] = useState<string[]>([]);
  const [availableOrders, setAvailableOrders] = useState<IOrder[]>([]);
  const [myOrder, SetMyOrder] = useState<IOrder | null>(null);

  const { user, location } = useAppData();
  const { socket } = useSocket();

  console.log(myOrder)

  // 1. Fetch Initial Rider Data
  useEffect(() => {
    const fetchRiderData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${riderService}/api/rider/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (data.success) setRiderData(data.resData);
      } catch (error) {
        console.error(error);
        toast.error("Fetch Rider Error");
      } finally {
        setLoading(false);
      }
    };
    fetchRiderData();
  }, []);

  console.log(receviedOrders);

  // 2. Fetch Active Order
  useEffect(() => {
    const fetchMyCurrOrder = async () => {
      try {
        const { data } = await axios.get(
          `${riderService}/api/rider/order/current`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        SetMyOrder(data.oredr || data.order);
      } catch (error) {
        console.error(error);
      }
    };
    fetchMyCurrOrder();
  }, []);

  // 3. Fetch Single Order Details (Helper)
  const fetchOrder = async (orderId: string) => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/my/${orderId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setAvailableOrders((prev) => {
        if (prev.some((o) => o._id === data.order._id)) return prev;
        return [...prev, data.order];
      });
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Socket Listeners
  useEffect(() => {
    if (!socket || myOrder) return;
    const handleNewOrder = (data: { orderId: string }) => {
      const { orderId } = data;
      setReceviedOrders((prev) => {
        if (!prev.includes(orderId)) {
          fetchOrder(orderId);
          return [...prev, orderId];
        }
        return prev;
      });
    };
    socket.on("order:available", handleNewOrder);
    return () => {
      socket.off("order:available", handleNewOrder);
    };
  }, [socket, myOrder]);

  // 5. Actions
  const handleToggleAvailability = async () => {
    if (!location?.latitude || !location?.longitude) {
      return toast.error("Location access is required to go online.");
    }
    setTogglingStatus(true);
    try {
      const { data } = await axios.put(
        `${riderService}/api/rider/toggle-availabity`,
        {
          isAvailble: !riderData?.isAvailble,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(data.message);
      if (data.resData) setRiderData(data.resData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to change status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const acceptOrder = async (orderToAccept: IOrder) => {
    try {
      const { data } = await axios.post(
        `${riderService}/api/rider/order/accept/${orderToAccept._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(data.message);
      SetMyOrder({ ...orderToAccept, status: "accepted" });
      setAvailableOrders([]);
      setReceviedOrders([]);
    } catch (error) {
      console.error(error);
      toast.error("Accept Order Error");
    }
  };

  const rejectOrderLocal = (orderId: string) => {
    setAvailableOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  const updateOrderStatus = async (newStatus: "picked_up" | "delivered") => {
    if (!myOrder) return;
    try {
      await axios.put(
        `${riderService}/api/rider/oredr/update/${myOrder._id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(`Order marked as ${newStatus.replace("_", " ")}`);
      if (newStatus === "delivered") {
        SetMyOrder(null);
      } else {
        SetMyOrder({ ...myOrder, status: newStatus });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    }
  };

  // UI Renders
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <RiLoader4Line className="animate-spin text-orange-500" size={40} />
        <p className="mt-4 text-gray-500 font-bold animate-pulse">
          Preparing your dashboard...
        </p>
      </div>
    );
  }

  if (!riderData)
    return (
      <div className="text-center mt-20 font-bold text-xl">
        No rider profile found.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 relative overflow-hidden font-sans">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-87.5 z-0 bg-linear-to-r from-orange-500 via-orange-600 to-red-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 sm:pt-32">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] border border-white/60 overflow-hidden">
          <RiderHeaderCard
            user={user}
            riderData={riderData}
            myOrder={myOrder}
            togglingStatus={togglingStatus}
            handleToggleAvailability={handleToggleAvailability}
          />

          <div className="p-6 sm:p-12 bg-gray-50/30">
            {myOrder ? (
              <ActiveOrderCard
                myOrder={myOrder}
                updateOrderStatus={updateOrderStatus}
              />
            ) : availableOrders.length > 0 ? (
              <NewOrderRequests
                availableOrders={availableOrders}
                acceptOrder={acceptOrder}
                rejectOrderLocal={rejectOrderLocal}
              />
            ) : null}

            {!myOrder && availableOrders.length === 0 && (
              <RiderProfileDetails riderData={riderData} location={location} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderHomePage;
