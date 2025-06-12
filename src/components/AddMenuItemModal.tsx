import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { X } from "lucide-react";
import { Box, Button, Modal } from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/utils/axios";
import LoaderModal from "./LoaderModal";

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
};

type FormData = {
  categoryName: string;
};

interface Payload {
  categoryId?: number | null;
  categoryName?: string;
  vendorId?: number;
}

interface IndiProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number | null;
  mode: "add" | "edit";
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: boolean;
  setId: React.Dispatch<React.SetStateAction<number | null>>;
  vendorId: number;
}

const validationSchema = yup.object().shape({
  categoryName: yup.string().required("Category name is required"),
});

export default function AddStation({
  open,
  setOpen,
  id,
  setId,
  mode,
  setRefresh,
  refresh,
  vendorId,
}: IndiProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      categoryName: "",
    },
  });

  const handleClose = () => {
    setId(null);
    reset({
      categoryName: "",
    });
    setOpen(false);
  };

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (mode === "edit" && id) {
        try {
          setIsLoading(true);
          const res = await api.get(`/categories/${id}`);
          if (res.status === 200 && res.data) {
            reset({
              categoryName: res.data.categoryName || "",
            });
          }
        } catch (error) {
          console.error("Error fetching category data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCategoryData();
  }, [id, mode, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    const payload: Payload = {
      categoryName: data.categoryName,
      vendorId: vendorId,
    };

    try {
      const endpoint =
        mode === "edit" && id ? `/categories/${id}` : "/categories";
      const method = mode === "edit" ? api.put : api.post;
      if (mode === "edit" && id) {
        payload.categoryId = id;
      }

      const res = await method(endpoint, payload);
      if (res.status === 200 || res.status === 201) {
        setRefresh(!refresh);
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "add":
        return "Add Category";
      case "edit":
        return "Update Category";
      default:
        return "";
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <div className="font-medium text-xl mb-4">{getTitle()}</div>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid md:grid-cols-1 gap-4 mb-2">
            <div className="mb-4 w-full">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="categoryName"
              >
                Category Name
              </label>
              <Controller
                name="categoryName"
                control={control}
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      type="text"
                      id="categoryName"
                      className={`mt-1 block w-full px-3 py-2 border ${
                        errors.categoryName
                          ? "border-red-500"
                          : "border-gray-300"
                      } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter category name"
                    />
                    {errors.categoryName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.categoryName.message}
                      </p>
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
}
