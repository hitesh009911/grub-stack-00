import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Package, MapPin, Clock, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeliveryUpdates } from '@/hooks/useDeliveryUpdates';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import DeliveryStatusBadge from '@/components/delivery/DeliveryStatusBadge';
import { useAuth } from '@/contexts/AuthContext';

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
  estimatedDeliveryTime: number;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get the actual logged-in user's ID
  const customerId = user ? parseInt(user.id) : null;
  
  const { deliveries, loading: deliveryLoading, refresh: refreshDeliveries, error: deliveryError } = useDeliveryUpdates({
    customerId,
    autoRefresh: true,
    intervalMs: 5000, // 5 seconds for faster updates
  });

  const { orders, loading: orderLoading, refresh: refreshOrders, error: orderError } = useOrderUpdates({
    userId: customerId,
    autoRefresh: true,
    intervalMs: 5000, // 5 seconds for order updates
  });

  const loading = deliveryLoading || orderLoading;
  const error = deliveryError || orderError;

  // Redirect to login if user is not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to view your orders.
              </p>
              <Button onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      ASSIGNED: { variant: 'default' as const, label: 'Assigned' },
      PICKED_UP: { variant: 'default' as const, label: 'Picked Up' },
      IN_TRANSIT: { variant: 'default' as const, label: 'In Transit' },
      DELIVERED: { variant: 'default' as const, label: 'Delivered' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    };
    return variants[status as keyof typeof variants] || variants.PENDING;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Handle refresh
  const handleRefresh = () => {
    refreshDeliveries();
    refreshOrders();
  };

  // Handle track order
  const handleTrackOrder = (orderId: number) => {
    navigate(`/orders/${orderId}/track`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading your orders...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if delivery service is not available
  if (error && error.includes('Failed to fetch deliveries')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Your Orders</h1>
              <p className="text-muted-foreground">Track and manage your food delivery orders</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Delivery Service Temporarily Unavailable</h3>
              <p className="text-muted-foreground mb-4">
                The delivery tracking service is currently unavailable. Your orders are still being processed.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Recent orders created: Order #14 (Cash on Delivery)
                </p>
                <p className="text-xs text-muted-foreground">
                  Customer ID: {customerId} | Check if delivery service is running
                </p>
                <Button onClick={() => navigate('/')}>
                  Browse Restaurants
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your Orders</h1>
            <p className="text-muted-foreground">Track and manage your food delivery orders</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Orders List */}
        {orders.length === 0 && deliveries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't placed any orders yet. Start by browsing restaurants!
              </p>
              <Button onClick={() => navigate('/')}>
                Browse Restaurants
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Show Orders with Status Tracking */}
            {orders.map((order) => {
              const delivery = deliveries.find(d => d.orderId === order.id);
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          Placed on {formatTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ₹{(order.totalCents / 100).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Order Status Tracker */}
                    <OrderStatusTracker
                      orderId={order.id}
                      status={order.status}
                      createdAt={order.createdAt}
                      estimatedTime={delivery?.estimatedDeliveryTime}
                      agent={delivery?.agent}
                      restaurantName="Restaurant Name"
                      className="mb-4"
                    />

                    {/* Delivery Status if available */}
                    {delivery && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4" />
                            <span className="text-sm font-medium">Delivery Status</span>
                            <DeliveryStatusBadge status={delivery.status} />
                          </div>
                          {delivery.agent && (
                            <div className="text-sm text-muted-foreground">
                              Agent: {delivery.agent.name}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {order.status === 'DELIVERED' && delivery?.deliveredAt && (
                          <span>Delivered on {formatTime(delivery.deliveredAt)}</span>
                        )}
                        {order.status === 'CANCELLED' && (
                          <span>Order was cancelled</span>
                        )}
                        {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                          <span>Order in progress</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
