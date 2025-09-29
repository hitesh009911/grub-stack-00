import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, userApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'restaurant' | 'delivery' | 'admin';
  phone?: string;
  avatar?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'restaurant' | 'delivery';
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored auth token on app load
    const storedUser = localStorage.getItem('grub-stack-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await userApi.post('/auth/login', { email, password });
      const roles: string[] = Array.isArray(data.roles) ? data.roles : [];
      const primaryRole = (roles[0] || 'CUSTOMER').toLowerCase();
      const mappedRole: User['role'] =
        primaryRole.includes('owner') ? 'restaurant' :
        primaryRole.includes('delivery') ? 'delivery' :
        primaryRole.includes('admin') ? 'admin' : 'customer';

      const loggedIn: User = {
        id: String(data.id ?? ''),
        email: data.email,
        name: data.fullName ?? data.email?.split('@')[0] ?? '',
        role: mappedRole,
      };

      setUser(loggedIn);
      localStorage.setItem('grub-stack-user', JSON.stringify(loggedIn));
    } catch (error: unknown) {
      if (
        typeof error === 'object' && error !== null &&
        'response' in error &&
        typeof (error as any).response === 'object' &&
        (error as any).response !== null
      ) {
        const response = (error as any).response;
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.data?.error) {
          throw new Error(response.data.error);
        }
      }
      throw new Error('Login failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const backendRole =
        userData.role === 'restaurant' ? 'OWNER' :
        userData.role === 'delivery' ? 'DELIVERY' : 'CUSTOMER';
      const { data } = await userApi.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        fullName: userData.name,
        roles: [backendRole],
        address: userData.address,
      });

      const roles: string[] = Array.isArray(data.roles) ? data.roles : [];
      const primaryRole = (roles[0] || 'CUSTOMER').toLowerCase();
      const mappedRole: User['role'] =
        primaryRole.includes('owner') ? 'restaurant' :
        primaryRole.includes('delivery') ? 'delivery' :
        primaryRole.includes('admin') ? 'admin' : 'customer';

      const newUser: User = {
        id: String(data.id ?? ''),
        email: data.email,
        name: data.fullName ?? userData.name,
        role: mappedRole,
        phone: userData.phone,
        address: userData.address,
      };

      setUser(newUser);
      localStorage.setItem('grub-stack-user', JSON.stringify(newUser));
    } catch (error: unknown) {
      if (
        typeof error === 'object' && error !== null &&
        'response' in error &&
        typeof (error as any).response === 'object' &&
        (error as any).response !== null
      ) {
        const response = (error as any).response;
        if (response.status === 409) {
          throw new Error('Email already exists. Please use a different email.');
        } else if (response.status === 400) {
          throw new Error('Invalid registration data. Please check your inputs.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else if (response.data?.error) {
          throw new Error(response.data.error);
        }
      }
      throw new Error('Registration failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('grub-stack-user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('grub-stack-user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};