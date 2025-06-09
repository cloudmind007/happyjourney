import React, { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MapPin, Upload, Edit, Trash2, Eye } from "lucide-react";

// Mock API utility
const api = {
  get: async (url: string) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      data: {
        stations: [
          {
            id: 1,
            station_name: "Mumbai Central",
            station_code: "MUM001",
            state_name: "Maharashtra",
            pin_code: "400008",
            latitude: 19.076,
            longitude: 72.8777,
            zoom_level: 10,
            status: "Published",
          },
          {
            id: 2,
            station_name: "Delhi Junction",
            station_code: "DEL001",
            state_name: "Delhi",
            pin_code: "110001",
            latitude: 28.6139,
            longitude: 77.209,
            zoom_level: 12,
            status: "Draft",
          },
        ],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: 2,
          from: 1,
          to: 2,
        },
      },
    };
  },
};

// Mock LoaderModal component
const LoaderModal = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-center">Loading...</p>
    </div>
  </div>
);

// Mock Pagination component
const Pagination = ({
  numOfPages,
  pageNo,
  handlePageClick,
  totalItems,
  from,
  to,
}: any) => (
  <div className="flex justify-between items-center">
    <div className="text-sm text-gray-700">
      Showing {from} to {to} of {totalItems} results
    </div>
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pageNo === 1}
        onClick={() => handlePageClick({ selected: pageNo - 2 })}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pageNo === numOfPages}
        onClick={() => handlePageClick({ selected: pageNo })}
      >
        Next
      </Button>
    </div>
  </div>
);

type LocationFormData = {
  stateName: string;
  stationName: string;
  stationCode: string;
  pinCode: string;
  latitude: number;
  longitude: number;
  zoomLevel: number;
  status: "Published" | "Draft";
};

