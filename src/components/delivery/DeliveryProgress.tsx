import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Package, User, Truck, Car, CheckCircle } from 'lucide-react';

interface DeliveryProgressProps {
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  className?: string;
}

const DeliveryProgress: React.FC<DeliveryProgressProps> = ({ 
  status, 
  className = '' 
}) => {
  const getProgressConfig = (status: string) => {
    const configs = {
      PENDING: {
        progress: 10,
        label: 'Order Placed',
        icon: Package,
        color: 'bg-yellow-500',
        description: 'Your order has been placed and is waiting to be assigned to a delivery agent.'
      },
      ASSIGNED: {
        progress: 25,
        label: 'Agent Assigned',
        icon: User,
        color: 'bg-blue-500',
        description: 'A delivery agent has been assigned to your order.'
      },
      PICKED_UP: {
        progress: 50,
        label: 'Picked Up',
        icon: Truck,
        color: 'bg-orange-500',
        description: 'Your order has been picked up from the restaurant and is on its way.'
      },
      IN_TRANSIT: {
        progress: 75,
        label: 'In Transit',
        icon: Car,
        color: 'bg-purple-500',
        description: 'Your order is being delivered to your location.'
      },
      DELIVERED: {
        progress: 100,
        label: 'Delivered',
        icon: CheckCircle,
        color: 'bg-green-500',
        description: 'Your order has been successfully delivered!'
      },
      CANCELLED: {
        progress: 0,
        label: 'Cancelled',
        icon: Package,
        color: 'bg-red-500',
        description: 'Your order has been cancelled.'
      }
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const config = getProgressConfig(status);
  const Icon = config.icon;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{config.label}</span>
          <span className="text-muted-foreground">{config.progress}%</span>
        </div>
        <Progress value={config.progress} className="h-2" />
      </div>

      {/* Status Icon and Description */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${config.color} text-white flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProgress;
