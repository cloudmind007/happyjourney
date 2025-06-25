import { FC, useEffect, useState, useCallback } from "react";
import axios from "../utils/axios"; // Ensure axios is configured with baseURL
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Select, { OptionsType, SingleValue } from "react-select";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Interfaces based on StationDTO and VendorDTO from backend
interface Station {
  id: number;
  stationName: string;
  stationCode: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

interface Vendor {
  id: number;
  name: string;
}

// Type for react-select options
interface SelectOption<T> {
  value: T;
  label: string;
}

const OrdersExportDashboard: FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch stations from /api/stations/all
  const fetchStations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwt"); // Adjust key based on your app
      if (!token) throw new Error("No authentication token found");

      const res = await axios.get("/api/stations/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStations(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Failed to fetch stations:", err);
      setError(err.response?.data?.message || "Failed to load stations");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch vendors based on selected station from /api/vendors/stations/{stationId}
  const fetchVendors = useCallback(async (stationId: number) => {
    if (!stationId) {
      setVendors([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");

      const res = await axios.get(`/api/vendors/stations/${stationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 0, size: 1000 },
      });
      setVendors(Array.isArray(res.data.content) ? res.data.content : []);
    } catch (err: any) {
      console.error("Failed to fetch vendors:", err);
      setError(err.response?.data?.message || "Failed to load vendors");
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle station selection
  const handleStationChange = (selectedOption: SingleValue<SelectOption<Station>>) => {
    const station = selectedOption ? selectedOption.value : null;
    setSelectedStation(station);
    setSelectedVendor(null); // Reset vendor when station changes
    setVendors([]); // Clear vendors
    if (station) {
      fetchVendors(station.id);
    }
  };

  // Handle vendor selection
  const handleVendorChange = (selectedOption: SingleValue<SelectOption<Vendor>>) => {
    setSelectedVendor(selectedOption ? selectedOption.value : null);
  };

  // Handle Excel export
  const handleExport = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    if (endDate < startDate) {
      setError("End date must be after start date");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("jwt");
      if (!token) throw new Error("No authentication token found");

      const queryParams = new URLSearchParams();
      if (selectedStation) queryParams.append("stationId", selectedStation.id.toString());
      if (selectedVendor) queryParams.append("vendorId", selectedVendor.id.toString());
      queryParams.append("startDate", format(startDate, "yyyy-MM-dd"));
      queryParams.append("endDate", format(endDate, "yyyy-MM-dd"));

      const res = await axios.get(`/api/admin/orders/export-excel?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      // Trigger file download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders_export_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Failed to export orders:", err);
      setError(err.response?.data?.message || "Failed to export orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load stations on mount
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Station and vendor options for react-select
  const stationOptions: OptionsType<SelectOption<Station>> = stations.map((station) => ({
    value: station,
    label: `${station.stationName} (${station.stationCode})`,
  }));

  const vendorOptions: OptionsType<SelectOption<Vendor>> = vendors.map((vendor) => ({
    value: vendor,
    label: vendor.name,
  }));

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      )}
      <Card className="w-full shadow-md border border-blue-100">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800">Orders Export Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
            <div className="flex-1 sm:max-w-[250px]">
              <Select
                options={stationOptions}
                value={stationOptions.find((option: SelectOption<Station>) => option.value.id === selectedStation?.id) || null}
                onChange={handleStationChange}
                placeholder="Select Station"
                className="w-full text-sm"
                classNamePrefix="select"
                isClearable
                aria-label="Select station"
              />
            </div>
            <div className="flex-1 sm:max-w-[250px]">
              <Select
                options={vendorOptions}
                value={vendorOptions.find((option: { value: Vendor; label: string }) => option.value.id === selectedVendor?.id) || null}
                onChange={handleVendorChange}
                placeholder="Select Vendor"
                className="w-full text-sm"
                classNamePrefix="select"
                isClearable
                isDisabled={!selectedStation}
                aria-label="Select vendor"
              />
            </div>
            <div className="flex-1 sm:max-w-[200px]">
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                placeholderText="Start Date"
                className="w-full text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-md px-3 py-2"
                dateFormat="yyyy-MM-dd"
                aria-label="Select start date"
              />
            </div>
            <div className="flex-1 sm:max-w-[200px]">
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                placeholderText="End Date"
                className="w-full text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500 rounded-md px-3 py-2"
                dateFormat="yyyy-MM-dd"
                aria-label="Select end date"
              />
            </div>
            <Button
              onClick={handleExport}
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              disabled={loading}
              aria-label="Export orders to Excel"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </Button>
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