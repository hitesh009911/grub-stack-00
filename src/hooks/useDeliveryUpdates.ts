import { useState, useEffect, useCallback } from 'react';
import { deliveryApi } from '@/lib/api';

interface Delivery {
  id: number;
  orderId: number;
  restaurantId: number;
  customerId: number;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  estimatedDeliveryTime: number;
  agent?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    vehicleType: string;
    status: string;
  };
}

interface UseDeliveryUpdatesOptions {
  orderId?: number;
  customerId?: number;
  intervalMs?: number;
  autoRefresh?: boolean;
}

export const useDeliveryUpdates = (options: UseDeliveryUpdatesOptions = {}) => {
  const { orderId, customerId, intervalMs = 30000, autoRefresh = true } = options;
  
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDelivery = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setError(null);
      const data = await deliveryApi.getDeliveryByOrder(orderId);
      setDelivery(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch delivery');
    }
  }, [orderId]);

  const fetchDeliveries = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setError(null);
      const data = await deliveryApi.getDeliveriesByCustomer(customerId);
      setDeliveries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deliveries');
    }
  }, [customerId]);

  const fetchData = useCallback(async () => {
    if (orderId) {
      await fetchDelivery();
    } else if (customerId) {
      await fetchDeliveries();
    }
  }, [orderId, customerId, fetchDelivery, fetchDeliveries]);

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
    delivery,
    deliveries,
    loading,
    error,
    refresh,
  };
};

export default useDeliveryUpdates;
