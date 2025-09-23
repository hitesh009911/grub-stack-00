import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, CreditCard, Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'razorpay' | 'phonepe' | 'gpay' | 'paytm' | 'amazonpay'>('cash');

  const deliveryFee = 3.99;
  const taxRate = 0.08;
  const subtotal = totalPrice;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  // Payment Gateway Redirect Functions (India-focused)
  const redirectToRazorpay = () => {
    const razorpayUrl = `https://rzp.io/test/pay_${Date.now()}`;
    window.open(razorpayUrl, '_blank');
  };

  const redirectToPhonePe = () => {
    const phonepeUrl = `https://mercury.phonepe.com/transact?merchantId=GRUBSTACK&transactionId=${Date.now()}`;
    window.open(phonepeUrl, '_blank');
  };

  const redirectToGPay = () => {
    const gpayUrl = `https://pay.google.com/gp/v/save/${Date.now()}`;
    window.open(gpayUrl, '_blank');
  };

  const redirectToPaytm = () => {
    const paytmUrl = `https://securegw.paytm.in/merchant-trans/paymentUI?txnToken=${Date.now()}&orderId=ORDER_${Date.now()}`;
    window.open(paytmUrl, '_blank');
  };

  const redirectToAmazonPay = () => {
    const amazonpayUrl = `https://pay.amazon.in/checkout/${Date.now()}`;
    window.open(amazonpayUrl, '_blank');
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Add some items to your cart before checkout"
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to place an order"
      });
      return;
    }

    // Check if any restaurant in cart is offline
    try {
      const restaurantId = parseInt(items[0].restaurantId);
      const restaurantResponse = await api.get(`/restaurants/${restaurantId}`);
      const restaurant = restaurantResponse.data;
      
      // Check delivery status (online/offline)
      if (restaurant.deliveryStatus === 'OFFLINE' || restaurant.deliveryStatus === 'offline') {
        toast({
          variant: "destructive",
          title: "Restaurant Offline",
          description: `${restaurant.name} is currently offline and not accepting orders. Please remove items from this restaurant or try another restaurant.`
        });
        return;
      }

      // Check account status (active/inactive)
      if (restaurant.status === 'INACTIVE' || restaurant.status === 'inactive') {
        toast({
          variant: "destructive",
          title: "Restaurant Inactive",
          description: `${restaurant.name} account is inactive. Please remove items from this restaurant or try another restaurant.`
        });
        return;
      }
    } catch (error) {
      console.error('Error checking restaurant status:', error);
      // Continue with checkout if we can't check status
    }

    setIsProcessing(true);

    try {
      // Create order data
      const orderData = {
        restaurantId: parseInt(items[0].restaurantId),
        userId: parseInt(user.id),
        totalCents: Math.round(total * 100), // Add total for order creation
        items: items.map(item => ({
          menuItemId: parseInt(item.id),
          quantity: item.quantity,
          priceCents: Math.round(item.price * 100)
        }))
      };

      // Handle different payment methods
      if (paymentMethod === 'cash') {
        // Cash on Delivery - instant processing, no payment service needed
        toast({
          title: "⚡ Placing COD Order",
          description: "Processing your order instantly...",
          duration: 500
        });

        // Create order only - delivery will be created asynchronously by the backend
        const orderResponse = await api.post('/orders', orderData);
        const { data: order } = orderResponse;

        // Instant success for COD
        clearCart();
        toast({
          title: "🎉 COD Order Placed!",
          description: "Your order is confirmed! Pay when delivered.",
          duration: 3000
        });
        
        const paymentUrl = `/payment?status=success&orderId=${order.id}&amount=${total.toFixed(2)}&method=cash`;
        navigate(paymentUrl);
        return;
      } else {
        // Show processing toast for online payments
        toast({
          title: "Processing Order",
          description: "Please wait while we process your order...",
          duration: 2000
        });

        // Create order only - delivery will be created asynchronously by the backend
        const orderResponse = await api.post('/orders', orderData);
        const { data: order } = orderResponse;
        
        // Process payment
        const paymentData = {
          orderId: order.id.toString(),
          amountCents: Math.round(total * 100)
        };
        // Redirect to payment gateway
        switch (paymentMethod) {
          case 'razorpay':
            redirectToRazorpay();
            break;
          case 'phonepe':
            redirectToPhonePe();
            break;
          case 'gpay':
            redirectToGPay();
            break;
          case 'paytm':
            redirectToPaytm();
            break;
          case 'amazonpay':
            redirectToAmazonPay();
            break;
        }
        
        toast({
          title: "Redirecting to payment...",
          description: "Complete your payment in the new window"
        });
        
        // Simulate payment success after 1 second and redirect to payment page
        setTimeout(() => {
          const paymentUrl = `/payment?status=success&orderId=${order.id}&amount=${total.toFixed(2)}&method=${paymentMethod}`;
          navigate(paymentUrl);
        }, 1000);
      }

      clearCart();
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "There was an error processing your order. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4"
        >
          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some delicious items to get started!</p>
        <Button className="bg-gradient-primary">
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 px-4">
      {/* Cart Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Order</h2>
        
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.restaurantName}</p>
                    <p className="text-sm font-medium text-primary">₹{item.price.toFixed(2)}</p>
                    
                    {item.customizations && item.customizations.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.customizations.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Order Summary */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Order Summary</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Choose Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Cash on Delivery */}
            <Button
              variant={paymentMethod === 'cash' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('cash')}
              className="h-16 flex-col space-y-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs font-bold">Cash on Delivery</span>
              <span className="text-xs opacity-90">⚡ Instant</span>
            </Button>

            {/* Razorpay */}
            <Button
              variant={paymentMethod === 'razorpay' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('razorpay')}
              className="h-16 flex-col space-y-1 bg-blue-800 hover:bg-blue-900 text-white border-blue-800"
            >
              <div className="text-xs font-bold">RAZORPAY</div>
              <span className="text-xs">UPI/Cards/NetBanking</span>
            </Button>

            {/* PhonePe */}
            <Button
              variant={paymentMethod === 'phonepe' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('phonepe')}
              className="h-16 flex-col space-y-1 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
            >
              <div className="text-xs font-bold">PHONEPE</div>
              <span className="text-xs">UPI Payment</span>
            </Button>

            {/* Google Pay */}
            <Button
              variant={paymentMethod === 'gpay' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('gpay')}
              className="h-16 flex-col space-y-1 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              <div className="text-xs font-bold">G PAY</div>
              <span className="text-xs">Google Pay</span>
            </Button>

            {/* Paytm */}
            <Button
              variant={paymentMethod === 'paytm' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('paytm')}
              className="h-16 flex-col space-y-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              <div className="text-xs font-bold">PAYTM</div>
              <span className="text-xs">Wallet/UPI</span>
            </Button>

            {/* Amazon Pay */}
            <Button
              variant={paymentMethod === 'amazonpay' ? 'default' : 'outline'}
              onClick={() => setPaymentMethod('amazonpay')}
              className="h-16 flex-col space-y-1 bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
            >
              <div className="text-xs font-bold">AMAZON PAY</div>
              <span className="text-xs">Amazon Wallet</span>
            </Button>
          </div>
          
          {/* Payment Method Info */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {paymentMethod === 'cash' 
                  ? 'Pay when your order arrives' 
                  : 'You will be redirected to the payment gateway'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleCheckout}
          disabled={isProcessing}
          className={`w-full transition-all duration-300 h-12 ${
            paymentMethod === 'cash' 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg' 
              : 'bg-gradient-primary hover:shadow-primary'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              {paymentMethod === 'cash' ? (
                <>
                  <div className="animate-pulse rounded-full h-4 w-4 bg-green-400"></div>
                  <span>⚡ Placing COD Order...</span>
                </>
              ) : (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing Order...</span>
                </>
              )}
            </div>
          ) : (
            <>
              {paymentMethod === 'cash' ? (
                <>
                  ⚡ Place COD Order
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Pay with {paymentMethod.toUpperCase()}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => {
            clearCart();
            toast({
              title: "Cart cleared",
              description: "All items have been removed from your cart"
            });
          }}
          className="w-full"
        >
          Clear Cart
        </Button>
      </div>
    </div>
  );
};

export default CartPage;