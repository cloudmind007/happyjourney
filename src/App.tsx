import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Dashboard from "./pages/Dashboard";
import AuthLayout from "./layout/AuthLayout";
import Media from "./pages/Media";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./layout/PrivateRoute";
import Register from "./pages/Register";
import Restaurant from "./pages/Restaurant";
import Customer from "./pages/Customer";
import Station from "./pages/Station";
import AddStation from "./components/AddStation";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<Otp />} />
            <Route path="/" element={<Navigate to={"/login"} replace />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/media" element={<Media />} />
              <Route path="/restaurant" element={<Restaurant />} />
              <Route path="/customers" element={<Customer />} />
              <Route path="/stations" element={<Station />} />
              <Route path="/stations/add" element={<AddStation />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
