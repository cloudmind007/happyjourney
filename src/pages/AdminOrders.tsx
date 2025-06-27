import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaRupeeSign,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdPayment, MdFastfood } from "react-icons/md";
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  CreditCard,
  Wallet,
  Truck,
  ChefHat,
} from "lucide-react";
import api from "@/utils/axios";
import { useAuth } from "@/contexts/AuthContext";
// import { motion, AnimatePresence } from "framer-motion";
// import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format, startOfDay, endOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface OrderItemDTO {
  itemId: number;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  specialInstructions: string | null;
  category?: string;
  imageUrl?: string | null;
}

interface OrderDTO {
  orderId: number;
  customerId: number;
  vendorId: number;
  trainId: number;
  pnrNumber: string;
  coachNumber: string;
  seatNumber: string;
  deliveryStationId: number;
  deliveryTime: string;
  orderStatus: "PLACED" | "PENDING" | "PREPARING" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryCharges: number;
  taxAmount: number;
  taxPercentage?: number;
  discountAmount: number | null;
  finalAmount: number;
  paymentStatus: "PENDING" | "CAPTURED" | "COMPLETED" | "FAILED" | "PROCESSING";
  paymentMethod: "COD" | "UPI" | "CARD" | "NETBANKING";
  razorpayOrderID: string | null;
  deliveryInstructions: string | null;
  items: OrderItemDTO[];
  vendorName?: string;
  trainNumber?: string;
}

interface StationDTO {
  stationId: number;
  stationName: string;
  stationCode: string;
  city: string;
  state: string;
}

