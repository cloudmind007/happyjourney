import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/utils/axios";
import { FaTrain, FaChair, FaRupeeSign, FaInfoCircle } from "react-icons/fa";
import { MdPayment, MdFastfood } from "react-icons/md";
import { IoTime, IoLocation } from "react-icons/io5";
import { BsFilter, BsChevronDown, BsChevronUp } from "react-icons/bs";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

interface OrderItemDTO {
  itemId: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  specialInstructions: string | null;
}

interface OrderDTO {
  orderId: number;
  userId: number;
  vendorId: number;
  trainId: number;
  pnrNumber: string;
  coachNumber: string;
  seatNumber: string;
  deliveryStationId: number;
  deliveryTime: string;
  orderStatus: "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryCharges: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  paymentMethod: "COD" | "UPI" | "CARD" | "NETBANKING";
  razorpayOrderID: string | null;
  deliveryInstructions: string | null;
  items: OrderItemDTO[];
}

// Comprehensive mock data with realistic values
const mockOrders: OrderDTO[] = [
  {
    orderId: 1024,
    userId: 37,
    vendorId: 12,
    trainId: 12345,
    pnrNumber: "PNR123456",
    coachNumber: "B1",
    seatNumber: "24",
    deliveryStationId: 201,
    deliveryTime: "2023-06-15T12:30:00Z",
    orderStatus: "DELIVERED",
    totalAmount: 350,
    deliveryCharges: 30,
    taxAmount: 25,
    discountAmount: 0,
    finalAmount: 405,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    razorpayOrderID: "rzp_123",
    deliveryInstructions: "Please call before delivery",
    items: [
      { itemId: 1, itemName: "Veg Thali Meal", quantity: 2, unitPrice: 150, specialInstructions: "Less spicy" },
      { itemId: 2, itemName: "Mineral Water", quantity: 1, unitPrice: 20, specialInstructions: null },
      { itemId: 3, itemName: "Chocolate Brownie", quantity: 1, unitPrice: 60, specialInstructions: "Add extra scoop of ice cream" },
    ],
  },
  {
    orderId: 1025,
    userId: 37,
    vendorId: 12,
    trainId: 12346,
    pnrNumber: "PNR654321",
    coachNumber: "A2",
    seatNumber: "12",
    deliveryStationId: 202,
    deliveryTime: "2023-06-15T14:45:00Z",
    orderStatus: "PREPARING",
    totalAmount: 420,
    deliveryCharges: 30,
    taxAmount: 30,
    discountAmount: 20,
    finalAmount: 460,
    paymentStatus: "PAID",
    paymentMethod: "CARD",
    razorpayOrderID: "rzp_124",
    deliveryInstructions: null,
    items: [
      { itemId: 4, itemName: "Non-Veg Special", quantity: 2, unitPrice: 200, specialInstructions: null },
    ],
  },
  {
    orderId: 1026,
    userId: 37,
    vendorId: 12,
    trainId: 12347,
    pnrNumber: "PNR112233",
    coachNumber: "S3",
    seatNumber: "08",
    deliveryStationId: 203,
    deliveryTime: "2023-06-14T18:30:00Z",
    orderStatus: "CANCELLED",
    totalAmount: 275,
    deliveryCharges: 25,
    taxAmount: 20,
    discountAmount: 0,
    finalAmount: 320,
    paymentStatus: "PAID",
    paymentMethod: "COD",
    razorpayOrderID: null,
    deliveryInstructions: "Leave with TTE if not available",
    items: [
      { itemId: 5, itemName: "Snacks Combo", quantity: 1, unitPrice: 250, specialInstructions: "Extra ketchup" },
      { itemId: 6, itemName: "Coffee", quantity: 2, unitPrice: 25, specialInstructions: "One with sugar, one without" },
    ],
  },
  {
    orderId: 1027,
    userId: 37,
    vendorId: 12,
    trainId: 12348,
    pnrNumber: "PNR445566",
    coachNumber: "B2",
    seatNumber: "15",
    deliveryStationId: 204,
    deliveryTime: "2023-06-16T09:15:00Z",
    orderStatus: "PENDING",
    totalAmount: 180,
    deliveryCharges: 20,
    taxAmount: 15,
    discountAmount: 10,
    finalAmount: 205,
    paymentStatus: "PENDING",
    paymentMethod: "UPI",
    razorpayOrderID: "rzp_125",
    deliveryInstructions: "Deliver after 9:30 AM",
    items: [
      { itemId: 7, itemName: "Breakfast Combo", quantity: 1, unitPrice: 150, specialInstructions: "No onions in sandwiches" },
      { itemId: 8, itemName: "Orange Juice", quantity: 1, unitPrice: 30, specialInstructions: "Freshly squeezed" },
    ],
  },
];

