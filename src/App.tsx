import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./components/publickRout";
import ProtectedRoute from "./components/protectedRoute";
import SelectRole from "./pages/SelectRole";
import AddRestaurant from "./pages/AddRestaurant";
import AddItems from "./components/AddItems";
import Items from "./pages/Items";
import RestaurantItems from "./components/user/RestaurantItems";
import CartPage from "./pages/CartPage";
import Address from "./pages/Address";
import CheckOutPage from "./pages/CheckOutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import RestaurantOrders from "./pages/RestaurantOrders";
import { SocketProvider } from "./context/SocketContex";
import UserOrders from "./pages/UserOrders";

export const authService = "https://foodpin-auth-latest.onrender.com";
export const restaurantService = "https://foodpin-restaurant7.onrender.com";
export const utilsService = "https://foodpin-utils.onrender.com";
export const realtimeService = "https://foodpin-realtime-latest.onrender.com";
export const riderService = "https://foodpin-rider2.onrender.com";
export const adminService = "https://foodpin-admin-latest.onrender.com";

function App() {
  return (
    <>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/select-role" element={<SelectRole />} />
              <Route path="/add-restaurant" element={<AddRestaurant />} />
              <Route path="/add-item" element={<AddItems />} />
              <Route path="/items" element={<Items />} />
              <Route path="/restaurant/:id" element={<RestaurantItems />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/address" element={<Address />} />
              <Route path="/checkout" element={<CheckOutPage />} />
              <Route path="/payment-failed/:id" element={<PaymentFailed />} />
              <Route path="/payment-success/:id" element={<PaymentSuccess />} />
              <Route path="/restaurant-orders" element={<RestaurantOrders />} />
              <Route path="/user-orders" element={<UserOrders />} />
            </Route>

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
      <Toaster />
    </>
  );
}

export default App;
