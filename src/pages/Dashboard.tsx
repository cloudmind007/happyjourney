import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, UtensilsCrossed, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../utils/axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Define interfaces for DTOs
interface VendorSalesOverviewDTO {
  vendorId: number;
  businessName: string;
  orderCount: number;
  totalAmount: number;
}

interface StationSalesOverviewDTO {
  stationId: number;
  stationName: string;
  orderCount: number;
  totalAmount: number;
}

interface TopSellingItemDTO {
  itemId: number;
  itemName: string;
  category: string;
  quantitySold: number;
  totalRevenue: number;
}

interface MonthlySalesDTO {
  month: string;
  totalOrders: number;
  totalRevenue: number;
}

interface OrderStatusBreakdownDTO {
  status: string;
  orderCount: number;
  totalAmount: number;
}

interface ComplaintSummaryDTO {
  status: string;
  count: number;
}

interface VendorDTO {
  vendorId: number;
  businessName: string;
  description: string;
  logoUrl: string;
  isVeg: boolean;
  rating: number;
  activeStatus: boolean;
}

interface OrderDTO {
  orderId: number;
  orderStatus: string;
  totalAmount: number;
  finalAmount: number;
  deliveryTime: string;
}

interface StationDTO {
  stationId: number;
  stationName: string;
}

interface ApiParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  sortBy?: string;
  page?: number;
  size?: number;
}

