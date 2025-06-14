import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Box,
  Button,
  Modal,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  IconButton,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "@/utils/axios";

type FormData = {
  email: string;
  username: string;
  phone: string;
  password: string;
  businessName: string;
  description: string;
  logoUrl: string;
  fssaiLicense: string;
  gstNumber: string | null;
  stationId: number;
  address: string;
  preparationTimeMin: number;
  minOrderAmount: number;
  rating: number;
  activeStatus: boolean;
  veg: boolean;
};

interface IndiProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  id: number | null;
  mode: "add" | "edit";
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: boolean;
  setId: React.Dispatch<React.SetStateAction<number | null>>;
}

interface Station {
  stationId: number;
  stationName: string;
}

const validationSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  username: yup.string().required("Username is required"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[0-9]+$/, "Phone must be numeric"),
  password: yup.string().when("$mode", {
    is: "add",
    then: (schema) => schema.required("Password is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessName: yup.string().required("Business name is required"),
  description: yup.string().required("Description is required"),
  logoUrl: yup.string().when("$mode", {
    is: "add",
    then: (schema) => schema.required("Logo URL is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  fssaiLicense: yup.string().required("FSSAI License is required"),
  gstNumber: yup.string().nullable(),
  stationId: yup
    .number()
    .required("Station ID is required")
    .min(1, "Select a station"),
  address: yup.string().required("Address is required"),
  preparationTimeMin: yup
    .number()
    .required("Preparation time is required")
    .min(0, "Preparation time cannot be negative"),
  minOrderAmount: yup
    .number()
    .required("Minimum order amount is required")
    .min(0, "Minimum order amount cannot be negative"),
  rating: yup
    .number()
    .required("Rating is required")
    .min(0, "Rating cannot be less than 0")
    .max(5, "Rating cannot be more than 5"),
  activeStatus: yup.boolean().required("Active status is required"),
  veg: yup.boolean().required("Vegetarian status is required"),
});

export default function AddVendor({
  open,
  setOpen,
  id,
  setId,
  mode,
  setRefresh,
  refresh,
}: IndiProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrlPreview, setLogoUrlPreview] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [stationsList, setStationsList] = useState<Station[]>([]);

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    context: { mode },
    defaultValues: {
      email: "",
      username: "",
      phone: "",
      password: "",
      businessName: "",
      description: "",
      logoUrl: "",
      fssaiLicense: "",
      gstNumber: null,
      stationId: 0,
      address: "",
      preparationTimeMin: 0,
      minOrderAmount: 0,
      rating: 0,
      activeStatus: true,
      veg: false,
    },
  });

  const handleClose = () => {
    setId(null);
    setLogoUrlPreview(null);
    setUploadedFileUrl(null);
    reset();
    setOpen(false);
  };

  useEffect(() => {
    const getData = async (pageNumber = 1, pageSize = 10) => {
      setIsLoading(true);
      try {
        const res = await api.get(
          `/stations?page=${pageNumber - 1}&size=${pageSize}`
        );
        setStationsList(res.data.content || []);
      } catch (error) {
        console.error("Failed to fetch stations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (mode === "edit" && id) {
        try {
          setIsLoading(true);
          const res = await api.get(`/vendors/${id}`);
          if (res.status === 200 && res.data) {
            const fileUrl = res.data.logoUrl;
            const logoUrl = fileUrl
              ? `/file/download?systemFileName=${fileUrl}`
              : null;
            setUploadedFileUrl(fileUrl || null);
            setLogoUrlPreview(logoUrl);
            reset({
              email: res.data.email || "",
              username: res.data.username || "",
              phone: res.data.phone || "",
              password: "",
              businessName: res.data.businessName || "",
              description: res.data.description || "",
              logoUrl: fileUrl || "",
              fssaiLicense: res.data.fssaiLicense || "",
              gstNumber: res.data.gstNumber || null,
              stationId: res.data.stationId || 0,
              address: res.data.address || "",
              preparationTimeMin: res.data.preparationTimeMin || 0,
              minOrderAmount: res.data.minOrderAmount || 0,
              rating: res.data.rating || 0,
              activeStatus: res.data.activeStatus ?? true,
              veg: res.data.isVeg ?? false,
            });
          }
        } catch (error) {
          console.error("Error fetching vendor data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchVendorData();
  }, [id, mode, reset]);

  // Retry loading the image if uploadedFileUrl is set but logoUrlPreview is not
  useEffect(() => {
    if (uploadedFileUrl && !logoUrlPreview) {
      const apiPreviewUrl = `/file/download?systemFileName=${uploadedFileUrl}`;
      const img = new Image();
      img.src = apiPreviewUrl;
      img.onload = () => {
        setLogoUrlPreview(apiPreviewUrl);
      };
      img.onerror = () => {
        console.error("Failed to load image from API:", apiPreviewUrl);
        setLogoUrlPreview(null);
      };
    }
  }, [uploadedFileUrl, logoUrlPreview]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    try {
      const endpoint =
        mode === "edit" && id ? `/vendors/${id}` : "/auth/create-vendor";
      const method = mode === "edit" ? api.put : api.post;
      const { veg, ...restData } = data;
      const payload = {
        ...restData,
        verified: true,
        isVeg: veg,
      };
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

  const getTitle = (): string => {
    return mode === "add" ? "Add New Vendor" : "Edit Vendor Details";
  };

  const handleFileChange = async (
    onChange: (value: string) => void,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const tempPreview = URL.createObjectURL(file);
      setLogoUrlPreview(tempPreview);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const resp = await api.post("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (resp.status === 200 && resp.data.fileUrl) {
          const fileUrl = resp.data.fileUrl;
          onChange(fileUrl);
          setValue("logoUrl", fileUrl, { shouldDirty: true });
          setUploadedFileUrl(fileUrl);

          const apiPreviewUrl = `/file/download?systemFileName=${fileUrl}`;
          const img = new Image();
          img.src = apiPreviewUrl;
          img.onload = () => {
            setLogoUrlPreview(apiPreviewUrl);
            URL.revokeObjectURL(tempPreview); // Clean up temporary URL
          };
          img.onerror = () => {
            console.error("Failed to load image from API:", apiPreviewUrl);
            setLogoUrlPreview(null); // Clear preview if API fails
          };
        } else {
          setLogoUrlPreview(null);
          setUploadedFileUrl(null);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setLogoUrlPreview(null);
        setUploadedFileUrl(null);
      }
    } else {
      setLogoUrlPreview(null);
      setUploadedFileUrl(null);
    }
  };

  const handleSelectChange = (
    onChange: (value: number) => void,
    event: SelectChangeEvent<number>
  ) => {
    onChange(Number(event.target.value));
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="vendor-modal-title"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "90%",
          maxWidth: 900,
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" component="h2" id="vendor-modal-title">
            {getTitle()}
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "text.secondary",
            }}
          >
            <X size={20} />
          </IconButton>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "0.4em",
            },
            "&::-webkit-scrollbar-track": {
              boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
              webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "rgba(0,0,0,.1)",
              borderRadius: 2,
            },
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Vendor Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { md: "1fr 1fr" },
                gap: 3,
                mb: 2,
              }}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    variant="outlined"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    size="small"
                    disabled={mode === "edit"}
                  />
                )}
              />

              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Username"
                    variant="outlined"
                    fullWidth
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    size="small"
                  />
                )}
              />

              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <Typography variant="body2" sx={{ mr: 1 }}>
                          +91
                        </Typography>
                      ),
                    }}
                  />
                )}
              />

              {mode === "add" && (
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type="password"
                      variant="outlined"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      size="small"
                    />
                  )}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Business Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { md: "1fr 1fr" },
                gap: 3,
                mb: 2,
              }}
            >
              <Controller
                name="businessName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Business Name"
                    variant="outlined"
                    fullWidth
                    error={!!errors.businessName}
                    helperText={errors.businessName?.message}
                    size="small"
                  />
                )}
              />

              <Controller
                name="fssaiLicense"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="FSSAI License Number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.fssaiLicense}
                    helperText={errors.fssaiLicense?.message}
                    size="small"
                  />
                )}
              />

              <Controller
                name="gstNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="GST Number (Optional)"
                    variant="outlined"
                    fullWidth
                    error={!!errors.gstNumber}
                    helperText={errors.gstNumber?.message}
                    size="small"
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                )}
              />

              <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Business Description"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      size="small"
                    />
                  )}
                />
              </Box>

              <Controller
                name="stationId"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    size="small"
                    error={!!errors.stationId}
                  >
                    <InputLabel>Station Location</InputLabel>
                    <Select
                      {...field}
                      label="Station Location"
                      value={field.value || ""}
                      onChange={(e) => handleSelectChange(field.onChange, e)}
                    >
                      <MenuItem value={0} disabled>
                        Select a station
                      </MenuItem>
                      {stationsList.map((station) => (
                        <MenuItem
                          key={station.stationId}
                          value={station.stationId}
                        >
                          {station.stationName}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.stationId && (
                      <Typography variant="caption" color="error">
                        {errors.stationId.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              <Box>
                <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                  Business Logo {mode === "edit" && "(Optional)"}
                </Typography>
                <Controller
                  name="logoUrl"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <label htmlFor="logoUrl-upload">
                        <input
                          type="file"
                          id="logoUrl-upload"
                          accept="image/*"
                          onChange={(e) => handleFileChange(field.onChange, e)}
                          style={{ display: "none" }}
                        />
                        <Button
                          variant="outlined"
                          component="span"
                          size="small"
                          sx={{ textTransform: "none" }}
                        >
                          Choose File
                        </Button>
                      </label>
                      {logoUrlPreview ? (
                        <Avatar
                          src={logoUrlPreview}
                          alt="Logo Preview"
                          sx={{ width: 56, height: 56 }}
                          variant="rounded"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          No file chosen
                        </Typography>
                      )}
                    </Box>
                  )}
                />
                {errors.logoUrl && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {errors.logoUrl.message}
                  </Typography>
                )}
              </Box>

              <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Business Address"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      size="small"
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Business Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { md: "1fr 1fr 1fr" },
                gap: 3,
                mb: 2,
              }}
            >
              <Controller
                name="preparationTimeMin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preparation Time (minutes)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.preparationTimeMin}
                    helperText={errors.preparationTimeMin?.message}
                    size="small"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : 0
                      )
                    }
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                )}
              />

              <Controller
                name="minOrderAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Minimum Order Amount (₹)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.minOrderAmount}
                    helperText={errors.minOrderAmount?.message}
                    size="small"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : 0
                      )
                    }
                    InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                  />
                )}
              />

              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Rating (0-5)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.rating}
                    helperText={errors.rating?.message}
                    size="small"
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : 0
                      )
                    }
                    InputProps={{ inputProps: { min: 0, max: 5, step: "0.1" } }}
                  />
                )}
              />

              <Box>
                <Controller
                  name="activeStatus"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Active Vendor"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Box>

              <Box>
                <Controller
                  name="veg"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Vegetarian Only"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              mt: 3,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ minWidth: 100 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || (mode === "edit" && !isDirty)}
              sx={{ minWidth: 100 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : mode === "add" ? (
                "Create Vendor"
              ) : (
                "Save Changes"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}