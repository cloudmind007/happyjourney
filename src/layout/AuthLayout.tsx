import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AuthLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div className="h-screen w-full overflow-hidden">
      <div className="flex w-full h-full">
        <aside
          className={`${
            collapsed ? "w-20" : "w-64"
          } h-full transition-all duration-300`}
        >
          <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        </aside>
        <main className="flex-1 h-full overflow-y-auto bg-gray-50">
          <div className="sticky top-0 z-10 bg-white shadow">
            <Navbar />
          </div>
          <div className="p-4">
            <Outlet />
          </div>
        </main>

        {/* <main className="flex-1 h-full overflow-y-auto bg-gray-50 p-4">
          <Navbar />
          <Outlet />
        </main> */}
      </div>
    </div>
  );
};

export default AuthLayout;
