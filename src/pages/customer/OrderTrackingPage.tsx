import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User, Phone, Car, CheckCircle, Package, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDeliveryUpdates } from '@/hooks/useDeliveryUpdates';
import { useOrderUpdates } from '@/hooks/useOrderUpdates';
import DeliveryProgress from '@/components/delivery/DeliveryProgress';
import OrderStatusTracker from '@/components/OrderStatusTracker';
import TruckLoader from '@/components/ui/TruckLoader';

interface DeliveryAgent {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  status: string;
}

interface Delivery {
  id: number;
  orderId: number;
  restaurantId: number;
  customerId: number;
  agent?: DeliveryAgent;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  pickupAddress: string;
  deliveryAddress: string;
  createdAt: string;
  assignedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  estimatedDeliveryTime: number;
}

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { delivery, loading: deliveryLoading, error: deliveryError, refresh: refreshDelivery } = useDeliveryUpdates({
    orderId: orderId ? parseInt(orderId) : undefined,
    autoRefresh: true,
    intervalMs: 3000, // 3 seconds for real-time updates
  });

  const { order, loading: orderLoading, error: orderError, refresh: refreshOrder } = useOrderUpdates({
    orderId: orderId ? parseInt(orderId) : undefined,
    autoRefresh: true,
    intervalMs: 5000, // 5 seconds for order updates
  });

  const loading = deliveryLoading || orderLoading;
  const error = deliveryError || orderError;

  // Get status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        label: 'Order Placed',
        color: 'bg-yellow-500',
        icon: Package,
        progress: 10,
        description: 'Your order has been placed and is waiting to be assigned to a delivery agent.'
      },
      ASSIGNED: {
        label: 'Agent Assigned',
        color: 'bg-blue-500',
        icon: User,
        progress: 25,
        description: 'A delivery agent has been assigned to your order.'
      },
      PICKED_UP: {
        label: 'Picked Up',
        color: 'bg-orange-500',
        icon: Truck,
        progress: 50,
        description: 'Your order has been picked up from the restaurant and is on its way.'
      },
      IN_TRANSIT: {
        label: 'In Transit',
        color: 'bg-purple-500',
        icon: Car,
        progress: 75,
        description: 'Your order is being delivered to your location.'
      },
      DELIVERED: {
        label: 'Delivered',
        color: 'bg-green-500',
        icon: CheckCircle,
        progress: 100,
        description: 'Your order has been successfully delivered!'
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'bg-red-500',
        icon: Package,
        progress: 0,
        description: 'Your order has been cancelled.'
      }
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  // Format timestamp
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString();
  };

  // Get estimated delivery time
  const getEstimatedTime = () => {
    if (!delivery) return null;
    
    const config = getStatusConfig(delivery.status);
    if (config.progress === 100) return 'Delivered';
    
    const estimatedMinutes = delivery.estimatedDeliveryTime || 30;
    return `${estimatedMinutes} minutes`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <TruckLoader />
                <span className="mt-4 text-muted-foreground">Loading order details...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error state if delivery service is not available
  if (error && error.includes('Failed to fetch delivery')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order #{orderId} - Cash on Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Order Placed Successfully!</h3>
                <p className="text-green-700 mb-4">
                  Your cash on delivery order has been confirmed and is being prepared.
                </p>
                <div className="bg-white p-4 rounded border">
                  <p className="text-sm text-gray-600">
                    <strong>Payment:</strong> Cash on Delivery
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> Order Confirmed
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Delivery details will be updated soon
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button onClick={() => navigate('/orders')} className="w-full">
                  Back to Orders
                </Button>
                <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                  Browse Restaurants
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || (!delivery && !order)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error || 'The order you are looking for could not be found.'}
              </p>
              <Button onClick={() => navigate('/orders')}>
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle case where delivery is null but order exists
  if (!delivery && order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Delivery Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The delivery for this order could not be found. The order may still be being processed.
              </p>
              <Button onClick={() => navigate('/orders')}>
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(delivery?.status || 'PENDING');
  const StatusIcon = statusConfig.icon;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order Tracking</h1>
            <p className="text-muted-foreground">Order #{orderId}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>

        {/* Order Status Tracker */}
        {order && (
          <OrderStatusTracker
            orderId={order.id}
            status={order.status}
            createdAt={order.createdAt}
            estimatedTime={delivery?.estimatedDeliveryTime}
            agent={delivery?.agent}
            restaurantLocation={delivery?.pickupAddress}
            className="mb-6"
          />
        )}

        {/* Delivery Status Card - Only show if delivery exists */}
        {delivery && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Delivery Status</span>
                <Button variant="outline" size="sm" onClick={() => { refreshDelivery(); refreshOrder(); }}>
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryProgress status={delivery?.status || 'PENDING'} />
              
              {delivery?.estimatedDeliveryTime && getStatusConfig(delivery?.status || 'PENDING').progress < 100 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                  <Clock className="h-4 w-4" />
                  <span>Estimated delivery time: {getEstimatedTime()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Delivery Agent Info */}
        {delivery?.agent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Delivery Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {delivery?.agent?.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{delivery?.agent?.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {delivery?.agent?.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      {delivery?.agent?.vehicleType}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">
                  {delivery?.agent?.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Pickup Address</h4>
              <p className="text-sm text-muted-foreground">
                {delivery?.pickupAddress}
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Delivery Address</h4>
              <p className="text-sm text-muted-foreground">
                {delivery?.deliveryAddress}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Placed */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500 text-white">
                  <Package className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(delivery?.createdAt || '')}
                  </p>
                </div>
              </div>

              {/* Agent Assigned */}
              {delivery?.assignedAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-500 text-white">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Agent Assigned</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(delivery?.assignedAt || '')}
                    </p>
                  </div>
                </div>
              )}

              {/* Picked Up */}
              {delivery?.pickedUpAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-orange-500 text-white">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Order Picked Up</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(delivery?.pickedUpAt || '')}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivered */}
              {delivery?.deliveredAt && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-500 text-white">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Order Delivered</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(delivery?.deliveredAt || '')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {delivery?.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{delivery?.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
