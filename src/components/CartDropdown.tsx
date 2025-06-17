// contexts/CartContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/utils/axios';

interface CartItem {
  itemId: number;
  quantity: number;
  unitPrice: number;
  itemName?: string;
}

interface CartSummary {
  cartId: string;
  customerId: number;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  deliveryCharges: number;
  finalAmount: number;
}

interface CartContextType {
  cart: CartSummary | null;
  loading: boolean;
  fetchCart: (vendorId: number) => Promise<void>;
  addItem: (item: {
    itemId: number;
    vendorId: number;
    quantity: number;
    specialInstructions?: string;
  }) => Promise<void>;
  removeItem: (itemId: number, vendorId: number) => Promise<void>;
  clearCart: (vendorId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const { role } = useAuth();

  const fetchCart = async (vendorId: number) => {
    if (role?.toLowerCase() !== 'user') return;
    
    setLoading(true);
    try {
      const response = await api.get(`/cart/summary`, { params: { vendorId } });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: {
    itemId: number;
    vendorId: number;
    quantity: number;
    specialInstructions?: string;
  }) => {
    try {
      await api.post(`/cart/add-item`, {
        ...item,
        trainId: 12345,
        pnrNumber: '1234567890',
        coachNumber: 'A1',
        seatNumber: '12',
        deliveryStationId: 1,
        deliveryInstructions: '',
      });
      await fetchCart(item.vendorId);
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: number, vendorId: number) => {
    try {
      await api.delete(`/cart/items/${itemId}`, { params: { vendorId } });
      await fetchCart(vendorId);
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  };

  const clearCart = async (vendorId: number) => {
    try {
      await api.delete(`/cart`, { params: { vendorId } });
      setCart(null);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, fetchCart, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};