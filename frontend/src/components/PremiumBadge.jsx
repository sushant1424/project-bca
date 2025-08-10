import React from 'react';
import PremiumIcon from './PremiumIcon';

const PremiumBadge = ({ variant = 'crown', size = 'sm', showText = true, className = '' }) => {
  return (
    <div className={`inline-flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-full ${className}`}>
      <PremiumIcon variant={variant} size={size} />
      {showText && (
        <span className="text-xs font-medium text-yellow-800">Premium</span>
      )}
    </div>
  );
};

export default PremiumBadge;
