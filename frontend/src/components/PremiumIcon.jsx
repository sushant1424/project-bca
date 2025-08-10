import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';

const PremiumIcon = ({ variant = 'crown', size = 'sm', className = '' }) => {
  const variants = {
    crown: Crown,
    star: Star,
    zap: Zap
  };

  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const IconComponent = variants[variant] || Crown;
  const sizeClass = sizes[size] || sizes.sm;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className="relative">
        <IconComponent 
          className={`${sizeClass} text-yellow-500 drop-shadow-sm`}
          fill="currentColor"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20 rounded-full blur-sm"></div>
      </div>
    </div>
  );
};

export default PremiumIcon;
