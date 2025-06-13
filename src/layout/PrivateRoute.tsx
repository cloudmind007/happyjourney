import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RoleBasedLayout from "./RoleBasedLayout";

const PrivateRoute: React.FC<{ allowedRoles: string[] }> = ({ allowedRoles }) => {
  const { accessToken, role } = useAuth();
  console.log("PrivateRoute: role =", role, "allowedRoles =", allowedRoles); // Debug

  if (!accessToken) {
    console.log("No accessToken, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role.toLowerCase())) {
    console.log("Role not allowed, redirecting to /unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  return <RoleBasedLayout><Outlet /></RoleBasedLayout>;
};

export default PrivateRoute;