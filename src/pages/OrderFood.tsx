import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star } from "lucide-react";
import api from "@/utils/axios";
import LoaderModal from "@/components/LoaderModal";
import Pagination from "@/components/Pagination";

interface Station {
  stationId: number;
  stationCode: string;
  stationName: string;
}

interface Vendor {
  vendorId: number;
  businessName: string;
  description: string;
  fssaiLicense: string;
  activeStatus: boolean;
  logoUrl?: string;
  veg: boolean;
  preparationTimeMin: number;
  rating: number;
  address: string;
}

const OrderFood = () => {
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [stations, setStations] = useState<Station[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState({
    current_page: 1,
    to: 0,
    total: 0,
    from: 0,
    per_page: 10,
    remainingPages: 0,
    last_page: 0,
  });
  const navigate = useNavigate();

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/stations/all");
        if (Array.isArray(res.data)) {
          setStations(res.data);
        } else {
          console.error("Unexpected station response:", res.data);
        }
      } catch (err) {
        console.error("Error fetching stations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  // Fetch vendors when station is selected or page/per_page changes
  const fetchVendors = async (stationId: string, pageNumber = 1, pageSize = 10) => {
    if (!stationId) return;
    setLoading(true);
    try {
      const res = await api.get(`/vendors/stations/${stationId}?page=${pageNumber - 1}&size=${pageSize}`);
      setVendors(res.data.content || []);
      const { pageable, numberOfElements, totalElements, totalPages } = res.data;
      setPage({
        current_page: pageNumber,
        from: pageable.offset + 1,
        to: pageable.offset + numberOfElements,
        total: totalElements,
        per_page: pageable.pageSize,
        remainingPages: totalPages - pageNumber,
        last_page: totalPages,
      });
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle station selection
  const handleStationChange = (value: string) => {
    setSelectedStation(value);
    setPage((prev) => ({ ...prev, current_page: 1 }));
    if (value) {
      fetchVendors(value, 1, page.per_page);
    } else {
      setVendors([]);
    }
  };

  // Handle pagination
  const handlePageClick = (e: any) => {
    if (!loading) {
      const newPage = e.selected + 1;
      if (newPage !== page.current_page) {
        setPage((prev) => ({ ...prev, current_page: newPage }));
        fetchVendors(selectedStation, newPage, page.per_page);
      }
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    if (newSize !== page.per_page) {
      setPage((prev) => ({ ...prev, per_page: newSize, current_page: 1 }));
      fetchVendors(selectedStation, 1, newSize);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-white">
      {loading && <LoaderModal />}
      <div className="w-full max-w-5xl mt-10 px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div className="w-full sm:w-1/2 flex flex-col items-center sm:items-start space-y-4">
            <Label htmlFor="station" className="text-lg font-medium">
              Select Station Name
            </Label>
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="size-5 text-gray-400" />
              </div>
              <Select onValueChange={handleStationChange} value={selectedStation}>
                <SelectTrigger className="w-full pl-10 pr-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select Station Name" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {stations.map((station) => (
                    <SelectItem
                      key={station.stationId}
                      value={station.stationId.toString()}
                      className="px-4 py-2 text-sm text-gray-900 hover:bg-blue-50 cursor-pointer"
                    >
                      {station.stationName} ({station.stationCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="w-full sm:w-1/2 flex justify-center sm:justify-end">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop"
              alt="Food Banner"
              className="w-full max-w-xs h-32 object-cover rounded-lg"
            />
          </div>
        </div>

        {selectedStation && vendors.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-end mb-4">
              <select
                value={page.per_page}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value={10}>10 Records Per Page</option>
                <option value={25}>25 Records Per Page</option>
                <option value={50}>50 Records Per Page</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card key={vendor.vendorId} className="shadow-lg rounded-lg overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {vendor.logoUrl ? (
                        <img
                          src={vendor.logoUrl}
                          alt="Vendor Logo"
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm">No Logo</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {vendor.businessName}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{vendor.address}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                          <span
                            className={`px-2 py-1 rounded-md ${
                              vendor.veg ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {vendor.veg ? "Veg" : "Non-Veg"}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded-md">
                            Prep: {vendor.preparationTimeMin} min
                          </span>
                          <span className="flex items-center px-2 py-1 bg-yellow-100 rounded-md">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            {vendor.rating.toFixed(1)}
                          </span>
                        </div>
                        <Button
                          onClick={() => navigate(`/vender-detail/${vendor.vendorId}`)}
                          className="mt-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-4 py-2"
                        >
                          Order Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="w-full mt-6 flex flex-col items-center">
              <Pagination
                numOfPages={page.last_page}
                pageNo={page.current_page}
                pageSize={page.per_page}
                handlePageClick={handlePageClick}
                totalItems={page.total}
                from={page.from}
                to={page.to}
              />
              <p className="text-sm text-gray-600 mt-2">
                Showing {page.from} to {page.to} of {page.total} results
              </p>
            </div>
          </div>
        )}

        {selectedStation && vendors.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center mt-12">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">No Vendors Found</h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFood;