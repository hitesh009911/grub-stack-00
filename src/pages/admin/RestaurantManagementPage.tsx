import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Trash2,
  RefreshCw,
  ArrowLeft,
  Plus,
  MapPin,
  Phone,
  Mail,
  Star,
  Users,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import BigTruckLoader from '@/components/ui/BigTruckLoader';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  rating: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt: string;
  updatedAt: string;
}

const RestaurantManagementPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRestaurant, setDeletingRestaurant] = useState<Restaurant | null>(null);

  // Load restaurants
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/restaurants/admin/all', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Error",
        description: `Failed to fetch restaurants: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (restaurantId: number) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setRestaurants(prev => 
        prev.map(restaurant => 
          restaurant.id === restaurantId 
            ? { ...restaurant, status: 'APPROVED' as const }
            : restaurant
        )
      );

      // Update localStorage if this restaurant is logged in
      const restaurantAuth = localStorage.getItem('restaurantAuth');
      if (restaurantAuth) {
        const restaurant = JSON.parse(restaurantAuth);
        if (restaurant.id === restaurantId) {
          restaurant.status = 'approved';
          localStorage.setItem('restaurantAuth', JSON.stringify(restaurant));
        }
      }

      // Also update any other localStorage entries that might match by email
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('restaurantAuth') || key.includes('restaurant')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.email && data.email === restaurants.find(r => r.id === restaurantId)?.email) {
              data.status = 'approved';
              localStorage.setItem(key, JSON.stringify(data));
            }
          } catch (e) {
            // Ignore invalid JSON
          }
        }
      });

      toast({
        title: "Restaurant Approved",
        description: "Restaurant has been approved successfully"
      });
    } catch (error) {
      console.error('Error approving restaurant:', error);
      toast({
        title: "Error",
        description: `Failed to approve restaurant: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (restaurantId: number) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setRestaurants(prev => 
        prev.map(restaurant => 
          restaurant.id === restaurantId 
            ? { ...restaurant, status: 'REJECTED' as const }
            : restaurant
        )
      );

      // Update localStorage if this restaurant is logged in
      const restaurantAuth = localStorage.getItem('restaurantAuth');
      if (restaurantAuth) {
        const restaurant = JSON.parse(restaurantAuth);
        if (restaurant.id === restaurantId) {
          restaurant.status = 'rejected';
          localStorage.setItem('restaurantAuth', JSON.stringify(restaurant));
        }
      }

      // Also update any other localStorage entries that might match by email
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (key.startsWith('restaurantAuth') || key.includes('restaurant')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.email && data.email === restaurants.find(r => r.id === restaurantId)?.email) {
              data.status = 'rejected';
              localStorage.setItem(key, JSON.stringify(data));
            }
          } catch (e) {
            // Ignore invalid JSON
          }
        }
      });

      toast({
        title: "Restaurant Rejected",
        description: "Restaurant has been rejected"
      });
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      toast({
        title: "Error",
        description: `Failed to reject restaurant: ${error.message}`,
        variant: "destructive"
      });
    }
  };


  const handleActivate = async (restaurantId: number) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'ACTIVE' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Update local state
      setRestaurants(prev => 
        prev.map(restaurant => 
          restaurant.id === restaurantId 
            ? { ...restaurant, status: 'ACTIVE' as const }
            : restaurant
        )
      );

      toast({
        title: "Restaurant Activated",
        description: "Restaurant is now online and accepting orders"
      });
    } catch (error) {
      console.error('Error activating restaurant:', error);
      toast({
        title: "Error",
        description: `Failed to activate restaurant: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (restaurantId: number) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Remove from local state
      setRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));

      toast({
        title: "Restaurant Deleted",
        description: "Restaurant has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast({
        title: "Error",
        description: `Failed to delete restaurant: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsDeleteOpen(false);
      setDeletingRestaurant(null);
    }
  };

  const handleRefresh = () => {
    fetchRestaurants();
  };

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = 
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      APPROVED: { variant: 'default' as const, label: 'Approved', icon: CheckCircle },
      REJECTED: { variant: 'destructive' as const, label: 'Rejected', icon: XCircle },
      ACTIVE: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      INACTIVE: { variant: 'secondary' as const, label: 'Inactive', icon: AlertCircle }
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

  // Calculate stats
  const stats = {
    total: restaurants.length,
    pending: restaurants.filter(r => r.status === 'PENDING').length,
    approved: restaurants.filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE').length,
    rejected: restaurants.filter(r => r.status === 'REJECTED').length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <BigTruckLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-2 hover:bg-primary/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    Restaurant Management
                  </h1>
                  <p className="text-muted-foreground text-lg">Manage restaurant applications and listings</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing} 
                variant="outline"
                className="hover:bg-primary/10 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <ThemeToggle />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">Approved</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">Rejected</p>
                    <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search restaurants, owners, cuisine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-2 focus:border-primary/50 transition-colors"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-12 border-2 focus:border-primary/50 transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Restaurants List */}
        <div className="space-y-4">
          {filteredRestaurants.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No restaurants found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No restaurants have been registered yet.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary/40 bg-gradient-to-r from-card to-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground">{restaurant.name}</h3>
                            <p className="text-sm text-muted-foreground">{restaurant.cuisine} • {restaurant.address}</p>
                          </div>
                          {getStatusBadge(restaurant.status)}
                        </div>
                        
                        <p className="text-muted-foreground mb-4 leading-relaxed">{restaurant.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="p-1 bg-muted rounded">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-foreground">{restaurant.address}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="p-1 bg-muted rounded">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-foreground">{restaurant.phone}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="p-1 bg-muted rounded">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-foreground">{restaurant.email}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="p-1 bg-muted rounded">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-foreground">Cuisine: {restaurant.cuisine}</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="p-1 bg-muted rounded">
                                <Star className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-foreground">Rating: {restaurant.rating}/5</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                              <div className="p-1 bg-muted rounded">
                                <Users className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-foreground">Owner: {restaurant.ownerName}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                          Created: {formatDate(restaurant.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRestaurant(restaurant);
                            setIsDetailsOpen(true);
                          }}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {restaurant.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(restaurant.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleReject(restaurant.id)}
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        
                        {(restaurant.status === 'APPROVED' || restaurant.status === 'ACTIVE' || restaurant.status === 'INACTIVE') && (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin/restaurants/${restaurant.id}/orders`)}
                              className="flex-1"
                            >
                              <Package className="h-4 w-4 mr-1" />
                              View Orders
                            </Button>
                            {restaurant.status === 'INACTIVE' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleActivate(restaurant.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activate
                              </Button>
                            )}
                          </div>
                        )}
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDeletingRestaurant(restaurant);
                            setIsDeleteOpen(true);
                          }}
                          className="w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Restaurant Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
            <DialogDescription>
              Complete information about the restaurant
            </DialogDescription>
          </DialogHeader>
          
          {selectedRestaurant && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Restaurant Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedRestaurant.name}</p>
                    <p><strong>Description:</strong> {selectedRestaurant.description}</p>
                    <p><strong>Cuisine:</strong> {selectedRestaurant.cuisine}</p>
                    <p><strong>Rating:</strong> {selectedRestaurant.rating}/5</p>
                    <p><strong>Status:</strong> {selectedRestaurant.status}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Address:</strong> {selectedRestaurant.address}</p>
                    <p><strong>Phone:</strong> {selectedRestaurant.phone}</p>
                    <p><strong>Email:</strong> {selectedRestaurant.email}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Owner Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {selectedRestaurant.ownerName}</p>
                  <p><strong>Email:</strong> {selectedRestaurant.ownerEmail}</p>
                  <p><strong>Phone:</strong> {selectedRestaurant.ownerPhone}</p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p><strong>Created:</strong> {formatDate(selectedRestaurant.createdAt)}</p>
                <p><strong>Updated:</strong> {formatDate(selectedRestaurant.updatedAt)}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Restaurant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingRestaurant?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deletingRestaurant && handleDelete(deletingRestaurant.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantManagementPage;
