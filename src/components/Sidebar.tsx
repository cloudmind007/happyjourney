import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import {
  // LayoutDashboard,
  // Image,
  // FileText,
  // Package,
  // UtensilsCrossed,
  // Users,
  // ShoppingCart,
  // CreditCard,
  // MapPin,
  // Award,
  // Star,
  // Palette,
  // Globe,
  // RefreshCw,
  // TrendingUp,
  // ChevronRight,
  Menu,
  // LucideIcon,
} from "lucide-react";

// type MenuItem = {
//   icon: LucideIcon;
//   label: string;
//   path: string;
//   hasSubmenu?: boolean;
// };

type SidebarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // const menuItems: MenuItem[] = [
  //   { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  //   { icon: Image, label: "Media", path: "/media" },
  //   { icon: FileText, label: "Pages", path: "/pages" },
  //   { icon: Package, label: "Products", path: "/products", hasSubmenu: true },
  //   {
  //     icon: UtensilsCrossed,
  //     label: "Restaurant",
  //     path: "/restaurant",
  //     hasSubmenu: true,
  //   },
  //   { icon: Users, label: "Customers", path: "/customers" },
  //   { icon: ShoppingCart, label: "Orders", path: "/orders", hasSubmenu: true },
  //   { icon: CreditCard, label: "Plans", path: "/plans", hasSubmenu: true },
  //   { icon: MapPin, label: "Station", path: "/station", hasSubmenu: true },
  //   { icon: Award, label: "Badges", path: "/badges", hasSubmenu: true },
  //   { icon: Star, label: "Featured", path: "/featured", hasSubmenu: true },
  //   {
  //     icon: TrendingUp,
  //     label: "Earning Reports",
  //     path: "/reports",
  //     hasSubmenu: true,
  //   },
  //   {
  //     icon: Palette,
  //     label: "Appearance",
  //     path: "/appearance",
  //     hasSubmenu: true,
  //   },
  //   { icon: Globe, label: "Language", path: "/language", hasSubmenu: true },
  //   { icon: RefreshCw, label: "Update", path: "/update" },
  // ];

  return (
    <div
      className={`h-full ${
        collapsed ? "w-20" : "w-64"
      } bg-white shadow-sm border-r transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h1 className="text-xl font-bold text-gray-800">RELSWAD</h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-gray-100 transition"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="mt-4">
        {menuItems.map((item, index) => {
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
                <div
                  className={`flex items-center ${
                    collapsed ? "" : "space-x-3"
                  }`}
                >
                  <item.icon size={20} />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
                {/* {!collapsed && item.hasSubmenu && <ChevronRight size={16} />} */}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
