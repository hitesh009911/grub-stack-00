import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import italianImg from '@/assets/restaurant-italian.jpg';
import sushiImg from '@/assets/restaurant-sushi.jpg';
import indianImg from '@/assets/restaurant-indian.jpg';
import burgerImg from '@/assets/restaurant-burger.jpg';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  cuisine: string[];
  promoted?: boolean;
  discount?: string;
}

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with API calls
  const restaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Bella Italia',
      image: italianImg,
      rating: 4.8,
      deliveryTime: '25-35 min',
      deliveryFee: 2.50,
      cuisine: ['Italian', 'Pizza', 'Pasta'],
      promoted: true,
      discount: '20% OFF'
    },
    {
      id: '2',
      name: 'Spice Garden',
      image: indianImg,
      rating: 4.6,
      deliveryTime: '30-40 min',
      deliveryFee: 1.99,
      cuisine: ['Indian', 'Curry', 'Vegetarian']
    },
    {
      id: '3',
      name: 'Burger House',
      image: burgerImg,
      rating: 4.5,
      deliveryTime: '20-30 min',
      deliveryFee: 3.00,
      cuisine: ['American', 'Burgers', 'Fast Food'],
      discount: '15% OFF'
    },
    {
      id: '4',
      name: 'Sushi Zen',
      image: sushiImg,
      rating: 4.9,
      deliveryTime: '35-45 min',
      deliveryFee: 4.50,
      cuisine: ['Japanese', 'Sushi', 'Fresh'],
      promoted: true
    }
  ];

  const categories = [
    { name: 'Pizza', icon: '🍕', color: 'bg-red-100 text-red-700' },
    { name: 'Burgers', icon: '🍔', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Sushi', icon: '🍣', color: 'bg-blue-100 text-blue-700' },
    { name: 'Indian', icon: '🍛', color: 'bg-orange-100 text-orange-700' },
    { name: 'Chinese', icon: '🥢', color: 'bg-green-100 text-green-700' },
    { name: 'Mexican', icon: '🌮', color: 'bg-purple-100 text-purple-700' }
  ];

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.cuisine.some(cuisine => cuisine.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-primary text-white p-6 rounded-lg mx-4 mt-4"
      >
        <h2 className="text-2xl font-bold mb-2">Hungry? We've got you covered!</h2>
        <p className="text-white/90 mb-4">Delicious food delivered to your doorstep in minutes</p>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 bg-white text-gray-900"
          />
          <Button size="sm" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="px-4">
        <h3 className="text-lg font-semibold mb-3">Categories</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <span className="text-sm font-medium">{category.name}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Restaurants */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {searchQuery ? `Results for "${searchQuery}"` : 'Popular Restaurants'}
          </h3>
          <span className="text-sm text-muted-foreground">
            {filteredRestaurants.length} restaurants
          </span>
        </div>

        <div className="space-y-4">
          {filteredRestaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {restaurant.promoted && (
                      <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                        Promoted
                      </Badge>
                    )}
                    {restaurant.discount && (
                      <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                        {restaurant.discount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{restaurant.name}</h4>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {restaurant.cuisine.map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className="h-4 w-4" />
                        <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;