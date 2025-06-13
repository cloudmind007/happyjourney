import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ShoppingCart,
  MapPin,
  Home,
  LucideIcon,
} from "lucide-react";

export type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

export const adminMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: UtensilsCrossed, label: "Restaurant", path: "/restaurant" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: MapPin, label: "Station", path: "/stations" },
];

export const vendorMenuItems: MenuItem[] = [
  { icon: Home, label: "Home", path: "/vendor/home" },
  { icon: UtensilsCrossed, label: "Restaurant Details", path: "/vender-detail" },
  { icon: ShoppingCart, label: "Orders", path: "/vendor/orders" },
];

export const userMenuItems: MenuItem[] = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: ShoppingCart, label: "Orders", path: "/user/orders" },
];