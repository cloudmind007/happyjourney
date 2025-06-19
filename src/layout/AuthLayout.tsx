import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AuthLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

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
    <div className="h-screen w-full overflow-hidden">
      <div className="flex w-full h-full">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} ref={sidebarRef} />
        <main className="flex-1 h-full overflow-y-auto bg-gray-50">
          <div ref={navbarRef} className="sticky top-0 z-10 bg-white shadow">
            <Navbar collapsed={collapsed} setCollapsed={setCollapsed} />
          </div>
          <div className="p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;