import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import PremiumIcon from './PremiumIcon';

const PremiumPaywall = ({ 
  previewText = "This is premium content. Subscribe to read the full article.",
  onUpgrade = () => {},
  className = ""
}) => {
  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-dashed border-purple-300 rounded-lg p-6 text-center ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <PremiumIcon variant="crown" size="md" />
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Premium Content
      </h3>
      
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {previewText}
      </p>
      
      <div className="space-y-3">
        <Button 
          onClick={onUpgrade}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center space-x-2"
        >
          <Crown className="w-4 h-4" />
          <span>Upgrade to Premium</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
        
        <div className="text-xs text-gray-500">
          Get unlimited access to all premium content
        </div>
      </div>
    </div>
  );
};

export default PremiumPaywall;
