import { useState } from 'react';

interface NotificationState {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export function useNotification() {
    const [notification, setNotification] = useState<NotificationState | null>(null);
    
    const showSuccess = (message: string) => {
      setNotification({ type: 'success', message });
    };
    
    const showError = (message: string) => {
      setNotification({ type: 'error', message });
    };
    
    const showInfo = (message: string) => {
      setNotification({ type: 'info', message });
    };
    
    const showWarning = (message: string) => {
      setNotification({ type: 'warning', message });
    };
    
    const clearNotification = () => setNotification(null);
    
    return { 
      notification, 
      showSuccess, 
      showError, 
      showInfo, 
      showWarning, 
      clearNotification,
      setNotification // Keep for backward compatibility
    };
  }