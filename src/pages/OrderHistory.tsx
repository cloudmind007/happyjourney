import React, { useState, useEffect, useMemo } from "react";
import { FaTrain, FaChair, FaRupeeSign, FaInfoCircle, FaDownload } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { IoTime } from "react-icons/io5";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import api from "@/utils/axios";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItemDTO {
  itemId: number;
  itemName?: string;
  quantity: number;
  unitPrice: number;
  specialInstructions: string | null;
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
  orderStatus: "PLACED" | "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryCharges: number;
  taxAmount: number;
  discountAmount: number | null;
  finalAmount: number;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  paymentMethod: "COD" | "UPI" | "CARD" | "NETBANKING";
  razorpayOrderID: string | null;
  deliveryInstructions: string | null;
  items: OrderItemDTO[];
}

interface StationDTO {
  stationId: number;
  stationName: string;
  stationCode: string;
}

interface ItemDTO {
  itemId: number;
  itemName: string;
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
  PLACED: { color: "bg-amber-100 text-amber-800", icon: <Clock className="w-4 h-4" /> },
  PENDING: { color: "bg-amber-100 text-amber-800", icon: <Clock className="w-4 h-4" /> },
  PREPARING: { color: "bg-blue-100 text-blue-800", icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  DELIVERED: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
  CANCELLED: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
};

const paymentConfig = {
  PAID: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
  PENDING: { color: "bg-amber-100 text-amber-800", icon: <Clock className="w-4 h-4" /> },
  FAILED: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
};

const paymentMethodConfig = {
  COD: { color: "text-red-500", icon: <MdPayment className="w-5 h-5" /> },
  UPI: { color: "text-blue-500", icon: <MdPayment className="w-5 h-5" /> },
  CARD: { color: "text-purple-500", icon: <MdPayment className="w-5 h-5" /> },
  NETBANKING: { color: "text-green-500", icon: <MdPayment className="w-5 h-5" /> },
};

const OrderHistory: React.FC = () => {
  const { userId, accessToken } = useAuth(); // Ensure token is stable
  const [activeOrders, setActiveOrders] = useState<OrderDTO[]>([]);
  const [historicalOrders, setHistoricalOrders] = useState<OrderDTO[]>([]);
  const [stationNames, setStationNames] = useState<{ [key: number]: string }>({});
  const [itemNames, setItemNames] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    const fetchOrdersAndStations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch active orders
        const activeResponse = await api.get<PageResponse<OrderDTO>>("/orders/user/active", {
          params: { page: 0, size: 100 },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const activeOrdersData = activeResponse.data.content || [];

        // Fetch historical orders
        const historicalResponse = await api.get<PageResponse<OrderDTO>>("/orders/user/historical", {
          params: { page: 0, size: 100 },
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const historicalOrdersData = historicalResponse.data.content || [];

        // Combine all orders
        const allOrders = [...activeOrdersData, ...historicalOrdersData];
        if (allOrders.length === 0) {
          setActiveOrders([]);
          setHistoricalOrders([]);
          setLoading(false);
          return;
        }

        // Transform orders
        const transformedOrders = allOrders.map((order) => ({
          ...order,
          userId: order.customerId,
          discountAmount: order.discountAmount ?? 0,
          items: order.items.map((item) => ({
            ...item,
            specialInstructions: item.specialInstructions || null,
          })),
        }));

        // Fetch item names for uncached items
        const itemIds = [...new Set(allOrders.flatMap((order) => order.items.map((item) => item.itemId)))];
        const uncachedItemIds = itemIds.filter((itemId) => !itemNames[itemId]);
        let newItemNames = { ...itemNames };

        if (uncachedItemIds.length > 0) {
          const itemPromises = uncachedItemIds.map(async (itemId) => {
            try {
              const response = await api.get<ItemDTO>(`/items/${itemId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              return { itemId, itemName: response.data.itemName };
            } catch (err) {
              console.error(`Failed to fetch item ${itemId}:`, err);
              return { itemId, itemName: `Item ${itemId}` };
            }
          });

          const itemResults = await Promise.all(itemPromises);
          newItemNames = {
            ...itemNames,
            ...itemResults.reduce((acc, { itemId, itemName }) => {
              acc[itemId] = itemName;
              return acc;
            }, {} as { [key: number]: string }),
          };
          setItemNames(newItemNames);
        }

        // Update orders with item names
        const ordersWithItemNames = transformedOrders.map((order) => ({
          ...order,
          items: order.items.map((item) => ({
            ...item,
            itemName: newItemNames[item.itemId] || `Item ${item.itemId}`,
          })),
        }));

        // Fetch station names for uncached stations
        const stationIds = [...new Set(allOrders.map((order) => order.deliveryStationId))];
        const uncachedStationIds = stationIds.filter((stationId) => !stationNames[stationId]);
        let newStationNames = { ...stationNames };

        if (uncachedStationIds.length > 0) {
          const stationPromises = uncachedStationIds.map(async (stationId) => {
            try {
              const response = await api.get<StationDTO>(`/stations/${stationId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              return { stationId, stationName: `${response.data.stationName} (${response.data.stationCode})` };
            } catch (err) {
              console.error(`Failed to fetch station ${stationId}:`, err);
              return { stationId, stationName: `Station ${stationId}` };
            }
          });

          const stationResults = await Promise.all(stationPromises);
          newStationNames = {
            ...stationNames,
            ...stationResults.reduce((acc, { stationId, stationName }) => {
              acc[stationId] = stationName;
              return acc;
            }, {} as { [key: number]: string }),
          };
          setStationNames(newStationNames);
        }

        setActiveOrders(ordersWithItemNames.filter((o) => ["PLACED", "PENDING", "PREPARING"].includes(o.orderStatus)));
        setHistoricalOrders(ordersWithItemNames.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.orderStatus)));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId && accessToken) {
      fetchOrdersAndStations();
    }
  }, [userId, accessToken]); // Only depend on userId and token

  const generateInvoice = (order: OrderDTO) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Invoice #${order.orderId}`, 20, 20);

    const headers = [["Item Name", "Quantity", "Unit Price", "Total", "Instructions"]];
    const data = order.items.map((item) => [
      item.itemName || `Item ${item.itemId}`,
      item.quantity,
      `₹${item.unitPrice.toFixed(2)}`,
      `₹${(item.quantity * item.unitPrice).toFixed(2)}`,
      item.specialInstructions || "None",
    ]);

    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Order Date: ${formatDate(order.deliveryTime)}`, 20, finalY);
    doc.text(`Train: ${order.trainId}, Coach: ${order.coachNumber}, Seat: ${order.seatNumber}`, 20, finalY + 10);
    doc.text(`Delivery Station: ${stationNames[order.deliveryStationId] || order.deliveryStationId}`, 20, finalY + 20);
    doc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`, 20, finalY + 30);
    doc.text(`Delivery Charges: ₹${order.deliveryCharges.toFixed(2)}`, 20, finalY + 40);
    doc.text(`Tax: ₹${order.taxAmount.toFixed(2)}`, 20, finalY + 50);
    if (order.discountAmount && order.discountAmount > 0) {
      doc.text(`Discount: ₹${order.discountAmount.toFixed(2)}`, 20, finalY + 60);
      doc.text(`Final Amount: ₹${order.finalAmount.toFixed(2)}`, 20, finalY + 70);
    } else {
      doc.text(`Final Amount: ₹${order.finalAmount.toFixed(2)}`, 20, finalY + 60);
    }
    doc.text(`Payment Status: ${order.paymentStatus}`, 20, finalY + 80);
    doc.text(`Payment Method: ${order.paymentMethod}`, 20, finalY + 90);
    if (order.deliveryInstructions) {
      doc.text(`Delivery Instructions: ${order.deliveryInstructions}`, 20, finalY + 100);
    }

    doc.save(`invoice-${order.orderId}.pdf`);
  };

