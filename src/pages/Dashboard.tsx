import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, UtensilsCrossed, TrendingUp } from 'lucide-react';
import api from '../utils/axios'; // Adjust path based on your project structure
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define interfaces for DTOs based on Java backend
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

// Define interface for API params
interface ApiParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  sortBy?: string;
}

const Dashboard = () => {
  const [vendors, setVendors] = useState<VendorSalesOverviewDTO[]>([]);
  const [stations, setStations] = useState<StationSalesOverviewDTO[]>([]);
  const [topItems, setTopItems] = useState<TopSellingItemDTO[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySalesDTO[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
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

  // Fetch Vendors Sales Overview
  const fetchVendorsSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ApiParams = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) params.endDate = new Date(endDate).toISOString();
      const response = await api.get<VendorSalesOverviewDTO[]>('/admin/analytics/vendors/sales', { params });
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

  // Initial data fetch
  useEffect(() => {
    fetchVendorsSales();
    fetchStationsSales();
  }, []);

  // Fetch top items and monthly sales when vendor or dates change
  useEffect(() => {
    if (selectedVendor) {
      fetchTopItems(selectedVendor);
      fetchMonthlySales(selectedVendor);
    } else {
      setTopItems([]);
      setMonthlySales([]);
    }
  }, [selectedVendor, startDate, endDate]);

  // Handle filter submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVendorsSales();
    if (selectedVendor) {
      fetchTopItems(selectedVendor);
      fetchMonthlySales(selectedVendor);
    }
  };

  // Calculate stats for cards
  const totalEarnings = vendors.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  const totalOrders = vendors.reduce((sum, v) => sum + (v.orderCount || 0), 0);
  const totalRestaurants = vendors.length;
  const avgOrderValue = totalOrders ? (totalEarnings / totalOrders).toFixed(2) : '0.00';
  const formattedTotalEarnings = totalEarnings.toFixed(2);

  const statsCards = [
    {
      title: 'Total Earnings',
      value: `₹${formattedTotalEarnings}`,
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
      title: 'Avg Order Value',
      value: `₹${avgOrderValue}`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  // Monthly Sales Chart Data
  const chartData = {
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

      {/* Date and Vendor Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h3 className="text-lg font-semibold mb-4">Filter Data</h3>
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
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

      {/* Monthly Sales Chart */}
      {selectedVendor && monthlySales.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
          <Bar
            data={chartData}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Value' },
                },
                x: {
                  title: { display: true, text: 'Month' },
                },
              },
              plugins: {
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Monthly Sales Overview' },
              },
            }}
          />
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
                    <td className="px-6 py-4 text-sm text-gray-900">{vendor.orderCount}</td>
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