import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Edit, Trash2, Plus, Star, Clock, Leaf, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddMenuItemModal from "@/components/AddMenuItemModal";
import api from "@/utils/axios";
import { useAuth } from "@/contexts/AuthContext";

interface Vendor {
  vendorId: number;
  businessName: string;
  description: string;
  logoUrl: string; // Contains systemFileName (e.g., UUID-filename.jpg)
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
  vendorPrice?: number;
  description: string;
  categoryId: number;
  categoryName?: string;
  vendorId: number;
  vegetarian: boolean;
  available: boolean;
  preparationTimeMin?: number;
  imageUrl?: string;
  displayOrder?: number;
  availableStartTime?: string;
  availableEndTime?: string;
  itemCategory?: string;
}

interface RestaurantDetailProps {
  vendorId?: number;
  isViewOnly?: boolean;
}

const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ vendorId, isViewOnly = false }) => {
  const { id: urlId } = useParams<{ id: string }>();
  const { role } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const effectiveVendorId = vendorId || Number(urlId);
  const isVendor = role?.toLowerCase() === "vendor";

  // Base URL for the download endpoint
  const DOWNLOAD_ENDPOINT = "http://94.136.184.78:8080/api/files/download";

  // Construct logo URL using systemFileName
  const getLogoUrl = (systemFileName: string) => {
    return `${DOWNLOAD_ENDPOINT}?systemFileName=${encodeURIComponent(systemFileName)}`;
  };

  const staticVendorData: Vendor = {
    vendorId: effectiveVendorId,
    businessName: "Tasty Bites",
    description: "A cozy restaurant serving delicious vegetarian meals.",
    logoUrl: "5e815990-aa46-4d4f-b493-48dbde3737a3-amr-taha-Zbvr7FWB4fc-unsplash.jpg", // Example systemFileName
    preparationTimeMin: 30,
    rating: 4.5,
    veg: true,
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorRes = await api.get(`/vendors/${effectiveVendorId}`);
        setVendor(vendorRes.data);

        const categoriesRes = await api.get(`/menu/vendors/${effectiveVendorId}/categories`);
        const fetchedCategories = categoriesRes.data.content || [];
        setCategories(fetchedCategories);

        const menuItemsRes = await api.get(`/menu/vendors/${effectiveVendorId}/items`);
        const itemsWithCategory = menuItemsRes.data.map((item: MenuItem) => ({
          ...item,
          categoryName:
            fetchedCategories.find((cat: Category) => cat.categoryId === item.categoryId)
              ?.categoryName || "Uncategorized",
        }));
        setMenuItems(itemsWithCategory);
      } catch (error) {
        console.error("Error fetching data, using static fallback:", error);
        setVendor(staticVendorData);
        const fallbackCategories = [
          { categoryId: 1, categoryName: "Indian", vendorId: effectiveVendorId, displayOrder: 1 },
          { categoryId: 2, categoryName: "Chinese", vendorId: effectiveVendorId, displayOrder: 2 },
          { categoryId: 3, categoryName: "Thai", vendorId: effectiveVendorId, displayOrder: 3 },
        ];
        setCategories(fallbackCategories);
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
            itemName: "Chicken Tikka Masala",
            basePrice: 280,
            description: "Grilled chicken in spiced curry",
            categoryId: 1,
            vendorId: effectiveVendorId,
            vegetarian: false,
            available: true,
          },
          {
            itemId: 3,
            itemName: "Spring Rolls",
            basePrice: 180,
            description: "Crispy vegetable rolls",
            categoryId: 2,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 4,
            itemName: "Pad Thai",
            basePrice: 220,
            description: "Stir-fried rice noodles",
            categoryId: 3,
            vendorId: effectiveVendorId,
            vegetarian: true,
            available: true,
          },
        ]);
      }
    };
    fetchData();
  }, [effectiveVendorId, refresh]);

  const handleOpenEditModal = (id: number, type: "category" | "menuItem") => {
    setSelectedId(id);
    setMode("edit");
    type === "category" ? setIsCategoryModalOpen(true) : setIsMenuItemModalOpen(true);
  };

  const handleDelete = async (id: number, type: "category" | "menuItem") => {
    try {
      if (type === "category") {
        await api.delete(`/menu/categories/${id}`);
        setCategories(categories.filter((cat) => cat.categoryId !== id));
        setMenuItems(menuItems.filter((item) => item.categoryId !== id));
      } else {
        await api.delete(`/menu/items/${id}`);
        setMenuItems(menuItems.filter((item) => item.itemId !== id));
      }
      setRefresh(!refresh);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Restaurant Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <img
          src={vendor?.logoUrl ? getLogoUrl(vendor.logoUrl) : "https://via.placeholder.com/1500x500"}
          alt={vendor?.businessName || "Restaurant"}
          className="w-full h-64 object-cover"
          onError={(e) => {
            console.error("Failed to load logo:", vendor?.logoUrl);
            e.currentTarget.src = "https://via.placeholder.com/1500x500"; // Fallback image
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

      {/* Menu Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Utensils className="w-5 h-5 mr-2 text-amber-500" />
            Menu
          </h2>
          {!isViewOnly && !isVendor && (
            <Button
              onClick={() => {
                setMode("add");
                setIsCategoryModalOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          )}
        </div>

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
                      <div className="flex items-center gap-2">
                        {!isViewOnly && !isVendor && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(category.categoryId, "category");
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(category.categoryId, "category");
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {expandedCategory === category.categoryId ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                    {expandedCategory === category.categoryId && (
                      <div className="p-4 border-t border-gray-100">
                        {!isViewOnly && !isVendor && (
                          <div className="flex justify-end mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                              onClick={() => {
                                setMode("add");
                                setIsMenuItemModalOpen(true);
                                setSelectedId(category.categoryId);
                              }}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                            </Button>
                          </div>
                        )}
                        {categoryItems.length > 0 ? (
                          <div className="overflow-x-auto">
                            {isMobile ? (
                              <div className="space-y-4">
                                {categoryItems.map((item, index) => (
                                  <div
                                    key={item.itemId}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                      <div>
                                        <p className="text-xs text-gray-500">Sr. No.</p>
                                        <p className="font-medium text-sm">{index + 1}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Item ID</p>
                                        <p className="font-medium text-sm">{item.itemId}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-xs text-gray-500">Item Name</p>
                                        <p className="font-medium text-sm">{item.itemName}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="font-medium text-sm">₹{item.basePrice}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">Vegetarian</p>
                                        <p className="font-medium text-sm">
                                          {item.vegetarian ? (
                                            <span className="text-green-600 flex items-center">
                                              <Leaf className="w-3 h-3 mr-1" /> Yes
                                            </span>
                                          ) : (
                                            "No"
                                          )}
                                        </p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-xs text-gray-500">Description</p>
                                        <p className="font-medium text-sm">{item.description}</p>
                                      </div>
                                    </div>
                                    {!isViewOnly && !isVendor && (
                                      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                          onClick={() => handleOpenEditModal(item.itemId, "menuItem")}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                          onClick={() => handleDelete(item.itemId, "menuItem")}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <table className="min-w-full border-separate border-spacing-y-2">
                                <thead>
                                  <tr className="text-left">
                                    <th className="px-4 py-3 font-medium text-gray-700 bg-gray-100 rounded-l-lg">Sr. No.</th>
                                    <th className="px-4 py-3 font-medium text-gray-700 bg-gray-100">Item ID</th>
                                    <th className="px-4 py-3 font-medium text-gray-700 bg-gray-100">Item Name</th>
                                    <th className="px-4 py-3 font-medium text-gray-700 bg-gray-100">Price</th>
                                    <th className="px-4 py-3 font-medium text-gray-700 bg-gray-100">Vegetarian</th>
                                    <th className="px-4 py-3 font-medium text-gray-700 bg-gray-100">Description</th>
                                    {!isViewOnly && !isVendor && (
                                      <th className="px-4 py-3 font-medium text-gray-700 bg-gray-100 rounded-r-lg">Actions</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {categoryItems.map((item, index) => (
                                    <tr
                                      key={item.itemId}
                                      className="text-sm hover:bg-gray-50 transition-colors"
                                    >
                                      <td className="px-4 py-3 rounded-l-lg border border-gray-100">{index + 1}</td>
                                      <td className="px-4 py-3 border border-gray-100">{item.itemId}</td>
                                      <td className="px-4 py-3 font-medium border border-gray-100">{item.itemName}</td>
                                      <td className="px-4 py-3 border border-gray-100">₹{item.basePrice}</td>
                                      <td className="px-4 py-3 border border-gray-100">
                                        {item.vegetarian ? (
                                          <span className="text-green-600 flex items-center">
                                            <Leaf className="w-3 h-3 mr-1" /> Yes
                                          </span>
                                        ) : (
                                          "No"
                                        )}
                                      </td>
                                      <td className="px-4 py-3 border border-gray-100 text-gray-600">{item.description}</td>
                                      {!isViewOnly && !isVendor && (
                                        <td className="px-4 py-3 rounded-r-lg border border-gray-100">
                                          <div className="flex gap-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                              onClick={() => handleOpenEditModal(item.itemId, "menuItem")}
                                            >
                                              <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-red-600 border-red-200 hover:bg-red-50"
                                              onClick={() => handleDelete(item.itemId, "menuItem")}
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
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
              <p className="text-gray-500 mt-1">
                {isViewOnly || isVendor ? "No categories available" : "Add your first category"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {!isViewOnly && !isVendor && (
        <>
          <AddCategoryModal
            open={isCategoryModalOpen}
            setOpen={setIsCategoryModalOpen}
            id={selectedId}
            setId={setSelectedId}
            mode={mode}
            setRefresh={setRefresh}
            refresh={refresh}
            vendorId={effectiveVendorId}
          />
          <AddMenuItemModal
            open={isMenuItemModalOpen}
            setOpen={setIsMenuItemModalOpen}
            id={selectedId}
            setId={setSelectedId}
            mode={mode}
            setRefresh={setRefresh}
            refresh={refresh}
            vendorId={effectiveVendorId}
            categories={categories}
          />
        </>
      )}
    </div>
  );
};

export default RestaurantDetail;