
import { useState, useEffect } from "react";
import { Modal, Box, IconButton, Button } from "@mui/material";
import { X } from "lucide-react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/utils/axios";
import LoaderModal from "@/components/LoaderModal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxHeight: "67vh",
  bgcolor: "background.paper",
  borderRadius: 2,
  border: "none",
  boxShadow: "none",
  p: 4,
  overflowY: "auto",
};

interface FormData {
  itemName: string;
  basePrice: string;
  description: string;
  categoryId: string;
  vegetarian: boolean;
  available: boolean;
  preparationTimeMin: string;
  imageUrl: string;
  displayOrder: string;
  availableStartTime: string;
  availableEndTime: string;
  itemCategory: string;
}

interface Payload {
  itemId?: number;
  itemName?: string;
  basePrice?: number;
  description?: string;
  categoryId?: number;
  vendorId?: number;
  vegetarian?: boolean;
  available?: boolean;
  preparationTimeMin?: number;
  imageUrl?: string;
  displayOrder?: number;
  availableStartTime?: string;
  availableEndTime?: string;
  itemCategory?: string;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: number | null; // categoryId for add, itemId for edit
  setId: (id: number | null) => void;
  mode: "add" | "edit";
  setRefresh: (refresh: boolean) => void;
  refresh: boolean;
  vendorId: number;
  categories: { categoryId: number; categoryName: string }[];
}

const validationSchema = yup.object().shape({
  itemName: yup.string().required("Item name is required"),
  basePrice: yup
    .string()
    .required("Price is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Price must be a valid number"),
  categoryId: yup.string().required("Category is required"),
  description: yup.string(),
  preparationTimeMin: yup.string().matches(/^\d*$/, "Preparation time must be a number"),
  displayOrder: yup.string().matches(/^\d*$/, "Display order must be a number"),
  imageUrl: yup.string().url("Must be a valid URL").nullable(),
  availableStartTime: yup.string(),
  availableEndTime: yup.string(),
  itemCategory: yup.string(),
});

