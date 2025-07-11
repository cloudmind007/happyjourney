import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/utils/axios";
import RestaurantDetail from "./RestaurantDetail";

interface VendorDetails {
  vendorId: number;
  businessName: string;
  userId: number;
}

const VendorHome: React.FC = () => {
  const { userId, vendorId, setVendorId } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID not found");
      setLoading(false);
      return;
    }

    if (vendorId) {
      // Skip fetching if vendorId is already in context
      setLoading(false);
      return;
    }

    const fetchVendorDetails = async () => {
      try {
        const response = await api.get<VendorDetails>(`/vendors/user-vendor/${userId}`);
        const newVendorId = response.data.vendorId;
        setVendorId(newVendorId); // Update context
        localStorage.setItem("vendorId", String(newVendorId)); // Persist to localStorage
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch vendor details:", err);
        setError("Unable to load vendor details");
        setLoading(false);
      }
    };

    fetchVendorDetails();
  }, [userId, vendorId, setVendorId]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!vendorId) return <div className="p-4 text-center">Vendor ID not available</div>;

  return <RestaurantDetail vendorId={vendorId} isViewOnly={true} />;
};

export default VendorHome;