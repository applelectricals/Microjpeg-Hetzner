/**
 * USAGE STATS COMPONENT
 * 
 * Displays user's current usage statistics with progress bars
 * and upgrade prompts when approaching limits
 */

import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface UsageStatsProps {
  operationsUsed: number;
  operationsLimit: number;
  apiCallsUsed?: number;
  apiCallsLimit?: number;
  periodEnd: string;
  tierName: string;
}

const UsageStats: React.FC<UsageStatsProps> = ({
  operationsUsed,
  operationsLimit,
  apiCallsUsed = 0,
  apiCallsLimit = 0,
  periodEnd,
  tierName
}) => {
  // Calculate percentages
  const opsPercentage = (operationsUsed / operationsLimit) * 100;
  const apiPercentage = apiCallsLimit > 0 ? (apiCallsUsed / apiCallsLimit) * 100 : 0;
  
  // Determine warning levels
  const getWarningLevel = (percentage: number) => {
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'normal';
  };

  const opsWarning = getWarningLevel(opsPercentage);
  const apiWarning = getWarningLevel(apiPercentage);

  // Progress bar colors
  const getProgressColor = (level: string) => {
    switch (level) {
      case 'danger': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  // Icon based on warning level
  const getWarningIcon = (level: string) => {
    switch (level) {
      case 'danger': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Days until reset
  const daysUntilReset = () => {
    const now = new Date();
    const reset = new Date(periodEnd);
    const diff = Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Usage Statistics</h3>
          <p className="text-sm text-gray-600">
            Current billing period • Resets {formatDate(periodEnd)} ({daysUntilReset()} days)
          </p>
        </div>
        <TrendingUp className="w-8 h-8 text-blue-500" />
      </div>

      {/* Operations Usage */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getWarningIcon(opsWarning)}
            <span className="font-semibold text-gray-900">Operations</span>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {operationsUsed.toLocaleString()} / {operationsLimit.toLocaleString()}
            <span className="text-gray-500 ml-2">({opsPercentage.toFixed(1)}%)</span>
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(opsWarning)}`}
            style={{ width: `${Math.min(opsPercentage, 100)}%` }}
          ></div>
        </div>

        {/* Warning Messages */}
        {opsWarning === 'danger' && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            ⚠️ You've used {opsPercentage.toFixed(0)}% of your monthly operations. Consider upgrading!
          </p>
        )}
        {opsWarning === 'warning' && (
          <p className="mt-2 text-sm text-yellow-600 font-medium">
            You're approaching your monthly limit. {operationsLimit - operationsUsed} operations remaining.
          </p>
        )}
      </div>

      {/* API Usage (if applicable) */}
      {apiCallsLimit > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {getWarningIcon(apiWarning)}
              <span className="font-semibold text-gray-900">API Calls</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {apiCallsUsed.toLocaleString()} / {apiCallsLimit.toLocaleString()}
              <span className="text-gray-500 ml-2">({apiPercentage.toFixed(1)}%)</span>
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(apiWarning)}`}
              style={{ width: `${Math.min(apiPercentage, 100)}%` }}
            ></div>
          </div>

          {apiWarning === 'danger' && (
            <p className="mt-2 text-sm text-red-600 font-medium">
              ⚠️ You've used {apiPercentage.toFixed(0)}% of your monthly API calls.
            </p>
          )}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {operationsLimit - operationsUsed >= 0 
              ? (operationsLimit - operationsUsed).toLocaleString()
              : 0
            }
          </p>
          <p className="text-xs text-gray-600">Operations Left</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{daysUntilReset()}</p>
          <p className="text-xs text-gray-600">Days Until Reset</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{tierName}</p>
          <p className="text-xs text-gray-600">Current Plan</p>
        </div>
      </div>

      {/* Upgrade CTA (if approaching limits) */}
      {opsWarning !== 'normal' && tierName !== 'Business' && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Need more operations?</h4>
              <p className="text-sm text-gray-600">
                Upgrade your plan to get higher limits and unlock premium features.
              </p>
            </div>
            <button className="ml-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition whitespace-nowrap">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageStats;
