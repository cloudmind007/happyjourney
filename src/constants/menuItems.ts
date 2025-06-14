import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ShoppingCart,
  MapPin,
  Home,
  Wallet,
  History,
  AlertCircle,
  MessageSquare,
  Shield,
  XCircle,
  FileText,
  HelpCircle,
  LucideIcon,
  Phone,
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
  { icon: MapPin, label: "Station", path: "/stations" },
];

export const vendorMenuItems: MenuItem[] = [
  { icon: Home, label: "Home", path: "/vendor/home" },
  { icon: UtensilsCrossed, label: "Restaurant Details", path: "/vendor-detail" },
  { icon: ShoppingCart, label: "Orders", path: "/vendor/orders" },
];

export const userMenuItems: MenuItem[] = [
  { icon: Home, label: "Home", path: "/home" },
  { icon: ShoppingCart, label: "My Orders", path: "/orders" },
  { icon: Wallet, label: "Wallet", path: "/wallet" },
  { icon: History, label: "Order History", path: "/order-history" },
  { icon: AlertCircle, label: "Complaint", path: "/complaints" },  
  { icon: MessageSquare, label: "Feedback", path: "/feedback" },
  { icon: Shield, label: "Privacy Policy", path: "/privacy-policy" },
  { icon: XCircle, label: "Cancellation Policy", path: "/cancellation-policy" },
  { icon: FileText, label: "Terms & Conditions", path: "/terms" },
  { icon: HelpCircle, label: "Help & Support", path: "/help" },
  { icon: Phone, label: "Contact Us", path: "/contact" }

];