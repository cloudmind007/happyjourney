import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItemDTO {
  itemId: number;
  itemName: string; // Added for clarity
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
  deliveryTime: string; // ISO format
  orderStatus: "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  deliveryCharges: number;
  taxAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  paymentMethod: string;
  razorpayOrderID: string | null;
  deliveryInstructions: string | null;
  items: OrderItemDTO[];
}

// Static data with itemName
const mockOrders: OrderDTO[] = [
  {
    orderId: 1,
    customerId: 101,
    vendorId: 6,
    trainId: 12345,
    pnrNumber: "PNR1234567890",
    coachNumber: "S1",
    seatNumber: "12A",
    deliveryStationId: 201,
    deliveryTime: "2025-06-14T12:30:00Z",
    orderStatus: "PENDING",
    totalAmount: 500,
    deliveryCharges: 50,
    taxAmount: 25,
    discountAmount: 10,
    finalAmount: 565,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    razorpayOrderID: "rzp_001",
    deliveryInstructions: "Leave at coach entrance",
    items: [
      { itemId: 1, itemName: "Veg Biryani", quantity: 2, unitPrice: 200, specialInstructions: "No onions" },
      { itemId: 2, itemName: "Paneer Tikka", quantity: 1, unitPrice: 100, specialInstructions: null },
    ],
  },
  {
    orderId: 2,
    customerId: 102,
    vendorId: 6,
    trainId: 12346,
    pnrNumber: "PNR0987654321",
    coachNumber: "S2",
    seatNumber: "15B",
    deliveryStationId: 202,
    deliveryTime: "2025-06-14T14:00:00Z",
    orderStatus: "PREPARING",
    totalAmount: 300,
    deliveryCharges: 40,
    taxAmount: 15,
    discountAmount: 5,
    finalAmount: 350,
    paymentStatus: "PENDING",
    paymentMethod: "CARD",
    razorpayOrderID: null,
    deliveryInstructions: "Call on arrival",
    items: [
      { itemId: 3, itemName: "Chicken Curry", quantity: 1, unitPrice: 300, specialInstructions: "Extra spicy" },
    ],
  },
  {
    orderId: 3,
    customerId: 103,
    vendorId: 6,
    trainId: 12347,
    pnrNumber: "PNR1122334455",
    coachNumber: "S3",
    seatNumber: "10C",
    deliveryStationId: 201,
    deliveryTime: "2025-06-13T18:00:00Z",
    orderStatus: "DELIVERED",
    totalAmount: 400,
    deliveryCharges: 50,
    taxAmount: 20,
    discountAmount: 0,
    finalAmount: 470,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    razorpayOrderID: "rzp_002",
    deliveryInstructions: null,
    items: [
      { itemId: 1, itemName: "Veg Biryani", quantity: 1, unitPrice: 200, specialInstructions: null },
      { itemId: 4, itemName: "Naan", quantity: 2, unitPrice: 100, specialInstructions: "No cheese" },
    ],
  },
  {
    orderId: 4,
    customerId: 104,
    vendorId: 6,
    trainId: 12348,
    pnrNumber: "PNR6677889900",
    coachNumber: "S4",
    seatNumber: "8D",
    deliveryStationId: 203,
    deliveryTime: "2025-06-12T10:00:00Z",
    orderStatus: "CANCELLED",
    totalAmount: 600,
    deliveryCharges: 60,
    taxAmount: 30,
    discountAmount: 20,
    finalAmount: 670,
    paymentStatus: "FAILED",
    paymentMethod: "CARD",
    razorpayOrderID: null,
    deliveryInstructions: "Deliver before 10 AM",
    items: [
      { itemId: 5, itemName: "Butter Chicken", quantity: 3, unitPrice: 200, specialInstructions: null },
    ],
  },
];