interface MenuItemDTO {
  itemId: number;
  itemName: string;
  description: string;
  category: string;
  imageUrl: string | null;
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

const statusConfig = {
  PLACED: {
    color: "bg-amber-50 text-amber-800",
    icon: <Clock className="w-4 h-4" />,
    label: "Order Placed",
  },
  PENDING: {
    color: "bg-amber-50 text-amber-800",
    icon: <Clock className="w-4 h-4" />,
    label: "Pending Confirmation",
  },
  PREPARING: {
    color: "bg-blue-50 text-blue-800",
    icon: <ChefHat className="w-4 h-4" />,
    label: "Preparing Your Meal",
  },
  DISPATCHED: {
    color: "bg-indigo-50 text-indigo-800",
    icon: <Truck className="w-4 h-4" />,
    label: "Dispatched",
  },
  DELIVERED: {
    color: "bg-green-50 text-green-800",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Delivered Successfully",
  },
  CANCELLED: {
    color: "bg-red-50 text-red-800",
    icon: <XCircle className="w-4 h-4" />,
    label: "Order Cancelled",
  },
};

const paymentConfig = {
  PENDING: {
    color: "bg-amber-50 text-amber-800",
    icon: <Clock className="w-4 h-4" />,
    label: "Payment Pending",
  },
  CAPTURED: {
    color: "bg-blue-50 text-blue-800",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Payment Captured",
  },
  COMPLETED: {
    color: "bg-green-50 text-green-800",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Payment Completed",
  },
  FAILED: {
    color: "bg-red-50 text-red-800",
    icon: <XCircle className="w-4 h-4" />,
    label: "Payment Failed",
  },
  PROCESSING: {
    color: "bg-gray-50 text-gray-800",
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: "Payment Processing",
  },
};

const paymentMethodConfig = {
  COD: {
    color: "text-red-600",
    icon: <Wallet className="w-5 h-5" />,
    label: "Cash on Delivery",
  },
  UPI: {
    color: "text-blue-600",
    icon: <MdPayment className="w-5 h-5" />,
    label: "UPI Payment",
  },
  CARD: {
    color: "text-purple-600",
    icon: <CreditCard className="w-5 h-5" />,
    label: "Credit/Debit Card",
  },
  NETBANKING: {
    color: "text-green-600",
    icon: <MdPayment className="w-5 h-5" />,
    label: "Net Banking",
  },
};

const AdminOrders: React.FC = () => {
  const { userId, accessToken } = useAuth();
  const [activeOrders, setActiveOrders] = useState<OrderDTO[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<OrderDTO[]>([]);
  const [stationData, setStationData] = useState<{ [key: number]: StationDTO }>({});
  const [stations, setStations] = useState<StationDTO[]>([]);
  const [vendors, setVendors] = useState<VendorDTO[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("");
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [statusRemarks, setStatusRemarks] = useState<{ [key: number]: string }>({});
  const [codRemarks, setCodRemarks] = useState<{ [key: number]: string }>({});

  const fetchStations = useCallback(async () => {
    try {
      const response = await api.get<StationDTO[]>("/stations/all", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setStations(response.data);
    } catch (err: any) {
      console.error("Failed to fetch stations:", err);
      toast.error("Failed to load stations.");
    }
  }, [accessToken]);

  const fetchVendors = useCallback(async (stationId: string) => {
    if (!stationId) {
      setVendors([]);
      return;
    }
    try {
      const response = await api.get<PageResponse<VendorDTO>>(
        `/vendors/stations/${stationId}`,
        {
          params: { page: 0, size: 100 },
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setVendors(response.data.content || []);
    } catch (err: any) {
      console.error(`Failed to fetch vendors for station ${stationId}:`, err);
      toast.error("Failed to load vendors.");
    }
  }, [accessToken]);

  const fetchOrdersAndData = useCallback(async () => {
    if (!userId || !accessToken) {
      setError("Authentication required. Please log in as an admin.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: any = { page: 0, size: 100 };
      if (selectedVendor) params.vendorId = Number(selectedVendor);
      if (startDate) params.startDate = format(startOfDay(new Date(startDate)), "yyyy-MM-dd'T'HH:mm:ss");
      if (endDate) params.endDate = format(endOfDay(new Date(endDate)), "yyyy-MM-dd'T'HH:mm:ss");

      const [activeResponse, historicalResponse] = await Promise.all([
        api.get<PageResponse<OrderDTO>>("/admin/orders/active", {
          params,
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch((err) => {
          console.error("Failed to fetch active orders:", err);
          return { data: { content: [], pageable: { pageNumber: 0, pageSize: 100 }, totalElements: 0, totalPages: 0 } };
        }),
        api.get<PageResponse<OrderDTO>>("/admin/orders/historical", {
          params,
          headers: { Authorization: `Bearer ${accessToken}` },
        }).catch((err) => {
          console.error("Failed to fetch historical orders:", err);
          return { data: { content: [], pageable: { pageNumber: 0, pageSize: 100 }, totalElements: 0, totalPages: 0 } };
        }),
      ]);

      const activeOrdersData = activeResponse.data.content || [];
      const historicalOrdersData = historicalResponse.data.content || [];
      const allOrders = [...activeOrdersData, ...historicalOrdersData];

      if (allOrders.length === 0) {
        setActiveOrders([]);
        setHistoricalOrders([]);
        setLoading(false);
        return;
      }

      const stationIds = [...new Set(allOrders.map((o) => o.deliveryStationId))];
      const itemIds = [...new Set(allOrders.flatMap((o) => o.items.map((i) => i.itemId)))];
      const vendorIds = [...new Set(allOrders.map((o) => o.vendorId))];

      const [stationsData, items, vendors] = await Promise.all([
        Promise.all(
          stationIds.map((id) =>
            api
              .get<StationDTO>(`/stations/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } })
              .then((res) => ({ [id]: res.data }))
              .catch((err) => {
                console.error(`Failed to fetch station ${id}:`, err);
                return {
                  [id]: {
                    stationId: id,
                    stationName: `Station #${id}`,
                    stationCode: "Unknown",
                    city: "Unknown",
                    state: "Unknown",
                  },
                };
              })
          )
        ).then((results) => Object.assign({}, ...results)),
        Promise.all(
          itemIds.map((id) =>
            api
              .get<MenuItemDTO>(`/menu/items/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } })
              .then((res) => ({ [id]: res.data }))
              .catch((err) => {
                console.error(`Failed to fetch item ${id}:`, err);
                return {
                  [id]: {
                    itemId: id,
                    itemName: `Item #${id}`,
                    description: "Unknown",
                    category: "Unknown",
                    imageUrl: null,
                  },
                };
              })
          )
        ).then((results) => Object.assign({}, ...results)),
        Promise.all(
          vendorIds.map((id) =>
            api
              .get<VendorDTO>(`/vendors/${id}`, { headers: { Authorization: `Bearer ${accessToken}` } })
              .then((res) => ({ [id]: res.data }))
              .catch((err) => {
                console.error(`Failed to fetch vendor ${id}:`, err);
                return { [id]: { vendorId: id, businessName: `Vendor #${id}` } };
              })
          )
        ).then((results) => Object.assign({}, ...results)),
      ]);

      setStationData((prev) => ({ ...prev, ...stationsData }));

      const transformedOrders = allOrders.map((order) => ({
        ...order,
        vendorName: vendors[order.vendorId]?.businessName || `Vendor #${order.vendorId}`,
        trainNumber: order.trainNumber || `Train #${order.trainId}`,
        items: order.items.map((item) => ({
          ...item,
          itemName: items[item.itemId]?.itemName || `Item #${item.itemId}`,
          category: items[item.itemId]?.category || "Unknown",
          imageUrl: items[item.itemId]?.imageUrl || null,
          specialInstructions: item.specialInstructions || "No special instructions",
        })),
      }));

      setActiveOrders(
        transformedOrders.filter((o) =>
          ["PLACED", "PENDING", "PREPARING", "DISPATCHED"].includes(o.orderStatus)
        )
      );
      setHistoricalOrders(
        transformedOrders.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.orderStatus))
      );
    } catch (err: any) {
      console.error("Order fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch orders. Please check your connection or try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [userId, accessToken, selectedVendor, startDate, endDate]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  useEffect(() => {
    fetchVendors(selectedStation);
  }, [selectedStation, fetchVendors]);

  useEffect(() => {
    fetchOrdersAndData();
  }, [fetchOrdersAndData]);

  const updateOrderStatus = async (
    orderId: number,
    status: OrderDTO["orderStatus"],
    remarks: string
  ) => {
    if (!userId || !accessToken) {
      toast.error("Authentication required. Please log in as an admin.");
      return;
    }

    try {
      const response = await api.put<OrderDTO>(
        `/admin/orders/${orderId}/status`,
        { status, remarks: remarks || "" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setActiveOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: response.data.orderStatus }
            : order
        )
      );
      setHistoricalOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: response.data.orderStatus }
            : order
        )
      );

      if (["DELIVERED", "CANCELLED"].includes(status)) {
        setActiveOrders((prev) =>
          prev.filter((order) => order.orderId !== orderId)
        );
        setHistoricalOrders((prev) => [
          ...prev,
          {
            ...activeOrders.find((o) => o.orderId === orderId)!,
            orderStatus: status,
          },
        ]);
      }

      toast.success(`Status for order ${orderId} updated to ${status}.`);
    } catch (err: any) {
      console.error(`Failed to update status for order ${orderId}:`, err);
      toast.error(
        err.response?.data?.message || "Failed to update order status."
      );
    }
  };

  const updateCodPaymentStatus = async (
    orderId: number,
    paymentStatus: OrderDTO["paymentStatus"],
    remarks: string
  ) => {
    if (!userId || !accessToken) {
      toast.error("Authentication required. Please log in as an admin.");
      return;
    }

    try {
      const response = await api.put<OrderDTO>(
        `/admin/orders/${orderId}/cod-payment-status`,
        { paymentStatus, remarks: remarks || "" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setActiveOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, paymentStatus: response.data.paymentStatus }
            : order
        )
      );
      setHistoricalOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, paymentStatus: response.data.paymentStatus }
            : order
        )
      );

      toast.success(`COD payment status for order ${orderId} updated to ${paymentStatus}.`);
    } catch (err: any) {
      console.error(`Failed to update COD payment status for order ${orderId}:`, err);
      toast.error(
        err.response?.data?.message || "Failed to update COD payment status."
      );
    }
  };

  const handleOpenDetailsModal = async (order: OrderDTO) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedOrder(null);
    setOpen(false);
  };

  const currentOrders = useMemo(
    () => (activeTab === "active" ? activeOrders : historicalOrders),
    [activeTab, activeOrders, historicalOrders]
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return format(date, "PPP");
    } catch {
      return "Invalid Date";
    }
  };

  const getAvailableStatuses = (currentStatus: OrderDTO["orderStatus"]) => {
    const statuses: OrderDTO["orderStatus"][] = [
      "PREPARING",
      "DISPATCHED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (currentStatus === "PLACED" || currentStatus === "PENDING") {
      return statuses.filter((s) => ["PREPARING", "CANCELLED"].includes(s));
    }
    if (currentStatus === "PREPARING") {
      return statuses.filter((s) => ["DISPATCHED", "CANCELLED"].includes(s));
    }
    if (currentStatus === "DISPATCHED") {
      return statuses.filter((s) => ["DELIVERED", "CANCELLED"].includes(s));
    }
    return [];
  };

  const getAvailablePaymentStatuses = () => {
    return ["PENDING", "COMPLETED", "FAILED"] as OrderDTO["paymentStatus"][];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <Card className="w-full shadow-md border border-blue-100">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800">
            Order Management Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-800 mb-4">Filter Orders</h2>
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
                  <SelectTrigger id="station" className="mt-1 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500">
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
                  <SelectTrigger id="vendor" className="mt-1 text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500">
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
                variant="outline"
                onClick={fetchOrdersAndData}
                disabled={loading}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Apply Filters"
                )}
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="inline-flex rounded-lg border border-blue-200 bg-blue-50">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("active")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "active"
                    ? "bg-blue-100 text-blue-800"
                    : "text-blue-600 hover:bg-blue-100"
                }`}
              >
                Active Orders ({activeOrders.length})
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "completed"
                    ? "bg-blue-100 text-blue-800"
                    : "text-blue-600 hover:bg-blue-100"
                }`}
              >
                Completed Orders ({historicalOrders.length})
              </Button>
            </div>
          </div>

          {error ? (
            <div className="flex flex-col items-center justify-center py-10">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-600">Error Loading Orders</h2>
              <p className="text-sm text-blue-500 mt-2">{error}</p>
              <Button
                variant="outline"
                onClick={fetchOrdersAndData}
                disabled={loading}
                className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Try Again"
                )}
              </Button>
            </div>
          ) : currentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <h2 className="text-lg sm:text-xl font-semibold text-blue-600">No Orders Found</h2>
              <p className="text-sm text-blue-500 mt-2">
                {activeTab === "active"
                  ? "No active orders found. Try adjusting your filters."
                  : "No completed orders found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <table className="min-w-full divide-y divide-blue-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Sr. No.</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Order ID</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Customer ID</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Station</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Vendor</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Delivery Time</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Status</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Total Amount</th>
                      <th className="px-3 py-2 text-sm font-medium text-blue-900 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-200">
                    {currentOrders.map((order, index) => (
                      <tr key={order.orderId} className="hover:bg-blue-50 transition-colors">
                        <td className="px-3 py-3 text-sm">{index + 1}</td>
                        <td className="px-3 py-3 text-sm truncate max-w-[100px]">{order.orderId}</td>
                        <td className="px-3 py-3 text-sm truncate max-w-[100px]">{order.customerId}</td>
                        <td className="px-3 py-3 text-sm truncate max-w-[150px]">
                          {stationData[order.deliveryStationId]?.stationName || `Station #${order.deliveryStationId}`}
                        </td>
                        <td className="px-3 py-3 text-sm truncate max-w-[150px]">{order.vendorName}</td>
                        <td className="px-3 py-3 text-sm truncate max-w-[150px]">{formatDate(order.deliveryTime)}</td>
                        <td className="px-3 py-3 text-sm">
                          <Badge className={`${statusConfig[order.orderStatus].color} py-1 px-2 rounded-full`}>
                            {statusConfig[order.orderStatus].label}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-sm truncate">₹{order.finalAmount.toFixed(2)}</td>
                        <td className="px-3 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            onClick={() => handleOpenDetailsModal(order)}
                            aria-label={`View details for order ${order.orderId}`}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {currentOrders.map((order, index) => (
                  <Card key={order.orderId} className="p-3 border border-blue-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-blue-600">Sr. No.</p>
                        <p className="font-medium text-sm truncate">{index + 1}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Order ID</p>
                        <p className="font-medium text-sm truncate">{order.orderId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Customer ID</p>
                        <p className="font-medium text-sm truncate">{order.customerId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Station</p>
                        <p className="font-medium text-sm truncate">
                          {stationData[order.deliveryStationId]?.stationName || `Station #${order.deliveryStationId}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Vendor</p>
                        <p className="font-medium text-sm truncate">{order.vendorName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Delivery Time</p>
                        <p className="font-medium text-sm truncate">{formatDate(order.deliveryTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Status</p>
                        <p className="font-medium text-sm truncate">{statusConfig[order.orderStatus].label}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-600">Total</p>
                        <p className="font-medium text-sm truncate">₹{order.finalAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => handleOpenDetailsModal(order)}
                        aria-label={`View details for order ${order.orderId}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md p-4">
              <DialogHeader>
                <DialogTitle className="text-blue-800">Order Details</DialogTitle>
              </DialogHeader>
              {selectedOrder && (
                <div className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Order Information
                    </h3>
                    <p><strong>ID:</strong> {selectedOrder.orderId}</p>
                    <p><strong>Customer ID:</strong> {selectedOrder.customerId}</p>
                    <p><strong>Status:</strong> {statusConfig[selectedOrder.orderStatus].label}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4" /> Delivery Information
                    </h3>
                    <p><strong>Station:</strong> {stationData[selectedOrder.deliveryStationId]?.stationName || `Station #${selectedOrder.deliveryStationId}`}</p>
                    <p><strong>Train:</strong> {selectedOrder.trainNumber || `Train #${selectedOrder.trainId}`}</p>
                    <p><strong>Coach/Seat:</strong> {selectedOrder.coachNumber}/{selectedOrder.seatNumber}</p>
                    <p><strong>Vendor:</strong> {selectedOrder.vendorName}</p>
                    <p><strong>Delivery Time:</strong> {formatDate(selectedOrder.deliveryTime)}</p>
                    {selectedOrder.deliveryInstructions && (
                      <p><strong>Instructions:</strong> {selectedOrder.deliveryInstructions}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                      <MdFastfood className="w-4 h-4" /> Items ({selectedOrder.items.length})
                    </h3>
                    {selectedOrder.items.map((item) => (
                      <div key={item.itemId} className="border-t border-blue-100 pt-2">
                        <p><strong>Name:</strong> {item.itemName}</p>
                        <p><strong>Quantity:</strong> {item.quantity} × ₹{item.unitPrice.toFixed(2)}</p>
                        <p><strong>Total:</strong> ₹{(item.quantity * item.unitPrice).toFixed(2)}</p>
                        {item.specialInstructions !== "No special instructions" && (
                          <p><strong>Note:</strong> {item.specialInstructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                      <MdPayment className="w-4 h-4" /> Payment Information
                    </h3>
                    <p><strong>Method:</strong> {paymentMethodConfig[selectedOrder.paymentMethod].label}</p>
                    <p><strong>Status:</strong> {paymentConfig[selectedOrder.paymentStatus].label}</p>
                    {selectedOrder.razorpayOrderID && (
                      <p><strong>Transaction ID:</strong> {selectedOrder.razorpayOrderID}</p>
                    )}
                    {selectedOrder.paymentMethod === "COD" && selectedOrder.paymentStatus !== "COMPLETED" && activeTab === "active" && (
                      <div className="mt-2">
                        <Label htmlFor={`cod-status-${selectedOrder.orderId}`} className="text-sm text-blue-700">
                          Update COD Payment Status
                        </Label>
                        <div className="flex gap-2 mt-1">
                          <Select
                            onValueChange={(value) =>
                              updateCodPaymentStatus(
                                selectedOrder.orderId,
                                value as OrderDTO["paymentStatus"],
                                codRemarks[selectedOrder.orderId] || ""
                              )
                            }
                          >
                            <SelectTrigger id={`cod-status-${selectedOrder.orderId}`} className="w-[180px] text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select payment status" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailablePaymentStatuses().map((status) => (
                                <SelectItem key={status} value={status}>
                                  {paymentConfig[status].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="Optional remarks"
                            value={codRemarks[selectedOrder.orderId] || ""}
                            onChange={(e) =>
                              setCodRemarks((prev) => ({
                                ...prev,
                                [selectedOrder.orderId]: e.target.value,
                              }))
                            }
                            className="max-w-xs text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-blue-700 flex items-center gap-2">
                      <FaRupeeSign className="w-4 h-4" /> Order Summary
                    </h3>
                    <p><strong>Subtotal:</strong> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
                    <p><strong>Delivery Charges:</strong> ₹{selectedOrder.deliveryCharges.toFixed(2)}</p>
                    <p><strong>Tax ({selectedOrder.taxPercentage || 5}%):</strong> ₹{selectedOrder.taxAmount.toFixed(2)}</p>
                    {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                      <p><strong>Discount:</strong> -₹{selectedOrder.discountAmount.toFixed(2)}</p>
                    )}
                    <p><strong>Total:</strong> ₹{selectedOrder.finalAmount.toFixed(2)}</p>
                  </div>
                  {activeTab === "active" && selectedOrder && getAvailableStatuses(selectedOrder.orderStatus).length > 0 && (
                    <div className="mt-2">
                      <Label htmlFor={`order-status-${selectedOrder.orderId}`} className="text-sm text-blue-700">
                        Update Order Status
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Select
                          onValueChange={(value) =>
                            updateOrderStatus(
                              selectedOrder.orderId,
                              value as OrderDTO["orderStatus"],
                              statusRemarks[selectedOrder.orderId] || ""
                            )
                          }
                        >
                          <SelectTrigger id={`order-status-${selectedOrder.orderId}`} className="w-[180px] text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableStatuses(selectedOrder.orderStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {statusConfig[status].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Optional remarks"
                          value={statusRemarks[selectedOrder.orderId] || ""}
                          onChange={(e) =>
                            setStatusRemarks((prev) => ({
                              ...prev,
                              [selectedOrder.orderId]: e.target.value,
                            }))
                          }
                          className="max-w-xs text-sm border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;