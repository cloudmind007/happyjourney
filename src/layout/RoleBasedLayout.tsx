  import React, { useState } from "react";
  import Sidebar from "../components/Sidebar";
  import VendorSidebar from "../components/VendorSidebar";
  import UserSidebar from "../components/UserSidebar";
  import Navbar from "../components/Navbar";
  import { useAuth } from "../contexts/AuthContext";

  const RoleBasedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { role, userId } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    console.log("RoleBasedLayout rendering, role:", role, "userId:", userId); // Debug

    const renderSidebar = () => {
      switch (role?.toLowerCase()) {
        case "admin":
          return <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />;
        case "vendor":
          return <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} vendorId={userId || undefined} />;
        case "user":
          return <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} />;
        default:
          console.warn("No sidebar for role:", role);
          return null;
      }
    };

    return (
      <div className="flex h-screen">
        {renderSidebar()}
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </div>
      </div>
    );
  };

  export default RoleBasedLayout;