const Dashboard = () => {
  const [vendors, setVendors] = useState<VendorSalesOverviewDTO[]>([]);
  const [stations, setStations] = useState<StationSalesOverviewDTO[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItemDTO[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesDTO[]>([]);
  const [orderStatusBreakdown, setOrderStatusBreakdown] = useState<OrderStatusBreakdownDTO[]>([]);
  const [complaintSummary, setComplaintSummary] = useState<ComplaintSummaryDTO[]>([]);
  const [vendorDetails, setVendorDetails] = useState<VendorDTO | null>(null);
  const [activeOrders, setActiveOrders] = useState<OrderDTO[]>([]);
  const [allStations, setAllStations] = useState<StationDTO[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for fallback
  const mockVendors: VendorSalesOverviewDTO[] = [
    { vendorId: 1, businessName: 'Sigri Restaurant', orderCount: 50, totalAmount: 5000.0 },
    { vendorId: 2, businessName: 'Tasty Bites', orderCount: 30, totalAmount: 3000.0 },
  ];
  const mockStations: StationSalesOverviewDTO[] = [
    { stationId: 1, stationName: 'Central Station', orderCount: 100, totalAmount: 10000.0 },
    { stationId: 2, stationName: 'North Station', orderCount: 80, totalAmount: 8000.0 },
  ];
  const mockTopItems: TopSellingItemDTO[] = [
    { itemId: 1, itemName: 'Biryani', category: 'Main Course', quantitySold: 200, totalRevenue: 2000.0 },
    { itemId: 2, itemName: 'Pizza', category: 'Fast Food', quantitySold: 150, totalRevenue: 1800.0 },
  ];
  const mockMonthlySales: MonthlySalesDTO[] = [
    { month: 'Jan 2025', totalOrders: 20, totalRevenue: 2000.0 },
    { month: 'Feb 2025', totalOrders: 30, totalRevenue: 3000.0 },
  ];
  const mockOrderStatusBreakdown: OrderStatusBreakdownDTO[] = [
    { status: 'PLACED', orderCount: 10, totalAmount: 1000.0 },
    { status: 'PREPARING', orderCount: 5, totalAmount: 500.0 },
  ];
  const mockComplaintSummary: ComplaintSummaryDTO[] = [
    { status: 'OPEN', count: 5 },
    { status: 'RESOLVED', count: 3 },
  ];
  const mockVendorDetails: VendorDTO = {
    vendorId: 1,
    businessName: 'Sigri Restaurant',
    description: 'Delicious Indian cuisine',
    logoUrl: '',
    isVeg: false,
    rating: 4.5,
    activeStatus: true,
  };
  const mockActiveOrders: OrderDTO[] = [
    { orderId: 1, orderStatus: 'PLACED', totalAmount: 500.0, finalAmount: 550.0, deliveryTime: new Date().toISOString() },
  ];

  // Fetch all stations
  const fetchAllStations = async () => {
    try {
      const response = await api.get<StationDTO[]>('/stations');
      setAllStations(response.data || []);
    } catch (err) {
      console.error('Error fetching stations:', err);
      setAllStations([]);
    }
  };

  // Fetch Vendors Sales Overview
  const fetchVendorsSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ApiParams = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      if (selectedStation) params.stationId = selectedStation;
      const response = await api.get<VendorSalesOverviewDTO[]>(
        selectedStation ? `/stations/${selectedStation}/vendors/sales` : '/admin/analytics/vendors/sales',
        { params }
      );
      setVendors(response.data || []);
    } catch (err) {
      console.error('Error fetching vendors sales:', err);
      setError('Failed to fetch vendor sales data. Using mock data.');
      setVendors(mockVendors);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stations Last Month Sales
  const fetchStationsSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<StationSalesOverviewDTO[]>('/admin/analytics/stations/sales/last-month');
      setStations(response.data || []);
    } catch (err) {
      console.error('Error fetching stations sales:', err);
      setError('Failed to fetch station sales data. Using mock data.');
      setStations(mockStations);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Top Selling Items for a Vendor
  const fetchTopItems = async (vendorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: ApiParams = { limit: 5, sortBy: 'quantity' };
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const response = await api.get<TopSellingItemDTO[]>(`/admin/analytics/vendors/${vendorId}/favorite-items`, { params });
      setTopItems(response.data || []);
    } catch (err) {
      console.error('Error fetching top items:', err);
      setError('Failed to fetch top items data. Using mock data.');
      setTopItems(mockTopItems);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Monthly Sales for a Vendor
  const fetchMonthlySales = async (vendorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: ApiParams = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const response = await api.get<MonthlySalesDTO[]>(`/admin/analytics/vendors/${vendorId}/sales/monthly`, { params });
      setMonthlySales(response.data || []);
    } catch (err) {
      console.error('Error fetching monthly sales:', err);
      setError('Failed to fetch monthly sales data. Using mock data.');
      setMonthlySales(mockMonthlySales);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Order Status Breakdown
  const fetchOrderStatusBreakdown = async (vendorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: ApiParams = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const response = await api.get<OrderStatusBreakdownDTO[]>(
        `/admin/analytics/vendors/${vendorId}/order-status-breakdown`,
        { params }
      );
      setOrderStatusBreakdown(response.data || []);
    } catch (err) {
      console.error('Error fetching order status breakdown:', err);
      setError('Failed to fetch order status breakdown data. Using mock data.');
      setOrderStatusBreakdown(mockOrderStatusBreakdown);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Complaint Summary
  const fetchComplaintSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ApiParams = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const response = await api.get<ComplaintSummaryDTO[]>('/admin/analytics/complaints/summary', { params });
      setComplaintSummary(response.data || []);
    } catch (err) {
      console.error('Error fetching complaint summary:', err);
      setError('Failed to fetch complaint summary data. Using mock data.');
      setComplaintSummary(mockComplaintSummary);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Vendor Details
  const fetchVendorDetails = async (vendorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<VendorDTO>(`/admin/analytics/vendors/${vendorId}/details`);
      setVendorDetails(response.data || null);
    } catch (err) {
      console.error('Error fetching vendor details:', err);
      setError('Failed to fetch vendor details. Using mock data.');
      setVendorDetails(mockVendorDetails);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Active Orders
  const fetchActiveOrders = async (vendorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: ApiParams = { page: 0, size: 10 };
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const response = await api.get<{ content: OrderDTO[] }>(`/admin/analytics/vendors/${vendorId}/active-orders`, { params });
      setActiveOrders(response.data.content || []);
    } catch (err) {
      console.error('Error fetching active orders:', err);
      setError('Failed to fetch active orders data. Using mock data.');
      setActiveOrders(mockActiveOrders);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAllStations();
    fetchVendorsSales();
    fetchStationsSales();
    fetchComplaintSummary();
  }, []);

  // Fetch vendor-specific data when vendor or dates change
  useEffect(() => {
    if (selectedVendor) {
      fetchTopItems(selectedVendor);
      fetchMonthlySales(selectedVendor);
      fetchOrderStatusBreakdown(selectedVendor);
      fetchVendorDetails(selectedVendor);
      fetchActiveOrders(selectedVendor);
    } else {
      setTopItems([]);
      setMonthlySales([]);
      setOrderStatusBreakdown([]);
      setVendorDetails(null);
      setActiveOrders([]);
    }
  }, [selectedVendor, startDate, endDate]);

  // Refetch vendors when station changes
  useEffect(() => {
    fetchVendorsSales();
  }, [selectedStation, startDate, endDate]);

  // Handle filter submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVendorsSales();
    fetchComplaintSummary();
    if (selectedVendor) {
      fetchTopItems(selectedVendor);
      fetchMonthlySales(selectedVendor);
      fetchOrderStatusBreakdown(selectedVendor);
      fetchVendorDetails(selectedVendor);
      fetchActiveOrders(selectedVendor);
    }
  };

  // Calculate stats for cards
  const totalEarnings = vendors.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  const totalOrders = vendors.reduce((sum, v) => sum + (v.orderCount || 0), 0);
  const totalRestaurants = vendors.length;
  const avgOrderValue = totalOrders ? (totalEarnings / totalOrders).toFixed(2) : '0.00';
  const totalComplaints = complaintSummary.reduce((sum, c) => sum + c.count, 0);

  const statsCards = [
    {
      title: 'Total Earnings',
      value: `₹${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Restaurants',
      value: totalRestaurants,
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      title: 'Total Complaints',
      value: totalComplaints,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  // Monthly Sales Chart Data
  const monthlySalesChartData = {
    labels: monthlySales.map((sale) => sale.month),
    datasets: [
      {
        label: 'Total Revenue',
        data: monthlySales.map((sale) => sale.totalRevenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Orders',
        data: monthlySales.map((sale) => sale.totalOrders),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Order Status Breakdown Chart Data
  const orderStatusChartData = {
    labels: orderStatusBreakdown.map((status) => status.status),
    datasets: [
      {
        label: 'Order Count',
        data: orderStatusBreakdown.map((status) => status.orderCount),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  // StatCard Component
  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    color: string;
    textColor: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, textColor }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Loading and Error States */}
      {loading && <p className="text-center text-blue-600">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold mb-4">Filter Data</h3>
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
          >
            <option value="">Select Station</option>
            {allStations.map((station) => (
              <option key={station.stationId} value={station.stationId}>
                {station.stationName}
              </option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
          >
            <option value="">Select Vendor</option>
            {vendors.map((vendor) => (
              <option key={vendor.vendorId} value={vendor.vendorId}>
                {vendor.businessName}
              </option>
            ))}
          </select>
          <input
            type="datetime-local"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="datetime-local"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </form>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            textColor={card.textColor}
          />
        ))}
      </div>

      {/* Vendor Details */}
      {vendorDetails && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Vendor Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Business Name</p>
              <p className="text-lg font-semibold">{vendorDetails.businessName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-sm">{vendorDetails.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vegetarian</p>
              <p className="text-sm">{vendorDetails.isVeg ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-sm">{vendorDetails.rating.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Status</p>
              <p className="text-sm">{vendorDetails.activeStatus ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Sales Chart */}
      {selectedVendor && monthlySales.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
          <Bar
            data={monthlySalesChartData}
            options={{
              scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Value' } },
                x: { title: { display: true, text: 'Month' } },
              },
              plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Monthly Sales Overview' },
              },
            }}
          />
        </div>
      )}

      {/* Order Status Breakdown Chart */}
      {selectedVendor && orderStatusBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Order Status Breakdown</h3>
          <Pie
            data={orderStatusChartData}
            options={{
              plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Order Status Distribution' },
              },
            }}
          />
        </div>
      )}

      {/* Complaint Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold mb-4">Complaint Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {complaintSummary.length > 0 ? (
                complaintSummary.map((complaint) => (
                  <tr key={complaint.status} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{complaint.status}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{complaint.count}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No complaint data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Orders */}
      {selectedVendor && activeOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Active Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{order.orderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{order.orderStatus}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{order.finalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(order.deliveryTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vendors Sales Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold mb-4">Vendors Sales Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.length > 0 ? (
                vendors.map((vendor) => (
                  <tr key={vendor.vendorId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{vendor.businessName}</td>
                    <td className="px-6 py-4 text-sm text-gr
ay-900">{vendor.orderCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{vendor.totalAmount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No vendor data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stations Last Month Sales */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold mb-4">Stations Last Month Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stations.length > 0 ? (
                stations.map((station) => (
                  <tr key={station.stationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{station.stationName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{station.orderCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{station.totalAmount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                    No station data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Selling Items */}
      {selectedVendor && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topItems.length > 0 ? (
                  topItems.map((item) => (
                    <tr key={item.itemId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.itemName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.quantitySold}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₹{item.totalRevenue.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-sm text-gray-500 text-center">
                      No top items data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;