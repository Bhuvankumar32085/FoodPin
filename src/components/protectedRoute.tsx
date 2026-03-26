import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppData } from "../context/AppContext";

const ProtectedRoute = () => {
  const { isAuth, loading, user } = useAppData();
  const losation = useLocation();
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.role && losation.pathname !== "/select-role") {
    return <Navigate to="/select-role" replace />;
  }

  if (user?.role && losation.pathname === "/select-role") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; //Outlet hoge ProtectedRoute ke under banne wale route
};

export default ProtectedRoute;
