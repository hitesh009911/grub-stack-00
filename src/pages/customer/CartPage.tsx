import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, clearCart } = useCart();
  const { toast } = useToast();

  const deliveryFee = 3.99;
  const taxRate = 0.08;
  const subtotal = totalPrice;
  const tax = subtotal * taxRate;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        variant: "destructive",
        title: "Cart is empty",
        description: "Add some items to your cart before checkout"
      });
      return;
    }

    toast({
      title: "Checkout initiated",
      description: "Redirecting to payment..."
    });
    
    // Here you would integrate with your payment system
    console.log('Checkout with items:', items);
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
                    <p className="text-sm font-medium text-primary">${item.price.toFixed(2)}</p>
                    
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
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleCheckout}
          className="w-full bg-gradient-primary hover:shadow-primary transition-all duration-300 h-12"
        >
          Proceed to Checkout
          <ArrowRight className="ml-2 h-4 w-4" />
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