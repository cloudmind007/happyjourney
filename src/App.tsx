import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import AuthLayout from "./layout/AuthLayout";
import Media from "./pages/Media";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminRegister from "./pages/AdminRegister";
import UserRegister from "./pages/UserRegister";
import Restaurant from "./pages/Restaurant";
import Customer from "./pages/Customer";
import Station from "./pages/Station";
import RestaurantDetail from "./pages/RestaurantDetail";
import VendorHome from "./pages/VendorHome";
import { Home } from "lucide-react"; // Likely incorrect; should be a component
import OrderFood from "./pages/OrderFood";

const PrivateRoute: React.FC<{ allowedRoles?: string[] }> = ({ allowedRoles }) => {
  const { accessToken, role } = useAuth();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <AuthLayout />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<UserRegister />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/verify-otp" element={<Otp />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="*" element={<div>404 Not Found</div>} />
            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/media" element={<Media />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/stations" element={<Station />} />
            <Route path="/orders" element={<OrderFood />} />
            <Route path="/vender-detail/:id" element={<RestaurantDetail />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["vendor"]} />}>
            <Route path="/vendor/home" element={<VendorHome />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/home" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;