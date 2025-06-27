import  { FC, useEffect, useState, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format, startOfDay, endOfDay } from "date-fns";
import api from "@/utils/axios";

interface StationDTO {
  stationId: number;
  stationName: string;
  stationCode: string;
  city: string;
  state: string;
}

interface VendorDTO {
  vendorId: number;
  businessName: string;
}

interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

const OrdersExportDashboard: FC = () => {
  const { accessToken } = useAuth();
  const [stations, setStations] = useState<StationDTO[]>([]);
  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stations from /stations/all
  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken) throw new Error("No authentication token found");
      const response = await api.get<StationDTO[]>("/stations/all", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setStations(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch stations:", err);
      setError(err.response?.data?.message || "Failed to load stations");
      toast.error("Failed to load stations.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Fetch vendors based on selected station from /vendors/stations/{stationId}
  const fetchVendors = useCallback(async (stationId: string) => {
    if (!stationId) {
      setVendors([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (!accessToken) throw new Error("No authentication token found");
      const response = await api.get<PageResponse<VendorDTO>>(
        `/vendors/stations/${stationId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { page: 0, size: 1000 },
        }
      );
      setVendors(response.data.content || []);
    } catch (err: any) {
      console.error("Failed to fetch vendors:", err);
      setError(err.response?.data?.message || "Failed to load vendors");
      toast.error("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Handle Excel export
  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date must be after start date");
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (!accessToken) throw new Error("No authentication token found");
      const queryParams = new URLSearchParams();
      if (selectedStation) queryParams.append("stationId", selectedStation);
      if (selectedVendor) queryParams.append("vendorId", selectedVendor);
      queryParams.append("startDate", format(startOfDay(new Date(startDate)), "yyyy-MM-dd'T'HH:mm:ss"));
      queryParams.append("endDate", format(endOfDay(new Date(endDate)), "yyyy-MM-dd'T'HH:mm:ss"));

      const response = await api.get(`/admin/orders/export-excel?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: "blob",
      });

      // Trigger file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_export_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Orders exported successfully!");
    } catch (err: any) {
      console.error("Failed to export orders:", err);
      setError(err.response?.data?.message || "Failed to export orders. Please try again.");
      toast.error(err.response?.data?.message || "Failed to export orders.");
    } finally {
      setLoading(false);
    }
  };

  // Load stations on mount
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Fetch vendors when station changes
  useEffect(() => {
    fetchVendors(selectedStation);
  }, [selectedStation, fetchVendors]);

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      )}
      <Card className="w-full shadow-md border border-blue-100">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800">
            Orders Export Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">Filter Orders for Export</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="station" className="text-sm font-medium text-blue-700">
                  Select Station
                </Label>
                <Select
                  value={selectedStation}
                  onValueChange={(value) => {
                    setSelectedStation(value);
                    setSelectedVendor("");
                  }}
                >
                  <SelectTrigger
                    id="station"
                    className="mt-1 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <SelectValue placeholder="Select a station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.stationId} value={station.stationId.toString()}>
                        {station.stationName} ({station.stationCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vendor" className="text-sm font-medium text-blue-700">
                  Select Vendor
                </Label>
                <Select
                  value={selectedVendor}
                  onValueChange={setSelectedVendor}
                  disabled={!selectedStation}
                >
                  <SelectTrigger
                    id="vendor"
                    className="mt-1 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  >
                    <SelectValue placeholder="Select a vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.vendorId} value={vendor.vendorId.toString()}>
                        {vendor.businessName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-blue-700">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-sm font-medium text-blue-700">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500 h-10 w-full"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleExport}
                className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                disabled={loading}
                aria-label="Export orders to Excel"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export Excel
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-10">
            <h2 className="text-lg sm:text-xl font-semibold text-blue-600">Export Orders</h2>
            <p className="text-sm text-blue-500 mt-2">
              Select filters above and click "Export Excel" to download the orders report.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersExportDashboard;