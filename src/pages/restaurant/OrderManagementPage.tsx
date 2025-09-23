import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  ArrowLeft,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  Truck,
  Package,
  User,
  Filter,
  Eye,
  Edit,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  totalAmountCents: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  menuItemId: number;
  quantity: number;
  priceCents: number;
}

interface Delivery {
  id: number;
  orderId: number;
  status: string;
  createdAt: string;
}

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const restaurantId = 1; // Demo restaurant ID

  // Fetch data
  const fetchData = async () => {
    try {
      // Fetch menu items for this restaurant first
      const menuResponse = await api.get(`/restaurants/${restaurantId}/menu`);
      const menuItemsData = menuResponse.data || [];
      setMenuItems(menuItemsData);
      
      // Fetch orders
      let restaurantOrders = [];
      try {
        const ordersResponse = await api.get('/orders');
        const allOrders = ordersResponse.data || [];
        restaurantOrders = allOrders.filter((order: Order) => order.restaurantId === restaurantId);
      } catch (error) {
        console.log('Failed to fetch orders, using mock data:', error);
        // Use mock data when API is not available
        restaurantOrders = [
          {
            id: 1,
            restaurantId: restaurantId,
            userId: 6,
            totalCents: 5000,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            items: [
              { id: 1, menuItemId: 1, quantity: 2, priceCents: 1500 },
              { id: 2, menuItemId: 2, quantity: 1, priceCents: 2000 }
            ]
          },
          {
            id: 2,
            restaurantId: restaurantId,
            userId: 7,
            totalCents: 1800,
            status: 'PREPARING',
            createdAt: new Date(Date.now() - 300000).toISOString(),
            items: [
              { id: 3, menuItemId: 3, quantity: 1, priceCents: 1800 }
            ]
          },
          {
            id: 3,
            restaurantId: restaurantId,
            userId: 8,
            totalCents: 3600,
            status: 'READY',
            createdAt: new Date(Date.now() - 600000).toISOString(),
            items: [
              { id: 4, menuItemId: 4, quantity: 3, priceCents: 1200 }
            ]
          },
          {
            id: 4,
            restaurantId: restaurantId,
            userId: 9,
            totalCents: 2500,
            status: 'PICKED_UP',
            createdAt: new Date(Date.now() - 900000).toISOString(),
            items: [
              { id: 5, menuItemId: 5, quantity: 1, priceCents: 2500 }
            ]
          },
          {
            id: 5,
            restaurantId: restaurantId,
            userId: 10,
            totalCents: 3200,
            status: 'DELIVERED',
            createdAt: new Date(Date.now() - 1200000).toISOString(),
            items: [
              { id: 6, menuItemId: 6, quantity: 2, priceCents: 1600 }
            ]
          }
        ];
      }
      
      // Fetch deliveries
      let restaurantDeliveries = [];
      try {
        const deliveriesResponse = await api.get('/deliveries');
        const allDeliveries = deliveriesResponse.data || [];
        restaurantDeliveries = allDeliveries.filter((delivery: Delivery) => delivery.orderId && restaurantOrders.some(order => order.id === delivery.orderId));
      } catch (error) {
        console.log('Failed to fetch deliveries, using mock data:', error);
        // Use mock delivery data
        restaurantDeliveries = restaurantOrders.map(order => ({
          id: order.id + 100,
          orderId: order.id,
          status: order.status === 'PENDING' ? 'PENDING' : 
                  order.status === 'PREPARING' ? 'PENDING' :
                  order.status === 'READY' ? 'ASSIGNED' :
                  order.status === 'PICKED_UP' ? 'PICKED_UP' :
                  order.status === 'IN_TRANSIT' ? 'IN_TRANSIT' :
                  order.status === 'DELIVERED' ? 'DELIVERED' : 'PENDING',
          createdAt: order.createdAt
        }));
      }
      
      setOrders(restaurantOrders);
      setDeliveries(restaurantDeliveries);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch orders data"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    toast({
      title: "Data refreshed",
      description: "Orders data has been updated"
    });
  };

  // Get order status
  const getOrderStatus = (order: Order) => {
    const delivery = deliveries.find(d => d.orderId === order.id);
    return delivery ? delivery.status : 'PENDING';
  };

  // Handle order status update
  const handleOrderStatusUpdate = async (orderId: number, newStatus: 'PREPARING' | 'READY') => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status?status=${newStatus}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      toast({
        title: `Order Status Updated`,
        description: `Order #${orderId} status updated to ${newStatus}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Update local state even if API call fails (for mock data)
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );

      toast({
        title: `Order Status Updated (Mock)`,
        description: `Order #${orderId} status updated to ${newStatus} (using mock data)`
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      PREPARING: { variant: 'default' as const, label: 'Preparing', icon: ChefHat },
      READY: { variant: 'default' as const, label: 'Ready for Pickup', icon: CheckCircle },
      PICKED_UP: { variant: 'default' as const, label: 'Picked Up', icon: Truck },
      IN_TRANSIT: { variant: 'default' as const, label: 'In Transit', icon: Truck },
      DELIVERED: { variant: 'default' as const, label: 'Delivered', icon: CheckCircle },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled', icon: XCircle }
    };
    
    const config = variants[status as keyof typeof variants] || variants.PENDING;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Get menu item name
  const getMenuItemName = (menuItemId: number) => {
    const item = menuItems.find(m => m.id === menuItemId);
    return item ? item.name : `Item #${menuItemId}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    return `${Math.floor(diffInSeconds / 86400)} day ago`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) || 
                         order.userId.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || getOrderStatus(order) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/restaurant/dashboard')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Order Management</h1>
                <p className="text-sm text-muted-foreground">Manage restaurant orders</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PREPARING">Preparing</SelectItem>
                  <SelectItem value="READY">Ready for Pickup</SelectItem>
                  <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                  <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.filter(o => getOrderStatus(o) === 'PENDING').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.filter(o => ['PREPARING', 'ASSIGNED', 'PICKED_UP'].includes(getOrderStatus(o))).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-foreground">
                    {orders.filter(o => getOrderStatus(o) === 'DELIVERED').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No orders have been placed yet'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-semibold text-foreground">Order #{order.id}</p>
                                <p className="text-sm text-muted-foreground">Customer #{order.userId}</p>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">
                                {order.items?.map(item => 
                                  `${item.quantity}x ${getMenuItemName(item.menuItemId)}`
                                ).join(', ') || 'Order items'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(order.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">₹{((order.totalCents || 0) / 100).toFixed(2)}</p>
                            <div className="mt-1">
                              {getStatusBadge(getOrderStatus(order))}
                            </div>
                          </div>
                          
                          {/* Order Status Action Buttons */}
                          <div className="flex flex-col space-y-2">
                            {getOrderStatus(order) === 'PENDING' && (
                              <Button
                                size="sm"
                                onClick={() => handleOrderStatusUpdate(order.id, 'PREPARING')}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <ChefHat className="h-4 w-4 mr-1" />
                                Start Preparing
                              </Button>
                            )}
                            {getOrderStatus(order) === 'PREPARING' && (
                              <Button
                                size="sm"
                                onClick={() => handleOrderStatusUpdate(order.id, 'READY')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Ready
                              </Button>
                            )}
                            {getOrderStatus(order) === 'READY' && (
                              <div className="text-center text-sm text-green-600 font-medium">
                                <p>Ready for Collection</p>
                                <p className="text-xs">Waiting for delivery agent</p>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id} Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer</p>
                  <p className="text-foreground">Customer #{selectedOrder.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-foreground">₹{((selectedOrder.totalCents || 0) / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Time</p>
                  <p className="text-foreground">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(getOrderStatus(selectedOrder))}
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Order Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{getMenuItemName(item.menuItemId)}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{((item.priceCents || 0) / 100).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagementPage;
