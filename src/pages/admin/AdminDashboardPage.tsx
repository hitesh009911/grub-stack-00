import React from 'react';
import { 
  Building2, 
  Shield,
  Settings,
  Package,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAdmin } from '@/contexts/AdminContext';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();



  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Restaurant Applications</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" onClick={() => {
                logout();
                navigate('/login');
              }}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Admin Management Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Shield className="h-5 w-5" />
              <span>Admin Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <h3 className="font-semibold">Manage Admin Users</h3>
              <p className="text-muted-foreground text-sm">
                Create, edit, and manage admin user accounts and permissions.
              </p>
              <Button 
                onClick={() => navigate('/admin/management')}
                className="w-full"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Admins
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Management Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Building2 className="h-5 w-5" />
              <span>Restaurant Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <h3 className="font-semibold">Manage Restaurants</h3>
              <p className="text-muted-foreground text-sm">
                View, approve, and manage restaurant applications and registrations.
              </p>
              <Button 
                onClick={() => navigate('/admin/restaurants')}
                className="w-full"
                size="sm"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Manage Restaurants
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Management Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Package className="h-5 w-5" />
              <span>Delivery Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <h3 className="font-semibold">Manage Deliveries</h3>
              <p className="text-muted-foreground text-sm">
                Track, assign, and manage all delivery orders and delivery agents.
              </p>
              <Button 
                onClick={() => navigate('/admin/deliveries')}
                className="w-full"
                size="sm"
              >
                <Truck className="h-4 w-4 mr-2" />
                Manage Deliveries
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
};

export default AdminDashboardPage;
