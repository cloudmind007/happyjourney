import React from "react";
import { History, Clock, CheckCircle, XCircle } from "lucide-react";

const OrderHistory = () => {
  const orders = [
    {
      id: "#ORD-12345",
      date: "15 June 2023",
      status: "Delivered",
      items: 3,
      amount: "₹450.00",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      id: "#ORD-12344",
      date: "14 June 2023",
      status: "Cancelled",
      items: 2,
      amount: "₹320.00",
      icon: XCircle,
      color: "text-red-500"
    },
    {
      id: "#ORD-12343",
      date: "10 June 2023",
      status: "Delivered",
      items: 5,
      amount: "₹680.00",
      icon: CheckCircle,
      color: "text-green-500"
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order History</h1>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700">
          <div className="col-span-4">Order ID</div>
          <div className="col-span-2">Items</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1">Status</div>
        </div>
        
        {orders.map((order, index) => (
          <div key={index} className="grid grid-cols-12 p-4 border-b items-center">
            <div className="col-span-4 font-medium">{order.id}</div>
            <div className="col-span-2">{order.items}</div>
            <div className="col-span-3 text-gray-600">{order.date}</div>
            <div className="col-span-2 font-medium">{order.amount}</div>
            <div className="col-span-1 flex items-center gap-1">
              <order.icon className={`${order.color}`} size={16} />
              <span className={order.color}>{order.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Load More
        </button>
      </div>
    </div>
  );
};

export default OrderHistory;