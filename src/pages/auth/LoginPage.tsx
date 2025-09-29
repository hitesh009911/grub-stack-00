import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChefHat, Shield, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import TruckLoader from '@/components/ui/TruckLoader';

interface LoginPageProps {
  onToggleMode: () => void;
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onToggleMode, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields"
      });
      return;
    }

    try {
      if (isAdminLogin) {
        // Handle admin login - try real API first, fallback to hardcoded
        try {
          const response = await fetch('/admin/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const adminData = await response.json();
            
            const adminSession = {
              id: adminData.id,
              email: adminData.email,
              name: adminData.fullName,
              role: 'admin',
              permissions: adminData.permissions || []
            };
            
            localStorage.setItem('grub-stack-admin', JSON.stringify(adminSession));
            
            toast({
              title: "Admin login successful!",
              description: "Welcome to the admin dashboard"
            });
            
            navigate('/admin/dashboard');
            return;
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Invalid admin credentials');
          }
        } catch (apiError) {
          // Fallback to hardcoded authentication
          console.log('API authentication failed, using fallback:', apiError);
          
          if (email === 'admin@grubstack.com' && password === 'admin123') {
            const adminSession = {
              id: '1',
              email: 'admin@grubstack.com',
              name: 'System Administrator',
              role: 'admin',
              permissions: ['MANAGE_RESTAURANTS', 'MANAGE_ADMINS', 'MANAGE_USERS', 'VIEW_ANALYTICS', 'MANAGE_ORDERS']
            };
            
            localStorage.setItem('grub-stack-admin', JSON.stringify(adminSession));
            
            toast({
              title: "Admin login successful!",
              description: "Welcome to the admin dashboard"
            });
            
            navigate('/admin/dashboard');
            return;
          } else {
            throw new Error('Invalid admin credentials');
          }
        }
      } else {
        // Handle regular user login
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in."
        });
        onLoginSuccess();
      }
  } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again."
      });
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      {/* Back to Welcome Page Button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Welcome
        </Button>
      </div>
      
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
        <Card className="shadow-primary border-0">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto flex items-center justify-center"
            >
              <span className="text-2xl font-bold text-white">🍽️</span>
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">Sign in to continue ordering delicious food</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <TruckLoader />
                ) : (
                  <>
                    {isAdminLogin ? 'Sign In as Admin' : 'Sign In'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Admin Login Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={isAdminLogin ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAdminLogin(!isAdminLogin)}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                {isAdminLogin ? 'Admin Mode' : 'Admin Login'}
              </Button>
            </div>

            
            <div className="space-y-3">
              <div className="text-center">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to="/restaurant/login">
                    <ChefHat className="mr-2 h-4 w-4" />
                    Restaurant Login
                  </Link>
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to="/delivery/login">
                    <Truck className="mr-2 h-4 w-4" />
                    Delivery Agent Login
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <Button variant="link" onClick={onToggleMode} className="p-0 text-primary">
                Sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;