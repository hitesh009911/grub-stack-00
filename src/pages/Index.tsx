import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WelcomePage from './WelcomePage';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import HomePage from './customer/HomePage';
import BrowsePage from './customer/BrowsePage';
import RestaurantPage from './customer/RestaurantPage';
import CartPage from './customer/CartPage';
import OrdersPage from './customer/OrdersPage';
import OrderTrackingPage from './customer/OrderTrackingPage';
import PaymentPage from './customer/PaymentPage';
import ProfilePage from './customer/ProfilePage';
import RestaurantLoginPage from './restaurant/RestaurantLoginPage';
import RestaurantRegisterPage from './restaurant/RestaurantRegisterPage';
import RestaurantDashboardPage from './restaurant/RestaurantDashboardPage';
import MenuManagementPage from './restaurant/MenuManagementPage';
import OrderManagementPage from './restaurant/OrderManagementPage';
import AdminDashboardPage from './admin/AdminDashboardPage';
import AdminLoginPage from './admin/AdminLoginPage';
import AdminManagementPage from './admin/AdminManagementPage';
import DeliveryManagementPage from './admin/DeliveryManagementPage';
import RestaurantManagementPage from './admin/RestaurantManagementPage';
import RestaurantOrdersPage from './admin/RestaurantOrdersPage';
import DeliveryLandingPage from './delivery/DeliveryLandingPage';
import DeliveryAgentRegisterPage from './delivery/DeliveryAgentRegisterPage';
import DeliveryAgentLoginPage from './delivery/DeliveryAgentLoginPage';
import DeliveryAgentDashboardPage from './delivery/DeliveryAgentDashboardPage';
import Header from '@/components/layout/Header';
import MobileNavigation from '@/components/layout/MobileNavigation';
import NotificationInitializer from '@/components/NotificationInitializer';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';

// Admin Routes Component
const AdminRoutes = () => {
  const { admin, isLoading } = useAdmin();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, redirect to login
  if (!admin && location.pathname !== '/admin/login') {
    return <AdminLoginPage />;
  }

  // If authenticated and on login page, redirect to dashboard
  if (admin && location.pathname === '/admin/login') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/management" element={<AdminManagementPage />} />
      <Route path="/admin/deliveries" element={<DeliveryManagementPage />} />
      <Route path="/admin/restaurants" element={<RestaurantManagementPage />} />
      <Route path="/admin/restaurants/:restaurantId/orders" element={<RestaurantOrdersPage />} />
      <Route path="/admin/*" element={<AdminDashboardPage />} />
    </Routes>
  );
};

const Index = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're in restaurant management mode (not customer restaurant viewing)
  const isRestaurantManagementMode = location.pathname.startsWith('/restaurant/') && 
    !location.pathname.match(/^\/restaurant\/\d+$/);
  
  // Check if we're in admin mode
  const isAdminMode = location.pathname.startsWith('/admin/');
  
  // Check if we're in delivery mode
  const isDeliveryMode = location.pathname.startsWith('/delivery/');
  
  // If user is not authenticated, show welcome page or auth pages
  if (!user && !isRestaurantManagementMode && !isAdminMode && !isDeliveryMode) {
    // Check if user is trying to access login or register directly
    if (location.pathname === '/login') {
      return (
        <LoginPage 
          onToggleMode={() => navigate('/register')}
          onLoginSuccess={() => {/* handled by context */}}
        />
      );
    }
    if (location.pathname === '/register') {
      return (
        <RegisterPage 
          onToggleMode={() => navigate('/login')}
          onRegisterSuccess={() => {/* handled by context */}}
        />
      );
    }
    // Default to welcome page
    return <WelcomePage />;
  }

  // Handle admin routes
  if (isAdminMode) {
    return (
      <AdminProvider>
        <AdminRoutes />
      </AdminProvider>
    );
  }

  // Handle restaurant management routes (no authentication required for login/register)
  if (isRestaurantManagementMode) {
    return (
      <Routes>
        <Route path="/restaurant/login" element={<RestaurantLoginPage />} />
        <Route path="/restaurant/register" element={<RestaurantRegisterPage />} />
        <Route path="/restaurant/dashboard" element={<RestaurantDashboardPage />} />
        <Route path="/restaurant/menu" element={<MenuManagementPage />} />
        <Route path="/restaurant/orders" element={<OrderManagementPage />} />
        <Route path="/restaurant/*" element={<RestaurantLoginPage />} />
      </Routes>
    );
  }

  // Handle delivery routes (no authentication required for login/register)
  if (isDeliveryMode) {
    return (
      <Routes>
        <Route path="/delivery" element={<DeliveryLandingPage />} />
        <Route path="/delivery/login" element={<DeliveryAgentLoginPage />} />
        <Route path="/delivery/register" element={<DeliveryAgentRegisterPage />} />
        <Route path="/delivery/dashboard" element={<DeliveryAgentDashboardPage />} />
        <Route path="/delivery/*" element={<DeliveryLandingPage />} />
      </Routes>
    );
  }

  // Get current tab from pathname
  const getCurrentTab = () => {
    if (location.pathname === '/browse') return 'browse';
    if (location.pathname.match(/^\/restaurant\/\d+$/)) return 'restaurants';
    if (location.pathname === '/cart') return 'cart';
    if (location.pathname.startsWith('/orders')) return 'orders';
    if (location.pathname === '/profile') return 'profile';
    return 'home';
  };

  const activeTab = getCurrentTab();

  // Main application layout for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <NotificationInitializer />
      <Header 
        title={getPageTitle(activeTab, user.role)}
        showMenuButton={false}
      />
      
      <main className="pt-16 pb-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:orderId/track" element={<OrderTrackingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
      
      <MobileNavigation 
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'home') navigate('/');
          else if (tab === 'browse') navigate('/browse');
          else if (tab === 'cart') navigate('/cart');
          else if (tab === 'orders') navigate('/orders');
          else if (tab === 'profile') navigate('/profile');
        }}
      />
    </div>
  );
};

// Helper functions
const getPageTitle = (tab: string, role: string) => {
  const titles: Record<string, string> = {
    'home': 'GrubStack',
    'browse': 'Browse Restaurants',
    'restaurants': 'Restaurant',
    'cart': 'Your Cart',
    'orders': 'Your Orders',
    'profile': 'Profile',
    'dashboard': role === 'restaurant' ? 'Restaurant Dashboard' : 'Admin Dashboard',
    'menu': 'Manage Menu',
    'available': 'Available Orders',
    'active': 'Active Deliveries',
    'history': 'Delivery History',
    'users': 'Manage Users'
  };
  return titles[tab] || 'GrubStack';
};

const ComingSoonPage = () => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
      <p className="text-muted-foreground">This page is under development</p>
    </div>
  </div>
);

export default Index;
