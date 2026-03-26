import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { restaurantService } from "../../App";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiArrowLeftLine,
  RiSearch2Line,
  RiShoppingCart2Fill,
  RiLoader4Line,
  RiRestaurantLine,
  RiCloseCircleFill,
} from "react-icons/ri";
import { useAppData } from "../../context/AppContext";

interface IItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: { url: string };
  isAvailable: boolean;
}

const RestaurantItems = () => {
  const { fetchCart } = useAppData();
  const [items, setItems] = useState<IItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

  const { id } = useParams();
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        let url = `${restaurantService}/api/item/all/${id}`;

        if (debouncedSearch.trim() !== "") {
          url = `${restaurantService}/api/item/${id}/items?search=${debouncedSearch}`;
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const fetchedItems = res.data.items || res.data.menuItems || [];
        setItems(fetchedItems);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message || "Failed to fetch menu items",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItems();
    }
  }, [id, debouncedSearch]);

  console.log(items);

  // Handle Add to Cart
  const handleAddToCart = async (item: IItem) => {
    if (!item.isAvailable) return;

    setAddingToCartId(item._id);
    try {
      const res = await axios.post(
        `${restaurantService}/api/cart/add`,
        { restaurantId: id, itemId: item._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      console.log(res.data);
      fetchCart();
      toast.success(`${item.name} added to cart!`, {
        icon: "🛒",
        style: {
          borderRadius: "12px",
          background: "#1f2937",
          color: "#fff",
          fontWeight: "bold",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to add to cart");
      } else {
        toast.error("Failed to add to cart");
      }
    } finally {
      setAddingToCartId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] pb-24 relative font-sans selection:bg-orange-200 selection:text-orange-900">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-80 bg-linear-to-b from-orange-100/60 to-transparent z-0 pointer-events-none"></div>

      {/* Sticky Header with Search */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] px-4 py-3 sm:px-8 sm:py-5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate(-1)}
              className="p-2 sm:p-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 rounded-xl sm:rounded-2xl transition-all shadow-sm active:scale-95"
            >
              <RiArrowLeftLine size={24} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                Restaurant Menu
              </h1>
              <p className="text-[10px] sm:text-xs font-black text-orange-500 uppercase tracking-widest mt-1">
                Order your favorites
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-100 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange-500 transition-colors">
              <RiSearch2Line size={20} />
            </div>
            <input
              type="text"
              placeholder="Search for dishes, cravings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-orange-500 focus:shadow-[0_0_0_4px_rgba(249,115,22,0.1)] rounded-xl sm:rounded-2xl transition-all outline-none font-bold text-gray-800 placeholder:font-medium placeholder:text-gray-400 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <RiCloseCircleFill size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="absolute w-24 h-24 border-4 border-orange-200 rounded-full animate-ping opacity-75"></div>
              <div className="bg-white p-5 rounded-full shadow-2xl z-10 relative">
                <RiLoader4Line
                  className="animate-spin text-orange-500"
                  size={40}
                />
              </div>
            </div>
            <p className="mt-8 text-gray-500 font-black tracking-widest uppercase text-sm animate-pulse">
              Curating Menu...
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-10 sm:p-16 text-center border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] mt-6 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
            <div className="w-28 h-28 bg-orange-50 text-orange-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
              <RiRestaurantLine size={56} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 relative z-10">
              {debouncedSearch ? "No matching dishes" : "Menu is empty"}
            </h3>
            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto relative z-10 leading-relaxed text-sm sm:text-base">
              {debouncedSearch
                ? `We couldn't find anything matching "${debouncedSearch}". Try a different keyword.`
                : "Looks like the chef is still preparing the menu. Check back in a while!"}
            </p>
            {debouncedSearch && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gray-900 text-white font-bold px-8 py-3.5 rounded-2xl hover:bg-black transition-colors shadow-lg relative z-10"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {items.map((item) => {
              const isExpanded = expandedDesc === item._id;
              // console.log(item._id)
              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-4xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-300 flex flex-col group ${
                    item.isAvailable
                      ? "hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)] hover:border-orange-200 hover:-translate-y-1.5"
                      : "opacity-80 grayscale-20"
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-gray-100">
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${item.isAvailable ? "group-hover:scale-110" : "grayscale-60"}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <RiRestaurantLine size={56} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 via-gray-900/10 to-transparent pointer-events-none transition-opacity group-hover:opacity-90"></div>

                    {/* Stock Badge & Price on Image */}
                    <div className="absolute top-4 left-4 z-10">
                      {item.isAvailable ? (
                        <span className="bg-white/95 backdrop-blur-md text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-emerald-100">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          Available
                        </span>
                      ) : (
                        <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 border border-red-400">
                          <RiCloseCircleFill size={14} /> Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 left-4 z-10 flex items-end">
                      <span className="text-orange-400 font-bold text-lg leading-none mr-0.5 mb-0.5">
                        ₹
                      </span>
                      <span className="text-white font-black text-3xl leading-none drop-shadow-md tracking-tight">
                        {item.price}
                      </span>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-5 flex-1 flex flex-col bg-white relative">
                    <h3
                      className={`text-xl sm:text-2xl font-black leading-tight line-clamp-2 mb-2 ${item.isAvailable ? "text-gray-900 group-hover:text-orange-600" : "text-gray-500"} transition-colors capitalize tracking-tight`}
                    >
                      {item.name}
                    </h3>

                    {/* Expandable Description */}
                    <div className="mb-6 flex-1">
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
                          className="text-xs font-black text-gray-400 hover:text-orange-500 mt-2 focus:outline-none transition-colors border-b border-transparent hover:border-orange-500 pb-0.5"
                        >
                          {isExpanded ? "Show less" : "Read full description"}
                        </button>
                      )}
                    </div>

                    {/* Action Buttons: Add to Cart & Buy Now */}
                    <div className="mt-auto grid grid-cols-1 gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={
                          !item.isAvailable || addingToCartId === item._id
                        }
                        className={`py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                          !item.isAvailable
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 active:scale-95"
                        }`}
                      >
                        {addingToCartId === item._id ? (
                          <RiLoader4Line
                            className="animate-spin text-orange-500"
                            size={20}
                          />
                        ) : (
                          <>
                            <RiShoppingCart2Fill size={18} />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantItems;
