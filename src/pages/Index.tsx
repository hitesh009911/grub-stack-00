import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import HomePage from './customer/HomePage';
import CartPage from './customer/CartPage';
import Header from '@/components/layout/Header';
import MobileNavigation from '@/components/layout/MobileNavigation';

const Index = () => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('home');

  // If user is not authenticated, show auth pages
  if (!user) {
    return authMode === 'login' ? (
      <LoginPage 
        onToggleMode={() => setAuthMode('register')}
        onLoginSuccess={() => {/* handled by context */}}
      />
    ) : (
      <RegisterPage 
        onToggleMode={() => setAuthMode('login')}
        onRegisterSuccess={() => {/* handled by context */}}
      />
    );
  }

  // Main application layout for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <Header 
        title={getPageTitle(activeTab, user.role)}
        showMenuButton={true}
      />
      
      <main className="pt-16">
        {renderCurrentPage(activeTab, user.role)}
      </main>
      
      <MobileNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};

// Helper functions
const getPageTitle = (tab: string, role: string) => {
  const titles: Record<string, string> = {
    'home': 'GrubStack',
    'restaurants': 'Browse Restaurants',
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

const renderCurrentPage = (tab: string, role: string) => {
  switch (tab) {
    case 'home':
    case 'restaurants':
      return <HomePage />;
    case 'cart':
      return <CartPage />;
    default:
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground">This page is under development</p>
          </div>
        </div>
      );
  }
};

export default Index;
