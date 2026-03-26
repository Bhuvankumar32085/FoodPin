import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../App";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Address {
  _id: string;
  mobile: number;
  formattedAddress: string;
}

const CheckOutPage = () => {
  const { carts, subtotal, fetchCart } = useAppData();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingCreateOredr, setLoadingCreateOredr] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddress = async () => {
      if (!carts || carts.length === 0) {
        return setLoadingAddress(false);
      }
      setLoadingAddress(true);
      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
      } catch {
        toast.error("Failed to load addresses");
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, [carts]);

  if (!carts || carts.length === 0) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center bg-gray-50/50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-sm w-full mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your Cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  // Calculation logic
  const deliveryFee = subtotal < 500 ? 30 : 0;
  const platformFee = 7;
  const totalAmount = subtotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) {
      toast.error("Please select an address first!");
      return null;
    }
    setLoadingCreateOredr(true);

    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error("Order Creating Error");
      }
    } finally {
      setLoadingCreateOredr(false);
    }
  };

  const payWithRazorPay = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    setLoadingRazorpay(true);
    try {
      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "FoodPin",
        description: "Food Order Payment",
        image: "/logo.png",
        order_id: razorpayOrderId,
        handler: async (res: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              orderId,
            });
            toast.success("Payment Successful 🎉");
            navigate(`/payment-success/${res.razorpay_payment_id}`);
          } catch (error) {
            if (axios.isAxiosError(error)) {
              toast.error(error.response?.data?.message);
            } else {
              toast.error("Payment Verification Error");
            }
            navigate(`/payment-failed/${res.razorpay_payment_id}`);
          } finally {
            fetchCart();
          }
        },
        theme: {
          color: "#EF4444",
        },
      };
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error("Payment Failed Error");
      }
    } finally {
      setLoadingRazorpay(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pt-8 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Select your address and complete the payment.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* --- Left Column: Address Selection --- */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
                  Delivery Address
                </h2>
              </div>

              <div className="p-6">
                {loadingAddress ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="w-10 h-10 border-4 border-red-100 border-t-red-500 rounded-full animate-spin"></div>
                    <span className="text-gray-500 font-medium">
                      Loading your addresses...
                    </span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-10 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No addresses found
                    </h3>
                    <p className="text-gray-500 mb-4 text-sm">
                      Please add a delivery address to proceed with your order.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <label
                        key={address._id}
                        className={`group relative flex cursor-pointer rounded-xl border p-5 focus:outline-none transition-all duration-300 ease-in-out ${
                          selectedAddressId === address._id
                            ? "border-red-500 bg-red-50/30 ring-1 ring-red-500 shadow-sm"
                            : "border-gray-200 bg-white hover:border-red-300 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center h-6">
                          <input
                            type="radio"
                            name="deliveryAddress"
                            className="h-5 w-5 border-gray-300 text-red-600 focus:ring-red-500 transition-colors"
                            checked={selectedAddressId === address._id}
                            onChange={() => setSelectedAddressId(address._id)}
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`font-semibold ${selectedAddressId === address._id ? "text-red-700" : "text-gray-900"}`}
                            >
                              Address
                            </span>
                            {selectedAddressId === address._id && (
                              <span className="text-xs font-medium text-red-600 bg-red-100 px-2.5 py-0.5 rounded-full">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed mb-2">
                            {address.formattedAddress}
                          </p>
                          <p className="text-gray-500 text-sm flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            <span className="font-medium text-gray-700">
                              {address.mobile}
                            </span>
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- Right Column: Order Summary & Pay Button --- */}
          <div className="w-full lg:w-105">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-24 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                    />
                  </svg>
                  Bill Details
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm">Item Total</span>
                    <span className="font-medium text-gray-800">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm">Delivery Fee</span>
                    <span className="font-medium text-gray-800">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                          Free
                        </span>
                      ) : (
                        `₹${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span className="text-sm">Platform Fee</span>
                    <span className="font-medium text-gray-800">
                      ₹{platformFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      To Pay
                    </span>
                    <span className="text-2xl font-extrabold text-gray-900">
                      ₹{totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={payWithRazorPay}
                    disabled={
                      !selectedAddressId ||
                      loadingRazorpay ||
                      loadingCreateOredr
                    }
                    className={`group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white transition-all duration-300 ${
                      !selectedAddressId
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-red-500 hover:bg-red-600 shadow-[0_4px_14px_0_rgba(239,68,68,0.39)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.23)] hover:-translate-y-0.5"
                    }`}
                  >
                    {loadingRazorpay || loadingCreateOredr ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing Securely...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Proceed to Pay
                        <svg
                          className="w-5 h-5 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </span>
                    )}
                  </button>

                  {!selectedAddressId && (
                    <div className="flex items-center justify-center gap-1.5 text-red-500 text-sm font-medium pt-2 animate-pulse">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Select an address to proceed
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-4 text-gray-400">
                  <svg className="h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wider">
                    100% Secure Payments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckOutPage;
