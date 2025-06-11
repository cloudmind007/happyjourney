import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { useParams } from "react-router-dom";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddCategoryModal from "@/components/AddCategoryModal";
import AddMenuItemModal from "@/components/AddMenuItemModal";

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
  id: number;
  name: string;
  vendorId: number;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryId: number;
  vendorId: number;
  categoryName?: string; // Added for display purposes
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

  // Static data fallbacks
  const staticVendorData: Vendor = {
    vendorId: 1,
    businessName: "Tasty Bites",
    description: "A cozy restaurant serving delicious vegetarian meals.",
    logoUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    preparationTimeMin: 30,
    rating: 4.5,
    veg: true,
  };

  const staticCategories: Category[] = [
    { id: 1, name: "Indian", vendorId: 1 },
    { id: 2, name: "Chinese", vendorId: 1 },
    { id: 3, name: "Thai", vendorId: 1 },
  ];

  const staticMenuItems: MenuItem[] = [
    {
      id: 1,
      name: "Butter Chicken",
      price: 250,
      description: "Creamy tomato-based curry",
      categoryId: 1,
      vendorId: 1,
      categoryName: "Indian",
    },
    {
      id: 2,
      name: "Chicken Tikka Masala",
      price: 280,
      description: "Grilled chicken in spiced curry",
      categoryId: 1,
      vendorId: 1,
      categoryName: "Indian",
    },
    {
      id: 3,
      name: "Spring Rolls",
      price: 180,
      description: "Crispy vegetable rolls",
      categoryId: 2,
      vendorId: 1,
      categoryName: "Chinese",
    },
    {
      id: 4,
      name: "Pad Thai",
      price: 220,
      description: "Stir-fried rice noodles",
      categoryId: 3,
      vendorId: 1,
      categoryName: "Thai",
    },
  ];

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
        const vendorRes = await api.get(`/vendor/${id}`);
        setVendor(vendorRes.data);

        // Fetch categories
        const categoriesRes = await api.get(`/categories?vendorId=${id}`);
        setCategories(categoriesRes.data);

        // Fetch menu items
        const menuItemsRes = await api.get(`/menu-items?vendorId=${id}`);
        // Add category names to menu items
        const itemsWithCategory = menuItemsRes.data.map((item: MenuItem) => ({
          ...item,
          categoryName:
            categoriesRes.data.find(
              (cat: Category) => cat.id === item.categoryId
            )?.name || "Uncategorized",
        }));
        setMenuItems(itemsWithCategory);
      } catch (error) {
        console.error("Error fetching data, using static fallback:", error);
        setVendor(staticVendorData);
        setCategories(staticCategories);
        setMenuItems(staticMenuItems);
      }
    };

    fetchData();
  }, [id, refresh]);

  const handleOpenEditModal = (id: number, type: "category" | "menuItem") => {
    setSelectedId(id);
    setMode("edit");
    type === "category"
      ? setIsCategoryModalOpen(true)
      : setIsMenuItemModalOpen(true);
  };

  const handleDelete = async (id: number, type: "category" | "menuItem") => {
    try {
      if (type === "category") {
        // await api.delete(`/categories/${id}`);
        setCategories(categories.filter((cat) => cat.id !== id));
      } else {
        // await api.delete(`/menu-items/${id}`);
        setMenuItems(menuItems.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Vendor Header */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <img
          src={vendor?.logoUrl || "https://via.placeholder.com/1500x500"}
          alt={vendor?.businessName}
          className="w-full h-64 object-cover"
        />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h1 className="text-3xl font-bold">
            {vendor?.businessName || "Restaurant"}
          </h1>
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

      {/* Categories Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Categories</h2>
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
          {categories.length > 0 ? (
            <div className="p-4 bg-white overflow-x-auto rounded-lg">
              {isMobile ? (
                <div className="space-y-4">
                  {categories.map((category, index) => (
                    <div
                      key={category.id}
                      className="p-4 bg-white shadow-md rounded-lg border border-gray-100"
                    >
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Sr. No.</p>
                          <p className="font-medium text-sm">{index + 1}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Category ID</p>
                          <p className="font-medium text-sm">{category.id}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Category Name</p>
                          <p className="font-medium text-sm">{category.name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenEditModal(category.id, "category")
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(category.id, "category")}
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
                      <th className="px-2 py-3 font-medium text-black">
                        Sr. No.
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Category ID
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Category Name
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category, index) => (
                      <tr
                        key={category.id}
                        className="text-center bg-white shadow-md text-sm"
                      >
                        <td className="px-2 py-4 rounded-tl-lg rounded-bl-lg">
                          {index + 1}
                        </td>
                        <td className="px-2 py-4">{category.id}</td>
                        <td className="px-2 py-4">{category.name}</td>
                        <td className="px-2 py-4 rounded-tr-lg rounded-br-lg">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenEditModal(category.id, "category")
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() =>
                                handleDelete(category.id, "category")
                              }
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
            <div className="flex flex-col items-center justify-center p-8">
              <h3 className="text-lg font-medium">No Categories Found</h3>
              <p className="text-gray-500">Add your first category</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Menu Items</h2>
          <Button
            onClick={() => {
              setMode("add");
              setIsMenuItemModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Menu Item
          </Button>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          {menuItems.length > 0 ? (
            <div className="p-4 bg-white overflow-x-auto rounded-lg">
              {isMobile ? (
                <div className="space-y-4">
                  {menuItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white shadow-md rounded-lg border border-gray-100"
                    >
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Sr. No.</p>
                          <p className="font-medium text-sm">{index + 1}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Item ID</p>
                          <p className="font-medium text-sm">{item.id}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Item Name</p>
                          <p className="font-medium text-sm">{item.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-medium text-sm">₹{item.price}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Category</p>
                          <p className="font-medium text-sm">
                            {item.categoryName}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="font-medium text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleOpenEditModal(item.id, "menuItem")
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(item.id, "menuItem")}
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
                      <th className="px-2 py-3 font-medium text-black">
                        Sr. No.
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Item ID
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Item Name
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Price
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Category
                      </th>
                      <th className="px-2 py-3 font-medium text-black">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item, index) => (
                      <tr
                        key={item.id}
                        className="text-center bg-white shadow-md text-sm"
                      >
                        <td className="px-2 py-4 rounded-tl-lg rounded-bl-lg">
                          {index + 1}
                        </td>
                        <td className="px-2 py-4">{item.id}</td>
                        <td className="px-2 py-4 font-medium">{item.name}</td>
                        <td className="px-2 py-4">₹{item.price}</td>
                        <td className="px-2 py-4">{item.categoryName}</td>
                        <td className="px-2 py-4 rounded-tr-lg rounded-br-lg">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenEditModal(item.id, "menuItem")
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600"
                              onClick={() => handleDelete(item.id, "menuItem")}
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
            <div className="flex flex-col items-center justify-center p-8">
              <h3 className="text-lg font-medium">No Menu Items Found</h3>
              <p className="text-gray-500">Add your first menu item</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
