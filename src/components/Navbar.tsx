import { ChevronDown, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "../constants/menuItems";
import { useEffect, useRef, useState } from "react";
import api from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const currentMenuItem = menuItems.find(
    (item) => item.path === location.pathname
  );
  const title = currentMenuItem?.label || "Page";

  const handleLogout = async () => {
    try {
      const response = await api.get("/auth/logout");
      if (response.status === 200) {
        logout();
        navigate("/login");
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative z-20">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center">
          <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-2">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span>admin</span>
              <span className="mx-2">/</span>
              <span>{location.pathname.replace("/", "") || "dashboard"}</span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-sm text-gray-600">Hi, Relswad</span>
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">R</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-30">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
