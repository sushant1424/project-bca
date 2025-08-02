import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
  // Auto-close toast after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  // Get icon and colors based on toast type
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default: // info
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div className={`fixed top-20 right-4 max-w-sm w-full rounded-lg shadow-xl transform transition-all duration-300 ease-in-out z-[10000] p-4 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      type === 'success' ? 'bg-green-500 border-2 border-green-600' :
      type === 'error' ? 'bg-red-500 border-2 border-red-600' :
      type === 'warning' ? 'bg-yellow-500 border-2 border-yellow-600' :
      'bg-blue-500 border-2 border-blue-600'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-white">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              type === 'success' ? 'text-green-600 hover:bg-green-100 focus:ring-green-600' :
              type === 'error' ? 'text-red-600 hover:bg-red-100 focus:ring-red-600' :
              type === 'warning' ? 'text-red-600 hover:bg-red-100 focus:ring-red-600' :
              'text-blue-600 hover:bg-blue-100 focus:ring-blue-600'
            }`}
          >
            <span className="sr-only">Close</span>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
