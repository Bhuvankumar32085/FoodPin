import { useAppData } from "../context/AppContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { isAuth, loading } = useAppData();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuth ? <Navigate to="/" replace /> : <Outlet />; //Outlet hoge PublicRoute ke under banne wale route
};

export default PublicRoute;
