import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChefHat, 
  Package, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Bell,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { api } from '@/lib/api';

interface RestaurantData {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  deliveryStatus: 'ONLINE' | 'OFFLINE';
}

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  activeDeliveries: number;
  menuItems: number;
  averageRating: number;
}

interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface Order {
  id: number;
  customerName: string;
  items: string;
  total: number;
  status: string;
  time: string;
  customerId: number;
  orderStatus?: 'PENDING' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  deliveryAgent?: {
    id: number;
    name: string;
    phone: string;
    vehicleType: string;
  };
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  priceCents: number;
}

const RestaurantDashboardPage: React.FC = () => {
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
    activeDeliveries: 0,
    menuItems: 0,
    averageRating: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check approval status on component mount
  useEffect(() => {
    const checkApprovalStatus = () => {
      const restaurantAuth = localStorage.getItem('restaurantAuth');
      if (restaurantAuth) {
        const restaurant = JSON.parse(restaurantAuth);
        
        // Check if restaurant is approved
        if (restaurant.status === 'pending') {
          toast({
            variant: "destructive",
            title: "Account pending approval",
            description: "Your restaurant application is still pending admin approval. You cannot access the dashboard yet."
          });
          navigate('/restaurant/login');
          return;
        } else if (restaurant.status === 'rejected') {
          toast({
            variant: "destructive",
            title: "Account rejected",
            description: "Your restaurant application has been rejected. Please contact admin for more information."
          });
          navigate('/restaurant/login');
          return;
        } else if (restaurant.status === 'approved') {
          setRestaurantData(restaurant);
        }
      } else {
        // No restaurant auth found, redirect to login
        navigate('/restaurant/login');
      }
    };

    checkApprovalStatus();
  }, [navigate, toast]);

  // Helper function to get menu item name
  const getMenuItemName = (menuItemId: number) => {
    const item = menuItems.find(m => m.id === menuItemId);
    return item ? item.name : `Item #${menuItemId}`;
  };

  // Fetch real-time data
  const fetchDashboardData = useCallback(async () => {
    try {
      // Get restaurant ID from auth context
      const restaurantAuth = localStorage.getItem('restaurantAuth');
      const restaurant = restaurantAuth ? JSON.parse(restaurantAuth) : null;
      const restaurantId = restaurant?.id || 5; // Fallback to 5 for demo
      
      // Fetch menu items for this restaurant first
      const menuResponse = await api.get(`/restaurants/${restaurantId}/menu`);
      const menuItemsData = menuResponse.data || [];
      setMenuItems(menuItemsData);
      
      // Fetch orders for this restaurant
      let restaurantOrders = [];
      try {
        const ordersResponse = await api.get(`/orders/restaurant/${restaurantId}`);
        restaurantOrders = ordersResponse.data || [];
      } catch (error) {
        console.log('Failed to fetch restaurant-specific orders, trying all orders:', error);
        try {
          // Fallback to fetch all orders and filter
          const allOrdersResponse = await api.get('/orders/all');
          const allOrders = allOrdersResponse.data || [];
          restaurantOrders = allOrders.filter((order: Record<string, unknown>) => order.restaurantId === restaurantId);
        } catch (fallbackError) {
          console.log('Failed to fetch all orders, using mock data:', fallbackError);
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
              createdAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
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
              createdAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
              items: [
                { id: 4, menuItemId: 4, quantity: 3, priceCents: 1200 }
              ]
            }
          ];
        }
      }
      
      // Fetch deliveries
      const deliveriesResponse = await api.get('/deliveries');
      const deliveries = deliveriesResponse.data || [];
      
    // Filter deliveries for this restaurant
  type Delivery = { orderId: number; restaurantId: number; status: string; agent?: { id: number; name: string; phone: string; vehicleType: string } };
    const restaurantDeliveries = (deliveries as Delivery[]).filter((delivery) => delivery.restaurantId === restaurantId);
      
      // Calculate stats
      const today = new Date().toDateString();
      type Order = { id: number; userId: number; items?: { menuItemId: number; quantity: number }[]; totalCents?: number; status?: string; createdAt: string };
      const todayOrders = (restaurantOrders as Order[]).filter((order) =>
        new Date(String(order.createdAt)).toDateString() === today
      );
      
      const totalRevenue = (restaurantOrders as Order[]).reduce((sum: number, order) =>
        sum + (order.totalCents || 0), 0
      ) / 100;
      
      const activeDeliveries = restaurantDeliveries.filter((delivery) =>
        ['PENDING', 'ASSIGNED', 'PICKED_UP'].includes(String(delivery.status))
      ).length;
      
      setStats({
        totalOrders: restaurantOrders.length,
        todayOrders: todayOrders.length,
        totalRevenue: totalRevenue,
        activeDeliveries: activeDeliveries,
        menuItems: menuItemsData.length,
        averageRating: 4.5 // Mock data
      });
      
      // Set recent orders with delivery agent information
      const recentOrdersData = (restaurantOrders as Order[]).slice(0, 5).map((order) => {
        // Find delivery for this order
        const delivery = restaurantDeliveries.find((delivery) => delivery.orderId === order.id);
        // Ensure orderStatus is one of the allowed values
        const allowedStatuses = ['PENDING', 'PREPARING', 'READY', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const;
        const status = (order.status && allowedStatuses.includes(order.status as typeof allowedStatuses[number]))
          ? (order.status as typeof allowedStatuses[number])
          : 'PENDING';
        return {
          id: order.id,
          customerName: `Customer #${order.userId}`,
          items: order.items?.map((item) => `${item.quantity}x ${getMenuItemName(item.menuItemId)}`).join(', ') || 'Order items',
          total: (order.totalCents || 0) / 100,
          status: order.status || 'PENDING',
          orderStatus: status,
          time: formatTimeAgo(new Date(String(order.createdAt))),
          customerId: order.userId,
          deliveryAgent: delivery?.agent || null
        };
      });
      
      setRecentOrders(recentOrdersData);
      
      // Generate notifications for new orders
    const newNotifications = todayOrders.map((order) => ({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: 'New Order Received',
        message: `Order #${order.id} from Customer #${order.userId}`,
  timestamp: new Date(String(order.createdAt)),
        read: false,
        actionUrl: `/restaurant/orders/${order.id}`
      }));
      
      setNotifications(prev => [...newNotifications, ...prev.slice(0, 10)]);
      
      // Fetch real notifications from notification service for this restaurant
      // Only if notifications haven't been cleared
      const clearedTime = localStorage.getItem('restaurant-notifications-cleared');
      if (!clearedTime) {
        try {
          const notificationsResponse = await api.get('/notifications/status/SENT');
          const realNotifications = notificationsResponse.data || [];
          
          // Get restaurant order IDs to filter notifications
          const restaurantOrderIds = restaurantOrders.map((order: Record<string, any>) => order.id);
          
          // Convert notification service data to our notification format
          // Only show notifications that are related to this restaurant's orders
          const convertedNotifications = realNotifications
            .filter((notif: Record<string, any>) => {
              // Filter by notification type
              if (notif.type !== 'ORDER_CONFIRMATION' && notif.type !== 'DELIVERY_DELIVERED') {
                return false;
              }
              
              // Extract order ID from notification content if possible
              const orderIdMatch = notif.subject?.match(/Order #(\d+)/) || notif.message?.match(/Order #(\d+)/);
              if (orderIdMatch) {
                const orderId = parseInt(orderIdMatch[1]);
                return restaurantOrderIds.includes(orderId);
              }
              
              // If we can't extract order ID, include it anyway (fallback)
              return true;
            })
            .slice(0, 10) // Limit to 10 most recent
            .map((notif: Record<string, any>, index: number) => ({
              id: `real-${notif.id}-${index}-${Date.now()}`, // Ensure unique keys
              type: notif.type === 'ORDER_CONFIRMATION' ? 'order' : 'delivery',
              title: notif.type === 'ORDER_CONFIRMATION' ? 'Order Confirmed' : 'Order Delivered',
              message: notif.subject || notif.message || 'Notification from system',
              timestamp: new Date(notif.createdAt || notif.timestamp || new Date()),
              read: false,
              actionUrl: notif.type === 'ORDER_CONFIRMATION' ? '/restaurant/orders' : '/restaurant/orders'
            }));
          
          // Remove duplicates and combine with order-based notifications
          const uniqueConvertedNotifications = convertedNotifications.filter((notif, index, self) => 
            index === self.findIndex(n => n.message === notif.message && n.timestamp.getTime() === notif.timestamp.getTime())
          );
          
          setNotifications(prev => {
            // Combine all notifications and remove duplicates
            const allNotifications = [...uniqueConvertedNotifications, ...newNotifications, ...prev];
            const uniqueAll = allNotifications.filter((notif, index, self) => 
              index === self.findIndex(n => n.id === notif.id)
            );
            return uniqueAll.slice(0, 15); // Limit to 15 total notifications
          });
        } catch (notifError) {
          console.log('Failed to fetch real notifications, using order-based notifications only:', notifError);
          // Keep the order-based notifications we already generated
        }
      } else {
        // Notifications were cleared, only show new order-based notifications
        setNotifications(newNotifications);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data if API fails
      setStats({
        totalOrders: 156,
        todayOrders: 12,
        totalRevenue: 45680,
        activeDeliveries: 3,
        menuItems: 24,
        averageRating: 4.5
      });
      
      setRecentOrders([
        {
          id: 14,
          customerName: 'John Doe',
          items: '2x Chicken Biryani, 1x Dal Curry',
          total: 850,
          status: 'PENDING',
          time: '2 min ago',
          customerId: 6
        },
        {
          id: 13,
          customerName: 'Jane Smith',
          items: '1x Margherita Pizza, 2x White Sauce Pasta',
          total: 650,
          status: 'PREPARING',
          time: '15 min ago',
          customerId: 5
        },
        {
          id: 12,
          customerName: 'Mike Johnson',
          items: '3x Chicken Burger, 2x French Fries',
          total: 420,
          status: 'READY',
          time: '25 min ago',
          customerId: 4
        }
      ]);
      
      // Mock menu items for demo
      setMenuItems([
        { id: 1, name: 'Chicken Biryani', description: 'Fragrant basmati rice with tender chicken', priceCents: 25000 },
        { id: 2, name: 'Dal Curry', description: 'Traditional lentil curry', priceCents: 15000 },
        { id: 3, name: 'Margherita Pizza', description: 'Classic tomato and mozzarella pizza', priceCents: 30000 },
        { id: 4, name: 'White Sauce Pasta', description: 'Creamy pasta with vegetables', priceCents: 20000 },
        { id: 5, name: 'Chicken Burger', description: 'Juicy chicken patty with fresh vegetables', priceCents: 18000 },
        { id: 6, name: 'French Fries', description: 'Crispy golden fries', priceCents: 8000 }
      ]);
      
      // No mock notifications - use real data only
      setNotifications([]);
    }
  }, []);

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    return `${Math.floor(diffInSeconds / 86400)} day ago`;
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast({
      title: "Data refreshed",
      description: "Dashboard data has been updated"
    });
  };

  useEffect(() => {
    // Load restaurant data from localStorage (demo mode - no auth required)
    const authData = localStorage.getItem('restaurantAuth');
    if (authData) {
      const data = JSON.parse(authData);
      setRestaurantData(data);
    } else {
      // Set demo restaurant data
      
    }
    
    // Fetch initial data
    fetchDashboardData().finally(() => {
      setLoading(false);
    });
    
    // Fetch initial notifications
    fetchNotifications();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchNotifications(); // Also refresh notifications
    }, 30000);
    
    return () => clearInterval(interval);
  }, [navigate, fetchDashboardData]);

  // Fetch notifications from notification service for this specific restaurant
  const fetchNotifications = async () => {
    try {
      // Check if notifications were cleared - if so, don't fetch new ones
      const clearedTime = localStorage.getItem('restaurant-notifications-cleared');
      if (clearedTime) {
        console.log('Notifications were cleared, not fetching new ones');
        return;
      }
      
      // Get restaurant ID from auth context
      const restaurantAuth = localStorage.getItem('restaurantAuth');
      const restaurant = restaurantAuth ? JSON.parse(restaurantAuth) : null;
      const restaurantId = restaurant?.id || 5; // Fallback to 5 for demo
      
      const notificationsResponse = await api.get('/notifications/status/SENT');
      const realNotifications = notificationsResponse.data || [];
      
      // Get orders for this restaurant to filter notifications
      const ordersResponse = await api.get(`/orders/restaurant/${restaurantId}`);
      const restaurantOrders = ordersResponse.data || [];
  const restaurantOrderIds = restaurantOrders.map((order: Record<string, any>) => order.id);
      
      console.log(`[${new Date().toLocaleTimeString()}] Fetching notifications for restaurant ${restaurantId}`);
      console.log(`Restaurant order IDs:`, restaurantOrderIds);
      
      // Convert notification service data to our notification format
      // Only show notifications that are related to this restaurant's orders
      const convertedNotifications = realNotifications
        .filter((notif: Record<string, any>) => {
          // Filter by notification type
          if (notif.type !== 'ORDER_CONFIRMATION' && notif.type !== 'DELIVERY_DELIVERED') {
            return false;
          }
          
          // Extract order ID from notification content if possible
          // This is a simple approach - in a real system, notifications would have orderId field
          const orderIdMatch = notif.subject?.match(/Order #(\d+)/) || notif.message?.match(/Order #(\d+)/);
          if (orderIdMatch) {
            const orderId = parseInt(orderIdMatch[1]);
            return restaurantOrderIds.includes(orderId);
          }
          
          // If we can't extract order ID, include it anyway (fallback)
          return true;
        })
        .slice(0, 15) // Limit to 15 most recent
  .map((notif: Record<string, any>, index: number) => ({
          id: `real-${notif.id}-${index}-${Date.now()}`, // Ensure unique keys
          type: notif.type === 'ORDER_CONFIRMATION' ? 'order' : 'delivery',
          title: notif.type === 'ORDER_CONFIRMATION' ? 'Order Confirmed' : 'Order Delivered',
          message: notif.subject || notif.message || 'Notification from system',
          timestamp: new Date(notif.createdAt || notif.timestamp || new Date()),
          read: false,
          actionUrl: notif.type === 'ORDER_CONFIRMATION' ? '/restaurant/orders' : '/restaurant/orders'
        }));
      
      console.log(`Filtered notifications for restaurant ${restaurantId}:`, convertedNotifications.length);
      
      // Remove duplicates based on notification content and set unique notifications
      const uniqueNotifications = convertedNotifications.filter((notif, index, self) => 
        index === self.findIndex(n => n.message === notif.message && n.timestamp.getTime() === notif.timestamp.getTime())
      );
      
      setNotifications(uniqueNotifications);
    } catch (error) {
      console.log('Failed to fetch real notifications:', error);
    }
  };

  // Notification functions
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications([]); // Clear all notifications permanently
    // Store cleared state to prevent notifications from reappearing
    localStorage.setItem('restaurant-notifications-cleared', Date.now().toString());
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setShowNotifications(false);
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
      setRecentOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, orderStatus: newStatus, status: newStatus }
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
      setRecentOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, orderStatus: newStatus, status: newStatus }
            : order
        )
      );

      toast({
        title: `Order Status Updated (Mock)`,
        description: `Order #${orderId} status updated to ${newStatus} (using mock data)`
      });
    }
  };

  // Handle restaurant delivery status toggle (Online/Offline)
  const handleRestaurantStatusToggle = async () => {
    try {
      const currentDeliveryStatus = restaurantData?.deliveryStatus?.toLowerCase();
      const newDeliveryStatus = currentDeliveryStatus === 'online' ? 'offline' : 'online';
      
      console.log('Updating restaurant delivery status:', {
        restaurantId: restaurantData?.id,
        currentDeliveryStatus,
        newDeliveryStatus
      });
      
      const response = await fetch(`/api/restaurants/${restaurantData?.id}/delivery-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryStatus: newDeliveryStatus.toUpperCase() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Restaurant status update failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const updatedRestaurant = await response.json();
      console.log('Restaurant delivery status updated successfully:', updatedRestaurant);

      // Update local state
  setRestaurantData(prev => prev ? { ...prev, deliveryStatus: newDeliveryStatus.toUpperCase() as 'ONLINE' | 'OFFLINE' } : null);

      // Update localStorage with new delivery status
      const restaurantAuth = localStorage.getItem('restaurantAuth');
      if (restaurantAuth) {
        const restaurant = JSON.parse(restaurantAuth);
        restaurant.deliveryStatus = newDeliveryStatus;
        localStorage.setItem('restaurantAuth', JSON.stringify(restaurant));
      }

      toast({
        title: `Restaurant ${newDeliveryStatus === 'online' ? 'Online' : 'Offline'}`,
        description: `Your restaurant is now ${newDeliveryStatus === 'online' ? 'online and accepting orders' : 'offline and not accepting orders'}`
      });
    } catch (error) {
      console.error('Error updating restaurant status:', error);
      toast({
        title: "Error",
        description: `Failed to update restaurant status: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('restaurantAuth');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your restaurant account"
    });
    navigate('/restaurant/login');
  };

  // Filter orders based on search and remove duplicates
  const filteredOrders = recentOrders
    .filter((order, index, self) => 
      // Remove duplicates based on order ID
      index === self.findIndex(o => o.id === order.id)
    )
    .filter(order =>
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
    );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, label: 'Pending' },
      PREPARING: { variant: 'default' as const, label: 'Order Accepted & Getting Prepared' },
      READY: { variant: 'default' as const, label: 'Ready for Pickup' },
      PICKED_UP: { variant: 'default' as const, label: 'Picked Up' },
      IN_TRANSIT: { variant: 'default' as const, label: 'In Transit' },
      DELIVERED: { variant: 'default' as const, label: 'Delivered' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-white" />
              </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{restaurantData?.name}</h1>
              <p className="text-sm text-muted-foreground">Restaurant Dashboard</p>
              {restaurantData?.status === 'PENDING' && (
                <Badge variant="secondary" className="mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Approval
                </Badge>
              )}
            </div>
            </div>
            
            <div className="flex items-center space-x-2">
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

              {/* Refresh */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notifications */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg z-50"
                    >
                      <div className="p-4 border-b">
                        <div className="flex justify-between items-center">
                          <div></div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={fetchNotifications}
                              className="text-xs"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={markAllNotificationsAsRead}
                              className="text-xs"
                            >
                              Clear all
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNotifications(false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                                !notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                              }`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {notification.type === 'order' && (
                                    <Package className="h-4 w-4 text-blue-600" />
                                  )}
                                  {notification.type === 'delivery' && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                  {notification.type === 'system' && (
                                    <Info className="h-4 w-4 text-orange-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatTimeAgo(notification.timestamp)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>


              {/* Help */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                      Need Help?
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Contact Admin
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                        <strong>Email:</strong> admin@grubstack.com
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        For account issues, approval status, or general questions
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">Common issues:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Order management problems</li>
                        <li>Menu item updates</li>
                        <li>Delivery status changes</li>
                        <li>Account verification</li>
                        <li>Technical support</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome back, {restaurantData?.ownerName}! 👋
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your restaurant today.
          </p>
        </motion.div>

        {/* Restaurant Information */}
        {restaurantData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  Restaurant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{restaurantData.name}</h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Owner:</strong> {restaurantData.ownerName}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Email:</strong> {restaurantData.email}
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      <strong>Phone:</strong> {restaurantData.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Address:</strong>
                    </p>
                    <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                      {restaurantData.address}
                    </p>
                    {restaurantData.description && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">
                          <strong>Description:</strong>
                        </p>
                        <p className="text-sm text-foreground bg-muted/50 p-3 rounded-md">
                          {restaurantData.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  +{stats.todayOrders} today
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-foreground">₹{stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Deliveries</p>
                    <p className="text-2xl font-bold text-foreground">{stats.activeDeliveries}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  In progress
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Menu Items</p>
                    <p className="text-2xl font-bold text-foreground">{stats.menuItems}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.averageRating}⭐ average rating
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Recent Orders</CardTitle>
                 <Button variant="outline" size="sm" onClick={() => navigate('/restaurant/orders')}>
                   View All
                 </Button>
               </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={`order-${order.id}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">#{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.items}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">₹{order.total.toFixed(2)}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusBadge(order.orderStatus || order.status)}
                          <span className="text-xs text-muted-foreground">{order.time}</span>
                        </div>
                        {/* Order Status Buttons */}
                        <div className="flex space-x-2 mt-2">
                          {order.orderStatus === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order.id, 'PREPARING')}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.orderStatus === 'PREPARING' && (
                            <Button
                              size="sm"
                              onClick={() => handleOrderStatusUpdate(order.id, 'READY')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Mark Ready
                            </Button>
                          )}
                          {order.orderStatus === 'READY' && (
                            <div className="text-xs text-green-600 font-medium">
                              Ready for Collection
                            </div>
                          )}
                        </div>
                        {/* Delivery Agent Information */}
                        {order.deliveryAgent && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <div className="text-xs">
                                <span className="font-medium text-blue-700 dark:text-blue-300">
                                  Assigned to: {order.deliveryAgent.name}
                                </span>
                                <div className="text-blue-600 dark:text-blue-400">
                                  {order.deliveryAgent.vehicleType} • {order.deliveryAgent.phone}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Button className="w-full justify-start" onClick={() => navigate('/restaurant/menu')}>
                   <Plus className="mr-2 h-4 w-4" />
                   Add Menu Item
                 </Button>
                 <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/restaurant/orders')}>
                   <Eye className="mr-2 h-4 w-4" />
                   View All Orders
                 </Button>
              </CardContent>
            </Card>

            {/* Restaurant Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Restaurant Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Delivery Status</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant={restaurantData?.deliveryStatus?.toLowerCase() === 'online' ? 'default' : 'secondary'}>
                      {restaurantData?.deliveryStatus?.toLowerCase() === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRestaurantStatusToggle}
                      className={restaurantData?.deliveryStatus?.toLowerCase() === 'online' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                    >
                      {restaurantData?.deliveryStatus?.toLowerCase() === 'online' ? 'Go Offline' : 'Go Online'}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">Orders Today</span>
                  <span className="text-sm text-muted-foreground">{stats.todayOrders}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">Avg. Prep Time</span>
                  <span className="text-sm text-muted-foreground">25 min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RestaurantDashboardPage;
