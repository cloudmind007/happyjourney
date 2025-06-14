import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Star, Clock, Sprout, Drumstick } from "lucide-react";
import api from "@/utils/axios";
import LoaderModal from "@/components/LoaderModal";
import Pagination from "@/components/Pagination";

// Define interfaces
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

interface PaginationData {
  current_page: number;
  to: number;
  total: number;
  from: number;
  per_page: number;
  remainingPages: number;
  last_page: number;
}

const OrderFood = () => {
  const [searchType, setSearchType] = useState<"stationCode" | "city">("city");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [stations, setStations] = useState<Station[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<PaginationData>({
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
        const res = await api.get<{ data: Station[] }>("/api/stations/all");
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

  // Fetch vendors when searchQuery or page changes
  const fetchVendors = async (stationId: number, pageNumber = 1, pageSize = 10) => {
    if (!stationId) return;
    setLoading(true);
    try {
      const res = await api.get<{
        content: Vendor[];
        pageable: { offset: number; pageSize: number };
        numberOfElements: number;
        totalElements: number;
        totalPages: number;
      }>(`/vendors/stations/${stationId}?page=${pageNumber - 1}&size=${pageSize}`);
      
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

  // Handle search
  const handleSearch = () => {
    const station = stations.find((s: Station) =>
      searchType === "stationCode"
        ? s.stationCode.toLowerCase() === searchQuery.toLowerCase()
        : s.stationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (station) {
      setPage((prev) => ({ ...prev, current_page: 1 }));
      fetchVendors(station.stationId, 1, page.per_page);
    } else {
      setVendors([]);
    }
  };

  // Handle pagination
  const handlePageClick = (e: { selected: number }) => {
    if (!loading) {
      const newPage = e.selected + 1;
      if (newPage !== page.current_page) {
        setPage((prev) => ({ ...prev, current_page: newPage }));
        const station = stations.find((s: Station) =>
          searchType === "stationCode"
            ? s.stationCode.toLowerCase() === searchQuery.toLowerCase()
            : s.stationName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (station) {
          fetchVendors(station.stationId, newPage, page.per_page);
        }
      }
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPage((prev) => ({ ...prev, per_page: newSize, current_page: 1 }));
    const station = stations.find((s: Station) =>
      searchType === "stationCode"
        ? s.stationCode.toLowerCase() === searchQuery.toLowerCase()
        : s.stationName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (station) {
      fetchVendors(station.stationId, 1, newSize);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <button className="md:hidden">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Orders</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hi, undefined</span>
            <div className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center rounded-full">U</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-2/3 flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setSearchType("stationCode")}
                className={`px-4 py-2 rounded-full text-sm ${searchType === "stationCode" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Station Code
              </Button>
              <Button
                onClick={() => setSearchType("city")}
                className={`px-4 py-2 rounded-full text-sm ${searchType === "city" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                City
              </Button>
            </div>
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Enter ${searchType === "stationCode" ? "Station Code" : "City"}`}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
              <Button onClick={handleSearch} className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white hover:bg-blue-700 rounded-full px-4 py-1 text-sm">
                Search
              </Button>
            </div>
          </div>
          <div className="w-full sm:w-1/3 flex justify-center sm:justify-end">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop"
              alt="Food Banner"
              className="w-full max-w-xs h-24 sm:h-32 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>

        {/* Vendor Cards */}
        {vendors.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-end mb-4">
              <select
                value={page.per_page}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-600"
              >
                <option value={10}>10 Records</option>
                <option value={25}>25 Records</option>
                <option value={50}>50 Records</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor: Vendor) => (
                <Card
                  key={vendor.vendorId}
                  className="shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/vendor-detail/${vendor.vendorId}`)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    {vendor.logoUrl ? (
                      <img
                        src={vendor.logoUrl}
                        alt="Vendor Logo"
                        className="w-16 h-16 object-cover rounded-full border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Logo</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{vendor.businessName}</h3>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          {vendor.veg ? (
                            <Sprout className="w-4 h-4 text-green-600" />
                          ) : (
                            <Drumstick className="w-4 h-4 text-red-600" />
                          )}
                          {vendor.veg ? "Veg" : "Non-Veg"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          Prep: {vendor.preparationTimeMin} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {vendor.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="w-full mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing {page.from} to {page.to} of {page.total} results
              </p>
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
        )}

        {searchQuery && vendors.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center mt-12">
            <h2 className="text-lg font-semibold text-gray-700">No Vendors Found</h2>
            <p className="text-sm text-gray-500 mt-2">
              Try a different {searchType === "stationCode" ? "station code" : "city"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFood;