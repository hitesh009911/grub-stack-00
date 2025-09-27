import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const RestaurantLoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields"
      });
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, we'll simulate restaurant login
      // In a real app, this would call your authentication API
      if (formData.email === 'restaurant@grubstack.com' && formData.password === 'password') {
        // Simulate successful login
        localStorage.setItem('restaurantAuth', JSON.stringify({
          id: 1,
          name: 'Demo Restaurant',
          email: formData.email,
          role: 'restaurant',
          status: 'approved' // Demo restaurant is approved
        }));

        toast({
          title: "Login successful!",
          description: "Welcome to your restaurant dashboard"
        });

        navigate('/restaurant/dashboard');
      } else {
        // Check if restaurant exists by fetching from localStorage first, then validate with API
        try {
          // First check localStorage for existing restaurant data
          const existingRestaurant = localStorage.getItem('restaurantAuth');
          console.log('Existing restaurant in localStorage:', existingRestaurant);
          if (existingRestaurant) {
            const restaurant = JSON.parse(existingRestaurant);
            console.log('Parsed restaurant:', restaurant);
            console.log('Looking for email:', formData.email);
            if (restaurant.email === formData.email) {
              // Found restaurant in localStorage, now validate with API
              try {
                const response = await fetch(`/api/restaurants/${restaurant.id}`);
                if (response.ok) {
                  const apiRestaurant = await response.json();
                  const currentStatus = apiRestaurant.status?.toLowerCase();
                  console.log('Restaurant found in API:', apiRestaurant);
                  console.log('Current status:', currentStatus);
                  
                  if (currentStatus === 'pending') {
                    toast({
                      variant: "destructive",
                      title: "Account pending approval",
                      description: "Your restaurant application is still pending admin approval. Please wait for approval before logging in."
                    });
                    return;
                  } else if (currentStatus === 'rejected') {
                    toast({
                      variant: "destructive",
                      title: "Account rejected",
                      description: "Your restaurant application has been rejected. Please contact admin for more information."
                    });
                    return;
                  } else if (currentStatus === 'inactive') {
                    toast({
                      variant: "destructive",
                      title: "Account inactive",
                      description: "Your restaurant account is currently inactive. Please contact admin to reactivate your account."
                    });
                    return;
                  } else if (currentStatus === 'approved' || currentStatus === 'active' || currentStatus === 'APPROVED' || currentStatus === 'ACTIVE') {
                    // Restaurant is approved/active, allow login
                    // Update localStorage with current data
                    const updatedRestaurantData = {
                      id: apiRestaurant.id,
                      name: apiRestaurant.name,
                      email: apiRestaurant.email,
                      role: 'restaurant',
                      status: currentStatus
                    };
                    localStorage.setItem('restaurantAuth', JSON.stringify(updatedRestaurantData));
                    
                    toast({
                      title: "Login successful!",
                      description: "Welcome back to your restaurant dashboard"
                    });
                    navigate('/restaurant/dashboard');
                    return;
                  }
                } else {
                  // API call failed, use localStorage data as fallback
                  console.log('API call failed, using localStorage data');
                  if (restaurant.status === 'approved' || restaurant.status === 'APPROVED') {
                    toast({
                      title: "Login successful!",
                      description: "Welcome back to your restaurant dashboard. You can toggle your online/offline status from the dashboard."
                    });
                    navigate('/restaurant/dashboard');
                    return;
                  } else if (restaurant.status === 'active' || restaurant.status === 'ACTIVE') {
                    toast({
                      title: "Login successful!",
                      description: "Welcome back to your restaurant dashboard. You're currently online and accepting orders."
                    });
                    navigate('/restaurant/dashboard');
                    return;
                  } else if (restaurant.status === 'inactive' || restaurant.status === 'INACTIVE') {
                    toast({
                      variant: "destructive",
                      title: "Restaurant offline",
                      description: "Your restaurant is currently offline (not delivering). You can go online from your dashboard or contact admin@grubstack.com for help."
                    });
                    return;
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Account not approved",
                      description: "Your restaurant account is not approved yet. Please wait for admin approval. Contact admin@grubstack.com for questions."
                    });
                    return;
                  }
                }
              } catch (apiError) {
                console.error('Error fetching restaurant from API:', apiError);
                // Use localStorage data as fallback
                if (restaurant.status === 'approved' || restaurant.status === 'APPROVED') {
                  toast({
                    title: "Login successful!",
                    description: "Welcome back to your restaurant dashboard. You can toggle your online/offline status from the dashboard."
                  });
                  navigate('/restaurant/dashboard');
                  return;
                } else if (restaurant.status === 'active' || restaurant.status === 'ACTIVE') {
                  toast({
                    title: "Login successful!",
                    description: "Welcome back to your restaurant dashboard. You're currently online and accepting orders."
                  });
                  navigate('/restaurant/dashboard');
                  return;
                } else if (restaurant.status === 'inactive' || restaurant.status === 'INACTIVE') {
                  toast({
                    variant: "destructive",
                    title: "Restaurant offline",
                    description: "Your restaurant is currently offline (not delivering). You can go online from your dashboard or contact admin@grubstack.com for help."
                  });
                  return;
                } else {
                  toast({
                    variant: "destructive",
                    title: "Account not approved",
                    description: "Your restaurant account is not approved yet. Please wait for admin approval. Contact admin@grubstack.com for questions."
                  });
                  return;
                }
              }
            }
          } else {
            console.log('No restaurant found in localStorage for email:', formData.email);
            // Try to find restaurant by email through API
            // Since the list endpoint doesn't include email, we'll try common restaurant IDs
            try {
              console.log('Searching for restaurant by trying common IDs...');
              // Try to find the restaurant by checking common IDs (1-30)
              let restaurantFound = false;
              for (let id = 1; id <= 30; id++) {
                try {
                  const response = await fetch(`/api/restaurants/${id}`);
                  if (response.ok) {
                    const restaurant = await response.json();
                    console.log(`Checking restaurant ID ${id}:`, restaurant.email);
                    if (restaurant.email === formData.email) {
                      console.log('Found restaurant by ID search:', restaurant);
                      const currentStatus = restaurant.status?.toLowerCase();
                      console.log('Current status:', currentStatus);
                      restaurantFound = true;
                      
                      if (currentStatus === 'pending') {
                        toast({
                          variant: "destructive",
                          title: "Account pending approval",
                          description: "Your restaurant application is still pending admin approval. Please wait for approval before logging in. Contact admin@grubstack.com for questions."
                        });
                        return;
                      } else if (currentStatus === 'rejected') {
                        toast({
                          variant: "destructive",
                          title: "Account rejected",
                          description: "Your restaurant application has been rejected. Please contact admin@grubstack.com for more information."
                        });
                        return;
                      } else if (currentStatus === 'approved') {
                        // Restaurant is approved but might be offline
                        const updatedRestaurantData = {
                          id: restaurant.id,
                          name: restaurant.name,
                          email: restaurant.email,
                          role: 'restaurant',
                          status: currentStatus
                        };
                        localStorage.setItem('restaurantAuth', JSON.stringify(updatedRestaurantData));
                        
                        toast({
                          title: "Login successful!",
                          description: "Welcome back to your restaurant dashboard. You can toggle your online/offline status from the dashboard."
                        });
                        navigate('/restaurant/dashboard');
                        return;
                      } else if (currentStatus === 'inactive') {
                        toast({
                          variant: "destructive",
                          title: "Restaurant offline",
                          description: "Your restaurant is currently offline (not delivering). You can go online from your dashboard or contact admin@grubstack.com for help."
                        });
                        return;
                      } else if (currentStatus === 'active') {
                        // Restaurant is approved and online, allow login
                        const updatedRestaurantData = {
                          id: restaurant.id,
                          name: restaurant.name,
                          email: restaurant.email,
                          role: 'restaurant',
                          status: currentStatus
                        };
                        localStorage.setItem('restaurantAuth', JSON.stringify(updatedRestaurantData));
                        
                        toast({
                          title: "Login successful!",
                          description: "Welcome back to your restaurant dashboard. You're currently online and accepting orders."
                        });
                        navigate('/restaurant/dashboard');
                        return;
                      }
                      break; // Found the restaurant, exit the loop
                    }
                  }
                } catch (idError) {
                  // Restaurant with this ID doesn't exist, continue to next ID
                  continue;
                }
              }
              
              if (!restaurantFound) {
                console.log('No restaurant found with email:', formData.email);
                throw new Error('Restaurant not found with this email');
              }
            } catch (apiError) {
              console.error('Error searching for restaurant by email:', apiError);
            }
          }
        } catch (apiError) {
          console.error('Error in login process:', apiError);
        }
        
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Try: restaurant@grubstack.com / password"
      });
    } finally {
      setIsLoading(false);
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
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2 border-orange-200 dark:border-orange-800 shadow-orange-500/20">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <ChefHat className="h-8 w-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Restaurant Login
            </CardTitle>
            <p className="text-muted-foreground dark:text-gray-300">
              Access your restaurant management dashboard
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="restaurant@grubstack.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-400 hover:border-orange-500"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>


            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have a restaurant account?{' '}
                <Link
                  to="/restaurant/register"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Register here
                </Link>
              </p>
            </div>

            {/* Contact Admin Section */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:blue-100 mb-2">
                Need Help?
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p><strong>Contact Admin:</strong> admin@grubstack.com</p>
                <p className="text-xs">For account issues, approval status, or general questions</p>
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400 transition-colors"
          >
            ← Back to Customer App
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RestaurantLoginPage;
