import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { userMenuItems } from "../constants/menuItems";
import { Menu } from "lucide-react";

type UserSidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const UserSidebar: React.FC<UserSidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  return (
    <div
      className={`h-full ${collapsed ? "w-20" : "w-64"} bg-white shadow-sm border-r transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && <h1 className="text-xl font-bold text-gray-800">User Portal</h1>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-100 transition"
        >
          <Menu size={20} />
        </button>
      </div>
      <nav className="mt-4">
        {userMenuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={index} className="px-2 py-1">
              <div
                title={collapsed ? item.label : ""}
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-between"
                } px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => navigate(item.path)}
              >
                <div className={`flex items-center ${collapsed ? "" : "space-x-3"}`}>
                  <item.icon size={20} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default UserSidebar;