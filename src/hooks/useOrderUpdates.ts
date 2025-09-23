import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

interface Order {
  id: number;
  restaurantId: number;
  userId: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  totalCents: number;
  createdAt: string;
  items: Array<{
    id: number;
    menuItemId: number;
    quantity: number;
    priceCents: number;
  }>;
}

interface UseOrderUpdatesOptions {
  orderId?: number;
  userId?: number;
  intervalMs?: number;
  autoRefresh?: boolean;
}

export const useOrderUpdates = (options: UseOrderUpdatesOptions = {}) => {
  const { orderId, userId, intervalMs = 5000, autoRefresh = true } = options;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setError(null);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    }
  }, [orderId]);

  const fetchOrders = useCallback(async () => {
    if (!userId) return;
    
    try {
      setError(null);
      const response = await api.get('/orders/all');
      // Filter orders by user ID (in real app, this would be done by backend)
      const userOrders = response.data.filter((order: Order) => order.userId === userId);
      setOrders(userOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    }
  }, [userId]);

  const fetchData = useCallback(async () => {
    if (orderId) {
      await fetchOrder();
    } else if (userId) {
      await fetchOrders();
    }
  }, [orderId, userId, fetchOrder, fetchOrders]);

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    
    loadData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh, intervalMs]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  }, [fetchData]);

  return {
    order,
    orders,
    loading,
    error,
    refresh,
  };
};

export default useOrderUpdates;

