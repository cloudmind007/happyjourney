import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminMenuItems, vendorMenuItems, userMenuItems } from "../constants/menuItems";
import { useEffect, useRef, useState } from "react";
import api from "../utils/axios";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { role, username, logout } = useAuth();

  const menuItems = role?.toLowerCase() === "vendor"
    ? vendorMenuItems
    : role?.toLowerCase() === "user"
    ? userMenuItems
    : adminMenuItems;


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
      logout();
      navigate("/login");
    } 
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.addEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div>
            {/* <h1 className="text-2xl font-semibold text-gray-900">{title}</h1> */}
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <span className="mx-2"></span>
            </div>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-sm text-gray-600 hidden sm:inline">
              Hi, {username || "User"}
            </span>
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {username ? username.charAt(0).toUpperCase() : "U"}
              </span>
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