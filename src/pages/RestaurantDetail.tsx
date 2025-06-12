import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddMenuItemModal from "@/components/AddMenuItemModal";
import api from "@/utils/axios";

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

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
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

  const staticVendorData: Vendor = {
    vendorId: 1,
    businessName: "Tasty Bites",
    description: "A cozy restaurant serving delicious vegetarian meals.",
    logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
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
        // Fetch vendor
        const vendorRes = await api.get(`/vendors/${id}`);
        setVendor(vendorRes.data);

        // Fetch categories
        const categoriesRes = await api.get(`/menu/vendors/${id}/categories`);
        const fetchedCategories = categoriesRes.data.content || [];
        setCategories(fetchedCategories);

        // Fetch menu items
        const menuItemsRes = await api.get(`/menu/vendors/${id}/items`);
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
          { categoryId: 1, categoryName: "Indian", vendorId: 1, displayOrder: 1 },
          { categoryId: 2, categoryName: "Chinese", vendorId: 1, displayOrder: 2 },
          { categoryId: 3, categoryName: "Thai", vendorId: 1, displayOrder: 3 },
        ];
        setCategories(fallbackCategories);
        setMenuItems([
          {
            itemId: 1,
            itemName: "Butter Chicken",
            basePrice: 250,
            description: "Creamy tomato-based curry",
            categoryId: 1,
            vendorId: 1,
            vegetarian: false,
            available: true,
          },
          {
            itemId: 2,
            itemName: "Chicken Tikka Masala",
            basePrice: 280,
            description: "Grilled chicken in spiced curry",
            categoryId: 1,
            vendorId: 1,
            vegetarian: false,
            available: true,
          },
          {
            itemId: 3,
            itemName: "Spring Rolls",
            basePrice: 180,
            description: "Crispy vegetable rolls",
            categoryId: 2,
            vendorId: 1,
            vegetarian: true,
            available: true,
          },
          {
            itemId: 4,
            itemName: "Pad Thai",
            basePrice: 220,
            description: "Stir-fried rice noodles",
            categoryId: 3,
            vendorId: 1,
            vegetarian: true,
            available: true,
          },
        ]);
      }
    };
    fetchData();
  }, [id, refresh]);

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
        // Also remove menu items that belong to this category
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

  // Sort categories by displayOrder
  const sortedCategories = [...categories].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <img
          src={vendor?.logoUrl || "https://via.placeholder.com/1500x500"}
          alt={vendor?.businessName}
          className="w-full h-64 object-cover"
        />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{vendor?.businessName || "Restaurant"}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
              ⭐ {vendor?.rating || 0}
            </span>
            <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
              🕒 {vendor?.preparationTimeMin || 0} min
            </span>
            {vendor?.veg && (
              <span className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                🌱 Vegetarian
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Menu</h2>
          <Button
            onClick={() => {
              setMode("add");
              setIsCategoryModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          {sortedCategories.length > 0 ? (
            <div className="space-y-4">
              {sortedCategories.map((category) => {
                const categoryItems = menuItems.filter((item) => item.categoryId === category.categoryId);
                return (
                  <div
                    key={category.categoryId}
                    className="bg-white rounded-lg shadow-md border border-gray-100"
                  >
                    <div
                      className="flex justify-between items-center p-4 cursor-pointer"
                      onClick={() => toggleCategory(category.categoryId)}
                    >
                      <h3 className="text-lg font-semibold">{category.categoryName}</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
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
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(category.categoryId, "category");
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {expandedCategory === category.categoryId ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    {expandedCategory === category.categoryId && (
                      <div className="p-4 border-t border-gray-100">
                        <div className="flex justify-end mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMode("add");
                              setIsMenuItemModalOpen(true);
                              setSelectedId(category.categoryId);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                          </Button>
                        </div>
                        {categoryItems.length > 0 ? (
                          <div className="overflow-x-auto">
                            {isMobile ? (
                              <div className="space-y-4">
                                {categoryItems.map((item, index) => (
                                  <div
                                    key={item.itemId}
                                    className="p-4 bg-gray-50 rounded-lg border border-gray-100"
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
                                        <p className="font-medium text-sm">{item.vegetarian ? "Yes" : "No"}</p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-xs text-gray-500">Description</p>
                                        <p className="font-medium text-sm">{item.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenEditModal(item.itemId, "menuItem")}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600"
                                        onClick={() => handleDelete(item.itemId, "menuItem")}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <table className="min-w-full border-separate border-spacing-y-2">
                                <thead>
                                  <tr className="rounded-md text-center">
                                    <th className="px-2 py-3 font-medium text-black">Sr. No.</th>
                                    <th className="px-2 py-3 font-medium text-black">Item ID</th>
                                    <th className="px-2 py-3 font-medium text-black">Item Name</th>
                                    <th className="px-2 py-3 font-medium text-black">Price</th>
                                    <th className="px-2 py-3 font-medium text-black">Vegetarian</th>
                                    <th className="px-2 py-3 font-medium text-black">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {categoryItems.map((item, index) => (
                                    <tr
                                      key={item.itemId}
                                      className="text-center bg-gray-50 shadow-md text-sm"
                                    >
                                      <td className="px-2 py-4 rounded-tl-lg rounded-bl-lg">{index + 1}</td>
                                      <td className="px-2 py-4">{item.itemId}</td>
                                      <td className="px-2 py-4 font-medium">{item.itemName}</td>
                                      <td className="px-2 py-4">₹{item.basePrice}</td>
                                      <td className="px-2 py-4">{item.vegetarian ? "Yes" : "No"}</td>
                                      <td className="px-2 py-4 rounded-tr-lg rounded-br-lg">
                                        <div className="flex gap-2 justify-center">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenEditModal(item.itemId, "menuItem")}
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600"
                                            onClick={() => handleDelete(item.itemId, "menuItem")}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
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
            <div className="flex flex-col items-center justify-center p-8">
              <h3 className="text-lg font-medium">No Categories Found</h3>
              <p className="text-gray-500">Add your first category</p>
            </div>
          )}
        </div>
      </div>
      <AddCategoryModal
        open={isCategoryModalOpen}
        setOpen={setIsCategoryModalOpen}
        id={selectedId}
        setId={setSelectedId}
        mode={mode}
        setRefresh={setRefresh}
        refresh={refresh}
        vendorId={Number(id)}
      />
      <AddMenuItemModal
        open={isMenuItemModalOpen}
        setOpen={setIsMenuItemModalOpen}
        id={selectedId}
        setId={setSelectedId}
        mode={mode}
        setRefresh={setRefresh}
        refresh={refresh}
        vendorId={Number(id)}
        categories={categories}
      />
    </div>
  );
};

export default RestaurantDetail;