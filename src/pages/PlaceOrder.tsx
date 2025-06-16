import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/utils/axios";
import { toast } from "sonner";
import { z } from "zod";

// Define interfaces
interface CartItem {
  itemId: number;
  quantity: number;
  unitPrice: number;
  itemName: string;
  specialInstructions?: string;
}

interface CartSummary {
  cartId: string;
  customerId: number;
  vendorId: number;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  deliveryCharges: number;
  finalAmount: number;
  pnrNumber?: string;
  trainId?: number;
  coachNumber?: string;
  seatNumber?: string;
  deliveryStationId?: number;
  deliveryInstructions?: string;
}

interface Station {
  stationId: number;
  stationName: string;
  stationCode: string;
}

interface VendorDetails {
  preparationTime: number;
  vendorName: string;
}

interface FormErrors {
  pnrNumber?: string;
  trainNumber?: string;
  coachNumber?: string;
  seatNumber?: string;
  deliveryStationId?: string;
  paymentMethod?: string;
}

// Form validation schema using zod
const formSchema = z.object({
  pnrNumber: z.string().regex(/^\d{10}$/, "PNR number must be exactly 10 digits"),
  trainNumber: z.string().min(1, "Valid train number is required").regex(/^\d+$/, "Train number must be numeric"),
  coachNumber: z.string().min(1, "Coach number is required"),
  seatNumber: z.string().min(1, "Seat number is required"),
  deliveryStationId: z.string().min(1, "Delivery station is required"),
  paymentMethod: z.enum(["COD", "ONLINE"], { message: "Please select a payment method" }),
  deliveryInstructions: z.string().optional(),
});

// Mock logger (replace with pino or similar in production)
const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${msg}`, meta),
};

// Reusable Form Field Component
const FormField: React.FC<{
  label: string;
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}> = ({ label, id, name, value, onChange, error, placeholder, type = "text", maxLength }) => (
  <div>
    <Label htmlFor={id} className="text-gray-700 font-medium">
      {label}
    </Label>
    <Input
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      maxLength={maxLength}
      className={`mt-1 rounded-lg ${error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
    {error && (
      <p id={`${id}-error`} className="text-red-600 text-sm mt-1">
        {error}
      </p>
    )}
  </div>
);

// Reusable Order Item Component
const OrderItem: React.FC<{ item: CartItem }> = ({ item }) => (
  <div className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
    <div className="flex-1">
      <p className="text-base font-medium text-gray-900">{item.itemName}</p>
      <p className="text-sm text-gray-600">
        ₹{item.unitPrice.toFixed(2)} × {item.quantity}
      </p>
      {item.specialInstructions && (
        <p className="text-xs text-gray-500 mt-1 italic">"{item.specialInstructions}"</p>
      )}
    </div>
    <p className="text-base font-medium text-gray-900">
      ₹{(item.unitPrice * item.quantity).toFixed(2)}
    </p>
  </div>
);

