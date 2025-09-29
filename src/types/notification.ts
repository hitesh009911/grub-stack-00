export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning';
  actionUrl?: string;
  read?: boolean;
  timestamp?: Date | string;
}
