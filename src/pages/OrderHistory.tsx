import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/utils/axios";
import { FaTrain, FaChair } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { CheckCircle, XCircle } from "lucide-react";

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

// Static mock data for development
const mockOrders: OrderDTO[] = [
  {
    orderId: 1,
    userId: 37,
    vendorId: 12,
    trainId: 12345,
    pnrNumber: "PNR123456",
    coachNumber: "B1",
    seatNumber: "24",
    deliveryStationId: 201,
    deliveryTime: "2023-06-15T12:30:00Z",
    orderStatus: "PENDING",
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
      { itemId: 1, itemName: "Veg Meal", quantity: 2, unitPrice: 150, specialInstructions: "Less spicy" },
    ],
  },
  {
    orderId: 2,
    userId: 37,
    vendorId: 12,
    trainId: 12346,
    pnrNumber: "PNR654321",
    coachNumber: "A2",
    seatNumber: "12",
    deliveryStationId: 202,
    deliveryTime: "2023-06-15T14:45:00Z",
    orderStatus: "DELIVERED",
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
      { itemId: 2, itemName: "Non-Veg Meal", quantity: 2, unitPrice: 200, specialInstructions: null },
    ],
  },
  {
    orderId: 3,
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
    deliveryInstructions: "Leave with TTE",
    items: [
      { itemId: 3, itemName: "Snacks Combo", quantity: 1, unitPrice: 250, specialInstructions: "Extra ketchup" },
    ],
  },
];

const statusColors = {
  PENDING: "bg-amber-100 text-amber-800",
  PREPARING: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const paymentColors = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-amber-100 text-amber-800",
  FAILED: "bg-red-100 text-red-800",
};

const paymentMethodIcons = {
  COD: <MdPayment className="text-red-500" title="Cash on Delivery" />,
  UPI: <MdPayment className="text-blue-500" title="UPI Payment" />,
  CARD: <MdPayment className="text-purple-500" title="Card Payment" />,
  NETBANKING: <MdPayment className="text-green-500" title="Net Banking" />,
};

const OrderHistory: React.FC = () => {
  const { userId } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "DELIVERED" | "CANCELLED">("ALL");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);

      // Log userId for debugging
      console.log("userId:", userId);

      // If no userId, use mock data directly
      if (!userId) {
        console.log("No userId, setting mockOrders");
        setOrders(mockOrders);
        setError("Not logged in. Showing sample data.");
        setLoading(false);
        return;
      }

      try {
        // API call to fetch customer orders
        const response = await api.get(`/api/orders/customer?customerId=${userId}`);
        console.log("API response:", response.data);
        if (response.status === 200) {
          setOrders(response.data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        console.log("Falling back to mockOrders");
        setOrders(mockOrders); // Use mock data without filtering
        setError("Failed to fetch orders. Showing sample data.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  // Log orders state for debugging
  console.log("Current orders state:", orders);

  // Filter orders based on historyFilter
  const filteredOrders = orders.filter((order) =>
    historyFilter === "ALL" ? true : order.orderStatus === historyFilter
  );

  // Log filteredOrders for debugging
  console.log("Filtered orders:", filteredOrders);

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto space-y-6 md:space-y-8">
      <section className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            Your Order History
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHistoryFilter("ALL")}
              className={`px-3 py-1 text-xs md:text-sm rounded-full ${
                historyFilter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setHistoryFilter("DELIVERED")}
              className={`px-3 py-1 text-xs md:text-sm rounded-full ${
                historyFilter === "DELIVERED"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setHistoryFilter("CANCELLED")}
              className={`px-3 py-1 text-xs md:text-sm rounded-full ${
                historyFilter === "CANCELLED"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-sm md:text-base">Loading orders...</p>
          </div>
        ) : error && filteredOrders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-red-600 text-sm md:text-base">{error}</p>
            <p className="text-gray-600 text-sm md:text-base">No orders found</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-sm md:text-base">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Train
                    </th>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat
                    </th>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaTrain className="mr-1 flex-shrink-0" />
                          {order.trainId}
                        </div>
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-600">
                        <div className="flex items-center">
                          <FaChair className="mr-1 flex-shrink-0" />
                          {order.coachNumber}/{order.seatNumber}
                        </div>
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs md:text-sm ${statusColors[order.orderStatus]}`}
                        >
                          {order.orderStatus}
                          {order.orderStatus === "DELIVERED" && (
                            <CheckCircle className="inline ml-1 w-4 h-4 text-green-500" />
                          )}
                          {order.orderStatus === "CANCELLED" && (
                            <XCircle className="inline ml-1 w-4 h-4 text-red-500" />
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-600">
                        ₹{order.finalAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs md:text-sm ${paymentColors[order.paymentStatus]}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {paymentMethodIcons[order.paymentMethod]}
                          <span className="ml-1 text-xs md:text-sm">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm font-medium">
                        <button
                          onClick={() => toggleOrderDetails(order.orderId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {expandedOrderId === order.orderId ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.map((order) => (
              expandedOrderId === order.orderId && (
                <div
                  key={`details-${order.orderId}`}
                  className="px-4 py-4 md:py-6 bg-gray-50 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm md:text-base mb-3">
                        Delivery Information
                      </h4>
                      <div className="space-y-3 text-xs md:text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span className="text-gray-500">PNR:</span>
                          <span>{order.pnrNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery Station:</span>
                          <span>{order.deliveryStationId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Delivery Time:</span>
                          <span>
                            {new Date(order.deliveryTime).toLocaleString()}
                          </span>
                        </div>
                        {order.deliveryInstructions && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Instructions:</span>
                            <span className="italic">
                              {order.deliveryInstructions}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm md:text-base mb-3">
                        Order Items
                      </h4>
                      <ul className="space-y-3 text-xs md:text-sm">
                        {order.items.map((item) => (
                          <li key={item.itemId}>
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {item.itemName}
                              </span>
                              <span>₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>
                                {item.quantity} x ₹{item.unitPrice.toFixed(2)}
                              </span>
                              {item.specialInstructions && (
                                <span className="italic">
                                  {item.specialInstructions}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderHistory;