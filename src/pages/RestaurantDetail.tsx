import { useState, useEffect } from "react";
import api from "@/utils/axios";
import { useParams } from "react-router-dom";
import AddCategoryModal from "@/components/AddCategoryModal";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Vendor {
  vendorId: number;
  username: string;
  password: string;
  businessName: string;
  description: string;
  logoUrl: string;
  fssaiLicense: string;
  gstNumber: string;
  stationId: number;
  address: string;
  preparationTimeMin: number;
  minOrderAmount: number;
  verified: boolean;
  rating: number;
  activeStatus: boolean;
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [isMobile, setIsMobile] = useState(false);

  // Static vendor data
  const staticVendorData: Vendor = {
    vendorId: 1,
    username: "vendor1",
    password: "securepassword",
    businessName: "Tasty Bites",
    description: "A cozy restaurant serving delicious vegetarian meals.",
    logoUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    fssaiLicense: "FSSAI123456789",
    gstNumber: "GSTIN987654321",
    stationId: 101,
    address: "123 Food Street, Flavor Town",
    preparationTimeMin: 30,
    minOrderAmount: 200,
    verified: true,
    rating: 4.5,
    activeStatus: true,
    veg: true,
  };

  // Static category data as fallback
  const staticCategoryData: Category[] = [
    { id: 1, name: "Indian", vendorId: 1 },
    { id: 2, name: "Chinese", vendorId: 1 },
    { id: 3, name: "Thai", vendorId: 1 },
    { id: 4, name: "Italian", vendorId: 1 },
    { id: 5, name: "Desserts", vendorId: 1 },
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
    const fetchVendor = async () => {
      try {
        const res = await api.get(`/vendors/${id}`);
        setVendor(res.data);
      } catch (error) {
        console.error("Error fetching vendor, loading static data:", error);
        setVendor(staticVendorData);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await api.get(`/categories?vendorId=${id}`);
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories, loading static data:", error);
        setCategories(staticCategoryData);
      }
    };

    fetchVendor();
    fetchCategories();
  }, [id, refresh]);

  const handleOpenEditModal = (id: number) => {
    setSelectedId(id);
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      // In a real app, you would call your API here
      // await api.delete(`/categories/${id}`);

      // For now, just filter out the deleted category
      setCategories(categories.filter((category) => category.id !== id));
      console.log(`Category with ID ${id} deleted successfully`);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      {/* Vendor Header Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <img
          src={vendor?.logoUrl}
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

      {/* Add Category Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setMode("add");
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Add New Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-gray-50 p-3 rounded-lg">
        {categories.length > 0 ? (
          <div className="p-4 bg-white overflow-x-auto rounded-lg">
            {isMobile ? (
              // Mobile view - card layout
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
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditModal(category.id)}
                        className="h-8 px-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="h-8 px-2 text-red-600 hover:text-red-800 border-red-100 hover:border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead className="w-full">
                  <tr className="rounded-md w-full text-center py-4">
                    <th className="px-2 text-sm py-3 font-medium text-black">
                      Sr. No.
                    </th>
                    <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                      Category ID
                    </th>
                    <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                      Category Name
                    </th>
                    <th className="px-2 text-sm py-3 text-center font-medium text-black tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr
                      key={category.id}
                      className="text-center bg-white shadow-md text-sm"
                    >
                      <td className="px-2 py-4 font-medium text-black rounded-tl-lg rounded-bl-lg">
                        {index + 1}
                      </td>
                      <td className="px-2 py-4 font-medium text-black">
                        {category.id}
                      </td>
                      <td className="px-2 py-4 font-medium text-black">
                        {category.name}
                      </td>
                      <td className="px-2 py-4 font-medium rounded-tr-lg rounded-br-lg">
                        <div className="flex gap-2 justify-center items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(category.id)}
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-red-600 hover:text-red-800"
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
          <div className="flex flex-col items-center justify-center mt-12">
            <h2 className="text-xl font-semibold mb-4">No Categories Found</h2>
            <p className="text-gray-500">
              Add your first category to get started
            </p>
          </div>
        )}
      </div>
      {/* Add Category Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setMode("add");
            setIsModalOpen(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Add New Menu
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-gray-50 p-3 rounded-lg">
        {categories.length > 0 ? (
          <div className="p-4 bg-white overflow-x-auto rounded-lg">
            {isMobile ? (
              // Mobile view - card layout
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
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditModal(category.id)}
                        className="h-8 px-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="h-8 px-2 text-red-600 hover:text-red-800 border-red-100 hover:border-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead className="w-full">
                  <tr className="rounded-md w-full text-center py-4">
                    <th className="px-2 text-sm py-3 font-medium text-black">
                      Sr. No.
                    </th>
                    <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                      Category ID
                    </th>
                    <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                      Category Name
                    </th>
                    <th className="px-2 text-sm py-3 text-center font-medium text-black tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr
                      key={category.id}
                      className="text-center bg-white shadow-md text-sm"
                    >
                      <td className="px-2 py-4 font-medium text-black rounded-tl-lg rounded-bl-lg">
                        {index + 1}
                      </td>
                      <td className="px-2 py-4 font-medium text-black">
                        {category.id}
                      </td>
                      <td className="px-2 py-4 font-medium text-black">
                        {category.name}
                      </td>
                      <td className="px-2 py-4 font-medium rounded-tr-lg rounded-br-lg">
                        <div className="flex gap-2 justify-center items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(category.id)}
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 text-red-600 hover:text-red-800"
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
          <div className="flex flex-col items-center justify-center mt-12">
            <h2 className="text-xl font-semibold mb-4">No Categories Found</h2>
            <p className="text-gray-500">
              Add your first category to get started
            </p>
          </div>
        )}
      </div>

      <AddCategoryModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        id={selectedId}
        setId={setSelectedId}
        mode={mode}
        setRefresh={setRefresh}
        refresh={refresh}
        vendorId={Number(id)}
      />
    </div>
  );
};

export default RestaurantDetail;
