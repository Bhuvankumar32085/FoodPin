import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import type { AppContextType, ICart, Location, User } from "../type";
import { authService, restaurantService } from "../App";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  const [cartLoading, setCartLoading] = useState(false);
  const [carts, setCarts] = useState<ICart[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [cartLenth, setCartLenth] = useState(0);

  const [location, setLocation] = useState<Location | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState<string | null>(null);

  async function fetchUser() {
    setLoading(true);
    try {
      const res = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(res.data.user);
      setIsAuth(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to fetch user data.",
        );
      }
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCart() {
    if (!user || user?.role !== "customer") return;
    setCartLoading(true);
    try {
      const res = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log(res.data);
      setCarts(res.data.carts || []);
      setCartLenth(res.data.cartLenth || 0);
      setSubtotal(res.data.subtotal || 0);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to fetch cart data.",
        );
      }
      setCarts([]);
      setCartLenth(0);
      setSubtotal(0);
    } finally {
      setCartLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user?.role === "customer") fetchCart();
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            );
            const data = res.data;
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              formattedAddress: data.display_name,
            });

            setCity(
              data.address.city ||
                data.address.town ||
                data.address.village ||
                "Unknown",
            );
          } catch (error) {
            console.error("Error fetching location data:", error);
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              formattedAddress: "Unknown Location",
            });
            setCity("Unknown");
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
        },
      );
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        setUser,
        setIsAuth,
        setLoading,
        location,
        city,
        loadingLocation,
        cartLenth,
        subtotal,
        carts,
        cartLoading,
        fetchCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
  return context;
};
