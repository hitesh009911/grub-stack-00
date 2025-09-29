import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Truck, 
  Mail, 
  Lock, 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  User,
  Phone,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { validatePhoneNumber, formatPhoneInput } from '@/utils/validation';

interface DeliveryAgent {
  id: number;
  email: string;
  name: string;
  phone: string;
  status?: string;
  vehicleType: string;
  licenseNumber: string;
  createdAt?: string;
}

const DeliveryAgentLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      vehicleType: '',
      licenseNumber: '',
      password: ''
    });

  // Determine where to go back based on referrer
  const getBackNavigation = () => {
    const referrer = document.referrer;
    if (referrer.includes('/delivery')) {
      return '/delivery'; // Came from delivery landing
    } else {
      return '/login'; // Default to main login
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      const formattedPhone = formatPhoneInput(value);
      setFormData(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
      
      // Validate phone number
      const validation = validatePhoneNumber(formattedPhone);
      setPhoneError(validation.isValid ? '' : validation.error || '');
    } else {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting delivery agent login with:', formData);
      
      // First check database for approved agents (admin-created or approved self-registered)
      console.log('Checking database for agent with email:', formData.email);
      
      try {
        const agentResponse = await fetch(`http://localhost:8086/deliveries/agents?email=${formData.email}`);
        
        if (agentResponse.ok) {
          const agents = await agentResponse.json();

            interface DeliveryAgent {
              id: number;
              email: string;
              name: string;
              phone: string;
              status?: string;
              vehicleType: string;
              licenseNumber: string;
            }
          const dbAgent = (agents as DeliveryAgent[]).find((a: DeliveryAgent) => a.email === formData.email);
          
          if (dbAgent) {
            console.log('Found agent in database:', dbAgent);
            
            // Check if agent is approved
            if (dbAgent.status === 'PENDING_APPROVAL') {
              toast({
                title: "Account Pending Approval",
                description: "Your application is still under review. You'll be notified once approved.",
                variant: "destructive"
              });
              return;
            }
            
            // Agent is approved, allow login
            const agentData = {
              id: dbAgent.id,
              email: dbAgent.email,
              name: dbAgent.name,
              phone: dbAgent.phone,
              status: dbAgent.status || 'ACTIVE',
              vehicleType: dbAgent.vehicleType,
              licenseNumber: dbAgent.licenseNumber
            };
            
            // Store agent session data
            const sessionData = {
              ...agentData,
              role: 'delivery'
            };
            
            console.log('Storing database agent session:', sessionData);
            localStorage.setItem('deliveryAgent', JSON.stringify(sessionData));
            
            // Update agent status to ACTIVE in backend
            try {
              await fetch(`/api/deliveries/agents/${dbAgent.id}/status?status=ACTIVE`, {
                method: 'PUT'
              });
              console.log('Agent status updated to ACTIVE');
            } catch (error) {
              console.error('Failed to update agent status:', error);
            }
            
            toast({
              title: "Login Successful",
              description: `Welcome back, ${agentData.name}!`
            });
            
            navigate('/delivery/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking database for agent:', error);
      }
      
      // Fallback: Check localStorage for pending agents
      const registeredAgents = JSON.parse(localStorage.getItem('registeredDeliveryAgents') || '[]');
      console.log('Registered agents in localStorage:', registeredAgents);
      
      const existingAgent = registeredAgents.find(agent => 
        agent.email === formData.email
      );
      
      console.log('Found existing agent:', existingAgent);
      
      if (existingAgent) {
        // Check if agent is approved
        if (existingAgent.status === 'PENDING_APPROVAL') {
          toast({
            title: "Account Pending Approval",
            description: "Your application is still under review. You'll be notified once approved.",
            variant: "destructive"
          });
          return;
        }
        
        // User has registered and is approved, create session
        const agentData = {
          id: existingAgent.id,
          email: existingAgent.email,
          name: existingAgent.name,
          phone: existingAgent.phone,
          status: existingAgent.status || 'ACTIVE',
          vehicleType: existingAgent.vehicleType,
          licenseNumber: existingAgent.licenseNumber
        };
        
        console.log('Found registered agent, logging in');
        
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
        // If not found in localStorage either, show error
        toast({
          title: "Account Not Found",
          description: "Please sign up first or contact admin to create your delivery agent account.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    setLoading(true);

    try {
      // Check if email already exists in backend
      const response = await fetch(`http://localhost:8086/deliveries/agents?email=${encodeURIComponent(formData.email)}`);
      if (response.ok) {
        const agents = await response.json();
        if (agents.length > 0) {
          throw new Error('An account with this email already exists');
        }
      } else if (response.status !== 404) {
        // If it's not a 404 (agent not found), it's an error
        throw new Error('Failed to check email availability');
      }

      // Create new agent (pending approval) - now using backend API
      const createResponse = await fetch('http://localhost:8086/deliveries/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: 'delivery123', // Default password for self-registered agents
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          licenseNumber: formData.licenseNumber
        })
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create agent');
      }

      const newAgent = await createResponse.json();
      
      setSuccess(true);
      toast({
        title: "Application Submitted",
        description: "Your delivery agent application has been submitted! You'll receive login credentials via email once approved."
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create delivery agent account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Send registration acknowledgment email
  const sendRegistrationAcknowledgment = async (agent: DeliveryAgent) => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'DELIVERY_AGENT_REGISTRATION',
          channel: 'EMAIL',
          recipient: agent.email,
          subject: 'Application Received - GrubStack Delivery',
          message: 'Thank you for applying to join the GrubStack delivery team. Your application is under review.',
          templateId: 'delivery-agent-registration',
          templateData: {
            agentName: agent.name,
            agentEmail: agent.email,
            phone: agent.phone,
            vehicleType: agent.vehicleType,
            registrationDate: agent.createdAt
          },
          priority: 'NORMAL'
        })
      });

      if (!response.ok) {
        console.error('Failed to send registration acknowledgment email');
      }
    } catch (error) {
      console.error('Error sending registration acknowledgment email:', error);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
               <h2 className="text-2xl font-bold mb-2">
                 Application Submitted!
               </h2>
               <p className="text-muted-foreground mb-6">
                 Your delivery agent application has been submitted successfully! 
                 You'll receive an email notification once your application is approved.
               </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setSuccess(false);
                    setIsRegisterMode(false);
                    setFormData({ name: '', email: '', phone: '', vehicleType: '', licenseNumber: '', password: '' });
                  }} 
                  className="w-full"
                >
                  Sign In to Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/')} 
                  variant="outline" 
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Theme Toggle and Help */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                  <li>Login problems</li>
                  <li>Account approval status</li>
                  <li>Delivery assignment issues</li>
                  <li>Password reset</li>
                  <li>Technical support</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <ThemeToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative"
      >
        {/* Neon Orange Border Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-lg blur-sm opacity-75 animate-pulse"></div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-300 via-orange-400 to-red-400 rounded-lg blur-xs opacity-50"></div>
        
        <Card className="relative bg-background border-2 border-orange-400 dark:border-orange-500 shadow-2xl shadow-orange-500/20 ring-2 ring-orange-400/30 dark:ring-orange-500/30">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isRegisterMode ? 'Join Our Delivery Team' : 'Delivery Agent Login'}
            </CardTitle>
            <p className="text-muted-foreground">
              {isRegisterMode 
                ? 'Become a delivery agent and start earning with GrubStack' 
                : 'Sign in to access your delivery dashboard'
              }
            </p>
          </CardHeader>
          <CardContent>
            {isRegisterMode ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {/* Personal Information */}
              <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                <div>
                      <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="123-456-7890"
                        className={phoneError ? 'border-red-500' : ''}
                        required
                      />
                      {phoneError && (
                        <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                      )}
                    </div>
                  </div>

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Vehicle Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleType">Vehicle Type *</Label>
                      <Select 
                        value={formData.vehicleType} 
                        onValueChange={(value) => handleInputChange('vehicleType', value)}
                      >
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
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        placeholder="Enter license number"
                        required
                      />
                    </div>
                  </div>
                </div>

                 {/* Terms and Conditions */}
                 <Alert>
                   <AlertCircle className="h-4 w-4" />
                   <AlertDescription>
                     By submitting this application, you agree to our terms and conditions. 
                     Your application will be reviewed and you'll be notified of the decision within 2-3 business days.
                   </AlertDescription>
                 </Alert>


                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRegisterMode(false)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Creating Account...' : 'Register as Delivery Agent'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                        className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 dark:border-orange-700 dark:focus:border-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="font-medium">Password</Label>
                  <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                        className="pl-10 pr-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 dark:border-orange-700 dark:focus:border-orange-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
                  
                  {/* Don't have an account link */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Button
                        variant="link"
                        onClick={() => setIsRegisterMode(true)}
                        className="p-0 h-auto text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
                      >
                        Sign up here
                      </Button>
                    </p>
                  </div>
                
                <Button
                  type="button"
                  variant="outline"
                    onClick={() => navigate(getBackNavigation())}
                    className="w-full flex items-center gap-2 border-orange-300 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                >
                  <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DeliveryAgentLoginPage;

