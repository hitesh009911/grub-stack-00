import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChefHat, Eye, EyeOff, ArrowRight, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import { validatePhoneNumber, formatPhoneInput } from '@/utils/validation';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const RestaurantRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const formattedPhone = formatPhoneInput(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
      
      // Validate phone number
      const validation = validatePhoneNumber(formattedPhone);
      setPhoneError(validation.isValid ? '' : validation.error || '');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.restaurantName || !formData.ownerName || !formData.email || !formData.phone || !formData.address || !formData.password) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Passwords do not match"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Weak password",
        description: "Password must be at least 6 characters long"
      });
      return;
    }

    // Validate phone number
    if (formData.phone) {
      const validation = validatePhoneNumber(formData.phone);
      if (!validation.isValid) {
        setPhoneError(validation.error || '');
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validation.error || 'Please enter a valid phone number.'
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // Call the actual API to create restaurant
      const response = await fetch('/api/restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.restaurantName,
          description: formData.description || '',
          cuisine: 'Mixed', // Default cuisine
          address: formData.address,
          phone: formData.phone || '',
          email: formData.email || '',
          ownerName: formData.ownerName || '',
          ownerEmail: formData.email || '',
          ownerPhone: formData.phone || '',
          rating: 0.0,
          status: 'PENDING' // Pending approval
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const restaurantData = await response.json();

      // Store restaurant data in localStorage for login purposes
      const localRestaurantData = {
        id: restaurantData.id,
        name: restaurantData.name,
        ownerName: restaurantData.ownerName,
        email: restaurantData.email,
        phone: restaurantData.phone,
        address: restaurantData.address,
        description: restaurantData.description,
        role: 'restaurant',
        status: 'pending' // Pending approval
      };

      localStorage.setItem('restaurantAuth', JSON.stringify(localRestaurantData));

      toast({
        title: "Registration successful!",
        description: "Your restaurant application has been submitted. Please wait for admin approval before logging in."
      });

      // Clear form
      setFormData({
        restaurantName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        password: '',
        confirmPassword: ''
      });

      // Redirect to login page
      navigate('/restaurant/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: `Failed to register restaurant: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-2 border-orange-500 bg-black shadow-orange-500/20">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <ChefHat className="h-8 w-8 text-white" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-orange-500">
              Restaurant Registration
            </CardTitle>
            <p className="text-gray-300">
              Join GrubStack and start serving delicious food
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName" className="text-white">Restaurant Name *</Label>
                  <Input
                    id="restaurantName"
                    name="restaurantName"
                    placeholder="e.g., Spice Garden"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    required
                    className="h-12 bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName" className="text-white">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    placeholder="e.g., John Doe"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                    className="h-12 bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="restaurant@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12 bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="123-456-7890"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`h-12 bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400 ${phoneError ? 'border-red-500' : ''}`}
                  />
                  {phoneError && (
                    <p className="text-sm text-red-400 mt-1">{phoneError}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-white">Restaurant Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                  <Input
                    id="address"
                    name="address"
                    placeholder="123 Main Street, City, State - 123456"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="h-12 pl-10 bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Restaurant Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your restaurant, cuisine type, specialties..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="resize-none bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="h-12 pr-12 bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-orange-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="h-12 pr-12 bg-black border-orange-500 text-white focus:border-orange-400 focus:ring-orange-400"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-orange-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <>
                    <span>Create Restaurant Account</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Already have a restaurant account?{' '}
                <Link
                  to="/restaurant/login"
                  className="text-orange-500 hover:text-orange-400 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>


            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-xs text-orange-400 font-medium mb-2">Registration Info:</p>
              <p className="text-xs text-orange-300">• Your account will be reviewed before activation</p>
              <p className="text-xs text-orange-300">• You'll receive an email confirmation</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-gray-400 hover:text-orange-500 transition-colors"
          >
            ← Back to Customer App
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RestaurantRegisterPage;
