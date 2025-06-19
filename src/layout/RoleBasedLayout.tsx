import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import VendorSidebar from "../components/VendorSidebar";
import UserSidebar from "../components/UserSidebar";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

const RoleBasedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, userId } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  console.log("RoleBasedLayout rendering, role:", role, "userId:", userId); // Debug

  const renderSidebar = () => {
    if (!role) {
      console.warn("No role defined, skipping sidebar render");
      return null;
    }
    switch (role.toLowerCase()) {
      case "admin":
        return <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} ref={sidebarRef} className="sidebar-admin" />;
      case "vendor":
        return <VendorSidebar collapsed={collapsed} setCollapsed={setCollapsed} vendorId={userId || undefined} ref={sidebarRef} className="sidebar-vendor" />;
      case "user":
        return <UserSidebar collapsed={collapsed} setCollapsed={setCollapsed} ref={sidebarRef} className="sidebar-user" />;
      default:
        console.warn("No sidebar for role:", role);
        return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && !collapsed) {
        if (
          navbarRef.current &&
          !navbarRef.current.contains(event.target as Node) &&
          sidebarRef.current &&
          !sidebarRef.current.contains(event.target as Node)
        ) {
          setCollapsed(true);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [collapsed]);

  return (
    <div className="flex h-screen overflow-hidden">
      {renderSidebar()}
      <div className="flex-1 flex flex-col">
        <div ref={navbarRef}>
          <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
        </div>
        <div className="flex-1 overflow-auto p-4 bg-gray-50">{children}</div>
      </div>
    </div>
  );
};

export default RoleBasedLayout;