import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Star, Clock, Sprout, Drumstick } from "lucide-react";
import api from "@/utils/axios";
import Pagination from "@/components/Pagination";

// Define interfaces
interface Station {
  stationId: number;
  stationCode: string;
  stationName: string;
}

interface Category {
  categoryId: number;
  vendorId: number;
  categoryName: string;
  displayOrder: number;
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
  categories?: Category[];
  minOrderAmount?: number;
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
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  // Fetch image for vendor logo
  const fetchImage = async (logoUrl: string) => {
    if (!logoUrl || imageUrls[logoUrl]) return;

    try {
      const response = await api.get(
        `/files/download?systemFileName=${logoUrl}`,
        { responseType: "blob" }
      );
      if (response.status === 200) {
        const blob = response.data;
        const url = URL.createObjectURL(blob);
        setImageUrls((prev) => ({ ...prev, [logoUrl]: url }));
      }
    } catch (error) {
      setImageUrls((prev) => ({
        ...prev,
        [logoUrl]: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=150&auto=format&fit=crop",
      }));
    }
  };

  // Debounce function
  const debounce = <F extends (...args: any[]) => void>(func: F, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Fetch stations
  const fetchStations = useCallback(
    async (query: string, type: "stationCode" | "city") => {
      if (!query.trim()) {
        setStations([]);
        setVendors([]);
        return;
      }

      setLoading(true);
      try {
        const params = type === "stationCode" ? { stationCode: query } : { city: query };
        const res = await api.get<Station[]>("/stations/all", { params });
        if (Array.isArray(res.data)) {
          setStations(res.data);
          if (res.data.length > 0) {
            setPage((prev) => ({ ...prev, current_page: 1 }));
            fetchVendors(res.data[0].stationId, 1, page.per_page);
          }
        }
      } catch (err) {
        console.error("Error fetching stations", err);
        setStations([]);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    },
    [page.per_page]
  );

  const debouncedFetchStations = useCallback(
    debounce((query: string, type: "stationCode" | "city") => {
      fetchStations(query, type);
    }, 500),
    [fetchStations]
  );

  // Fetch vendors with proper category handling
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

      const vendorsData = res.data.content || [];
      
      // Fetch images and categories
      const vendorsWithData = await Promise.all(
        vendorsData.map(async (vendor) => {
          // Fetch logo
          if (vendor.logoUrl) {
            await fetchImage(vendor.logoUrl);
          }
          
          // Fetch categories
          try {
            const categoriesRes = await api.get<{
              content: Category[];
            }>(`/menu/vendors/${vendor.vendorId}/categories`);
            return { 
              ...vendor, 
              categories: categoriesRes.data.content || [] 
            };
          } catch (error) {
            console.error(`Failed to fetch categories for vendor ${vendor.vendorId}:`, error);
            return { ...vendor, categories: [] };
          }
        })
      );

      setVendors(vendorsWithData);
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

  // Event handlers
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedFetchStations(query, searchType);
  };

  const handlePageClick = (e: { selected: number }) => {
    if (!loading) {
      const newPage = e.selected + 1;
      if (newPage !== page.current_page && stations.length > 0) {
        setPage((prev) => ({ ...prev, current_page: newPage }));
        fetchVendors(stations[0].stationId, newPage, page.per_page);
      }
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPage((prev) => ({ ...prev, per_page: newSize, current_page: 1 }));
    if (stations.length > 0) {
      fetchVendors(stations[0].stationId, 1, newSize);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => {
        if (!url.includes("unsplash.com")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imageUrls]);

  // Render star rating
  // Render star rating with half-star support
const renderStarRating = (rating: number) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="w-3 h-3 fill-yellow-500 text-yellow-500" />
      ))}
      {hasHalfStar && (
        <div className="relative w-3 h-3">
          <Star className="absolute w-3 h-3 fill-gray-300 text-gray-300" />
          <Star className="absolute w-3 h-3 fill-yellow-500 text-yellow-500" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-3 h-3 fill-gray-300 text-gray-300" />
      ))}
    </div>
  );
};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-6">
        {/* Header */}
  

        {/* Search Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-2/3 flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setSearchType("stationCode")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  searchType === "stationCode" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                Station Code
              </Button>
              <Button
                onClick={() => setSearchType("city")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  searchType === "city" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                City
              </Button>
            </div>
            <div className="relative w-full max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder={`Enter ${searchType === "stationCode" ? "Station Code" : "City"}`}
                className="w-full pl-10 py-2 text-sm border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
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
                className="border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-600 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={10}>10 Records</option>
                <option value={25}>25 Records</option>
                <option value={50}>50 Records</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <div
                  key={vendor.vendorId}
                  className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-100 ${
                    vendor.veg ? "border-b-2 border-b-green-500" : "border-b-2 border-b-red-500"
                  }`}
                  onClick={() => navigate(`/vendor-detail/${vendor.vendorId}`)}
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-1/3 h-32 sm:h-auto">
                      {vendor.logoUrl && imageUrls[vendor.logoUrl] ? (
                        <img
                          src={imageUrls[vendor.logoUrl]}
                          className="w-full h-full object-cover"
                          alt="Vendor Logo"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-2/3 p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                            {vendor.businessName}
                          </h3>
                          <div className="flex items-center gap-1 bg-white px-1 py-0.5 rounded">
                            {vendor.veg ? (
                              <Sprout className="w-4 h-4 text-green-500" />
                            ) : (
                              <Drumstick className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs font-medium text-gray-800">
                              {vendor.veg ? "Veg" : "Non-Veg"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                          {vendor.description}
                        </p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">FSSAI:</span> {vendor.fssaiLicense}
                          </div>
                          <div className="flex items-center gap-1">
  <span className="font-medium">Rating:</span>
  {renderStarRating(vendor.rating || 0)}
</div>
                          <div>
                            <Clock className="w-3 h-3 text-gray-500 inline mr-1" />
                            {vendor.preparationTimeMin || 0} min
                          </div>
                          <div>
                            <span className="font-medium">Min Order:</span> ₹{vendor.minOrderAmount || 0}
                          </div>
                          <div className="col-span-2">
                            <span className="font-medium">Cuisines:</span>{" "}
                            {vendor.categories?.length ? 
                              vendor.categories.map(c => c.categoryName).join(", ") : 
                              "No cuisines available"}
                          </div>
                        </div>
                      </div>
                      <Button
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-1 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vendor-detail/${vendor.vendorId}`);
                        }}
                      >
                        View Menu
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full mt-6 flex flex-col items-center gap-4">
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