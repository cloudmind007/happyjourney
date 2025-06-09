import { useState } from "react";
import {
  LayoutDashboard,
  Image,
  FileText,
  Package,
  UtensilsCrossed,
  Users,
  ShoppingCart,
  CreditCard,
  MapPin,
  Award,
  Star,
  Palette,
  Globe,
  RefreshCw,
  DollarSign,
  TrendingUp,
  UserPlus,
  Menu,
  ChevronRight,
  Eye,
} from "lucide-react";

const Dashboard = () => {
  const statsCards = [
    {
      title: "Total Earnings",
      value: "0.00",
      icon: DollarSign,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      title: "Total Payouts",
      value: "0.00",
      icon: TrendingUp,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
    {
      title: "Total Restaurant",
      value: "93",
      icon: UtensilsCrossed,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      title: "Total Customers",
      value: "12",
      icon: UserPlus,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
  ];

  const orderStats = [
    { label: "In Pending", value: "3", color: "text-gray-600" },
    { label: "In Progress", value: "2", color: "text-blue-600" },
    { label: "Completed", value: "11", color: "text-green-600" },
  ];

  const todayStats = [
    { label: "In Pending", value: "0", color: "text-gray-600" },
    { label: "In Progress", value: "0", color: "text-blue-600" },
    { label: "Completed", value: "0", color: "text-green-600" },
  ];

  const payoutStats = [
    { label: "In Pending", value: "0", color: "text-gray-600" },
    { label: "In Progress", value: "0", color: "text-blue-600" },
    { label: "Completed", value: "0", color: "text-green-600" },
  ];

  const orders = [
    {
      id: 1,
      title: "Relswad Train Food Delivery – New",
      type: "Home Delivery",
      amount: "182",
      author: "Sigri Restaurant",
      status: "active",
    },
    {
      id: 2,
      title: "Don't Miss Our Tasty Deals – Available on All Major Routes.",
      type: "Home Delivery",
      amount: "182",
      author: "Sigri Restaurant",
      status: "active",
    },
    {
      id: 3,
      title: "Special Combo Meal",
      type: "Home Delivery",
      amount: "182",
      author: "Sigri Restaurant",
      status: "active",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 border"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <card.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold mb-4">Order Statistics</h3>
              <div className="space-y-4">
                {orderStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className={`text-lg font-semibold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded">
                    <ShoppingCart size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-blue-600">17</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Order Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold mb-4">
                Today's Order Statistics
              </h3>
              <div className="space-y-4">
                {todayStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className={`text-lg font-semibold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded">
                    <ShoppingCart size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-xl font-bold text-blue-600">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payout Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold mb-4">Payout Statistics</h3>
              <div className="space-y-4">
                {payoutStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className={`text-lg font-semibold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded">
                    <CreditCard size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Payouts</p>
                    <p className="text-xl font-bold text-blue-600">0</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  New Restaurant Request
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  New Rider Request
                </h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View All
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex space-x-8">
                  <h3 className="text-lg font-semibold text-blue-600">
                    Announcement
                  </h3>
                  <h3 className="text-lg font-semibold text-blue-600">
                    New Order
                  </h3>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  View All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {order.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-orange-600 font-medium text-sm">
                              S
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.author}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Show</option>
                  <option>Hide</option>
                </select>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
