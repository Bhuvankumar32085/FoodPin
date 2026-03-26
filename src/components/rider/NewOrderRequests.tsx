import { RiLoader4Line, RiStore2Line, RiMapPin2Line } from "react-icons/ri";
import type { IOrder } from "../../type";

const NewOrderRequests = ({
  availableOrders,
  acceptOrder,
  rejectOrderLocal,
}: {
  availableOrders: IOrder[];
  acceptOrder: (orderToAccept: IOrder) => Promise<void>;
  rejectOrderLocal: (orderId: string) => void;
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6 px-2">
        <span className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
        </span>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          New Delivery Requests ({availableOrders.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {availableOrders.map((order: IOrder) => (
          <div
            key={order._id}
            className="border-2 border-orange-300 rounded-4xl overflow-hidden shadow-md bg-white"
          >
            <div className="bg-linear-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-lg font-black flex items-center gap-2">
                <RiLoader4Line className="animate-spin" size={22} /> New Request
              </h2>
              <span className="text-xs font-bold font-mono bg-black/20 px-3 py-1.5 rounded-xl border border-white/20">
                #{order._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Pickup From
                  </p>
                  <p className="text-lg font-black text-gray-900 flex items-start gap-2">
                    <RiStore2Line
                      className="text-orange-500 mt-0.5 shrink-0"
                      size={20}
                    />{" "}
                    <span className="capitalize">{order.restaurantName}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                    Drop To
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    <RiMapPin2Line
                      className="inline text-orange-500 mr-1"
                      size={16}
                    />
                    {order.deliveryAddress?.formattedAddress}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => rejectOrderLocal(order._id)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-600 py-4 rounded-2xl font-black text-sm uppercase"
                >
                  Reject
                </button>
                <button
                  onClick={() => acceptOrder(order)}
                  className="w-2/3 bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase"
                >
                  Accept Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NewOrderRequests;
