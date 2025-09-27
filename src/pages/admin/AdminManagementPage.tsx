import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Shield,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

const AdminManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form data for create/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: [] as string[]
  });

  // Mock data for demo
  const mockAdmins: AdminUser[] = [
    {
      id: 'admin-1',
      email: 'admin@grubstack.com',
      name: 'System Administrator',
      role: 'admin',
      permissions: ['manage_restaurants', 'manage_admins', 'view_analytics', 'manage_users'],
      createdAt: '2025-01-01T00:00:00Z',
      lastLogin: '2025-01-15T10:30:00Z',
      isActive: true
    },
    {
      id: 'admin-2',
      email: 'manager@grubstack.com',
      name: 'Restaurant Manager',
      role: 'admin',
      permissions: ['manage_restaurants', 'view_analytics'],
      createdAt: '2025-01-05T00:00:00Z',
      lastLogin: '2025-01-14T15:20:00Z',
      isActive: true
    },
    {
      id: 'admin-3',
      email: 'support@grubstack.com',
      name: 'Support Admin',
      role: 'admin',
      permissions: ['view_analytics'],
      createdAt: '2025-01-10T00:00:00Z',
      lastLogin: '2025-01-13T09:15:00Z',
      isActive: false
    }
  ];

  // Fetch admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      const adminData = response.data.map((admin: any) => ({
        id: admin.id.toString(),
        email: admin.email,
        name: admin.fullName,
        role: admin.role.toLowerCase(),
        permissions: admin.permissions || [],
        createdAt: admin.createdAt,
        lastLogin: admin.lastLogin,
        isActive: admin.isActive
      }));
      setAdmins(adminData);
    } catch (error) {
      console.error('Error fetching admins:', error);
      // Fallback to mock data if API fails
      setAdmins(mockAdmins);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch admin users, using demo data"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || (!editingAdmin && !formData.password)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    try {
      if (editingAdmin) {
        // Update existing admin
        const updateData = {
          fullName: formData.name,
          role: formData.role.toUpperCase(),
          permissions: formData.permissions
        };
        
        const response = await api.put(`/admin/users/${editingAdmin.id}`, updateData);
        const updatedAdmin = response.data;
        
        setAdmins(prev => 
          prev.map(admin => 
            admin.id === editingAdmin.id 
              ? {
                  ...admin,
                  name: updatedAdmin.fullName,
                  role: updatedAdmin.role.toLowerCase(),
                  permissions: updatedAdmin.permissions || []
                }
              : admin
          )
        );
        
        toast({
          title: "Admin updated",
          description: "Admin user has been updated successfully"
        });
      } else {
        // Create new admin
        const createData = {
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          role: formData.role.toUpperCase(),
          permissions: formData.permissions || []
        };
        
        const response = await api.post('/admin/users', createData);
        const newAdmin = response.data;
        
        const adminData = {
          id: newAdmin.id.toString(),
          email: newAdmin.email,
          name: newAdmin.fullName,
          role: newAdmin.role.toLowerCase(),
          permissions: newAdmin.permissions || [],
          createdAt: newAdmin.createdAt,
          lastLogin: newAdmin.lastLogin,
          isActive: newAdmin.isActive
        };
        
        setAdmins(prev => [adminData, ...prev]);
        
        toast({
          title: "Admin created",
          description: "New admin user has been created successfully"
        });
      }
      
      resetForm();
      setShowCreateDialog(false);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error saving admin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save admin user"
      });
    }
  };

  // Handle delete
  const handleDelete = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return;
    
    try {
      await api.delete(`/admin/users/${adminId}`);
      
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
      
      toast({
        title: "Admin deleted",
        description: "Admin user has been deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete admin user"
      });
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (adminId: string) => {
    try {
      const response = await api.patch(`/admin/users/${adminId}/toggle-active`);
      const updatedAdmin = response.data;
      
      setAdmins(prev => 
        prev.map(admin => 
          admin.id === adminId 
            ? { ...admin, isActive: updatedAdmin.isActive }
            : admin
        )
      );
      
      toast({
        title: "Status updated",
        description: "Admin user status has been updated"
      });
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update admin status"
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      permissions: []
    });
    setEditingAdmin(null);
  };

  // Open edit dialog
  const openEditDialog = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.permissions
    });
    setShowEditDialog(true);
  };

  // Filter admins
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get role badge
  const getRoleBadge = (role: string) => {
    const variants = {
      admin: { variant: 'default' as const, label: 'Admin' }
    };
    
    const config = variants[role as keyof typeof variants] || variants.admin;
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admins...</p>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Management</h1>
                <p className="text-sm text-muted-foreground">Manage admin users and permissions</p>
              </div>
            </div>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Admins</p>
                  <p className="text-2xl font-bold text-foreground">{admins.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-foreground">
                    {admins.filter(admin => admin.isActive).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold text-foreground">
                    {admins.filter(admin => !admin.isActive).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admins</p>
                  <p className="text-2xl font-bold text-foreground">
                    {admins.filter(admin => admin.role === 'admin').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Admins List */}
        <div className="space-y-4">
          {filteredAdmins.map((admin) => (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{admin.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {admin.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getRoleBadge(admin.role)}
                            <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                              {admin.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Created: {new Date(admin.createdAt).toLocaleDateString()}</p>
                        {admin.lastLogin && (
                          <p>Last login: {new Date(admin.lastLogin).toLocaleDateString()}</p>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(admin)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(admin.id)}
                          className={admin.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {admin.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredAdmins.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No admins found</h3>
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No admin users have been created yet'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAdmin ? 'Edit Admin User' : 'Create New Admin'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>
            
            {/* Password field only for edit mode */}
            {editingAdmin && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Leave blank to keep current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setShowEditDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAdmin ? 'Update Admin' : 'Create Admin'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagementPage;
