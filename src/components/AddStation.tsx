import React, { useState } from "react";
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
import { MapPin, Plus, Upload } from "lucide-react";

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

const LocationFormModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stations, setStations] = useState<LocationFormData[]>([
    {
      stateName: "West Bengal",
      stationName: "Chittagong Station",
      stationCode: "CTG001",
      pinCode: "400001",
      latitude: 22.3569,
      longitude: 91.7832,
      zoomLevel: 12,
      status: "Published",
    },
    {
      stateName: "Maharashtra",
      stationName: "Mumbai Central",
      stationCode: "MUM001",
      pinCode: "400008",
      latitude: 19.076,
      longitude: 72.8777,
      zoomLevel: 10,
      status: "Draft",
    },
  ]);

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

  const onSubmit = async (data: LocationFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setStations((prev) => [...prev, data]);
    console.log("Form Submitted:", data);

    // Reset form and close modal
    reset();
    setIsOpen(false);
  };

  const handleStatusChange = (value: string) => {
    setValue("status", value as "Published" | "Draft");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Station Locations</h1>
          <p className="text-gray-600 mt-1">
            Manage your station locations and configurations
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Station
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Add New Location
              </DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new station location to your
                network.
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
                          className={errors.stateName ? "border-red-500" : ""}
                        />
                        {errors.stateName && (
                          <p className="text-sm text-red-500">
                            {errors.stateName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stationName">Station Name</Label>
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
                          className={errors.stationName ? "border-red-500" : ""}
                        />
                        {errors.stationName && (
                          <p className="text-sm text-red-500">
                            {errors.stationName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stationCode">Station Code</Label>
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
                          className={errors.stationCode ? "border-red-500" : ""}
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
                              message: "Pin code must be exactly 6 digits",
                            },
                          })}
                          placeholder="Enter 6-digit Pin Code"
                          className={errors.pinCode ? "border-red-500" : ""}
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
                              message: "Latitude must be between -90 and 90",
                            },
                            max: {
                              value: 90,
                              message: "Latitude must be between -90 and 90",
                            },
                          })}
                          className={errors.latitude ? "border-red-500" : ""}
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
                              message: "Longitude must be between -180 and 180",
                            },
                            max: {
                              value: 180,
                              message: "Longitude must be between -180 and 180",
                            },
                          })}
                          className={errors.longitude ? "border-red-500" : ""}
                        />
                        {errors.longitude && (
                          <p className="text-sm text-red-500">
                            {errors.longitude.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zoomLevel">Map Zoom Level</Label>
                        <Input
                          id="zoomLevel"
                          type="number"
                          {...register("zoomLevel", {
                            required: "Zoom level is required",
                            min: {
                              value: 1,
                              message: "Zoom level must be between 1 and 20",
                            },
                            max: {
                              value: 20,
                              message: "Zoom level must be between 1 and 20",
                            },
                          })}
                          placeholder="1-20"
                          className={errors.zoomLevel ? "border-red-500" : ""}
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
                          <SelectItem value="Published">Published</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Station Image</CardTitle>
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

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? "Saving..." : "Save Station"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Stations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations.map((station, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {station.stationName}
                  </CardTitle>
                  <CardDescription>{station.stateName}</CardDescription>
                </div>
                <Badge
                  variant={
                    station.status === "Published" ? "default" : "secondary"
                  }
                >
                  {station.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-mono">{station.stationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pin Code:</span>
                  <span>{station.pinCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coordinates:</span>
                  <span className="font-mono text-xs">
                    {station.latitude.toFixed(4)},{" "}
                    {station.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zoom:</span>
                  <span>{station.zoomLevel}x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocationFormModal;
