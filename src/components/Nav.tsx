import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import {
  RiLogoutCircleRLine,
  RiMapPin2Fill,
  RiArrowDownSLine,
  RiShoppingCart2Fill,
  RiUser3Fill,
  RiAddBoxLine,
  RiFileList3Line,
  RiOrderPlayFill,
} from "react-icons/ri";
import toast from "react-hot-toast";
import { FaMapLocationDot } from "react-icons/fa6";

const Nav = () => {
  const {
    isAuth,
    setIsAuth,
    setUser,
    user,
    city,
    loadingLocation,
    cartLenth,
    cartLoading,
  } = useAppData();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const mobileProfileRef = useRef<HTMLDivElement>(null);
  const desktopProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileProfileRef.current &&
        !mobileProfileRef.current.contains(event.target as Node) &&
        desktopProfileRef.current &&
        !desktopProfileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setUser(null);
    setIsAuth(false);
    setIsProfileOpen(false);
    navigate("/login");
  };

  // Role based checks
  const isCustomerOrGuest = !user || user.role === "customer";
  const isSeller = user?.role === "seller";
  const isAdmin = user?.role === "admin";

  console.log("isAdmin", isAdmin);
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 md:py-4 gap-3 md:gap-6">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src={"/logo.png"}
                alt="FoodPin"
                className="h-8 md:h-10 drop-shadow-sm"
              />
              <span className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-red-600 hidden lg:block tracking-tight">
                FoodPin
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl">
              <RiMapPin2Fill className="text-orange-500 text-xl shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Deliver to
                </span>
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  {loadingLocation ? "Detecting..." : city || "Unknown"}
                  <RiArrowDownSLine className="text-orange-500" />
                </span>
              </div>
            </div>

            {/* Mobile Actions (Visible only on small screens) */}
            <div className="md:hidden flex items-center gap-3">
              <div className="flex items-center gap-1 cursor-pointer bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                <RiMapPin2Fill className="text-orange-500 text-sm" />
                <span className="text-xs font-bold text-gray-700 max-w-20 truncate">
                  {loadingLocation ? "Detecting..." : city || "Unknown"}
                </span>
                <RiArrowDownSLine className="text-gray-400 text-xs" />
              </div>

              {isAuth ? (
                <>
                  {isCustomerOrGuest && (
                    <Link
                      to="/cart"
                      className="relative p-1.5 text-gray-600 active:bg-gray-100 rounded-full"
                    >
                      <RiShoppingCart2Fill size={22} />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white box-content">
                        {cartLoading ? 0 : cartLenth}
                      </span>
                    </Link>
                  )}

                  <div className="relative" ref={mobileProfileRef}>
                    <div
                      className="w-8 h-8 rounded-full overflow-hidden border border-orange-200 shadow-sm cursor-pointer"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-orange-100 to-red-100 flex items-center justify-center text-orange-600">
                          <RiUser3Fill size={16} />
                        </div>
                      )}
                    </div>

                    {isProfileOpen && (
                      <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-2xl shadow-2xl border z-50 border-gray-100 py-2  transform origin-top-right transition-all">
                        <div className="px-4 py-3 border-b border-gray-50 mb-1">
                          <p className="text-sm font-bold text-gray-800 truncate">
                            {user?.name || "User"}
                          </p>
                          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mt-0.5">
                            {user?.role || "Customer"}
                          </p>
                        </div>

                        {isSeller && (
                          <>
                            <button
                              onClick={() => navigate("/restaurant-orders")}
                              className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 active:bg-orange-50 flex items-center gap-2"
                            >
                              <RiOrderPlayFill
                                size={18}
                                className="text-orange-500"
                              />
                              Orders
                            </button>
                            <button
                              onClick={() => {
                                navigate("/add-item");
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 active:bg-orange-50 flex items-center gap-2"
                            >
                              <RiAddBoxLine
                                size={18}
                                className="text-orange-500"
                              />
                              Add Item
                            </button>
                            <Link
                              to="/items"
                              // onClick={() => setIsProfileOpen(false)}
                              className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 active:bg-orange-50 flex items-center gap-2"
                            >
                              <RiFileList3Line
                                size={18}
                                className="text-blue-500"
                              />
                              Show All Items
                            </Link>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>
                          </>
                        )}

                        {user?.role == "customer" && (
                          <>
                            <button
                              onClick={() => navigate("/address")}
                              className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-600 active:bg-red-50 flex items-center gap-2"
                            >
                              <FaMapLocationDot size={18} />
                              Address
                            </button>
                            <button
                              onClick={() => navigate("/user-orders")}
                              className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-600 active:bg-red-50 flex items-center gap-2"
                            >
                              <RiOrderPlayFill size={18} />
                              Orders
                            </button>
                          </>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 active:bg-red-50 flex items-center gap-2"
                        >
                          <RiLogoutCircleRLine size={18} />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-bold text-white bg-linear-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full shadow-md"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Desktop Actions (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-6 shrink-0 ml-auto">
            {isAuth ? (
              <>
                {/* Desktop Seller Links */}
                {isSeller && (
                  <div className="flex items-center gap-3 mr-2">
                    <Link
                      to="/add-item"
                      className="flex items-center gap-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      <RiAddBoxLine size={20} />
                      Add Item
                    </Link>
                    <Link
                      to="/items"
                      className="flex items-center gap-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                      <RiFileList3Line size={20} className="text-blue-500" />
                      All Items
                    </Link>
                  </div>
                )}

                {/* Desktop Cart (Customers Only) */}
                {isCustomerOrGuest && (
                  <>
                    <Link
                      to="/cart"
                      className="relative text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-2 font-semibold"
                    >
                      <div className="relative">
                        <RiShoppingCart2Fill size={24} />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white box-content">
                          {cartLoading ? 0 : cartLenth}
                        </span>
                      </div>
                      <span className="hidden lg:block">Cart</span>
                    </Link>
                    <div className="h-8 w-px bg-gray-200"></div>
                  </>
                )}

                {/* Desktop Profile */}
                <div className="relative" ref={desktopProfileRef}>
                  <div
                    className="flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <div className="flex flex-col items-end ml-2">
                      <span className="text-sm font-bold text-gray-700">
                        {user?.name || "User"}
                      </span>
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-wider">
                        {user?.role || "Customer"}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm bg-white">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-500">
                          <RiUser3Fill size={20} />
                        </div>
                      )}
                    </div>
                  </div>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-down">
                      {user?.role == "customer" && (
                        <>
                          <button
                            onClick={() => navigate("/address")}
                            className="w-full px-5 py-3 text-left text-sm font-bold text-gray-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <FaMapLocationDot size={18} />
                            Address
                          </button>

                          <button
                            onClick={() => navigate("/user-orders")}
                            className="w-full px-5 py-3 text-left text-sm font-bold text-gray-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <RiOrderPlayFill size={18} />
                            Orders
                          </button>
                        </>
                      )}
                      {isSeller && (
                        <button
                          onClick={() => navigate("/restaurant-orders")}
                          className="w-full px-5 py-3 text-left text-sm font-bold gray-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                        >
                          <RiOrderPlayFill size={20} />
                          Orders
                        </button>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full px-5 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <RiLogoutCircleRLine size={20} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl font-bold tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
