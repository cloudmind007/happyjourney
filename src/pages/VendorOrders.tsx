import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FaTrain, FaChair } from "react-icons/fa";
import { MdPayment } from "react-icons/md";

interface OrderItemDTO {
  itemId: number;
  itemName: string;
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
    orderId: 1,
    customerId: 101,
    vendorId: 13,
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
    customerId: 102,
    vendorId: 13,
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
      { itemId: 2, itemName: "Non-Veg Meal", quantity: 2, unitPrice: 200, specialInstructions: null },
    ],
  },
  {
    orderId: 3,
    customerId: 103,
    vendorId: 13,
    trainId: 12347,
    pnrNumber: "PNR112233",
    coachNumber: "S3",
    seatNumber: "08",
    deliveryStationId: 203,
    deliveryTime: "2023-06-14T18:30:00Z",
    orderStatus: "DELIVERED",
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

const VendorOrders: React.FC = () => {
  const { vendorId } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "DELIVERED" | "CANCELLED">("ALL");

  if (!vendorId) {
    return (
      <div className="p-4 text-center text-red-500 text-sm md:text-base">
        Please login as vendor
      </div>
    );
  }

  const vendorOrders = mockOrders.filter((order) => order.vendorId === vendorId);
  const activeOrders = vendorOrders.filter((order) =>
    ["PENDING", "PREPARING"].includes(order.orderStatus)
  );
  const filteredOrderHistory = vendorOrders.filter((order) =>
    historyFilter === "ALL"
      ? ["DELIVERED", "CANCELLED"].includes(order.orderStatus)
      : order.orderStatus === historyFilter
  );

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto space-y-6 md:space-y-8">
      {/* Active Orders Section */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            Active Orders ({activeOrders.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs md:text-sm ${statusColors.PENDING}`}
            >
              Pending: {vendorOrders.filter((o) => o.orderStatus === "PENDING").length}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs md:text-sm ${statusColors.PREPARING}`}
            >
              Preparing: {vendorOrders.filter((o) => o.orderStatus === "PREPARING").length}
            </span>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-sm md:text-base">No active orders currently</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-lg shadow-md overflow-hidden border-l-4 border-blue-500"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base">
                        Order #{order.orderId}
                      </h3>
                      <div className="flex items-center mt-1 text-xs md:text-sm text-gray-600">
                        <FaTrain className="mr-1 flex-shrink-0" />
                        <span>Train {order.trainId}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 min-w-[100px]">
                      <span
                        className={`px-2 py-1 rounded-full text-xs md:text-sm ${statusColors[order.orderStatus]}`}
                      >
                        {order.orderStatus}
                      </span>
                      <div className="flex items-center">
                        {paymentMethodIcons[order.paymentMethod]}
                        <span className="ml-1 text-xs md:text-sm">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center gap-2">
                    <div className="flex items-center">
                      <FaChair className="mr-1 text-gray-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-600">
                        {order.coachNumber}/{order.seatNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs md:text-sm text-gray-500">
                        {new Date(order.deliveryTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-semibold text-sm md:text-base">
                        ₹{order.finalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleOrderDetails(order.orderId)}
                    className="mt-3 w-full py-1.5 text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center"
                  >
                    {expandedOrderId === order.orderId ? "Hide details" : "Show details"}
                  </button>

                  {expandedOrderId === order.orderId && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-500">PNR:</span>
                        <span className="font-medium">{order.pnrNumber}</span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm">
                        <span className="text-gray-500">Payment Status:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${paymentColors[order.paymentStatus]}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      {order.deliveryInstructions && (
                        <div className="text-xs md:text-sm">
                          <p className="text-gray-500">Instructions:</p>
                          <p className="italic">{order.deliveryInstructions}</p>
                        </div>
                      )}
                      <div className="pt-2">
                        <h4 className="text-xs md:text-sm font-medium text-gray-700">
                          Items:
                        </h4>
                        <ul className="space-y-1 mt-1">
                          {order.items.map((item) => (
                            <li
                              key={item.itemId}
                              className="flex justify-between text-xs md:text-sm"
                            >
                              <span>
                                {item.itemName} × {item.quantity}
                                {item.specialInstructions && (
                                  <span className="text-xs text-gray-500 ml-1">
                                    ({item.specialInstructions})
                                  </span>
                                )}
                              </span>
                              <span>₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order History Section */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
            Order History
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHistoryFilter("ALL")}
              className={`px-3 py-1 text-xs md:text-sm rounded-full ${
                historyFilter === "ALL"
                  ? "bg-gray-800 text-white"
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

        {filteredOrderHistory.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-sm md:text-base">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  {filteredOrderHistory.map((order) => (
                    <tr key={order.orderId}>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaTrain className="mr-1 flex-shrink-0" />
                          {order.trainId}
                        </div>
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-500">
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
                        </span>
                      </td>
                      <td className="px-3 py-2 md:py-3 whitespace-nowrap text-xs md:text-sm text-gray-500">
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
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedOrderId === order.orderId ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expanded order details */}
            {filteredOrderHistory.map((order) => (
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
                            <div className="flex justify-between text-gray-500">
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

export default VendorOrders;