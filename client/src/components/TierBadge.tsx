/**
 * TIER BADGE COMPONENT
 * 
 * Displays user's current subscription tier with color-coding
 * and visual indicators
 */

import React from 'react';
import { Crown, Zap, Rocket, Building2 } from 'lucide-react';

interface TierBadgeProps {
  tier: string;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const TierBadge: React.FC<TierBadgeProps> = ({ 
  tier, 
  displayName, 
  size = 'md',
  showIcon = true 
}) => {
  // Tier configurations
  const tierConfig = {
    free: {
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: null,
      gradient: false
    },
    starter: {
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: <Zap className="w-4 h-4" />,
      gradient: false
    },
    pro: {
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      icon: <Crown className="w-4 h-4" />,
      gradient: true,
      popular: true
    },
    business: {
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      icon: <Building2 className="w-4 h-4" />,
      gradient: true
    }
  };

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.free;

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className="inline-flex items-center">
      <div
        className={`
          inline-flex items-center space-x-1.5 rounded-full font-semibold
          ${config.gradient ? '' : 'border'}
          ${config.color}
          ${sizeClasses[size]}
        `}
      >
        {showIcon && config.icon && (
          <span>{config.icon}</span>
        )}
        <span>{displayName}</span>
        {config.popular && (
          <span className="text-xs">⭐</span>
        )}
      </div>
    </div>
  );
};

export default TierBadge;
