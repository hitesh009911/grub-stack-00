import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Users,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validatePhoneNumber, formatPhoneInput } from '@/utils/validation';
import { api } from '@/lib/api';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';

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
  agent?: {
    id: number;
    name: string;
    phone: string;
    vehicleType: string;
  };
}

interface Customer {
  id: number;
  email: string;
  fullName: string;
  address: string;
  roles: string[];
  createdAt: string;
}

interface DeliveryAgent {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'ACTIVE';
  lastActiveAt: string;
}

interface PendingAgent {
  id: number;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  licenseNumber: string;
  createdAt: string;
  status: 'PENDING_APPROVAL' | 'REJECTED';
}

const DeliveryManagementPage = () => {
  const { toast } = useToast();
  const { admin } = useAdmin();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [rejectedAgents, setRejectedAgents] = useState<PendingAgent[]>([]);
  const [customers, setCustomers] = useState<Map<number, Customer>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCreateAgentDialogOpen, setIsCreateAgentDialogOpen] = useState(false);
  const [isConfirmAssignOpen, setIsConfirmAssignOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    licenseNumber: ''
  });
  const [phoneError, setPhoneError] = useState<string>('');
  const [autoAssignTimer, setAutoAssignTimer] = useState<NodeJS.Timeout | null>(null);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Handle auto-assignment after both deliveries and agents are loaded
  const handleAutoAssignment = () => {
    if (deliveries.length === 0 || agents.length === 0) {
      console.log('Data not ready for auto-assignment yet');
      return;
    }

    // Check for pending deliveries that need auto-assignment
    const pendingDeliveries = deliveries.filter((delivery: Delivery) => 
      delivery.status === 'PENDING' && !delivery.agent
    );
    
    console.log('Pending deliveries for auto-assignment:', pendingDeliveries.length);
    console.log('Pending deliveries details:', pendingDeliveries);
    
    pendingDeliveries.forEach((delivery: Delivery) => {
      console.log(`Setting auto-assignment timer for delivery ${delivery.id} (Order ${delivery.orderId})`);
      // Set timer for auto-assignment after 1 second for faster response
      const timer = setTimeout(() => {
        autoAssignDelivery(delivery);
      }, 1000);
      setAutoAssignTimer(timer);
    });
  };

  // Auto-assign delivery to available agent
  const autoAssignDelivery = async (delivery: Delivery) => {
    try {
      console.log(`Auto-assigning delivery ${delivery.id} (Order ${delivery.orderId})`);
      console.log('Available agents count:', agents.length);
      console.log('All agents:', agents.map(a => ({ id: a.id, name: a.name, status: a.status })));
      
      // Find available agents (they can handle multiple deliveries)
      const availableAgents = agents.filter(agent => agent.status === 'ACTIVE');
      console.log('Available agents count:', availableAgents.length);
      console.log('Available agents:', availableAgents.map(a => ({ id: a.id, name: a.name, status: a.status })));
      
      // If still no agents, show error message
      if (availableAgents.length === 0) {
        console.log('No agents available for auto-assignment');
        toast({
          title: "No Agents Available",
          description: "All delivery agents are currently offline. Please assign manually or wait for agents to come online.",
          variant: "destructive"
        });
        return;
      }
      
      const randomAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];
      console.log(`Auto-assigning delivery ${delivery.id} to agent ${randomAgent.id} (status: ${randomAgent.status})`);
      
      const response = await fetch(`/api/deliveries/${delivery.id}/assign?agentId=${randomAgent.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        toast({
          title: "Auto-Assigned",
          description: `Delivery #${delivery.orderId} assigned to ${randomAgent.name}`,
          variant: "default"
        });
        // Refresh data after assignment
        fetchDeliveries();
        fetchAgents();
      } else {
        const errorText = await response.text();
        console.error('Assignment error response:', errorText);
        toast({
          title: "Assignment Failed",
          description: `Failed to assign delivery: ${errorText}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error auto-assigning delivery:', error);
      toast({
        title: "Assignment Error",
        description: `Error assigning delivery: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Manual assignment function for admin
  const handleAutoAssign = async (deliveryId: number) => {
    const delivery = deliveries.find(d => d.id === deliveryId);
    if (delivery) {
      await autoAssignDelivery(delivery);
    }
  };


  // Fetch deliveries with throttling
  const fetchDeliveries = async () => {
    const now = Date.now();
    if (now - lastFetchTime < 5000) { // Throttle to max once every 5 seconds
      return;
    }
    
    try {
      setLastFetchTime(now);
      const response = await fetch('http://localhost:8086/deliveries', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDeliveries(data);
      
      if (data.length === 0) {
        toast({
          title: "Info",
          description: "No deliveries found. Create some orders to see deliveries here.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: "Error",
        description: `Failed to fetch deliveries: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Fetch agents with throttling
  const fetchAgents = async (force = false) => {
    const now = Date.now();
    if (!force && now - lastFetchTime < 5000) { // Throttle to max once every 5 seconds unless forced
      return;
    }
    
    try {
      setLastFetchTime(now);
      const response = await fetch('http://localhost:8086/deliveries/agents', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAgents(data);
      console.log('Agents fetched successfully:', data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: `Failed to fetch delivery agents: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Fetch pending agents
  const fetchPendingAgents = async () => {
    try {
      const response = await fetch('http://localhost:8086/deliveries/agents/pending', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPendingAgents(data);
      console.log('Pending agents fetched successfully:', data);
    } catch (error) {
      console.error('Error fetching pending agents:', error);
      toast({
        title: "Error",
        description: `Failed to fetch pending agents: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDeliveries(), fetchAgents(), fetchPendingAgents()]);
      setLoading(false);
    };
    loadData();
    
    // Set up refresh timer - refresh every 5 seconds for better responsiveness
    const refreshInterval = setInterval(() => {
      fetchDeliveries();
      fetchAgents();
      fetchPendingAgents();
    }, 5000);
    setRefreshTimer(refreshInterval);
    
    // Cleanup timers on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (autoAssignTimer) {
        clearTimeout(autoAssignTimer);
      }
    };
  }, []);

  // Handle auto-assignment when both deliveries and agents are loaded
  useEffect(() => {
    // Only run auto-assignment if we have both data and no pending assignments are already running
    if (deliveries.length > 0 && agents.length > 0 && !autoAssignTimer) {
      handleAutoAssignment();
    }
  }, [deliveries, agents]);

  // Fetch customer data when deliveries are loaded
  useEffect(() => {
    if (deliveries.length > 0) {
      const uniqueCustomerIds = [...new Set(deliveries.map(d => d.customerId))];
      uniqueCustomerIds.forEach(customerId => {
        if (!customers.has(customerId)) {
          fetchCustomer(customerId);
        }
      });
    }
  }, [deliveries]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isCreateAgentDialogOpen) {
      setNewAgent({ name: '', email: '', phone: '', vehicleType: '', licenseNumber: '' });
    }
  }, [isCreateAgentDialogOpen]);


  // Fetch customer details
  const fetchCustomer = async (customerId: number) => {
    try {
      const response = await fetch(`http://localhost:8082/users/${customerId}`);
      if (response.ok) {
        const customer = await response.json();
        setCustomers(prev => new Map(prev).set(customerId, customer));
        return customer;
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
    return null;
  };


  // Filter deliveries
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = 
      delivery.orderId.toString().includes(searchTerm) ||
      delivery.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.agent?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Separate current and past deliveries
  const currentDeliveries = filteredDeliveries.filter(delivery => 
    ['PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(delivery.status)
  );
  
  const pastDeliveries = filteredDeliveries.filter(delivery => 
    ['DELIVERED', 'CANCELLED'].includes(delivery.status)
  );

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

  // Note: Status updates are handled by delivery agents, not admins

  // Handle delivery assignment
  const handleAssignDelivery = async (deliveryId: number, agentId: number, isReassignment: boolean = false) => {
    try {
      console.log(`${isReassignment ? 'Reassigning' : 'Assigning'} delivery ${deliveryId} to agent ${agentId}`);
      console.log('Available agents:', agents);
      console.log('Selected agent:', agents.find(a => a.id === agentId));
      
      const response = await fetch(`/api/deliveries/${deliveryId}/assign?agentId=${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Assignment response status:', response.status);
      console.log('Assignment response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Assignment error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Assignment successful:', result);
      
      await fetchDeliveries();
      await fetchAgents();
      setIsAssignDialogOpen(false);
      setSelectedDelivery(null);
      toast({
        title: "Success",
        description: isReassignment ? "Delivery reassigned successfully" : "Delivery assigned successfully",
        duration: 3000
      });
    } catch (error) {
      console.error('Error assigning delivery:', error);
      toast({
        title: "Error",
        description: `Failed to ${isReassignment ? 'reassign' : 'assign'} delivery: ${error.message}`,
        variant: "destructive"
      });
    }
  };


  // Handle create agent
  const handleCreateAgent = async () => {
    try {
      console.log('Admin authentication state:', admin);
      console.log('Admin is authenticated:', !!admin);
      console.log('Admin email:', admin?.email);
      console.log('Creating agent with data:', newAgent);
      
      // Validate required fields
      console.log('Validation check:', {
        name: newAgent.name,
        email: newAgent.email,
        phone: newAgent.phone,
        vehicleType: newAgent.vehicleType,
        licenseNumber: newAgent.licenseNumber
      });
      
      const missingFields = [];
      if (!newAgent.name) missingFields.push('Name');
      if (!newAgent.email) missingFields.push('Email');
      if (!newAgent.phone) missingFields.push('Phone');
      if (!newAgent.vehicleType) missingFields.push('Vehicle Type');
      if (!newAgent.licenseNumber) missingFields.push('License Number');
      
      if (missingFields.length > 0) {
        console.error('Validation failed - missing fields:', missingFields);
        throw new Error(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      }

      // Validate phone number
      if (newAgent.phone) {
        const validation = validatePhoneNumber(newAgent.phone);
        if (!validation.isValid) {
          setPhoneError(validation.error || '');
          throw new Error(validation.error || 'Please enter a valid phone number.');
        }
      }
      
      // Use API Gateway (CORS-safe)
      const requestHeaders = {
        'Content-Type': 'application/json'
      };
      
      console.log('Request headers:', requestHeaders);
      console.log('Request body:', JSON.stringify(newAgent));
      
      const response = await fetch('/api/deliveries/agents/admin', {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(newAgent)
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        console.error('Request URL:', response.url);
        throw new Error(`HTTP ${response.status}: ${errorText || 'No error message provided'}`);
      }
      
      const result = await response.json();
      console.log('Agent created successfully:', result);
      
      await fetchAgents(true); // Force refresh agents
      setNewAgent({ name: '', email: '', phone: '', vehicleType: '', licenseNumber: '' });
      setIsCreateAgentDialogOpen(false);
      toast({
        title: "Success",
        description: "Delivery agent created successfully. Default password: delivery123"
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      toast({
        title: "Error",
        description: `Failed to create delivery agent: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Delete delivery agent
  const handleDeleteAgent = async (agentId: number) => {
    try {
      console.log(`Deleting agent ${agentId}`);
      
      // First, check if agent has active deliveries
      const deliveriesResponse = await fetch(`http://localhost:8086/deliveries/agent/${agentId}`);
      if (deliveriesResponse.ok) {
        const deliveries = await deliveriesResponse.json();
        const activeDeliveries = deliveries.filter((d: any) => 
          ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
        );
        
        if (activeDeliveries.length > 0) {
          const deliveryList = activeDeliveries.map((d: any) => `Order #${d.orderId} (${d.status})`).join(', ');
          toast({
            title: "Cannot Delete Agent",
            description: `This agent has ${activeDeliveries.length} active delivery(ies): ${deliveryList}. Please complete or reassign these deliveries first.`,
            variant: "destructive"
          });
          return;
        }
      }

      if (!confirm('Are you sure you want to delete this delivery agent? This action cannot be undone.')) {
        return;
      }
      
      // Use API Gateway (CORS-safe)
      const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer admin-token`,
        'X-Admin-Email': admin?.email || 'admin@grubstack.com'
      };

      const response = await fetch(`http://localhost:8086/deliveries/agents/${agentId}`, {
        method: 'DELETE',
        headers: requestHeaders
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log('Agent deleted successfully');
      toast({
        title: "Success",
        description: "Delivery agent deleted successfully"
      });

      // Refresh agents list
      await fetchAgents(true);
      await fetchPendingAgents();
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: `Failed to delete delivery agent: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Handle agent approval
  const handleApproveAgent = async (agentId: number) => {
    try {
      const response = await fetch(`http://localhost:8086/deliveries/agents/${agentId}/approve`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery agent approved successfully"
        });
        await fetchAgents(true);
        await fetchPendingAgents();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve agent');
      }
    } catch (error) {
      console.error('Error approving agent:', error);
      toast({
        title: "Error",
        description: `Failed to approve agent: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Handle agent rejection
  const handleRejectAgent = async (agentId: number) => {
    try {
      const response = await fetch(`http://localhost:8086/deliveries/agents/${agentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Delivery agent rejected successfully"
        });
        await fetchAgents(true);
        await fetchPendingAgents();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject agent');
      }
    } catch (error) {
      console.error('Error rejecting agent:', error);
      toast({
        title: "Error",
        description: `Failed to reject agent: ${error.message}`,
        variant: "destructive"
      });
    }
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
    const cancelled = deliveries.filter(d => d.status === 'CANCELLED').length;

    return { total, pending, inProgress, delivered, cancelled };
  };

  const stats = getDeliveryStats();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading delivery data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Delivery Management</h1>
          <p className="text-muted-foreground">Manage deliveries and delivery agents</p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => {
            fetchDeliveries();
            fetchAgents();
          }} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateAgentDialogOpen} onOpenChange={setIsCreateAgentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Delivery Agent</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="Agent name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                    placeholder="agent@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={newAgent.phone}
                    onChange={(e) => {
                      const formattedPhone = formatPhoneInput(e.target.value);
                      setNewAgent({ ...newAgent, phone: formattedPhone });
                      
                      // Validate phone number
                      const validation = validatePhoneNumber(formattedPhone);
                      setPhoneError(validation.isValid ? '' : validation.error || '');
                    }}
                    placeholder="123-456-7890"
                    className={phoneError ? 'border-red-500' : ''}
                    required
                  />
                  {phoneError && (
                    <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Select value={newAgent.vehicleType} onValueChange={(value) => setNewAgent({ ...newAgent, vehicleType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIKE">Bike</SelectItem>
                      <SelectItem value="SCOOTER">Scooter</SelectItem>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={newAgent.licenseNumber}
                    onChange={(e) => setNewAgent({ ...newAgent, licenseNumber: e.target.value })}
                    placeholder="License number"
                    required
                  />
                </div>
                <Button onClick={handleCreateAgent} className="w-full">
                  Create Agent
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deliveries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search deliveries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="PICKED_UP">Picked Up</SelectItem>
                    <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Current Deliveries */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Current Deliveries ({currentDeliveries.length})</h2>
            </div>
            
            {currentDeliveries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No current deliveries</h3>
                  <p className="text-muted-foreground">
                    All deliveries are completed or no active deliveries found
                  </p>
                </CardContent>
              </Card>
            ) : (
              currentDeliveries.map((delivery) => {
                const statusInfo = getStatusBadge(delivery.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card key={delivery.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Order #{delivery.orderId}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Pickup</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{delivery.pickupAddress}</p>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Delivery</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {customers.get(delivery.customerId)?.address || delivery.deliveryAddress}
                              </p>
                            </div>
                          </div>

                          {delivery.agent && (
                            <div className="mb-4">
                              <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Assigned Agent</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {delivery.agent.name} ({delivery.agent.vehicleType}) - {delivery.agent.phone}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                        </div>

                        <div className="flex flex-col gap-2">
                          {delivery.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedDelivery(delivery);
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                Assign Agent
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAutoAssign(delivery.id)}
                              >
                                Auto Assign
                              </Button>
                            </>
                          )}
                          
                          {['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(delivery.status) && (
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  setSelectedDelivery(delivery);
                                  await fetchAgents(true); // Refresh agents list
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                Reassign Agent
                              </Button>
                              <div className="text-xs text-muted-foreground text-center">
                                Status updates by delivery agent
                              </div>
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

          {/* Past Deliveries */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Past Deliveries ({pastDeliveries.length})</h2>
            </div>
            
            {pastDeliveries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No completed deliveries</h3>
                  <p className="text-muted-foreground">
                    Completed and cancelled deliveries will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastDeliveries.map((delivery) => {
                const statusInfo = getStatusBadge(delivery.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card key={delivery.id} className="opacity-75">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Order #{delivery.orderId}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Pickup</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{delivery.pickupAddress}</p>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Delivery</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {customers.get(delivery.customerId)?.address || delivery.deliveryAddress}
                              </p>
                            </div>
                          </div>
                          
                          {delivery.agent && (
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Agent:</span>
                              <span className="text-sm font-medium">{delivery.agent.name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Created: {new Date(delivery.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Delivery Agents:</strong> Showing {agents.length} delivery agents. Create additional agents as needed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                    <Badge 
                      variant={agent.status === 'ACTIVE' ? 'default' : agent.status === 'BUSY' ? 'secondary' : 'destructive'}
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{agent.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Vehicle:</span>
                      <span>{agent.vehicleType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">License:</span>
                      <span>{agent.licenseNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Last Active:</span>
                      <span>{formatTime(agent.lastActiveAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="h-8 px-3"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          {/* Pending Approvals Section */}
          <div>
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>Pending Approvals:</strong> Review and approve new delivery agent applications.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAgents.map((agent) => (
                <Card key={agent.id} className="border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        PENDING
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{agent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Vehicle:</span>
                        <span>{agent.vehicleType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">License:</span>
                        <span>{agent.licenseNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Applied:</span>
                        <span>{formatTime(agent.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectAgent(agent.id)}
                        className="h-8 px-3 text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveAgent(agent.id)}
                        className="h-8 px-3 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {pendingAgents.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Approvals</h3>
                <p className="text-muted-foreground">All delivery agent applications have been reviewed.</p>
              </div>
            )}
          </div>

          {/* Rejected Agents Section */}
          {rejectedAgents.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Rejected Applications:</strong> Previously rejected delivery agent applications.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rejectedAgents.map((agent) => (
                  <Card key={agent.id} className="border-red-200 dark:border-red-800">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.email}</p>
                        </div>
                        <Badge variant="outline" className="text-red-600 border-red-300">
                          REJECTED
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Phone:</span>
                          <span>{agent.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Vehicle:</span>
                          <span>{agent.vehicleType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">License:</span>
                          <span>{agent.licenseNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Applied:</span>
                          <span>{formatTime(agent.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReapproveAgent(agent.id)}
                          className="h-8 px-3 text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Re-approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePermanentlyRejectAgent(agent.id)}
                          className="h-8 px-3 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDelivery?.status !== 'PENDING' ? 'Reassign Delivery Agent' : 'Assign Delivery Agent'}
            </DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Order #{selectedDelivery.orderId} - {selectedDelivery.pickupAddress} → {selectedDelivery.deliveryAddress}
                </p>
                <Select onValueChange={(agentId) => {
                  setSelectedAgentId(parseInt(agentId));
                  setIsConfirmAssignOpen(true);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.filter(agent => agent.status === 'ACTIVE').map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name} ({agent.vehicleType}) - {agent.phone} - {agent.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    setSelectedDelivery(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmAssignOpen} onOpenChange={setIsConfirmAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDelivery?.status !== 'PENDING' ? 'Confirm Reassignment' : 'Confirm Assignment'}
            </DialogTitle>
          </DialogHeader>
          {selectedDelivery && selectedAgentId && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Are you sure you want to {selectedDelivery.status !== 'PENDING' ? 'reassign' : 'assign'} this delivery to the selected agent?
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="font-medium">Order #{selectedDelivery.orderId}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDelivery.pickupAddress} → {selectedDelivery.deliveryAddress}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Agent: {agents.find(a => a.id === selectedAgentId)?.name} 
                    ({agents.find(a => a.id === selectedAgentId)?.vehicleType})
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsConfirmAssignOpen(false);
                    setSelectedAgentId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    const isReassignment = selectedDelivery.status !== 'PENDING';
                    try {
                      await handleAssignDelivery(selectedDelivery.id, selectedAgentId, isReassignment);
                      setIsConfirmAssignOpen(false);
                      setIsAssignDialogOpen(false);
                      setSelectedDelivery(null);
                      setSelectedAgentId(null);
                    } catch (error) {
                      // Error handling is done in handleAssignDelivery
                      console.error('Assignment failed:', error);
                    }
                  }}
                >
                  {selectedDelivery.status !== 'PENDING' ? 'Confirm Reassignment' : 'Confirm Assignment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagementPage;