const AddMenuItemModal = ({ open, setOpen, id, setId, mode, setRefresh, refresh, vendorId, categories }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      itemName: "",
      basePrice: "",
      description: "",
      categoryId: id?.toString() || "",
      vegetarian: false,
      available: true,
      preparationTimeMin: "",
      imageUrl: "",
      displayOrder: "",
      availableStartTime: "",
      availableEndTime: "",
      itemCategory: "",
    },
  });

  useEffect(() => {
    const fetchItemData = async () => {
      if (mode === "edit" && id) {
        try {
          setIsLoading(true);
          const res = await api.get(`/api/menu/items/${id}`);
          if (res.status === 200 && res.data) {
            reset({
              itemName: res.data.itemName || "",
              basePrice: res.data.basePrice?.toString() || "",
              description: res.data.description || "",
              categoryId: res.data.categoryId?.toString() || "",
              vegetarian: res.data.vegetarian || false,
              available: res.data.available ?? true,
              preparationTimeMin: res.data.preparationTimeMin?.toString() || "",
              imageUrl: res.data.imageUrl || "",
              displayOrder: res.data.displayOrder?.toString() || "",
              availableStartTime: res.data.availableStartTime || "",
              availableEndTime: res.data.availableEndTime || "",
              itemCategory: res.data.itemCategory || "",
            });
          }
        } catch (error: any) {
          console.error("Error fetching item data:", error);
          setError(error.response?.data?.message || "Failed to load item details.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchItemData();
  }, [id, mode, reset]);

  const handleClose = () => {
    setId(null);
    reset({
      itemName: "",
      basePrice: "",
      description: "",
      categoryId: "",
      vegetarian: false,
      available: true,
      preparationTimeMin: "",
      imageUrl: "",
      displayOrder: "",
      availableStartTime: "",
      availableEndTime: "",
      itemCategory: "",
    });
    setOpen(false);
    setError(null);
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    const payload: Payload = {
      itemName: data.itemName,
      basePrice: Number(data.basePrice) || undefined,
      description: data.description || undefined,
      categoryId: Number(data.categoryId) || undefined,
      vendorId,
      vegetarian: data.vegetarian,
      available: data.available,
      preparationTimeMin: Number(data.preparationTimeMin) || undefined,
      imageUrl: data.imageUrl || undefined,
      displayOrder: Number(data.displayOrder) || undefined,
      availableStartTime: data.availableStartTime || undefined,
      availableEndTime: data.availableEndTime || undefined,
      itemCategory: data.itemCategory || undefined,
    };

    try {
      const endpoint = mode === "edit" && id ? `/api/menu/items/${id}` : "/api/menu/items";
      const method = mode === "edit" ? api.put : api.post;
      if (mode === "edit" && id) {
        payload.itemId = id;
      }

      const res = await method(endpoint, payload);
      if (res.status === 200 || res.status === 201) {
        setRefresh(!refresh);
        handleClose();
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(error.response?.data?.message || "Failed to save menu item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="font-medium text-xl mb-4">
          {mode === "add" ? "Add Menu Item" : "Update Menu Item"}
        </div>
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "grey.500",
          }}
        >
          <X />
        </IconButton>
        {isLoading && <LoaderModal />}
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-1 gap-4 mb-2">
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="itemName">
                Item Name
              </label>
              <Controller
                name="itemName"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      id="itemName"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.itemName ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter item name"
                    />
                    {errors.itemName && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemName.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="basePrice">
                Price
              </label>
              <Controller
                name="basePrice"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      id="basePrice"
                      step="0.01"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.basePrice ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter price"
                    />
                    {errors.basePrice && (
                      <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="categoryId">
                Category
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <>
                    <select
                      {...field}
                      id="categoryId"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.categoryId ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((category) => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="description">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <>
                    <textarea
                      {...field}
                      id="description"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.description ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter description"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="vegetarian">
                Vegetarian
              </label>
              <Controller
                name="vegetarian"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="vegetarian"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-1"
                  />
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="available">
                Available
              </label>
              <Controller
                name="available"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="available"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-1"
                  />
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="preparationTimeMin"
              >
                Preparation Time (min)
              </label>
              <Controller
                name="preparationTimeMin"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      id="preparationTimeMin"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.preparationTimeMin ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter preparation time"
                    />
                    {errors.preparationTimeMin && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.preparationTimeMin.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="imageUrl">
                Image URL
              </label>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      id="imageUrl"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.imageUrl ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter image URL"
                    />
                    {errors.imageUrl && (
                      <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="displayOrder">
                Display Order
              </label>
              <Controller
                name="displayOrder"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="number"
                      id="displayOrder"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.displayOrder ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter display order"
                    />
                    {errors.displayOrder && (
                      <p className="mt-1 text-sm text-red-600">{errors.displayOrder.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="availableStartTime"
              >
                Available Start Time
              </label>
              <Controller
                name="availableStartTime"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="time"
                      id="availableStartTime"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.availableStartTime ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.availableStartTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.availableStartTime.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="availableEndTime"
              >
                Available End Time
              </label>
              <Controller
                name="availableEndTime"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="time"
                      id="availableEndTime"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.availableEndTime ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                    {errors.availableEndTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.availableEndTime.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700" htmlFor="itemCategory">
                Item Category
              </label>
              <Controller
                name="itemCategory"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      id="itemCategory"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.itemCategory ? "border-red-500" : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter item category"
                    />
                    {errors.itemCategory && (
                      <p className="mt-1 text-sm text-red-600">{errors.itemCategory.message}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
          <div className="w-full flex justify-center items-center mt-4 mb-6">
            <Button
              type="submit"
              variant="outlined"
              size="medium"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Save"}
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default AddMenuItemModal;