const PlaceOrder: React.FC = () => {
  const { userId, role, token } = useAuth();
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const effectiveVendorId = Number(vendorId);

  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [vendorDetails, setVendorDetails] = useState<VendorDetails | null>(null);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>("");
  const [formData, setFormData] = useState({
    pnrNumber: "",
    trainNumber: "",
    coachNumber: "",
    seatNumber: "",
    deliveryStationId: "",
    deliveryInstructions: "",
    paymentMethod: "COD",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Validate vendorId
  if (isNaN(effectiveVendorId) || effectiveVendorId <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Invalid Vendor ID</h2>
          <p className="text-gray-600 mb-6">Please select a valid vendor to continue.</p>
          <Button
            onClick={() => navigate("/vendors")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2"
          >
            Browse Vendors
          </Button>
        </div>
      </div>
    );
  }

  // Fetch initial data with retry logic
  const fetchInitialData = useCallback(async () => {
    if (!userId || role?.toLowerCase() !== "user") {
      toast.error("Please log in to continue");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    try {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      logger.info("Fetching initial data", { vendorId: effectiveVendorId, userId });

      // Fetch cart summary
      const cartResponse = await api.get(`/cart/summary?vendorId=${effectiveVendorId}`);
      const cartData = cartResponse.data;
      logger.info("Cart summary fetched", { cartId: cartData.cartId, itemCount: cartData.items?.length });

      if (!cartData || !cartData.items || cartData.items.length === 0) {
        logger.warn("Empty cart detected", { cartData });
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          logger.info(`Retrying cart fetch, attempt ${retryCount + 1}`, { delay });
          setTimeout(() => setRetryCount(retryCount + 1), delay);
          return;
        }
        setCartSummary(null);
        setError("Your cart is empty. Add items to proceed.");
        return;
      }

      setCartSummary(cartData);
      setFormData((prev) => ({
        ...prev,
        pnrNumber: cartData.pnrNumber || "",
        trainNumber: cartData.trainId?.toString() || "",
        coachNumber: cartData.coachNumber || "",
        seatNumber: cartData.seatNumber || "",
        deliveryStationId: cartData.deliveryStationId?.toString() || "",
        deliveryInstructions: cartData.deliveryInstructions || "",
      }));

      // Fetch stations
      const stationsResponse = await api.get("/stations");
      const stationsData = stationsResponse.data.content || [];
      setStations(stationsData);
      logger.info("Stations fetched", { stationCount: stationsData.length });

      // Fetch vendor details
      const vendorResponse = await api.get(`/vendors/${effectiveVendorId}`);
      setVendorDetails(vendorResponse.data);
      logger.info("Vendor details fetched", { vendorName: vendorResponse.data.vendorName });
    } catch (err: any) {
      logger.error("Failed to fetch initial data", { error: err.message, status: err.response?.status });
      const errorMessage = err.response?.data?.message || "Failed to load cart data. Please try again.";
      if (retryCount < maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000;
        logger.info(`Retrying fetch, attempt ${retryCount + 1}`, { delay });
        setTimeout(() => setRetryCount(retryCount + 1), delay);
        return;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId, role, token, effectiveVendorId, navigate, retryCount]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Calculate estimated delivery time
  useEffect(() => {
    if (vendorDetails?.preparationTime) {
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + vendorDetails.preparationTime * 60 * 1000);
      const formattedTime = deliveryTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setEstimatedDeliveryTime(`Estimated delivery: ${formattedTime} (${vendorDetails.preparationTime} mins)`);
    } else {
      setEstimatedDeliveryTime("Awaiting vendor preparation time...");
    }
  }, [vendorDetails]);

  // Get station name for display
  const stationDisplay = useMemo(() => {
    if (!formData.deliveryStationId) return "Not selected";
    const station = stations.find((s) => s.stationId === Number(formData.deliveryStationId));
    return station ? `${station.stationName} (${station.stationCode})` : "Unknown station";
  }, [formData.deliveryStationId, stations]);

  // Form validation
  const validateForm = useCallback(() => {
    try {
      formSchema.parse(formData);
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        err.errors.forEach((error) => {
          newErrors[error.path[0] as keyof FormErrors] = error.message;
        });
        setErrors(newErrors);
        logger.warn("Form validation failed", { errors: newErrors });
        return false;
      }
      return false;
    }
  }, [formData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Place order handler
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please correct the form errors");
      logger.warn("Order placement aborted due to form errors");
      return;
    }

    if (!cartSummary || !cartSummary.items.length) {
      setError("Your cart is empty. Add items to proceed.");
      toast.error("Your cart is empty");
      logger.error("Empty cart during order placement");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const deliveryTime = new Date(now.getTime() + (vendorDetails?.preparationTime || 30) * 60 * 1000);

      // Prepare order payload with itemName
      const orderPayload = {
        vendorId: effectiveVendorId,
        paymentMethod: formData.paymentMethod === "ONLINE" ? "RAZORPAY" : "COD",
        deliveryTime: deliveryTime.toISOString(),
        pnrNumber: formData.pnrNumber,
        trainId: Number(formData.trainNumber),
        coachNumber: formData.coachNumber,
        seatNumber: formData.seatNumber,
        deliveryStationId: Number(formData.deliveryStationId),
        deliveryInstructions: formData.deliveryInstructions,
        items: cartSummary.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemName: item.itemName, // Include itemName
          specialInstructions: item.specialInstructions,
        })),
      };

      logger.info("Creating order", { vendorId: effectiveVendorId, paymentMethod: formData.paymentMethod });
      const response = await api.post("/orders", orderPayload);
      const order = response.data;
      logger.info("Order created successfully", { orderId: order.orderId });

      if (formData.paymentMethod === "ONLINE") {
        const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
        if (!razorpayKey) {
          throw new Error("Razorpay key not configured");
        }

        const options = {
          key: razorpayKey,
          amount: order.finalAmount * 100,
          currency: "INR",
          name: "Railswad",
          description: `Food Order #${order.orderId}`,
          order_id: order.razorpayOrderID,
          handler: async function (response: any) {
            try {
              logger.info("Verifying payment", { orderId: order.orderId });
              await api.post(`/payments/verify-payment/${order.orderId}`, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              setCartSummary(null);
              toast.success("Payment successful!");
              navigate(`/order-confirmation/${order.orderId}`);
            } catch (error: any) {
              logger.error("Payment verification failed", { error: error.message });
              toast.error(error.response?.data?.message || "Payment verification failed");
              setIsLoading(false);
            }
          },
          prefill: {
            name: "Customer Name", // TODO: Fetch from useAuth
            email: "customer@example.com",
            contact: "9999999999",
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: () => {
              toast.error("Payment cancelled");
              setIsLoading(false);
              logger.warn("Payment cancelled by user");
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.on("payment.failed", function (response: any) {
          toast.error(`Payment failed: ${response.error.description}`);
          setIsLoading(false);
          logger.error("Payment failed", { description: response.error.description });
        });
        razorpay.open();
      } else {
        setCartSummary(null);
        toast.success("Order placed successfully!");
        navigate(`/order-confirmation/${order.orderId}`);
      }
    } catch (err: any) {
      logger.error("Order processing failed", { error: err.message, status: err.response?.status });
      const errorMessage = err.response?.data?.message || "Failed to process your order. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (formData.paymentMethod !== "ONLINE") {
        setIsLoading(false);
      }
    }
  };

  // Loading state with skeleton
  if (isLoading && !cartSummary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-7xl w-full p-8 space-y-6">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-2 bg-white p-8 rounded-2xl shadow-xl space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartSummary || !cartSummary.items?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious items to your cart to place an order.</p>
          <Button
            onClick={() => navigate(`/vendor/${effectiveVendorId}/menu`)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2"
          >
            Browse Menu
          </Button>
          <Button
            onClick={() => {
              setRetryCount(0);
              fetchInitialData();
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-full px-6 py-2 mt-4"
          >
            Retry Loading Cart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
          Place Order with {vendorDetails?.vendorName || "Vendor"}
        </h1>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.732 6.732a1 1 0 011.414 0L10 7.586l.854-.854a1 1 0 111.414 1.414L11.414 9l.854.854a1 1 0 11-1.414 1.414L10 10.414l-.854.854a1 1 0 11-1.414-1.414L8.586 9l-.854-.854a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">Delivery Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="PNR Number"
                id="pnrNumber"
                name="pnrNumber"
                value={formData.pnrNumber}
                onChange={handleInputChange}
                error={errors.pnrNumber}
                placeholder="Enter 10-digit PNR"
                maxLength={10}
              />
              <FormField
                label="Train Number"
                id="trainNumber"
                name="trainNumber"
                value={formData.trainNumber}
                onChange={handleInputChange}
                error={errors.trainNumber}
                placeholder="e.g., 12345"
              />
              <FormField
                label="Coach Number"
                id="coachNumber"
                name="coachNumber"
                value={formData.coachNumber}
                onChange={handleInputChange}
                error={errors.coachNumber}
                placeholder="e.g., A1"
              />
              <FormField
                label="Seat Number"
                id="seatNumber"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleInputChange}
                error={errors.seatNumber}
                placeholder="e.g., 12"
              />
              <div className="md:col-span-2">
                <Label htmlFor="deliveryStationId" className="text-gray-700 font-medium">
                  Delivery Station
                </Label>
                <Input
                  id="deliveryStationId"
                  value={stationDisplay}
                  readOnly
                  className={`mt-1 rounded-lg bg-gray-100 cursor-not-allowed ${errors.deliveryStationId ? "border-red-500 focus:ring-red-500" : ""}`}
                  aria-invalid={!!errors.deliveryStationId}
                  aria-describedby={errors.deliveryStationId ? "deliveryStationId-error" : undefined}
                />
                {errors.deliveryStationId && (
                  <p id="deliveryStationId-error" className="text-red-600 text-sm mt-1">
                    {errors.deliveryStationId}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium">{estimatedDeliveryTime}</p>
                  <p className="text-sm text-blue-600 mt-1">Based on vendor's preparation time</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="deliveryInstructions" className="text-gray-700 font-medium">
                  Delivery Instructions (Optional)
                </Label>
                <Textarea
                  id="deliveryInstructions"
                  name="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={handleInputChange}
                  placeholder="e.g., Call before delivery"
                  className="mt-1 rounded-lg h-24 focus:ring-blue-500"
                  aria-describedby="deliveryInstructions-desc"
                />
                <p id="deliveryInstructions-desc" className="text-sm text-gray-500 mt-1">
                  Add any special instructions for the delivery person
                </p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="paymentMethod" className="text-gray-700 font-medium">
                  Payment Method
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange("paymentMethod", value)}
                  value={formData.paymentMethod}
                >
                  <SelectTrigger
                    className={`mt-1 rounded-lg ${errors.paymentMethod ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                    aria-invalid={!!errors.paymentMethod}
                    aria-describedby={errors.paymentMethod ? "paymentMethod-error" : undefined}
                  >
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-lg shadow-lg">
                    <SelectItem value="COD" className="hover:bg-gray-100">
                      Cash on Delivery (COD)
                    </SelectItem>
                    <SelectItem value="ONLINE" className="hover:bg-gray-100">
                      Online Payment (Razorpay)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && (
                  <p id="paymentMethod-error" className="text-red-600 text-sm mt-1">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl p-8 lg:sticky lg:top-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
              {cartSummary.items.map((item) => (
                <OrderItem key={item.itemId} item={item} />
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span>₹{cartSummary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Tax ({((cartSummary.taxAmount / cartSummary.subtotal) * 100).toFixed(1)}%)</span>
                <span>₹{cartSummary.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Delivery</span>
                <span>₹{cartSummary.deliveryCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3">
                <span>Total</span>
                <span>₹{cartSummary.finalAmount.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full py-3 text-lg font-semibold transition-all duration-200 flex items-center justify-center"
              onClick={handlePlaceOrder}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : null}
              {isLoading ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;