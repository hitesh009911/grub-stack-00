import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Truck, 
  Mail, 
  Lock, 
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const DeliveryAgentLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', formData);
      
      // Try delivery service authentication
      let response;
      try {
        response = await fetch('http://localhost:8086/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
      } catch (error) {
        console.log('API Gateway failed, trying direct service...');
        try {
          response = await fetch('http://localhost:8086/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
        } catch (directError) {
          console.log('Direct service failed, using hardcoded fallback...');
          // Hardcoded fallback for testing
          if (formData.email === 'delivery@grub.local' && formData.password === 'delivery123') {
            const mockResponse = {
              ok: true,
              json: async () => ({
                id: 6,
                email: 'delivery@grub.local',
                name: 'Mike Delivery',
                phone: '+1-555-9999',
                status: 'AVAILABLE',
                vehicleType: 'Motorcycle',
                licenseNumber: 'MC999999'
              })
            };
            response = mockResponse;
          } else {
            throw new Error('Invalid credentials');
          }
        }
      }

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const agentData = await response.json();
        console.log('Login response data:', agentData);
        
        // Store agent session data
        const sessionData = {
          ...agentData,
          role: 'delivery'
        };
        
        console.log('Storing agent data:', sessionData);
        localStorage.setItem('deliveryAgent', JSON.stringify(sessionData));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${agentData.name}!`
        });
        
        console.log('Navigating to dashboard...');
        navigate('/delivery/dashboard');
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-orange-200 dark:border-orange-800 shadow-2xl shadow-orange-500/20">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Delivery Agent Login
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your delivery dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Demo Credentials */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Demo Credentials
                </h4>
                <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <p><strong>Email:</strong> delivery@grub.local</p>
                  <p><strong>Password:</strong> delivery123</p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p>Don't have an account? Contact admin to get approved as a delivery agent.</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-400 hover:border-orange-500"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center gap-2 border-2 border-orange-400 hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:border-orange-600 dark:hover:border-orange-500 dark:hover:bg-gradient-to-r dark:hover:from-orange-900/30 dark:hover:to-red-900/30 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DeliveryAgentLoginPage;

