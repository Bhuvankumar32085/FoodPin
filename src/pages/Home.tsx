import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import RiderHomePage from "../components/rider/RiderHomePage";
import UserHomePage from "../components/user/UserHomePage";
import { useAppData } from "../context/AppContext";
import Resturant from "./Resturant";
import axios from "axios";
import toast from "react-hot-toast";
import AddRiderDetails from "./rider/AddRiderDetails";
import { riderService } from "../App";
import AdminPage from "./Admin/AdminPage";

const Home = () => {
  const { user } = useAppData();
  const [riderAddProfileOpen, setRiderAddProfileOpen] = useState(false);
  const isAdmin = user?.role === "admin";
  console.log("isAdmin", isAdmin);

  useEffect(() => {
    if (user?.role !== "rider") return;

    const fetchRiderData = async () => {
      try {
        const { data } = await axios.get(`${riderService}/api/rider/my`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!data.success) {
          setRiderAddProfileOpen(true);
          return;
        }

        const rider = data.resData;

        if (
          !rider.phoneNumber ||
          !rider.addharNummber ||
          !rider.drivingLicenseNumber
        ) {
          setRiderAddProfileOpen(true);
        } else {
          setRiderAddProfileOpen(false);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            // profile exist nahi karti
            setRiderAddProfileOpen(true);
            return;
          }

          toast.error(error.response?.data.message || "Fetch Rider Error!");
        } else {
          toast.error("Fetch Rider Error");
        }
      }
    };

    fetchRiderData();
  }, [user?.role]);

  return (
    <>
      {!riderAddProfileOpen && <Nav />}
      {user?.role === "seller" && <Resturant />}
      {user?.role === "customer" && <UserHomePage />}
      {user?.role === "rider" &&
        (riderAddProfileOpen ? <AddRiderDetails /> : <RiderHomePage />)}
      {isAdmin && <AdminPage />}
    </>
  );
};

export default Home;
