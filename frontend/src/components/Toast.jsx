import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast as ToastPrimitive, ToastClose, ToastDescription } from './ui/toast';

const ToastComponent = ({ message, type = 'info', isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getVariant = () => {
    return type === 'error' ? 'destructive' : 'default';
  };

  if (!isVisible) return null;

  return (
    <ToastPrimitive variant={getVariant()}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <ToastDescription>{message}</ToastDescription>
      </div>
      <ToastClose onClick={onClose} />
    </ToastPrimitive>
  );
};

export default ToastComponent;
