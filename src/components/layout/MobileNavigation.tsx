import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingCart, User, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const { totalItems } = useCart();

  const getNavigationTabs = () => {
    if (!user) {
      return [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'restaurants', icon: Search, label: 'Browse' },
        { id: 'profile', icon: User, label: 'Account' },
      ];
    }

    switch (user.role) {
      case 'customer':
        return [
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'restaurants', icon: Search, label: 'Browse' },
          { id: 'cart', icon: ShoppingCart, label: 'Cart', badge: totalItems },
          { id: 'orders', icon: MapPin, label: 'Orders' },
          { id: 'profile', icon: User, label: 'Profile' },
        ];
      
      case 'restaurant':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'menu', icon: Search, label: 'Menu' },
          { id: 'orders', icon: ShoppingCart, label: 'Orders' },
          { id: 'profile', icon: User, label: 'Profile' },
        ];
      
      case 'delivery':
        return [
          { id: 'available', icon: Home, label: 'Available' },
          { id: 'active', icon: MapPin, label: 'Active' },
          { id: 'history', icon: ShoppingCart, label: 'History' },
          { id: 'profile', icon: User, label: 'Profile' },
        ];
      
      case 'admin':
        return [
          { id: 'dashboard', icon: Home, label: 'Dashboard' },
          { id: 'restaurants', icon: Search, label: 'Restaurants' },
          { id: 'orders', icon: ShoppingCart, label: 'Orders' },
          { id: 'users', icon: User, label: 'Users' },
        ];
      
      default:
        return [];
    }
  };

  const tabs = getNavigationTabs();

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center py-2 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.badge && tab.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
              
              {isActive && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full"
                  layoutId="activeIndicator"
                  initial={false}
                  style={{ x: "-50%" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileNavigation;