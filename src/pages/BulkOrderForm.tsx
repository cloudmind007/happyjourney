import React, { useState } from "react";
import api from "@/utils/axios";
import { useNavigate } from "react-router-dom";

const BulkOrderForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryStation: "",
    orderDetails: "",
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post("/api/bulk-orders", formData);
      if (response.status === 200 || response.status === 201) {
        setSuccess("Bulk order submitted successfully!");
        setTimeout(() => navigate("/"), 2000); // Redirect to home after 2 seconds
      }
    } catch (err) {
      setError("Failed to submit bulk order. Please try again.");
      console.error("Error submitting bulk order:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-6">BULK ORDER FORM</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Your email"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Your phone number"
            />
          </div>
          <div>
            <label htmlFor="deliveryStation" className="block text-sm font-medium text-gray-700">
              Delivery Station
            </label>
            <input
              type="text"
              id="deliveryStation"
              name="deliveryStation"
              value={formData.deliveryStation}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Delivery station"
            />
          </div>
          <div>
            <label htmlFor="orderDetails" className="block text-sm font-medium text-gray-700">
              Order Details
            </label>
            <textarea
              id="orderDetails"
              name="orderDetails"
              value={formData.orderDetails}
              onChange={handleChange}
              required
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Specify your order details (e.g., menu items)"
              rows={4}
            />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Number of meals"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Submitting..." : "Submit Bulk Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkOrderForm;