'use client'

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export default function Notification({ 
  type, 
  message, 
  onClose, 
  autoHide = true, 
  autoHideDelay = 3000 
}: NotificationProps) {
  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
      type === 'success' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:bg-black/10 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
