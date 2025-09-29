import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, Truck, Plus, Minus, ShoppingCart, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import italianImg from '@/assets/restaurant-italian.jpg';
import sushiImg from '@/assets/restaurant-sushi.jpg';
import indianImg from '@/assets/restaurant-indian.jpg';
import burgerImg from '@/assets/restaurant-burger.jpg';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  createdAt: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  deliveryStatus: 'ONLINE' | 'OFFLINE';
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  restaurant: {
    id: number;
    name: string;
  };
}

const RestaurantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, items, updateQuantity } = useCart();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get restaurant image based on cuisine
  const getRestaurantImage = (cuisine: string | null) => {
    if (!cuisine) return italianImg; // default if cuisine is null
    const cuisineLower = cuisine.toLowerCase();
    if (cuisineLower.includes('italian') || cuisineLower.includes('pizza')) return italianImg;
    if (cuisineLower.includes('japanese') || cuisineLower.includes('sushi')) return sushiImg;
    if (cuisineLower.includes('indian') || cuisineLower.includes('curry')) return indianImg;
    if (cuisineLower.includes('american') || cuisineLower.includes('burger')) return burgerImg;
    return italianImg;
  };

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/restaurants/${id}`);
        
        const transformedRestaurant = {
          ...data,
          image: getRestaurantImage(data.cuisine),
          rating: 4.5 + Math.random() * 0.5,
          deliveryTime: `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} min`,
          deliveryFee: 1.99 + Math.random() * 3,
        };
        
        setRestaurant(transformedRestaurant);
      } catch (err) {
        setError('Failed to load restaurant');
        console.error('Error fetching restaurant:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id]);

  // Fetch menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data } = await api.get(`/restaurants/${id}/menu`);
        setMenuItems(data || []);
      } catch (err) {
        console.error('Error fetching menu items:', err);
        // Use restaurant-specific mock data when API is not available
        const restaurantId = parseInt(id || '1');
        const mockMenuItems = getRestaurantSpecificMockMenu(restaurantId, restaurant?.name || 'Restaurant');
        setMenuItems(mockMenuItems);
      }
    };

    if (id) {
      fetchMenuItems();
    }
  }, [id, restaurant]);

  // Function to get restaurant-specific mock menu
  const getRestaurantSpecificMockMenu = (restaurantId: number, restaurantName: string): MenuItem[] => {
    const restaurantMenus: { [key: number]: MenuItem[] } = {
      1: [ // Sushi Place
        {
          id: 1,
          name: "California Roll",
          description: "Crab, avocado, and cucumber roll",
          priceCents: 1200,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 2,
          name: "Salmon Nigiri",
          description: "Fresh salmon over sushi rice",
          priceCents: 1500,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 3,
          name: "Dragon Roll",
          description: "Eel, cucumber, and avocado roll",
          priceCents: 1800,
          restaurant: { id: restaurantId, name: restaurantName }
        }
      ],
      2: [ // Italian Bistro
        {
          id: 4,
          name: "Margherita Pizza",
          description: "Classic tomato and mozzarella pizza",
          priceCents: 1200,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 5,
          name: "Pasta Carbonara",
          description: "Creamy pasta with bacon and parmesan",
          priceCents: 1500,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 6,
          name: "Tiramisu",
          description: "Classic Italian dessert",
          priceCents: 800,
          restaurant: { id: restaurantId, name: restaurantName }
        }
      ],
      3: [ // Indian Spice
        {
          id: 7,
          name: "Chicken Curry",
          description: "Spicy chicken curry with basmati rice",
          priceCents: 1400,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 8,
          name: "Naan Bread",
          description: "Fresh baked Indian bread",
          priceCents: 300,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 9,
          name: "Mango Lassi",
          description: "Refreshing yogurt drink",
          priceCents: 400,
          restaurant: { id: restaurantId, name: restaurantName }
        }
      ],
      4: [ // Burger Joint
        {
          id: 10,
          name: "Classic Burger",
          description: "Beef patty with lettuce, tomato, and onion",
          priceCents: 1200,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 11,
          name: "Chicken Burger",
          description: "Juicy chicken patty with fresh vegetables",
          priceCents: 1100,
          restaurant: { id: restaurantId, name: restaurantName }
        },
        {
          id: 12,
          name: "French Fries",
          description: "Crispy golden fries",
          priceCents: 500,
          restaurant: { id: restaurantId, name: restaurantName }
        }
      ]
    };

    // Return specific menu for restaurant or empty array for new restaurants
    return restaurantMenus[restaurantId] || [];
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    if (!restaurant) return;

    // Check if restaurant is offline (delivery status)
  if (restaurant.deliveryStatus === 'OFFLINE') {
      toast({
        variant: "destructive",
        title: "Restaurant Offline",
        description: "This restaurant is currently offline and not accepting orders. Please try another restaurant."
      });
      return;
    }

    // Check if restaurant account is active
  if (restaurant.status === 'INACTIVE') {
      toast({
        variant: "destructive",
        title: "Restaurant Inactive",
        description: "This restaurant account is inactive. Please try another restaurant."
      });
      return;
    }

    const cartItem = {
      id: menuItem.id.toString(),
      name: menuItem.name,
      price: menuItem.priceCents / 100, // Convert cents to dollars
      image: getRestaurantImage(restaurant.cuisine),
      restaurantId: restaurant.id.toString(),
      restaurantName: restaurant.name,
      category: restaurant.cuisine,
      description: menuItem.description,
    };

    addItem(cartItem);
  };

  const getItemQuantity = (itemId: number) => {
    const item = items.find(item => item.id === itemId.toString());
    return item?.quantity || 0;
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Restaurant not found'}</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold truncate">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{restaurant.cuisine}</p>
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="px-4">
        <Card>
          <div className="relative">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full h-48 object-cover rounded-t-lg"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-bold">{restaurant.name}</h2>
              <div className="flex items-center space-x-2">
                {/* Delivery Status - Only show Online/Offline */}
                {restaurant.deliveryStatus === 'ONLINE' ? (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    Online
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Offline
                  </Badge>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-3">{restaurant.description || 'Delicious food awaits!'}</p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Truck className="h-4 w-4" />
                <span>₹{restaurant.deliveryFee.toFixed(2)} delivery</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="px-4">
        <Input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Menu Items */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Menu</h3>
          {restaurant.deliveryStatus === 'OFFLINE' && (
            <Badge variant="destructive" className="text-xs">
              View Only - Restaurant Offline
            </Badge>
          )}
        </div>
        {filteredMenuItems.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Utensils className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-2">Menu Coming Soon</h4>
                  <p className="text-muted-foreground">
                    This restaurant is working on their menu. Check back later!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredMenuItems.map((item, index) => {
            const quantity = getItemQuantity(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={restaurant.deliveryStatus === 'OFFLINE' ? 'opacity-75' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-lg">{item.name}</h4>
                          {restaurant.deliveryStatus === 'OFFLINE' && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              View Only
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">{item.description}</p>
                        <p className="text-lg font-bold text-primary">
                          ₹{(item.priceCents / 100).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {restaurant.deliveryStatus === 'OFFLINE' ? (
                          <Button
                            size="sm"
                            disabled
                            className="h-8 opacity-50"
                            title="Restaurant is offline - items are view only"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            View Only
                          </Button>
                        ) : restaurant.status === 'INACTIVE' ? (
                          <Button
                            size="sm"
                            disabled
                            className="h-8 opacity-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Inactive
                          </Button>
                        ) : quantity > 0 ? (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id.toString(), quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id.toString(), quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(item)}
                            className="h-8"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          </div>
        )}
      </div>

    </div>
  );
};

export default RestaurantPage;
