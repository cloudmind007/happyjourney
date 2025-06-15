import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Star, Clock, Leaf, Utensils, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import api from "@/utils/axios";
import { useAuth } from "@/contexts/AuthContext";

interface Vendor {
  vendorId: number;
  businessName: string;
  description: string;
  logoUrl: string;
  preparationTimeMin: number;
  rating: number;
  veg: boolean;
}

interface Category {
  categoryId: number;
  categoryName: string;
  vendorId: number;
  displayOrder: number;
}

interface MenuItem {
  itemId: number;
  itemName: string;
  basePrice: number;
  description: string;
  categoryId: number;
  categoryName?: string;
  vendorId: number;
  vegetarian: boolean;
  available: boolean;
}

interface CartItem {
  itemId: number;
  quantity: number;
  unitPrice: number;
  itemName?: string;
  specialInstructions?: string;
}

interface CartSummary {
  cartId: string;
  customerId: number;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  deliveryCharges: number;
  finalAmount: number;
}

const UserOrder: React.FC = () => {
  const { id: urlId } = useParams<{ id: string }>();
  const { role, userId } = useAuth();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [isClearCartOpen, setIsClearCartOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [isCartExpanded, setIsCartExpanded] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  const effectiveVendorId = Number(urlId);
  const isCustomer = role?.toLowerCase() === "user";
  const DOWNLOAD_ENDPOINT = "http://94.136.184.78:8080/api/files/download";

  const getLogoUrl = (systemFileName: string) => {
    return `${DOWNLOAD_ENDPOINT}?systemFileName=${encodeURIComponent(systemFileName)}`;
  };

  const staticVendorData: Vendor = {
    vendorId: effectiveVendorId,
    businessName: "Tasty Bites",
    description: "A cozy restaurant serving delicious vegetarian meals.",
    logoUrl: "5e815990-aa46-4d4f-b493-48dbde3737a3-amr-taha-Zbvr7FWB4fc-unsplash.jpg",
    preparationTimeMin: 30,
    rating: 4.5,
    veg: true,
  };

  useEffect(() => {
    if (!isCustomer || !userId) {
      navigate("/login");
    }
  }, [isCustomer, userId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!effectiveVendorId || isNaN(effectiveVendorId)) {
          throw new Error("Invalid vendor ID");
        }

        const vendorRes = await api.get(`/vendors/${effectiveVendorId}`);
        setVendor(vendorRes.data);

        const categoriesRes = await api.get(`/menu/vendors/${effectiveVendorId}/categories`);
        const fetchedCategories = categoriesRes.data.content || [];
        setCategories(fetchedCategories);

        const menuItemsRes = await api.get(`/menu/vendors/${effectiveVendorId}/items`);
        const itemsWithCategory = menuItemsRes.data.map((item: MenuItem) => ({
          ...item,
          categoryName:
            fetchedCategories.find((cat: Category) => cat.categoryId === item.categoryId)?.categoryName ||
            "Uncategorized",
        }));
        setMenuItems(itemsWithCategory);

        await fetchCartSummary();
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load restaurant details");
        setVendor(staticVendorData);
        setCategories([
          { categoryId: 1, categoryName: "Indian", vendorId: effectiveVendorId, displayOrder: 1 },
          { categoryId: 2, categoryName: "Chinese", vendorId: effectiveVendorId, displayOrder: 2 },
          { categoryId: 3, categoryName: "Italian", vendorId: effectiveVendorId, displayOrder: 3 },
          { categoryId: 4, categoryName: "Mexican", vendorId: effectiveVendorId, displayOrder: 4 },
          { categoryId: 5, categoryName: "Desserts", vendorId: effectiveVendorId, displayOrder: 5 },
        ]);
        setMenuItems([
          {
            itemId: 1,
            itemName: "Butter Chicken",
            basePrice: 250,
            description: "Creamy tomato-based curry",
            categoryId: 1,
            vendorId: effectiveVendorId,
            vegetarian: false,
            available: true,
          },
          {
            itemId: 2,
            itemName: "Spring Rolls",
            basePrice: 180,
            description: "Crispy vegetable rolls",
            categoryId: 2,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 3,
            itemName: "Margherita Pizza",
            basePrice: 300,
            description: "Classic cheese and tomato pizza",
            categoryId: 3,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 4,
            itemName: "Tacos",
            basePrice: 220,
            description: "Mexican style soft tacos",
            categoryId: 4,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 5,
            itemName: "Chocolate Lava Cake",
            basePrice: 150,
            description: "Warm chocolate cake with molten center",
            categoryId: 5,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 6,
            itemName: "Paneer Tikka",
            basePrice: 200,
            description: "Grilled cottage cheese skewers",
            categoryId: 1,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 7,
            itemName: "Manchurian",
            basePrice: 180,
            description: "Indo-Chinese vegetable balls",
            categoryId: 2,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 8,
            itemName: "Pasta Alfredo",
            basePrice: 250,
            description: "Creamy white sauce pasta",
            categoryId: 3,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 9,
            itemName: "Burrito",
            basePrice: 280,
            description: "Mexican style stuffed wrap",
            categoryId: 4,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 10,
            itemName: "Tiramisu",
            basePrice: 200,
            description: "Classic Italian dessert",
            categoryId: 5,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [effectiveVendorId]);

  const fetchCartSummary = async () => {
    try {
      const response = await api.get(`/cart/summary`, { params: { vendorId: effectiveVendorId } });
      const summary: CartSummary = response.data;
      const enrichedItems = summary.items.map((item) => ({
        ...item,
        itemName: menuItems.find((menuItem) => menuItem.itemId === item.itemId)?.itemName || "Unknown Item",
      }));
      setCartSummary({ ...summary, items: enrichedItems });
    } catch (error: any) {
      console.error("Error fetching cart summary:", error);
      setCartSummary(null);
    }
  };

  const addItemToCart = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setIsAddingItem(itemId);
    try {
      const request = {
        itemId,
        vendorId: effectiveVendorId,
        quantity,
        specialInstructions: "",
        trainId: 12345,
        pnrNumber: "1234567890",
        coachNumber: "A1",
        seatNumber: "12",
        deliveryStationId: 1,
        deliveryInstructions: "",
      };
      await api.post(`/cart/add-item`, request);
      await fetchCartSummary();
      setQuantities((prev) => ({ ...prev, [itemId]: 0 }));
    } catch (error: any) {
      console.error("Error adding item to cart:", error);
      setError(error.response?.data?.message || "Failed to add item to cart");
    } finally {
      setIsAddingItem(null);
    }
  };

  const updateCartItemQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      await removeItemFromCart(itemId);
      return;
    }
    setIsAddingItem(itemId);
    try {
      const request = {
        itemId,
        vendorId: effectiveVendorId,
        quantity: newQuantity,
        specialInstructions: "",
        trainId: 12345,
        pnrNumber: "1234567890",
        coachNumber: "A1",
        seatNumber: "12",
        deliveryStationId: 1,
        deliveryInstructions: "",
      };
      await api.post(`/cart/add-item`, request);
      await fetchCartSummary();
    } catch (error: any) {
      console.error("Error updating cart item quantity:", error);
      setError(error.response?.data?.message || "Failed to update item quantity");
    } finally {
      setIsAddingItem(null);
    }
  };

  const removeItemFromCart = async (itemId: number) => {
    try {
      await api.delete(`/cart/items/${itemId}`, { params: { vendorId: effectiveVendorId } });
      await fetchCartSummary();
    } catch (error: any) {
      console.error("Error removing item from cart:", error);
      setError(error.response?.data?.message || "Failed to remove item from cart");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete(`/cart`, { params: { vendorId: effectiveVendorId } });
      setCartSummary(null);
      setIsClearCartOpen(false);
      setIsCartExpanded(false);
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      setError(error.response?.data?.message || "Failed to clear cart");
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleQuantityChange = (itemId: number, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue >= 0) {
      setQuantities((prev) => ({ ...prev, [itemId]: numValue }));
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
      setIsCartExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-red-600 text-lg font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Restaurant Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <img
          src={vendor?.logoUrl ? getLogoUrl(vendor.logoUrl) : "https://via.placeholder.com/1500x500"}
          alt={vendor?.businessName || "Restaurant"}
          className="w-full h-64 sm:h-80 object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/1500x500";
          }}
        />
        <div className="absolute bottom-0 left-0 p-6 sm:p-8 text-white">
          <h1 className="text-3xl sm:text-4xl font-bold">{vendor?.businessName || "Restaurant"}</h1>
          <p className="text-sm sm:text-base mt-2 max-w-md">{vendor?.description}</p>
          <div className="flex flex-wrap items-center mt-4 gap-3">
            <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
              <Star className="w-4 h-4 mr-1 text-yellow-400" />
              {vendor?.rating || 0}
            </span>
            <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {vendor?.preparationTimeMin || 0} min
            </span>
            {vendor?.veg && (
              <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                <Leaf className="w-4 h-4 mr-1 text-green-400" />
                Vegetarian
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col lg:flex-row gap-8">
        {/* Menu Section */}
        <div className="flex-1 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Utensils className="w-6 h-6 mr-2 text-amber-500" />
            Menu
          </h2>
          {sortedCategories.length > 0 ? (
            sortedCategories.map((category) => {
              const categoryItems = menuItems.filter((item) => item.categoryId === category.categoryId);
              return (
                <div
                  key={category.categoryId}
                  className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div
                    className="flex justify-between items-center p-4 sm:p-6 cursor-pointer"
                    onClick={() => toggleCategory(category.categoryId)}
                  >
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{category.categoryName}</h3>
                    <div>
                      {expandedCategory === category.categoryId ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>
                  {expandedCategory === category.categoryId && (
                    <div className="p-4 sm:p-6 border-t border-gray-100">
                      {categoryItems.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryItems.map((item) => (
                            <div
                              key={item.itemId}
                              className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-amber-300 transition-colors"
                            >
                              <div className="flex-1">
                                <h4 className="text-md font-medium text-gray-800">{item.itemName}</h4>
                                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                                <div className="flex items-center mt-2 gap-2">
                                  <span className="text-sm font-medium">₹{item.basePrice}</span>
                                  {item.vegetarian && (
                                    <span className="text-green-600 flex items-center text-sm">
                                      <Leaf className="w-3 h-3 mr-1" /> Veg
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                  <button
                                    className="p-2 text-gray-600 hover:bg-gray-100"
                                    onClick={() =>
                                      handleQuantityChange(item.itemId, String((quantities[item.itemId] || 0) - 1))
                                    }
                                    disabled={(quantities[item.itemId] || 0) <= 0}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <input
                                    type="number"
                                    value={quantities[item.itemId] || 0}
                                    onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                                    className="w-12 text-center border-x border-gray-300 focus:outline-none"
                                    min="0"
                                  />
                                  <button
                                    className="p-2 text-gray-600 hover:bg-gray-100"
                                    onClick={() =>
                                      handleQuantityChange(item.itemId, String((quantities[item.itemId] || 0) + 1))
                                    }
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                                <Button
                                  onClick={() => addItemToCart(item.itemId, quantities[item.itemId] || 1)}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                                  disabled={isAddingItem === item.itemId || !item.available || (quantities[item.itemId] || 0) <= 0}
                                >
                                  {isAddingItem === item.itemId ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <span className="flex items-center justify-center">
                                      <Plus className="w-4 h-4 mr-1" /> Add
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                          <p className="text-gray-600">No menu items found in this category</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-md border border-dashed border-gray-300">
              <h3 className="text-lg font-medium text-gray-700">No Categories Found</h3>
              <p className="text-gray-600 mt-1">No categories available</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      {cartSummary?.items.length ? (
        <>
          {/* Floating Cart Button - Mobile */}
          <div className="fixed bottom-4 right-4 lg:hidden z-50">
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-14 w-14 rounded-full shadow-lg relative"
              onClick={() => setIsCartExpanded(true)}
            >
              <ShoppingCart className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartSummary.items.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            </Button>
          </div>

          {/* Cart Panel - Desktop */}
          <div className="hidden lg:block mt-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Order</h3>
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {cartSummary.items.map((item) => (
                  <div key={item.itemId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                      <p className="text-xs text-gray-600">₹{item.unitPrice} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100"
                          onClick={() => updateCartItemQuantity(item.itemId, item.quantity - 1)}
                          disabled={isAddingItem === item.itemId}
                          aria-label={`Decrease quantity of ${item.itemName}`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-sm">{item.quantity}</span>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100"
                          onClick={() => updateCartItemQuantity(item.itemId, item.quantity + 1)}
                          disabled={isAddingItem === item.itemId}
                          aria-label={`Increase quantity of ${item.itemName}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gray-800">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 p-2"
                        onClick={() => removeItemFromCart(item.itemId)}
                        disabled={isAddingItem === item.itemId}
                        aria-label={`Remove ${item.itemName} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tax</span>
                  <span>₹{cartSummary.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Delivery</span>
                  <span>₹{cartSummary.deliveryCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-800 pt-2">
                  <span>Total</span>
                  <span>₹{cartSummary.finalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsClearCartOpen(true)}
                >
                  Clear
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Cart Drawer */}
          {isCartExpanded && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                onClick={() => setIsCartExpanded(false)}
              ></div>
              <div
                ref={cartRef}
                className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-2xl p-6 max-h-[70vh] overflow-y-auto transform transition-transform duration-300 ease-in-out"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Order</h3>
                  <button
                    onClick={() => setIsCartExpanded(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close cart"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 mb-4">
                  {cartSummary.items.map((item) => (
                    <div key={item.itemId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.itemName}</p>
                        <p className="text-xs text-gray-600">₹{item.unitPrice} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100"
                            onClick={() => updateCartItemQuantity(item.itemId, item.quantity - 1)}
                            disabled={isAddingItem === item.itemId}
                            aria-label={`Decrease quantity of ${item.itemName}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center text-sm">{item.quantity}</span>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100"
                            onClick={() => updateCartItemQuantity(item.itemId, item.quantity + 1)}
                            disabled={isAddingItem === item.itemId}
                            aria-label={`Increase quantity of ${item.itemName}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-gray-800">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 p-2"
                          onClick={() => removeItemFromCart(item.itemId)}
                          disabled={isAddingItem === item.itemId}
                          aria-label={`Remove ${item.itemName} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Subtotal</span>
                    <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Tax</span>
                    <span>₹{cartSummary.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Delivery</span>
                    <span>₹{cartSummary.deliveryCharges.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-800 pt-2">
                    <span>Total</span>
                    <span>₹{cartSummary.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsClearCartOpen(true)}
                  >
                    Clear
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      setIsCartExpanded(false);
                      navigate("/checkout");
                    }}
                  >
                    Checkout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Clear Cart Confirmation */}
      <Dialog open={isClearCartOpen} onOpenChange={setIsClearCartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to clear all items from your cart?</p>
          <DialogFooter>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50" onClick={() => setIsClearCartOpen(false)}>
              Cancel
            </Button>
            <Button onClick={clearCart} className="bg-red-600 hover:bg-red-700 text-white">
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserOrder;