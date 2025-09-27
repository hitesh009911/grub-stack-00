import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  LogOut,
  Phone,
  Navigation,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RocketLoader from '@/components/ui/RocketLoader';

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
  notes?: string;
  customerPhone?: string;
  restaurantPhone?: string;
  orderStatus?: 'PENDING' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
}

interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  status: 'ACTIVE' | 'BUSY' | 'OFFLINE';
}

const DeliveryAgentDashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Load agent data from localStorage
  useEffect(() => {
    const agentData = localStorage.getItem('deliveryAgent');
    if (agentData) {
      setAgent(JSON.parse(agentData));
    } else {
      navigate('/delivery/login');
    }
  }, [navigate]);

  // Fetch order details for a specific order
  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const order = await response.json();
        return order;
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
    return null;
  };

  // Fetch customer address from user service
  const fetchCustomerAddress = async (customerId: number) => {
    try {
      const response = await fetch(`http://localhost:8082/users/${customerId}`);
      if (response.ok) {
        const customer = await response.json();
        return customer.address || null;
      }
    } catch (error) {
      console.error('Error fetching customer address:', error);
    }
    return null;
  };

  // Fetch agent's deliveries with throttling
  const fetchDeliveries = async (force = false) => {
    if (!agent) return;
    
    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) { // Throttle to max once every 5 seconds unless forced
      return;
    }
    
    try {
      setLastFetchTime(now);
      const response = await fetch(`/api/deliveries/agent/${agent.id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Fetch order status and customer address for each delivery
      const deliveriesWithOrderStatus = await Promise.all(
        data.map(async (delivery: Delivery) => {
          const [orderDetails, customerAddress] = await Promise.all([
            fetchOrderDetails(delivery.orderId),
            fetchCustomerAddress(delivery.customerId)
          ]);
          return {
            ...delivery,
            orderStatus: orderDetails?.status || 'PENDING',
            deliveryAddress: customerAddress || delivery.deliveryAddress
          };
        })
      );
      
      setDeliveries(deliveriesWithOrderStatus);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: "Error",
        description: `Failed to fetch deliveries: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Load deliveries when agent is available
  useEffect(() => {
    if (agent) {
      const loadData = async () => {
        setLoading(true);
        await fetchDeliveries();
        setLoading(false);
      };
      loadData();
      
      // Set up refresh timer - refresh every 10 seconds
      const refreshInterval = setInterval(() => {
        fetchDeliveries();
      }, 10000);
      
      // Cleanup timer on unmount
      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    }
  }, [agent]);

  // Handle delivery status update
  const handleStatusUpdate = async (deliveryId: number, newStatus: string, orderId?: number) => {
    try {
      await fetch(`/api/deliveries/${deliveryId}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      
      // If starting delivery (IN_TRANSIT), also update order status
      if (newStatus === 'IN_TRANSIT' && orderId) {
        await fetch(`/api/orders/${orderId}/status?status=IN_TRANSIT`, {
          method: 'POST'
        });
      }
      
      await fetchDeliveries();
      toast({
        title: "Success",
        description: "Delivery status updated successfully"
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: "Error",
        description: "Failed to update delivery status",
        variant: "destructive"
      });
    }
  };

  // Handle delivery completion (update both delivery and order status to DELIVERED)
  const handleDeliveryCompletion = async (deliveryId: number, orderId: number) => {
    try {
      // Update both delivery status and order status
      await Promise.all([
        fetch(`/api/deliveries/${deliveryId}/status?status=DELIVERED`, {
          method: 'PUT'
        }),
        fetch(`/api/orders/${orderId}/status?status=DELIVERED`, {
          method: 'POST'
        })
      ]);
      await fetchDeliveries();
      toast({
        title: "Delivery Completed",
        description: "Order has been successfully delivered"
      });
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: "Error",
        description: "Failed to complete delivery",
        variant: "destructive"
      });
    }
  };

  // Handle order collection (update delivery status to PICKED_UP and order status to IN_TRANSIT)
  const handleOrderCollection = async (deliveryId: number, orderId: number) => {
    try {
      // Update delivery status to PICKED_UP and order status to IN_TRANSIT
      await Promise.all([
        fetch(`/api/deliveries/${deliveryId}/status?status=PICKED_UP`, {
          method: 'PUT'
        }),
        fetch(`/api/orders/${orderId}/status?status=IN_TRANSIT`, {
          method: 'POST'
        })
      ]);
      await fetchDeliveries();
      toast({
        title: "Order Collected",
        description: "Order picked up and in transit to customer"
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  // Handle agent status update
  const handleAgentStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/deliveries/agents/${agent.id}/status?status=${newStatus}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        // Update local agent status
        const updatedAgent = { ...agent, status: newStatus as 'ACTIVE' | 'BUSY' | 'OFFLINE' };
        localStorage.setItem('deliveryAgent', JSON.stringify(updatedAgent));
        
        // Update the agent state to reflect the change
        setAgent(updatedAgent);
        
        toast({
          title: "Status Updated",
          description: `Your status changed to ${newStatus}`,
          variant: "default",
          duration: 3000
        });
      } else {
        throw new Error('Failed to update agent status');
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      toast({
        title: "Error",
        description: "Failed to update your status",
        variant: "destructive"
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('deliveryAgent');
    navigate('/delivery/login');
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      ASSIGNED: { variant: 'default' as const, label: 'Assigned', icon: User },
      PICKED_UP: { variant: 'default' as const, label: 'Picked Up', icon: Package },
      IN_TRANSIT: { variant: 'default' as const, label: 'In Transit', icon: Truck },
      DELIVERED: { variant: 'default' as const, label: 'Delivered', icon: CheckCircle },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle },
    };
    return variants[status as keyof typeof variants] || variants.PENDING;
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get delivery statistics
  const getDeliveryStats = () => {
    const total = deliveries.length;
    const pending = deliveries.filter(d => d.status === 'PENDING').length;
    const inProgress = deliveries.filter(d => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)).length;
    const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;

    return { total, pending, inProgress, delivered };
  };

  const stats = getDeliveryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RocketLoader />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mt-4">
            Loading your delivery dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold dark:text-white">Delivery Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Welcome, {agent.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {/* Help Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Contact Support</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Need help or have questions? Contact our admin team:
                    </p>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="font-medium">Admin Email:</p>
                      <p className="font-mono text-primary">admin@grubstack.com</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We'll get back to you within 24 hours.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* Status Management */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                <div className="flex space-x-1">
                  <Button
                    size="sm"
                    variant={agent.status === 'ACTIVE' ? 'default' : 'outline'}
                    onClick={() => handleAgentStatusUpdate('ACTIVE')}
                    className="text-xs"
                  >
                    Active
                  </Button>
                  <Button
                    size="sm"
                    variant={agent.status === 'BUSY' ? 'default' : 'outline'}
                    onClick={() => handleAgentStatusUpdate('BUSY')}
                    className="text-xs"
                  >
                    Busy
                  </Button>
                </div>
              </div>
              
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Deliveries</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">In Progress</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Delivered</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">My Deliveries</h2>
          <Button onClick={() => fetchDeliveries(true)} variant="outline" size="sm" className="dark:border-gray-700 dark:hover:bg-gray-800">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>


        {/* Current Deliveries */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Current Deliveries</h3>
          <div className="space-y-4">
            {deliveries.filter(d => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status) || d.orderStatus === 'IN_TRANSIT').length === 0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">No active deliveries</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    You don't have any active deliveries assigned yet. Check back later!
                  </p>
                </CardContent>
              </Card>
            ) : (
              deliveries.filter(d => ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status) || d.orderStatus === 'IN_TRANSIT').map((delivery) => {
              const statusInfo = getStatusBadge(delivery.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card key={delivery.id} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Order #{delivery.orderId}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Pickup</span>
                            </div>
                            <p className="text-sm text-gray-700">{delivery.pickupAddress}</p>
                            {delivery.restaurantPhone && (
                              <p className="text-xs text-gray-500 mt-1">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {delivery.restaurantPhone}
                              </p>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Delivery</span>
                            </div>
                            <p className="text-sm text-gray-700">{delivery.deliveryAddress}</p>
                            {delivery.customerPhone && (
                              <p className="text-xs text-gray-500 mt-1">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {delivery.customerPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Created: {formatTime(delivery.createdAt)}
                          </div>
                          {delivery.estimatedDeliveryTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              ETA: {delivery.estimatedDeliveryTime} min
                            </div>
                          )}
                        </div>

                        {delivery.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Notes:</strong> {delivery.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {/* Order Collection Button - show when assigned, regardless of order status */}
                        {delivery.status === 'ASSIGNED' && (
                          <Button
                            size="sm"
                            onClick={() => handleOrderCollection(delivery.id, delivery.orderId)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={delivery.orderStatus === 'PENDING'}
                          >
                            <Package className="h-4 w-4 mr-1" />
                            {delivery.orderStatus === 'PENDING' ? 'Order Not Ready' : 'Collect Order'}
                          </Button>
                        )}
                        
                        {delivery.status === 'ASSIGNED' && delivery.orderStatus === 'PENDING' && (
                          <div className="text-center text-sm text-gray-500">
                            <p>Order is being prepared</p>
                            <p>Please wait</p>
                          </div>
                        )}
                        
                        {/* Start Delivery Button - when delivery is PICKED_UP and order is not IN_TRANSIT */}
                        {delivery.status === 'PICKED_UP' && delivery.orderStatus !== 'IN_TRANSIT' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(delivery.id, 'IN_TRANSIT', delivery.orderId)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Start Delivery
                          </Button>
                        )}
                        
                        {/* Mark as Delivered Button - when order is IN_TRANSIT */}
                        {delivery.orderStatus === 'IN_TRANSIT' && (
                          <Button
                            size="sm"
                            onClick={() => handleDeliveryCompletion(delivery.id, delivery.orderId)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark as Delivered
                          </Button>
                        )}

                        {/* Navigate Button - when order is IN_TRANSIT */}
                        {delivery.orderStatus === 'IN_TRANSIT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(delivery.deliveryAddress)}`, '_blank')}
                          >
                            <Navigation className="h-4 w-4 mr-1" />
                            Navigate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          </div>
        </div>

        {/* Past Deliveries */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Past Deliveries</h3>
          <div className="space-y-4">
            {deliveries.filter(d => ['DELIVERED', 'CANCELLED'].includes(d.status) || d.orderStatus === 'DELIVERED').length === 0 ? (
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">No completed deliveries</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your completed deliveries will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              deliveries.filter(d => ['DELIVERED', 'CANCELLED'].includes(d.status) || d.orderStatus === 'DELIVERED').map((delivery) => {
                const statusInfo = getStatusBadge(delivery.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card key={delivery.id} className="dark:bg-gray-900 dark:border-gray-800">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Order #{delivery.orderId}
                            </span>
                            {delivery.orderStatus && (
                              <Badge 
                                variant={delivery.orderStatus === 'DELIVERED' ? 'default' : 'secondary'} 
                                className="flex items-center gap-1"
                              >
                                <Package className="h-3 w-3" />
                                Order: {delivery.orderStatus}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">Pickup</span>
                              </div>
                              <p className="text-sm text-gray-700">{delivery.pickupAddress}</p>
                              {delivery.restaurantPhone && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <Phone className="h-3 w-3 inline mr-1" />
                                  {delivery.restaurantPhone}
                                </p>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium">Delivery</span>
                              </div>
                              <p className="text-sm text-gray-700">{delivery.deliveryAddress}</p>
                              {delivery.customerPhone && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <Phone className="h-3 w-3 inline mr-1" />
                                  {delivery.customerPhone}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Created: {formatTime(delivery.createdAt)}
                            </div>
                            {delivery.deliveredAt && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Delivered: {formatTime(delivery.deliveredAt)}
                              </div>
                            )}
                          </div>

                          {delivery.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <strong>Notes:</strong> {delivery.notes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {delivery.status === 'DELIVERED' && (
                            <div className="text-center">
                              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                              <p className="text-sm text-green-600 font-medium">Completed</p>
                            </div>
                          )}
                          {delivery.status === 'CANCELLED' && (
                            <div className="text-center">
                              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                              <p className="text-sm text-red-600 font-medium">Cancelled</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAgentDashboardPage;

