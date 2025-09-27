import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Clock, Eye, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeliveryUpdates } from '@/hooks/useDeliveryUpdates';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import DeliveryStatusBadge from '@/components/delivery/DeliveryStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import TruckLoader from '@/components/ui/TruckLoader';

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

  // Handle cancel order
  const handleCancelOrder = async (orderId: number, status: string) => {
    // Check if order is in PREPARING state
    if (status === 'PREPARING') {
      toast({
        title: "Cannot Cancel Order",
        description: "Your order is already being prepared and cannot be cancelled. Please contact the restaurant directly.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      
      if (response.status === 200) {
        toast({
          title: "Order Cancelled",
          description: `Order #${orderId} has been cancelled successfully.`,
        });
        
        // Refresh orders to get updated status
        refreshOrders();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  // Check if order can be cancelled (not in DELIVERED or CANCELLED state)
  const canCancelOrder = (status: string) => {
    return !['DELIVERED', 'CANCELLED'].includes(status);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <TruckLoader />
            <span className="mt-4 text-muted-foreground">Loading your orders...</span>
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
                Delivery details will be updated soon. Your orders are still being processed.
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

  // Separate orders into recent (not delivered) and past deliveries (delivered)
  console.log('All orders in OrdersPage:', orders);
  console.log('Order statuses:', orders.map(o => ({ id: o.id, status: o.status })));
  const recentOrders = orders.filter(order => !['DELIVERED', 'CANCELLED'].includes(order.status));
  const pastDeliveries = orders.filter(order => ['DELIVERED', 'CANCELLED'].includes(order.status));
  console.log('Recent orders (not delivered):', recentOrders.map(o => ({ id: o.id, status: o.status })));
  console.log('Past deliveries (delivered/cancelled):', pastDeliveries.map(o => ({ id: o.id, status: o.status })));

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

        {/* Recent Orders Section */}
        {recentOrders.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Badge variant="secondary">{recentOrders.length}</Badge>
            </div>
            {recentOrders.map((order) => {
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
                      restaurantLocation={delivery?.pickupAddress}
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
                        <span>Order in progress</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {canCancelOrder(order.status) && (
                          <Button
                            variant={order.status === 'PREPARING' ? 'outline' : 'destructive'}
                            size="sm"
                            onClick={() => handleCancelOrder(order.id, order.status)}
                            className={order.status === 'PREPARING' ? 'border-orange-500 text-orange-500 hover:bg-orange-50' : ''}
                          >
                            <X className="h-4 w-4 mr-2" />
                            {order.status === 'PREPARING' ? 'Cannot Cancel' : 'Cancel Order'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTrackOrder(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Track Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Past Deliveries Section */}
        {pastDeliveries.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold">Past Deliveries</h2>
              <Badge variant="outline">{pastDeliveries.length}</Badge>
            </div>
            {pastDeliveries.map((order) => {
              const delivery = deliveries.find(d => d.orderId === order.id);
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow opacity-90">
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

                    {/* Order Status */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge variant={order.status === 'DELIVERED' ? 'default' : 'destructive'}>
                          {order.status === 'DELIVERED' ? 'Delivered' : 'Cancelled'}
                        </Badge>
                      </div>
                      {order.status === 'DELIVERED' && delivery?.deliveredAt && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Delivered on {formatTime(delivery.deliveredAt)}
                        </p>
                      )}
                      {order.status === 'CANCELLED' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Order was cancelled
                        </p>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {order.status === 'DELIVERED' ? 'Order completed' : 'Order cancelled'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrackOrder(order.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Orders State */}
        {orders.length === 0 && deliveries.length === 0 && (
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
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
