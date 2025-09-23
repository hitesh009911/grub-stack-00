import { useNotifications } from '@/contexts/NotificationContext';

// This service provides helper functions to trigger notifications
// Note: This should be used within React components that have access to the NotificationContext

export const createSampleNotifications = (addNotification: any) => {
  // Add some sample notifications for demo
  addNotification({
    title: 'Welcome to GrubStack!',
    message: 'Your account has been created successfully. Start exploring restaurants near you.',
    type: 'success',
    actionUrl: '/'
  });

  addNotification({
    title: 'New Order Received',
    message: 'You have a new order #1234 from John Doe. Total: ₹450',
    type: 'info',
    actionUrl: '/restaurant/orders'
  });

  addNotification({
    title: 'Order Status Update',
    message: 'Your order #1234 is out for delivery. Expected arrival: 25 minutes',
    type: 'info',
    actionUrl: '/orders'
  });

  addNotification({
    title: 'Restaurant Application Approved',
    message: 'Congratulations! Your restaurant "Bella Vista" has been approved and is now live.',
    type: 'success',
    actionUrl: '/restaurant/dashboard'
  });

  addNotification({
    title: 'Payment Failed',
    message: 'Your payment for order #1234 could not be processed. Please try again.',
    type: 'error',
    actionUrl: '/payment'
  });

  addNotification({
    title: 'Maintenance Scheduled',
    message: 'System maintenance is scheduled for tonight 2:00 AM - 4:00 AM. Some features may be unavailable.',
    type: 'warning'
  });
};

export const triggerOrderNotification = (addNotification: any, orderData: any) => {
  addNotification({
    title: 'New Order Received',
    message: `Order #${orderData.id} from ${orderData.customerName}. Total: ₹${orderData.total}`,
    type: 'info',
    actionUrl: '/restaurant/orders'
  });
};

export const triggerOrderStatusNotification = (addNotification: any, orderId: string, status: string) => {
  addNotification({
    title: 'Order Status Update',
    message: `Your order #${orderId} status has been updated to: ${status}`,
    type: 'info',
    actionUrl: '/orders'
  });
};

export const triggerRestaurantApprovalNotification = (addNotification: any, restaurantName: string, approved: boolean) => {
  addNotification({
    title: approved ? 'Restaurant Application Approved' : 'Restaurant Application Rejected',
    message: approved 
      ? `Congratulations! Your restaurant "${restaurantName}" has been approved and is now live.`
      : `Your restaurant application for "${restaurantName}" has been rejected. Please review the feedback and reapply.`,
    type: approved ? 'success' : 'error',
    actionUrl: approved ? '/restaurant/dashboard' : '/restaurant/register'
  });
};

export const triggerPaymentNotification = (addNotification: any, orderId: string, success: boolean) => {
  addNotification({
    title: success ? 'Payment Successful' : 'Payment Failed',
    message: success 
      ? `Payment for order #${orderId} has been processed successfully.`
      : `Payment for order #${orderId} could not be processed. Please try again.`,
    type: success ? 'success' : 'error',
    actionUrl: success ? '/orders' : '/payment'
  });
};