  const currentOrders = useMemo(
    () => (activeTab === "active" ? activeOrders : historicalOrders),
    [activeTab, activeOrders, historicalOrders]
  );

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Order History</h1>
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("active")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === "active" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-2 px-4 font-medium text-sm border-b-2 ${
              activeTab === "completed" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"
            }`}
          >
            Completed ({historicalOrders.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Error loading orders</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </div>
      ) : currentOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <FaInfoCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">
            No {activeTab === "active" ? "active" : "completed"} orders
          </h3>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Train</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <React.Fragment key={order.orderId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.orderId}</div>
                        <p className="text-sm text-gray-500">{formatDate(order.deliveryTime)}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaTrain className="flex-shrink-0 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Train {order.trainId}</div>
                            <div className="text-sm text-gray-500">{order.coachNumber}/{order.seatNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center w-fit ${statusConfig[order.orderStatus].color}`}>
                          {statusConfig[order.orderStatus].icon}
                          <span className="ml-1">{order.orderStatus}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaRupeeSign className="mr-1" />
                          {order.finalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`mr-2 ${paymentMethodConfig[order.paymentMethod].color}`}>
                            {paymentMethodConfig[order.paymentMethod].icon}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentConfig[order.paymentStatus].color}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleOrderDetails(order.orderId)}
                            className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-100 rounded-md text-sm"
                          >
                            View
                          </button>
                          {(order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED") && (
                            <button
                              onClick={() => generateInvoice(order)}
                              className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-100 rounded-md text-sm flex items-center"
                            >
                              <FaDownload className="mr-1" /> PDF
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order.orderId && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-3">Delivery Information</h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Station:</span>
                                  <span>{stationNames[order.deliveryStationId] || order.deliveryStationId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Instructions:</span>
                                  <span>{order.deliveryInstructions || "None"}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                              <ul className="divide-y divide-gray-200">
                                {order.items.map((item) => (
                                  <li key={item.itemId} className="py-2">
                                    <div className="flex justify-between">
                                      <div>
                                        <p className="font-medium">{item.itemName || `Item ${item.itemId}`}</p>
                                        {item.specialInstructions && (
                                          <p className="text-xs text-gray-500">Note: {item.specialInstructions}</p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="flex items-center justify-end">
                                          <FaRupeeSign className="mr-1" />
                                          {(item.quantity * item.unitPrice).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-gray-200">
            {currentOrders.map((order) => (
              <div key={order.orderId} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <IoTime className="mr-1" />
                      {formatDate(order.deliveryTime)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center ${statusConfig[order.orderStatus].color}`}>
                    {statusConfig[order.orderStatus].icon}
                    <span className="ml-1">{order.orderStatus}</span>
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <p className="text-gray-500">Train</p>
                    <p className="font-medium flex items-center">
                      <FaTrain className="mr-1" />
                      {order.trainId}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Seat</p>
                    <p className="font-medium flex items-center">
                      <FaChair className="mr-1" />
                      {order.coachNumber}/{order.seatNumber}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium flex items-center">
                      <FaRupeeSign className="mr-1" />
                      {order.finalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Payment</p>
                    <p className="font-medium flex items-center">
                      <span className={`mr-1 ${paymentMethodConfig[order.paymentMethod].color}`}>
                        {paymentMethodConfig[order.paymentMethod].icon}
                      </span>
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    onClick={() => toggleOrderDetails(order.orderId)}
                    className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-100 rounded-md text-sm"
                  >
                    {expandedOrderId === order.orderId ? "Hide" : "View"}
                  </button>
                  {(order.orderStatus === "DELIVERED" || order.orderStatus === "CANCELLED") && (
                    <button
                      onClick={() => generateInvoice(order)}
                      className="text-green-600 hover:text-green-900 px-3 py-1 border border-green-100 rounded-md text-sm flex items-center"
                    >
                      <FaDownload className="mr-1" /> PDF
                    </button>
                  )}
                </div>

                {expandedOrderId === order.orderId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Delivery Info</h4>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Station:</span>
                            <span>{stationNames[order.deliveryStationId] || order.deliveryStationId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Instructions:</span>
                            <span>{order.deliveryInstructions || "None"}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Order Items</h4>
                        <ul className="mt-2 space-y-3">
                          {order.items.map((item) => (
                            <li key={item.itemId}>
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{item.itemName || `Item ${item.itemId}`}</p>
                                  {item.specialInstructions && (
                                    <p className="text-xs text-gray-500">Note: {item.specialInstructions}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="flex items-center justify-end">
                                    <FaRupeeSign className="mr-1" />
                                    {(item.quantity * item.unitPrice).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} × ₹{item.unitPrice.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;