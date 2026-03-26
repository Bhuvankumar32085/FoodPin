import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../App";
import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEdit2Line,
  RiDeleteBin7Line,
  RiLoader4Line,
  RiRestaurantLine,
  RiAddLine,
  RiPriceTag3Line,
  RiFileTextLine,
  RiCloseLine,
  RiErrorWarningFill,
} from "react-icons/ri";

interface IItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: { url: string };
  isAvailable: boolean;
}

const Items = () => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<IItem[]>([]);
  const { user } = useAppData();
  const navigate = useNavigate();

  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

  // Modals State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: "",
    name: "",
    description: "",
    price: "",
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${restaurantService}/api/item/all/${user?.restaurantId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      setItems(res.data.menuItems || []);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to fetch items");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Toggle Availability Handler ---
  const handleToggleAvailability = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    try {
      setTogglingId(itemId);
      setItems(
        items.map((item) =>
          item._id === itemId ? { ...item, isAvailable: !currentStatus } : item,
        ),
      );

      const res = await axios.put(
        `${restaurantService}/api/item/toggle-open-close/${itemId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success(res.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to change availability",
        );
      }
      setItems(
        items.map((item) =>
          item._id === itemId ? { ...item, isAvailable: currentStatus } : item,
        ),
      );
      toast.error("Failed to change availability");
    } finally {
      setTogglingId(null);
    }
  };

  // --- Edit Handlers ---
  const openEditModal = (item: IItem) => {
    setEditForm({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: String(item.price),
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      await axios.put(
        `${restaurantService}/api/item/edit/${editForm._id}`,
        {
          name: editForm.name,
          description: editForm.description,
          price: Number(editForm.price),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      toast.success("Item updated successfully");
      setIsEditOpen(false);
      setItems(
        items.map((item) =>
          item._id === editForm._id
            ? {
                ...item,
                name: editForm.name,
                description: editForm.description,
                price: Number(editForm.price),
              }
            : item,
        ),
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update item");
      }
      toast.error("Failed to update item");
    } finally {
      setEditLoading(false);
    }
  };

  // --- Delete Handlers ---
  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      await axios.delete(`${restaurantService}/api/item/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Item deleted permanently");
      setIsDeleteOpen(false);
      setItems(items.filter((item) => item._id !== deleteId));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to delete item");
      } else {
        toast.error("Failed to delete item");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 border-4 border-orange-200 rounded-full animate-ping opacity-75"></div>
          <div className="bg-white p-4 rounded-full shadow-xl z-10">
            <RiLoader4Line className="animate-spin text-orange-500" size={36} />
          </div>
        </div>
        <p className="mt-6 text-gray-500 font-bold tracking-wide animate-pulse">
          Loading Your Menu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-64 bg-linear-to-b from-orange-100/50 to-transparent z-0 pointer-events-none"></div>

      {/* Top Header Section */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] px-4 py-3 sm:px-8 sm:py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate("/")}
            className="p-2 sm:p-2.5 bg-white border border-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 rounded-xl transition-all shadow-sm"
          >
            <RiArrowLeftLine size={22} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
              Menu Manager
            </h1>
            <p className="text-[10px] sm:text-xs text-orange-500 font-black tracking-widest uppercase mt-1">
              Store Inventory
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/add-item")}
          className="shrink-0 flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-red-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl font-bold shadow-[0_8px_15px_rgba(249,115,22,0.2)] hover:shadow-[0_12px_20px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 transition-all"
        >
          <RiAddLine size={20} />{" "}
          <span className="hidden sm:inline">Add New Dish</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border-2 border-dashed border-orange-200 mt-10 shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <RiRestaurantLine size={48} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">
              Your Menu is Empty
            </h3>
            <p className="text-gray-500 font-medium mb-8 text-sm sm:text-base">
              You haven't added any dishes yet. Start building your digital
              storefront by adding your first delicious item!
            </p>
            <button
              onClick={() => navigate("/add-item")}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-colors"
            >
              <RiAddLine size={22} /> Create First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {items.map((item) => {
              const isExpanded = expandedDesc === item._id;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-4xl overflow-hidden shadow-[0_10px_30px_rgb(0,0,0,0.06)] border border-gray-100 hover:border-orange-200 hover:shadow-[0_15px_40px_rgba(249,115,22,0.1)] transition-all duration-300 flex flex-col group relative"
                >
                  {/* Floating Price Tag */}
                  <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-1">
                    <span className="text-orange-500 font-bold text-sm">₹</span>
                    <span className="text-gray-900 font-black text-lg leading-none">
                      {item.price}
                    </span>
                  </div>

                  {/* Item Image Section */}
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-50">
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!item.isAvailable ? "grayscale opacity-70" : ""}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <RiRestaurantLine size={50} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                    {/* iOS Style Toggle Switch inside Image area */}
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.isAvailable}
                          onChange={() =>
                            handleToggleAvailability(item._id, item.isAvailable)
                          }
                          disabled={togglingId === item._id}
                        />
                        <div className="w-11 h-6 bg-white/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <span
                        className={`text-xs font-black uppercase tracking-wider ${item.isAvailable ? "text-emerald-400" : "text-gray-300"}`}
                      >
                        {togglingId === item._id
                          ? "Updating..."
                          : item.isAvailable
                            ? "In Stock"
                            : "Out of Stock"}
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 flex-1 flex flex-col bg-white">
                    <h3
                      className={`text-xl font-black mb-2 leading-tight ${!item.isAvailable ? "text-gray-500" : "text-gray-900"}`}
                    >
                      {item.name}
                    </h3>

                    {/* Description with Expand/Collapse */}
                    <div className="mb-5 flex-1 relative">
                      <p
                        className={`text-sm font-medium text-gray-500 leading-relaxed transition-all ${!isExpanded ? "line-clamp-2" : ""}`}
                      >
                        {item.description}
                      </p>
                      {item.description?.length > 70 && (
                        <button
                          onClick={() =>
                            setExpandedDesc(isExpanded ? null : item._id)
                          }
                          className="text-xs font-black text-orange-500 hover:text-orange-600 mt-1.5 focus:outline-none inline-flex items-center gap-1"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-bold py-2.5 rounded-xl transition-all text-sm border border-transparent hover:border-blue-100"
                      >
                        <RiEdit2Line size={18} /> Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(item._id)}
                        className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 font-bold py-2.5 rounded-xl transition-all text-sm border border-transparent hover:border-red-100"
                      >
                        <RiDeleteBin7Line size={18} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- EDIT MODAL (Sleek UI) --- */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => !editLoading && setIsEditOpen(false)}
          ></div>

          <div className="relative w-full max-w-lg bg-white rounded-4xl shadow-2xl overflow-hidden transform transition-all animate-fade-in-up">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
              <h2 className="text-xl font-black flex items-center gap-2 relative z-10">
                <RiEdit2Line size={24} /> Edit Item Details
              </h2>
              <button
                onClick={() => setIsEditOpen(false)}
                disabled={editLoading}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors relative z-10"
              >
                <RiCloseLine size={22} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Dish Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <RiRestaurantLine size={20} />
                  </div>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] rounded-xl outline-none font-bold text-gray-800 text-sm transition-all"
                    required
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Price
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <RiPriceTag3Line size={20} />
                  </div>
                  <span className="absolute inset-y-0 left-11 flex items-center text-gray-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                    className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] rounded-xl outline-none font-bold text-gray-800 text-sm transition-all"
                    required
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Description
                </label>
                <div className="relative group">
                  <div className="absolute top-4 left-0 pl-4 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <RiFileTextLine size={20} />
                  </div>
                  <textarea
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] rounded-xl outline-none font-medium text-gray-700 text-sm resize-none transition-all leading-relaxed"
                    required
                    disabled={editLoading}
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={editLoading}
                  className="w-1/3 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-2/3 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 flex justify-center items-center gap-2"
                >
                  {editLoading ? (
                    <RiLoader4Line className="animate-spin" size={20} />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE WARNING MODAL (Danger UI) --- */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity"
            onClick={() => !deleteLoading && setIsDeleteOpen(false)}
          ></div>

          <div className="relative w-full max-w-sm bg-white rounded-4xl shadow-2xl p-8 text-center transform transition-all animate-fade-in-up">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 relative">
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
              <RiErrorWarningFill size={48} />
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Delete Item?
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-8 leading-relaxed">
              This action cannot be undone. The item will be permanently wiped
              from your menu and customers won't see it.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-[0_8px_15px_rgba(220,38,38,0.2)] hover:shadow-[0_12px_20px_rgba(220,38,38,0.3)] transition-all flex justify-center items-center"
              >
                {deleteLoading ? (
                  <RiLoader4Line className="animate-spin" size={24} />
                ) : (
                  "Yes, Delete It"
                )}
              </button>
              <button
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleteLoading}
                className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel & Keep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
