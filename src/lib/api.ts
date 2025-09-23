import axios from "axios";

export const api = axios.create({
	baseURL: "/api",
});

// Direct user service API (temporary workaround for API Gateway routing issue)
export const userApi = axios.create({
	baseURL: "http://localhost:8082",
});

// Delivery service API functions
export const deliveryApi = {
  // Get delivery by order ID
  getDeliveryByOrder: async (orderId: number) => {
    const response = await fetch(`/api/deliveries/order/${orderId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch delivery');
    }
    return response.json();
  },

  // Get deliveries by customer ID
  getDeliveriesByCustomer: async (customerId: number) => {
    const response = await fetch(`/api/deliveries/customer/${customerId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch deliveries');
    }
    return response.json();
  },

  // Get all deliveries
  getAllDeliveries: async () => {
    const response = await fetch(`/api/deliveries`);
    if (!response.ok) {
      throw new Error('Failed to fetch deliveries');
    }
    return response.json();
  },

  // Create delivery
  createDelivery: async (deliveryData: {
    orderId: number;
    restaurantId: number;
    customerId: number;
    pickupAddress: string;
    deliveryAddress: string;
  }) => {
    const response = await fetch(`/api/deliveries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deliveryData),
    });
    if (!response.ok) {
      throw new Error('Failed to create delivery');
    }
    return response.json();
  },

  // Update delivery status
  updateDeliveryStatus: async (deliveryId: number, status: string) => {
    const response = await fetch(`/api/deliveries/${deliveryId}/status?status=${status}`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error('Failed to update delivery status');
    }
    return response.json();
  },

  // Assign delivery to agent
  assignDelivery: async (deliveryId: number, agentId: number) => {
    const response = await fetch(`/api/deliveries/${deliveryId}/assign?agentId=${agentId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to assign delivery');
    }
    return response.json();
  },

  // Auto-assign delivery
  autoAssignDelivery: async (deliveryId: number) => {
    const response = await fetch(`/api/deliveries/${deliveryId}/auto-assign`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to auto-assign delivery');
    }
    return response.json();
  },
};

export default api;


