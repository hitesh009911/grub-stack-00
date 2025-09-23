import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Truck, 
  MapPin,
  User,
  XCircle
} from 'lucide-react';

interface OrderStatusTrackerProps {
  orderId: number;
  status: string;
  createdAt: string;
  estimatedTime?: number;
  agent?: {
    id: number;
    name: string;
    phone: string;
    vehicleType: string;
  };
  restaurantName?: string;
  className?: string;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  orderId,
  status,
  createdAt,
  estimatedTime,
  agent,
  restaurantName,
  className = ""
}) => {
  // Get status configuration
  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        label: 'Order Pending',
        color: 'bg-yellow-500',
        icon: Clock,
        description: 'Your order has been placed and is waiting for restaurant confirmation.'
      },
      PREPARING: {
        label: 'Order Accepted & Getting Prepared',
        color: 'bg-orange-500',
        icon: ChefHat,
        description: 'Your order has been accepted and is being prepared by the restaurant.'
      },
      READY: {
        label: 'Ready for Pickup',
        color: 'bg-blue-500',
        icon: CheckCircle,
        description: 'Your order is ready and waiting for delivery agent to collect.'
      },
      PICKED_UP: {
        label: 'Picked Up',
        color: 'bg-purple-500',
        icon: Truck,
        description: 'Your order has been picked up by the delivery agent.'
      },
      IN_TRANSIT: {
        label: 'In Transit',
        color: 'bg-indigo-500',
        icon: Truck,
        description: 'Your order is on its way to you.'
      },
      DELIVERED: {
        label: 'Delivered',
        color: 'bg-green-500',
        icon: CheckCircle,
        description: 'Your order has been delivered successfully.'
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'bg-red-500',
        icon: XCircle,
        description: 'Your order has been cancelled.'
      }
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-5 w-5" />
            <span>Order #{orderId}</span>
          </div>
          <Badge 
            variant="outline" 
            className={`${statusConfig.color} text-white border-0`}
          >
            {statusConfig.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Description */}
        <p className="text-sm text-muted-foreground">
          {statusConfig.description}
        </p>

        {/* Order Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Ordered: {formatTime(createdAt)}</span>
          </div>
          
          {restaurantName && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>From: {restaurantName}</span>
            </div>
          )}

          {agent && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Agent: {agent.name} ({agent.vehicleType})</span>
            </div>
          )}

          {estimatedTime && status !== 'DELIVERED' && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Estimated delivery: {estimatedTime} minutes</span>
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Order Timeline</h4>
          <div className="space-y-1 text-xs">
            <div className={`flex items-center space-x-2 ${status === 'PENDING' ? 'text-yellow-600' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
              <span>Order Pending</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === 'PREPARING' ? 'text-orange-600' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'PREPARING' ? 'bg-orange-500' : 'bg-gray-300'}`} />
              <span>Order Accepted & Getting Prepared</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === 'READY' ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'READY' ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span>Ready for Pickup</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === 'PICKED_UP' ? 'text-purple-600' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'PICKED_UP' ? 'bg-purple-500' : 'bg-gray-300'}`} />
              <span>Picked Up</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === 'IN_TRANSIT' ? 'text-indigo-600' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'IN_TRANSIT' ? 'bg-indigo-500' : 'bg-gray-300'}`} />
              <span>In Transit</span>
            </div>
            <div className={`flex items-center space-x-2 ${status === 'DELIVERED' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-2 h-2 rounded-full ${status === 'DELIVERED' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Delivered</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusTracker;