const VendorOrders: React.FC = () => {
  const { vendorId } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  if (!vendorId) {
    return <div className="p-4 text-center text-red-500">Vendor ID not available</div>;
  }

  // Filter orders by vendorId
  const vendorOrders = mockOrders.filter((order) => order.vendorId === vendorId);
  const activeOrders = vendorOrders.filter((order) =>
    ["PENDING", "PREPARING"].includes(order.orderStatus)
  );
  const orderHistory = vendorOrders.filter((order) =>
    ["DELIVERED", "CANCELLED"].includes(order.orderStatus)
  );

  // Summary metrics
  const totalActiveOrders = activeOrders.length;
  const totalHistoricalOrders = orderHistory.length;
  const totalRevenue = orderHistory
    .filter((order) => order.orderStatus === "DELIVERED")
    .reduce((sum, order) => sum + order.finalAmount, 0);

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center">Vendor Orders Dashboard</h1>

      {/* Summary Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Order Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-100 rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-blue-700">Active Orders</h3>
            <p className="text-3xl font-bold text-blue-900">{totalActiveOrders}</p>
          </div>
          <div className="bg-green-100 rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-green-700">Total Orders</h3>
            <p className="text-3xl font-bold text-green-900">{totalHistoricalOrders}</p>
          </div>
          <div className="bg-orange-100 rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-orange-700">Total Revenue</h3>
            <p className="text-3xl font-bold text-orange-900">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Active Orders Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Active Orders</h2>
        {activeOrders.length === 0 ? (
          <p className="text-center text-gray-500">No active orders at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500"
              >
                <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderId}</h3>
                <p className="text-gray-600">Customer ID: {order.customerId}</p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      order.orderStatus === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </p>
                <p className="text-gray-600">Final Amount: ₹{order.finalAmount.toFixed(2)}</p>
                <p className="text-gray-500 text-sm">
                  Delivery: {new Date(order.deliveryTime).toLocaleString()}
                </p>
                <button
                  onClick={() => toggleOrderDetails(order.orderId)}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  {expandedOrderId === order.orderId ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show Details
                    </>
                  )}
                </button>
                {expandedOrderId === order.orderId && (
                  <div className="mt-4 border-t border-gray-200 pt-4 text-gray-600 text-sm">
                    <p>PNR: {order.pnrNumber}</p>
                    <p>Coach/Seat: {order.coachNumber}/{order.seatNumber}</p>
                    <p>Delivery Station ID: {order.deliveryStationId}</p>
                    <p>
                      Payment: {order.paymentStatus} (
                      <span className="text-orange-600">{order.paymentMethod}</span>)
                    </p>
                    {order.razorpayOrderID && <p>Razorpay ID: {order.razorpayOrderID}</p>}
                    {order.deliveryInstructions && (
                      <p>Instructions: <span className="italic">{order.deliveryInstructions}</span></p>
                    )}
                    <h4 className="font-semibold mt-4 text-gray-700">Order Items</h4>
                    <ul className="list-disc pl-5">
                      {order.items.map((item) => (
                        <li key={item.itemId}>
                          {item.itemName}: {item.quantity} x ₹{item.unitPrice.toFixed(2)}
                          {item.specialInstructions && (
                            <span className="text-gray-500"> ({item.specialInstructions})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order History Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Order History</h2>
        {orderHistory.length === 0 ? (
          <p className="text-center text-gray-500">No orders in history.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orderHistory.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-gray-300"
              >
                <h3 className="text-lg font-semibold text-gray-800">Order #{order.orderId}</h3>
                <p className="text-gray-600">Customer ID: {order.customerId}</p>
                <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      order.orderStatus === "DELIVERED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </p>
                <p className="text-gray-600">Final Amount: ₹{order.finalAmount.toFixed(2)}</p>
                <p className="text-gray-500 text-sm">
                  Delivery: {new Date(order.deliveryTime).toLocaleString()}
                </p>
                <button
                  onClick={() => toggleOrderDetails(order.orderId)}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  {expandedOrderId === order.orderId ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show Details
                    </>
                  )}
                </button>
                {expandedOrderId === order.orderId && (
                  <div className="mt-4 border-t border-gray-200 pt-4 text-gray-600 text-sm">
                    <p>PNR: {order.pnrNumber}</p>
                    <p>Coach/Seat: {order.coachNumber}/{order.seatNumber}</p>
                    <p>Delivery Station ID: {order.deliveryStationId}</p>
                    <p>
                      Payment: {order.paymentStatus} (
                      <span className="text-orange-600">{order.paymentMethod}</span>)
                    </p>
                    {order.razorpayOrderID && <p>Razorpay ID: {order.razorpayOrderID}</p>}
                    {order.deliveryInstructions && (
                      <p>Instructions: <span className="italic">{order.deliveryInstructions}</span></p>
                    )}
                    <h4 className="font-semibold mt-4 text-gray-700">Order Items</h4>
                    <ul className="list-disc pl-5">
                      {order.items.map((item) => (
                        <li key={item.itemId}>
                          {item.itemName}: {item.quantity} x ₹{item.unitPrice.toFixed(2)}
                          {item.specialInstructions && (
                            <span className="text-gray-500"> ({item.specialInstructions})</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VendorOrders;