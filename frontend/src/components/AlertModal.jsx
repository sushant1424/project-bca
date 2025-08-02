import React from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, type = 'info', title, message, showConfirm = false, onConfirm }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          button: 'bg-yellow-600 hover:bg-yellow-700'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-start pl-8">
      {/* Backdrop with lighter opacity to show background */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      
      {/* Modal content - positioned on left side */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all border-4 border-red-600">
        {/* Header */}
        <div className={`flex items-center p-4 rounded-t-lg ${colors.bg} ${colors.border} border-b`}>
          <div className="flex items-center flex-1">
            {getIcon()}
            <h3 className="ml-3 text-lg font-semibold text-gray-900">
              {title || 'Alert'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50 rounded-b-lg">
          {showConfirm && (
            <button
              onClick={() => {
                onConfirm && onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-md font-medium transition-colors ${colors.button}`}
            >
              Confirm
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-400 transition-colors"
          >
            {showConfirm ? 'Cancel' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
