import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}

interface AdminContextType {
  admin: Admin | null;
  login: (adminData: Admin) => void;
  logout: () => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing admin session
    const adminData = localStorage.getItem('grub-stack-admin');
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('grub-stack-admin');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (adminData: Admin) => {
    setAdmin(adminData);
    localStorage.setItem('grub-stack-admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('grub-stack-admin');
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};
