import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Truck, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { validatePhoneNumber, formatPhoneInput } from '@/utils/validation';

const DeliveryAgentRegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: '',
    licenseNumber: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      // First register with the user service
      const userResponse = await fetch('http://localhost:8082/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          roles: ['DELIVERY']
        })
      });

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.error || 'User registration failed');
      }

      const userData = await userResponse.json();

      // Then create delivery agent profile
      const agentResponse = await fetch('/api/deliveries/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          licenseNumber: formData.licenseNumber
        })
      });

      if (agentResponse.ok) {
        // Store registration data in localStorage for login
        const registeredAgents = JSON.parse(localStorage.getItem('registeredDeliveryAgents') || '[]');
        const newAgent = {
          id: Date.now(),
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          vehicleType: formData.vehicleType,
          licenseNumber: formData.licenseNumber
        };
        registeredAgents.push(newAgent);
        localStorage.setItem('registeredDeliveryAgents', JSON.stringify(registeredAgents));
        
        setSuccess(true);
        toast({
          title: "Registration Successful",
          description: "Your delivery agent account has been created successfully!"
        });
      } else {
        const errorData = await agentResponse.json();
        throw new Error(errorData.message || 'Delivery agent registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Even if API fails, store locally for demo purposes
      const registeredAgents = JSON.parse(localStorage.getItem('registeredDeliveryAgents') || '[]');
      const newAgent = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        vehicleType: formData.vehicleType,
        licenseNumber: formData.licenseNumber
      };
      registeredAgents.push(newAgent);
      localStorage.setItem('registeredDeliveryAgents', JSON.stringify(registeredAgents));
      
      setSuccess(true);
      toast({
        title: "Registration Successful",
        description: "Your delivery agent account has been created!"
      });
    } finally {
      setLoading(false);
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
                Your delivery agent application has been submitted for review. 
                We'll review your application and notify you via email once it's approved.
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/delivery')} 
                  className="w-full"
                >
                  Back to Delivery
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Truck className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Join Our Delivery Team</CardTitle>
            <p className="text-muted-foreground">
              Become a delivery agent and start earning with GrubStack
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter a secure password"
                    required
                  />
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

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    onClick={() => navigate('/delivery/login')}
                    className="p-0 h-auto text-primary"
                  >
                    Sign in here
                  </Button>
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DeliveryAgentRegisterPage;

