import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Star, Clock, Leaf, Utensils, Trash2, Plus } from "lucide-react";
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

        // Fetch vendor details
        const vendorRes = await api.get(`/vendors/${effectiveVendorId}`);
        setVendor(vendorRes.data);

        // Fetch categories
        const categoriesRes = await api.get(`/menu/vendors/${effectiveVendorId}/categories`);
        const fetchedCategories = categoriesRes.data.content || [];
        setCategories(fetchedCategories);

        // Fetch menu items
        const menuItemsRes = await api.get(`/menu/vendors/${effectiveVendorId}/items`);
        const itemsWithCategory = menuItemsRes.data.map((item: MenuItem) => ({
          ...item,
          categoryName:
            fetchedCategories.find((cat: Category) => cat.categoryId === item.categoryId)?.categoryName ||
            "Uncategorized",
        }));
        setMenuItems(itemsWithCategory);

        // Fetch cart summary
        await fetchCartSummary();
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to load restaurant details");
        setVendor(staticVendorData);
        setCategories([
          { categoryId: 1, categoryName: "Indian", vendorId: effectiveVendorId, displayOrder: 1 },
          { categoryId: 2, categoryName: "Chinese", vendorId: effectiveVendorId, displayOrder: 2 },
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

  const addItemToCart = async (itemId: number) => {
    setIsAddingItem(itemId);
    try {
      const request = {
        itemId,
        vendorId: effectiveVendorId,
        quantity: 1,
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
      console.error("Error adding item to cart:", error);
      setError(error.response?.data || "Failed to add item to cart");
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
      setError(error.response?.data || "Failed to remove item from cart");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete(`/cart`, { params: { vendorId: effectiveVendorId } });
      setCartSummary(null);
      setIsClearCartOpen(false);
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      setError(error.response?.data || "Failed to clear cart");
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Restaurant Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <img
          src={vendor?.logoUrl ? getLogoUrl(vendor.logoUrl) : "https://via.placeholder.com/1500x500"}
          alt={vendor?.businessName || "Restaurant"}
          className="w-full h-64 object-cover"
          onError={(e) => {
            console.error("Failed to load logo:", vendor?.logoUrl);
            e.currentTarget.src = "https://via.placeholder.com/1500x500";
          }}
        />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{vendor?.businessName || "Restaurant"}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
              <Star className="w-4 h-4 mr-1" />
              {vendor?.rating || 0}
            </span>
            <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {vendor?.preparationTimeMin || 0} min
            </span>
            {vendor?.veg && (
              <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                <Leaf className="w-4 h-4 mr-1" />
                Vegetarian
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Menu Section */}
        <div className="flex-1 space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-amber-500" />
              Menu
            </h2>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              {sortedCategories.length > 0 ? (
                <div className="space-y-4">
                  {sortedCategories.map((category) => {
                    const categoryItems = menuItems.filter((item) => item.categoryId === category.categoryId);
                    return (
                      <div
                        key={category.categoryId}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-amber-300 transition-colors"
                      >
                        <div
                          className="flex justify-between items-center p-4 cursor-pointer"
                          onClick={() => toggleCategory(category.categoryId)}
                        >
                          <h3 className="text-lg font-semibold text-gray-800">{category.categoryName}</h3>
                          <div>
                            {expandedCategory === category.categoryId ? (
                              <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        {expandedCategory === category.categoryId && (
                          <div className="p-4 border-t border-gray-100">
                            {categoryItems.length > 0 ? (
                              <div className="space-y-4">
                                {categoryItems.map((item) => (
                                  <div
                                    key={item.itemId}
                                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex-1">
                                      <h4 className="text-md font-medium text-gray-800">{item.itemName}</h4>
                                      <p className="text-sm text-gray-600">{item.description}</p>
                                      <div className="flex items-center mt-1 space-x-2">
                                        <span className="text-sm font-medium">₹{item.basePrice}</span>
                                        {item.vegetarian && (
                                          <span className="text-green-600 flex items-center text-sm">
                                            <Leaf className="w-3 h-3 mr-1" /> Veg
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => addItemToCart(item.itemId)}
                                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2"
                                      disabled={isAddingItem === item.itemId || !item.available}
                                    >
                                      {isAddingItem === item.itemId ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      ) : (
                                        <span className="flex items-center">
                                          <Plus className="w-4 h-4 mr-1" /> Add
                                        </span>
                                      )}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">No menu items found in this category</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-dashed border-gray-300">
                  <h3 className="text-lg font-medium text-gray-700">No Categories Found</h3>
                  <p className="text-gray-500 mt-1">No categories available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Section - Fixed at bottom on mobile, sidebar on desktop */}
        {cartSummary?.items.length ? (
          <div className="lg:w-80 lg:sticky lg:top-4 lg:h-fit">
            <div className="bg-white rounded-lg shadow-lg p-4 lg:border border-gray-200 fixed bottom-0 left-0 right-0 lg:relative">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Order</h3>
              <div className="max-h-64 overflow-y-auto mb-4">
                {cartSummary.items.map((item) => (
                  <div key={item.itemId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <p className="text-sm font-medium">{item.itemName}</p>
                      <p className="text-xs text-gray-600">₹{item.unitPrice} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => removeItemFromCart(item.itemId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{cartSummary.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tax</span>
                  <span>₹{cartSummary.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Delivery Charges</span>
                  <span>₹{cartSummary.deliveryCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-md font-bold text-gray-800 mt-2">
                  <span>Total</span>
                  <span>₹{cartSummary.finalAmount.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsClearCartOpen(true)}>
                  Clear Cart
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Proceed to Checkout</Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Clear Cart Confirmation */}
      <Dialog open={isClearCartOpen} onOpenChange={setIsClearCartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Cart</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Are you sure you want to clear all items from your cart?</p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsClearCartOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={clearCart}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserOrder;