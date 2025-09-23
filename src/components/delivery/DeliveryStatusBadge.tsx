import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Package, User, Truck, Car, CheckCircle, XCircle } from 'lucide-react';

interface DeliveryStatusBadgeProps {
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  showIcon?: boolean;
}

const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({ 
  status, 
  showIcon = false 
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      PENDING: {
        label: 'Pending',
        variant: 'secondary' as const,
        icon: Package,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
      },
      ASSIGNED: {
        label: 'Assigned',
        variant: 'default' as const,
        icon: User,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      },
      PICKED_UP: {
        label: 'Picked Up',
        variant: 'default' as const,
        icon: Truck,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      },
      IN_TRANSIT: {
        label: 'In Transit',
        variant: 'default' as const,
        icon: Car,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
      },
      DELIVERED: {
        label: 'Delivered',
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      },
      CANCELLED: {
        label: 'Cancelled',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      },
    };
    return configs[status as keyof typeof configs] || configs.PENDING;
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (showIcon) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
        <Icon className="h-4 w-4" />
        <span>{config.label}</span>
      </div>
    );
  }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export default DeliveryStatusBadge;