const Station: FC = () => {
  const [listData, setListData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState({
    current_page: 1,
    to: 0,
    total: 0,
    from: 0,
    per_page: 10,
    remainingPages: 0,
    last_page: 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormData>({
    defaultValues: {
      latitude: 22.3569,
      longitude: 91.7832,
      zoomLevel: 10,
      status: "Published",
    },
  });

  const handlePageClick = (e: any) => {
    if (!loading) {
      setPage((prev) => ({ ...prev, current_page: e.selected + 1 }));
    }
  };

  const getData = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/stations?page=${page.current_page}&size=${page.per_page}`
      );
      setListData(res.data.stations);
      setPage((prev) => ({
        ...prev,
        ...res.data.pagination,
      }));
    } catch (error) {
      console.error("Error fetching stations:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LocationFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingStation) {
      // Update existing station
      setListData((prev) =>
        prev.map((station) =>
          station.id === editingStation.id
            ? {
                ...station,
                ...data,
                station_name: data.stationName,
                station_code: data.stationCode,
                state_name: data.stateName,
                pin_code: data.pinCode,
              }
            : station
        )
      );
    } else {
      // Add new station
      const newStation = {
        id: Date.now(),
        station_name: data.stationName,
        station_code: data.stationCode,
        state_name: data.stateName,
        pin_code: data.pinCode,
        latitude: data.latitude,
        longitude: data.longitude,
        zoom_level: data.zoomLevel,
        status: data.status,
      };
      setListData((prev) => [...prev, newStation]);
    }

    // Reset form and close modal
    reset();
    setIsModalOpen(false);
    setEditingStation(null);
  };

  const handleEdit = (station: any) => {
    setEditingStation(station);
    setValue("stateName", station.state_name);
    setValue("stationName", station.station_name);
    setValue("stationCode", station.station_code);
    setValue("pinCode", station.pin_code);
    setValue("latitude", station.latitude);
    setValue("longitude", station.longitude);
    setValue("zoomLevel", station.zoom_level);
    setValue("status", station.status);
    setIsModalOpen(true);
  };

  const handleDelete = (stationId: number) => {
    if (confirm("Are you sure you want to delete this station?")) {
      setListData((prev) => prev.filter((station) => station.id !== stationId));
    }
  };

  const handleStatusChange = (value: string) => {
    setValue("status", value as "Published" | "Draft");
  };

  const handleAddNew = () => {
    setEditingStation(null);
    reset();
    setIsModalOpen(true);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPage((prev) => ({ ...prev, per_page: parseInt(e.target.value) }));
  };

  useEffect(() => {
    getData();
  }, [page.current_page, page.per_page]);

  const filteredData = listData.filter(
    (station) =>
      station.station_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.state_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.station_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {loading ? (
        <LoaderModal />
      ) : (
        <div className="h-full w-full">
          <div className="h-16 flex justify-between items-center bg-white px-4">
            <div className="">
              <div className="flex gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-1 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                    <Search className="size-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="searchQuery"
                    className="max-w-md p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-3xl outline-none"
                    placeholder="Search stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <select
                    value={page.per_page}
                    onChange={handleSelectChange}
                    className="border border-gray-300 rounded-lg px-4 py-2 ml-3"
                  >
                    <option value={10}>10 Records Per Page</option>
                    <option value={25}>25 Records Per Page</option>
                    <option value={50}>50 Records Per Page</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <div className="flex gap-2">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <div
                      onClick={handleAddNew}
                      className="flex justify-center items-center py-1.5 px-3 gap-2 bg-[#6672fe] text-white rounded-lg font-light shadow-lg cursor-pointer"
                    >
                      <Plus />
                      Add Station
                    </div>
                  </DialogTrigger>

                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {editingStation ? "Edit Station" : "Add New Station"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingStation
                          ? "Update the station details below."
                          : "Fill in the details below to add a new station location to your network."}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form Fields */}
                        <div className="lg:col-span-2 space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Basic Information
                              </CardTitle>
                              <CardDescription>
                                Enter the basic details for the station location
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="stateName">State Name</Label>
                                <Input
                                  id="stateName"
                                  {...register("stateName", {
                                    required: "State name is required",
                                    minLength: {
                                      value: 2,
                                      message:
                                        "State name must be at least 2 characters",
                                    },
                                  })}
                                  placeholder="Enter State Name"
                                  className={
                                    errors.stateName ? "border-red-500" : ""
                                  }
                                />
                                {errors.stateName && (
                                  <p className="text-sm text-red-500">
                                    {errors.stateName.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="stationName">
                                  Station Name
                                </Label>
                                <Input
                                  id="stationName"
                                  {...register("stationName", {
                                    required: "Station name is required",
                                    minLength: {
                                      value: 3,
                                      message:
                                        "Station name must be at least 3 characters",
                                    },
                                  })}
                                  placeholder="Enter Station Name"
                                  className={
                                    errors.stationName ? "border-red-500" : ""
                                  }
                                />
                                {errors.stationName && (
                                  <p className="text-sm text-red-500">
                                    {errors.stationName.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="stationCode">
                                  Station Code
                                </Label>
                                <Input
                                  id="stationCode"
                                  {...register("stationCode", {
                                    required: "Station code is required",
                                    pattern: {
                                      value: /^[A-Z]{3}[0-9]{3}$/,
                                      message:
                                        "Code must be 3 letters followed by 3 numbers (e.g., ABC123)",
                                    },
                                  })}
                                  placeholder="e.g., MUM001"
                                  className={
                                    errors.stationCode ? "border-red-500" : ""
                                  }
                                />
                                {errors.stationCode && (
                                  <p className="text-sm text-red-500">
                                    {errors.stationCode.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="pinCode">Pin Code</Label>
                                <Input
                                  id="pinCode"
                                  {...register("pinCode", {
                                    required: "Pin code is required",
                                    pattern: {
                                      value: /^[0-9]{6}$/,
                                      message:
                                        "Pin code must be exactly 6 digits",
                                    },
                                  })}
                                  placeholder="Enter 6-digit Pin Code"
                                  className={
                                    errors.pinCode ? "border-red-500" : ""
                                  }
                                />
                                {errors.pinCode && (
                                  <p className="text-sm text-red-500">
                                    {errors.pinCode.message}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Geographic Coordinates
                              </CardTitle>
                              <CardDescription>
                                Specify the exact location and map settings
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                  id="latitude"
                                  type="number"
                                  step="any"
                                  {...register("latitude", {
                                    required: "Latitude is required",
                                    min: {
                                      value: -90,
                                      message:
                                        "Latitude must be between -90 and 90",
                                    },
                                    max: {
                                      value: 90,
                                      message:
                                        "Latitude must be between -90 and 90",
                                    },
                                  })}
                                  className={
                                    errors.latitude ? "border-red-500" : ""
                                  }
                                />
                                {errors.latitude && (
                                  <p className="text-sm text-red-500">
                                    {errors.latitude.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                  id="longitude"
                                  type="number"
                                  step="any"
                                  {...register("longitude", {
                                    required: "Longitude is required",
                                    min: {
                                      value: -180,
                                      message:
                                        "Longitude must be between -180 and 180",
                                    },
                                    max: {
                                      value: 180,
                                      message:
                                        "Longitude must be between -180 and 180",
                                    },
                                  })}
                                  className={
                                    errors.longitude ? "border-red-500" : ""
                                  }
                                />
                                {errors.longitude && (
                                  <p className="text-sm text-red-500">
                                    {errors.longitude.message}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="zoomLevel">
                                  Map Zoom Level
                                </Label>
                                <Input
                                  id="zoomLevel"
                                  type="number"
                                  {...register("zoomLevel", {
                                    required: "Zoom level is required",
                                    min: {
                                      value: 1,
                                      message:
                                        "Zoom level must be between 1 and 20",
                                    },
                                    max: {
                                      value: 20,
                                      message:
                                        "Zoom level must be between 1 and 20",
                                    },
                                  })}
                                  placeholder="1-20"
                                  className={
                                    errors.zoomLevel ? "border-red-500" : ""
                                  }
                                />
                                {errors.zoomLevel && (
                                  <p className="text-sm text-red-500">
                                    {errors.zoomLevel.message}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <Select
                                onValueChange={handleStatusChange}
                                defaultValue="Published"
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Published">
                                    Published
                                  </SelectItem>
                                  <SelectItem value="Draft">Draft</SelectItem>
                                </SelectContent>
                              </Select>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">
                                Station Image
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                  Click to upload image
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  PNG, JPG up to 10MB
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        className="min-w-[100px]"
                      >
                        {isSubmitting
                          ? "Saving..."
                          : editingStation
                          ? "Update Station"
                          : "Save Station"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3">
            {filteredData.length > 0 ? (
              <div className="p-4 bg-white">
                <table className="min-w-full border-separate">
                  <thead className="w-full">
                    <tr className="rounded-md w-full text-center py-4">
                      <th className="px-2 text-sm py-3 font-medium text-black">
                        Sr. No.
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Station Name
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        State
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Station Code
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Pin Code
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Coordinates
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Zoom Level
                      </th>
                      <th className="px-2 text-sm py-3 font-medium text-black tracking-wider">
                        Status
                      </th>
                      <th className="px-2 text-sm py-3 text-center font-medium text-black tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item: any, index) => (
                      <tr
                        key={item.id}
                        className="text-center bg-white shadow-md text-sm"
                      >
                        <td className="px-2 py-4 font-medium text-black rounded-tl-lg rounded-bl-lg">
                          {(page.current_page - 1) * page.per_page + index + 1}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.station_name}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.state_name}
                        </td>
                        <td className="px-2 py-4 font-medium text-black font-mono">
                          {item.station_code}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.pin_code}
                        </td>
                        <td className="px-2 py-4 font-medium text-black font-mono text-xs">
                          {item.latitude.toFixed(4)},{" "}
                          {item.longitude.toFixed(4)}
                        </td>
                        <td className="px-2 py-4 font-medium text-black">
                          {item.zoom_level}x
                        </td>
                        <td className="text-center px-2 py-1 font-medium text-black">
                          <Badge
                            variant={
                              item.status === "Published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-2 py-4 font-medium rounded-tr-lg rounded-br-lg">
                          <div className="flex gap-2 justify-center items-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                              className="p-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                console.log("View station:", item.id)
                              }
                              className="p-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
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
                <div className="w-full mt-4">
                  <Pagination
                    numOfPages={page.last_page}
                    pageNo={page.current_page}
                    pageSize={page.per_page}
                    handlePageClick={handlePageClick}
                    totalItems={page.total}
                    from={page.from}
                    to={page.to}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center mt-12">
                <h2 className="text-xl font-semibold mb-4">
                  No Stations Found
                </h2>
                <p className="text-gray-600 mb-4">
                  Get started by adding your first station
                </p>
                <Button
                  onClick={handleAddNew}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Station
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Station;
