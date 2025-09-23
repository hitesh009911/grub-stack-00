import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { createSampleNotifications } from '@/services/notificationService';

const NotificationInitializer: React.FC = () => {
  const { addNotification, notifications } = useNotifications();

  useEffect(() => {
    // Only add sample notifications if there are no existing notifications
    if (notifications.length === 0) {
      // Add a small delay to ensure the context is fully initialized
      const timer = setTimeout(() => {
        createSampleNotifications(addNotification);
      }, 2000); // Increased delay to ensure proper initialization

      return () => clearTimeout(timer);
    }
  }, [addNotification, notifications.length]);

  return null; // This component doesn't render anything
};

export default NotificationInitializer;
