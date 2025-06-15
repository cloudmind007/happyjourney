import React, { useState, useEffect } from "react";
import { FaTrain, FaChair, FaRupeeSign, FaInfoCircle, FaDownload } from "react-icons/fa";
import { MdPayment, MdFastfood } from "react-icons/md";
import { IoTime, IoLocation } from "react-icons/io5";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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
      { itemId: 1, itemName: "Veg Thali", quantity: 2, unitPrice: 150, specialInstructions: "Less spicy" },
    ],
  },
  // Add more mock orders as needed
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
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setOrders(mockOrders);
      } catch (err) {
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const generateInvoice = (order: OrderDTO) => {
    const doc = new jsPDF();
    doc.text(`Invoice #${order.orderId}`, 10, 10);
    doc.save(`invoice-${order.orderId}.pdf`);
  };

  const activeOrders = orders.filter(order => 
    ["PENDING", "PREPARING"].includes(order.orderStatus)
  );

  const completedOrders = orders.filter(order => 
    ["DELIVERED", "CANCELLED"].includes(order.orderStatus)
  );

  const currentOrders = activeTab === "active" ? activeOrders : completedOrders;

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            Completed ({completedOrders.length})
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
                        <div className="text-sm text-gray-500">{formatDate(order.deliveryTime)}</div>
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
                                  <span>{order.deliveryStationId}</span>
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
                                        <p className="font-medium">{item.itemName}</p>
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
                            <span>{order.deliveryStationId}</span>
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
                                  <p className="font-medium">{item.itemName}</p>
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