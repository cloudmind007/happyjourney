import {
  LayoutDashboard,
  // Image,
  // FileText,
  // Package,
  UtensilsCrossed,
  Users,
  // ShoppingCart,
  // CreditCard,
  MapPin,
  // Award,
  // Star,
  // Palette,
  // Globe,
  // RefreshCw,
  // TrendingUp,
  LucideIcon,
} from "lucide-react";

export type MenuItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

export const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  // { icon: Image, label: "Media", path: "/media" },
  // { icon: FileText, label: "Pages", path: "/pages" },
  // { icon: Package, label: "Products", path: "/products" },
  {
    icon: UtensilsCrossed,
    label: "Restaurant",
    path: "/restaurant",
  },
  { icon: Users, label: "Customers", path: "/customers" },
  // { icon: ShoppingCart, label: "Orders", path: "/orders" },
  // { icon: CreditCard, label: "Plans", path: "/plans" },
  { icon: MapPin, label: "Station", path: "/stations" },
  // { icon: Award, label: "Badges", path: "/badges" s},
  // { icon: Star, label: "Featured", path: "/featured" },
  // {
  //   icon: TrendingUp,
  //   label: "Earning Reports",
  //   path: "/reports",
  // },
  // { icon: Palette, label: "Appearance", path: "/appearance" },
  // { icon: Globe, label: "Language", path: "/language" },
  // { icon: RefreshCw, label: "Update", path: "/update" },
];