const statusConfig = {
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
  const { userId } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "DELIVERED" | "CANCELLED">("ALL");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Use mock data directly since we're not calling real API
        setOrders(mockOrders.filter(order => order.userId === 37)); // Filter to show only mock orders for user 37
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to fetch orders. Showing sample data.");
        setOrders(mockOrders); // Fallback to all mock data
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const filteredOrders = orders.filter((order) =>
    historyFilter === "ALL" ? true : order.orderStatus === historyFilter
  );

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-IN', options);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Your Order History</h1>
        
        {/* Desktop Filter Buttons */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => setHistoryFilter("ALL")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              historyFilter === "ALL" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setHistoryFilter("DELIVERED")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              historyFilter === "DELIVERED" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setHistoryFilter("CANCELLED")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              historyFilter === "CANCELLED" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Mobile Filter Dropdown */}
        <div className="md:hidden w-full">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
          >
            <span className="flex items-center gap-2">
              <BsFilter className="w-5 h-5" />
              Filter: {historyFilter === "ALL" ? "All Orders" : historyFilter === "DELIVERED" ? "Delivered" : "Cancelled"}
            </span>
            {showMobileFilters ? <BsChevronUp /> : <BsChevronDown />}
          </button>
          {showMobileFilters && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <button
                onClick={() => {
                  setHistoryFilter("ALL");
                  setShowMobileFilters(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                  historyFilter === "ALL" ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => {
                  setHistoryFilter("DELIVERED");
                  setShowMobileFilters(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                  historyFilter === "DELIVERED" ? "bg-green-50 text-green-600" : "text-gray-700"
                }`}
              >
                Delivered
              </button>
              <button
                onClick={() => {
                  setHistoryFilter("CANCELLED");
                  setShowMobileFilters(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-md text-sm ${
                  historyFilter === "CANCELLED" ? "bg-red-50 text-red-600" : "text-gray-700"
                }`}
              >
                Cancelled
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading your orders...</span>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">Error loading orders</h3>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Try Again
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <FaInfoCircle className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {historyFilter === "ALL" 
              ? "You haven't placed any orders yet." 
              : `You don't have any ${historyFilter.toLowerCase()} orders.`}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Train Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order.orderId}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.orderId}</div>
                        <div className="text-sm text-gray-500">{formatDate(order.deliveryTime)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FaTrain className="flex-shrink-0 mr-2 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Train {order.trainId}</div>
                            <div className="text-sm text-gray-500">
                              {order.coachNumber}/{order.seatNumber} • PNR: {order.pnrNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.orderStatus].color}`}>
                            {statusConfig[order.orderStatus].icon}
                            <span className="ml-1">{order.orderStatus}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center">
                          <FaRupeeSign className="mr-1 text-gray-500" />
                          {order.finalAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`mr-2 ${paymentMethodConfig[order.paymentMethod].color}`}>
                            {paymentMethodConfig[order.paymentMethod].icon}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentConfig[order.paymentStatus].color}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleOrderDetails(order.orderId)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedOrderId === order.orderId ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedOrderId === order.orderId && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                                <IoLocation className="mr-2 text-blue-500" />
                                Delivery Information
                              </h3>
                              <div className="space-y-2 text-sm text-gray-700">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Station:</span>
                                  <span className="font-medium">{order.deliveryStationId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Time:</span>
                                  <span className="font-medium">{formatDate(order.deliveryTime)}</span>
                                </div>
                                {order.deliveryInstructions && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Instructions:</span>
                                    <span className="font-medium italic">{order.deliveryInstructions}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                                <MdFastfood className="mr-2 text-green-500" />
                                Order Items
                              </h3>
                              <ul className="divide-y divide-gray-200">
                                {order.items.map((item) => (
                                  <li key={item.itemId} className="py-2">
                                    <div className="flex justify-between">
                                      <div>
                                        <p className="font-medium">{item.itemName}</p>
                                        {item.specialInstructions && (
                                          <p className="text-xs text-gray-500 italic">Note: {item.specialInstructions}</p>
                                        )}
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium flex items-center justify-end">
                                          <FaRupeeSign className="mr-1 text-gray-500" />
                                          {(item.quantity * item.unitPrice).toFixed(2)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {item.quantity} × <FaRupeeSign className="inline" />{item.unitPrice.toFixed(2)}
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

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order.orderId} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <IoTime className="mr-1" />
                      {formatDate(order.deliveryTime)}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.orderStatus].color}`}>
                    {statusConfig[order.orderStatus].icon}
                    <span className="ml-1">{order.orderStatus}</span>
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <p className="text-gray-500">Train</p>
                    <p className="font-medium flex items-center">
                      <FaTrain className="mr-1 text-gray-400" />
                      {order.trainId}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Seat</p>
                    <p className="font-medium flex items-center">
                      <FaChair className="mr-1 text-gray-400" />
                      {order.coachNumber}/{order.seatNumber}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium flex items-center">
                      <FaRupeeSign className="mr-1 text-gray-400" />
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

                <button
                  onClick={() => toggleOrderDetails(order.orderId)}
                  className="mt-3 w-full flex items-center justify-center text-blue-600 text-sm font-medium"
                >
                  {expandedOrderId === order.orderId ? (
                    <>
                      <BsChevronUp className="mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <BsChevronDown className="mr-1" />
                      View Details
                    </>
                  )}
                </button>

                {expandedOrderId === order.orderId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <IoLocation className="mr-2 text-blue-500" />
                          Delivery Info
                        </h4>
                        <div className="mt-2 space-y-2 text-sm text-gray-700">
                          <div className="flex justify-between">
                            <span className="text-gray-500">PNR:</span>
                            <span>{order.pnrNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Station:</span>
                            <span>{order.deliveryStationId}</span>
                          </div>
                          {order.deliveryInstructions && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Instructions:</span>
                              <span className="italic">{order.deliveryInstructions}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <MdFastfood className="mr-2 text-green-500" />
                          Order Items
                        </h4>
                        <ul className="mt-2 space-y-3">
                          {order.items.map((item) => (
                            <li key={item.itemId}>
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{item.itemName}</p>
                                  {item.specialInstructions && (
                                    <p className="text-xs text-gray-500 italic">Note: {item.specialInstructions}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium flex items-center justify-end">
                                    <FaRupeeSign className="mr-1" />
                                    {(item.quantity * item.unitPrice).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {item.quantity} × <FaRupeeSign className="inline" />{item.unitPrice.toFixed(2)}
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