import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import BigTruckLoader from '@/components/ui/BigTruckLoader';
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
}

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/restaurants');
        
        // Transform backend data to frontend format
        type Restaurant = {
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
        };
        const transformedRestaurants = (data as Restaurant[]).map((restaurant) => ({
          ...restaurant,
          image: getRestaurantImage(restaurant.cuisine),
          rating: 4.5 + Math.random() * 0.5, // Mock rating
          deliveryTime: `${20 + Math.floor(Math.random() * 20)}-${30 + Math.floor(Math.random() * 20)} min`,
          deliveryFee: 1.99 + Math.random() * 3
        }));
        
        setRestaurants(transformedRestaurants);
      } catch (err) {
        setError('Failed to load restaurants');
        console.error('Error fetching restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Helper function to get restaurant image based on cuisine
  const getRestaurantImage = (cuisine: string | null) => {
    if (!cuisine) return italianImg; // default if cuisine is null
    const cuisineLower = cuisine.toLowerCase();
    if (cuisineLower.includes('italian') || cuisineLower.includes('pizza')) return italianImg;
    if (cuisineLower.includes('japanese') || cuisineLower.includes('sushi')) return sushiImg;
    if (cuisineLower.includes('indian') || cuisineLower.includes('curry')) return indianImg;
    if (cuisineLower.includes('american') || cuisineLower.includes('burger')) return burgerImg;
    return italianImg; // default
  };

  const categories = [
    { name: 'Pizza', icon: '🍕', color: 'bg-red-100 text-red-700' },
    { name: 'Burgers', icon: '🍔', color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Sushi', icon: '🍣', color: 'bg-blue-100 text-blue-700' },
    { name: 'Indian', icon: '🍛', color: 'bg-orange-100 text-orange-700' },
    { name: 'Chinese', icon: '🥢', color: 'bg-green-100 text-green-700' },
    { name: 'Mexican', icon: '🌮', color: 'bg-purple-100 text-purple-700' }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = !selectedCategory || 
                           (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(categoryName);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <BigTruckLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-primary text-white p-6 rounded-lg mx-4 mt-4"
      >
        <h2 className="text-2xl font-bold mb-2">Browse Restaurants</h2>
        <p className="text-white/90 mb-4">Discover amazing food from local restaurants</p>
        
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
              <Card 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedCategory === category.name ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
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
            {selectedCategory 
              ? `${selectedCategory} Restaurants` 
              : searchQuery 
                ? `Results for "${searchQuery}"` 
                : 'All Restaurants'
            }
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
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
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
                      <Badge variant="secondary" className="text-xs">
                        {restaurant.cuisine || 'Restaurant'}
                      </Badge>
                    </div>
                    
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No restaurants found matching your criteria.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
