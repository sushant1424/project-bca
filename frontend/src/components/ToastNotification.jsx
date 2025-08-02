import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const ToastNotification = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      setIsLeaving(false);
      
      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!toast || !isVisible) return null;

  const getToastConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-500',
          borderColor: 'border-green-500',
          textColor: 'text-green-800',
          bgLight: 'bg-green-50'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-500',
          borderColor: 'border-red-500',
          textColor: 'text-red-800',
          bgLight: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-yellow-500',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-800',
          bgLight: 'bg-yellow-50'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-500',
          textColor: 'text-blue-800',
          bgLight: 'bg-blue-50'
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div 
        className={`
          pointer-events-auto transform transition-all duration-300 ease-in-out
          ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        `}
      >
        <div className={`
          flex items-start p-4 rounded-xl shadow-2xl border-l-4 ${config.borderColor} 
          bg-white backdrop-blur-sm max-w-sm min-w-[300px]
          hover:shadow-3xl transition-shadow duration-200
        `}>
          {/* Icon */}
          <div className={`flex-shrink-0 w-6 h-6 ${config.bgColor} rounded-full flex items-center justify-center mr-3`}>
            <IconComponent className="w-4 h-4 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {toast.title}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleClose}
                className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.bgColor} rounded-full animate-[shrink_4s_linear_forwards]`}
            style={{
              animation: 'shrink 4s linear forwards'
            }}
          />
        </div>
      </div>
      
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ top: `${16 + index * 80}px` }} className="absolute right-4">
          <ToastNotification
            toast={toast}
            onClose={() => onRemoveToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

export { ToastNotification, ToastContainer };
export default ToastNotification;
