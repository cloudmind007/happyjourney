import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import Media from "./pages/Media";
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
import UserOrders from "./pages/UserOrder";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./layout/PrivateRoute";
import BulkOrderForm from "./pages/BulkOrderForm";
import WalletPage from "./pages/WalletPage";
import CancellationPolicy from "./pages/CancellationPolicy";
import ComplaintPage from "./pages/ComplaintForm";
import FeedbackPage from "./pages/FeedbackForm";
import HelpAndSupport from "./pages/HelpAndSupport ";
import OrderHistory from "./pages/OrderHistory";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ComplaintForm from "./pages/ComplaintForm";
import ContactForm from "./pages/ContactForm";
import FeedbackForm from "./pages/FeedbackForm";
import UserOrder from "./pages/UserOrder";

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
            <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/media" element={<Media />} />
            <Route path="/restaurant" element={<Restaurant />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/stations" element={<Station />} />
            <Route path="/vendor-detail/:id" element={<RestaurantDetail/>} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={["vendor"]} />}>
            <Route path="/vendor/home" element={<VendorHome />} />
            <Route path="/vendor/orders" element={<VendorOrders />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['user']} />}>
          <Route path="/" element={<OrderFood />} />
          <Route path="/home" element={<OrderFood />} />
          <Route path="/cart" element={<OrderFood />} />
          <Route path="/bulk-order" element={<BulkOrderForm />} />
          <Route path="/complaints" element={<ComplaintForm />} />
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/help" element={<HelpAndSupport />} />
          <Route path="/user-order/:id" element={<UserOrder />} />

          {/* <Route path="/vendor/:vendorId" element={<VendorDetail />} /> */}
        </Route>

          <Route
            path="/"
            element={
              <Navigate
                to={
                  localStorage.getItem("accessToken")
                    ? localStorage.getItem("role")?.toLowerCase() === "admin"
                      ? "/dashboard"
                      : localStorage.getItem("role")?.toLowerCase() === "vendor"
                      ? "/vendor/home"
                      : "/home"
                    : "/login"
                }
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;