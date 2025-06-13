import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import Media from "./pages/Media";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminRegister from "./pages/AdminRegister";
import UserRegister from "./pages/UserRegister";
import Restaurant from "./pages/Restaurant";
import Customer from "./pages/Customer";
import Station from "./pages/Station";
import RestaurantDetail from "./pages/RestaurantDetail";
import VendorHome from "./pages/VendorHome";
import Home from "./pages/Home";
import OrderFood from "./pages/OrderFood";
import VendorOrders from "./pages/VendorOrders";
import UserOrders from "./pages/UserOrders";
import Sidebar from "./components/Sidebar";
import VendorSidebar from "./components/VendorSidebar";
import UserSidebar from "./components/UserSidebar";
import Navbar from "./components/Navbar";
import { useState } from "react";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

const VendorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, userId } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  console.log("VendorLayout rendered:", { role, userId }); // Debug
  return (
    <div className="flex h-screen">
      {role?.toLowerCase() === "vendor" && (
        <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} vendorId={userId || undefined} />
      )}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex h-screen">
      <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

const PrivateRoute: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { accessToken, role } = useAuth();
  console.log("PrivateRoute:", { accessToken: !!accessToken, role, allowedRoles }); // Debug

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role.toLowerCase())) {
    return <Navigate to="/unauthorized" />;
  }

  if (role?.toLowerCase() === "vendor") {
    return <VendorLayout>{children}</VendorLayout>;
  } else if (role?.toLowerCase() === "user") {
    return <UserLayout>{children}</UserLayout>;
  } else {
    return <AdminLayout>{children}</AdminLayout>;
  }
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
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
            <Route path="*" element={<div>404 Not Found</div>} />
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
            <Route path="/vender-detail/:id" element={<RestaurantDetail />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={["user"]} />}>
            <Route path="/home" element={<Home />} />
            <Route path="/user/orders" element={<UserOrders />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;