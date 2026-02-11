'use client';

import { trpc } from '@/lib/trpc/client';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { UpgradeModal } from './UpgradeModal';

interface UsageIndicatorProps {
  resource: 'locations' | 'users' | 'inspections';
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export function UsageIndicator({ resource, showUpgradeButton = true, compact = false }: UsageIndicatorProps) {
  const { data, isLoading } = trpc.subscription.checkLimit.useQuery({ resource });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }

  const { currentCount, limit, planName, utilizationPercent, isNearLimit, isAtLimit } = data;

  const getColor = () => {
    if (isAtLimit) return 'red';
    if (isNearLimit) return 'yellow';
    return 'blue';
  };

  const color = getColor();

  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      bar: 'bg-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      bar: 'bg-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      bar: 'bg-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const classes = colorClasses[color];

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${classes.bar}`}
              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            {currentCount} / {limit === -1 ? '∞' : limit}
          </span>
        </div>
        <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      </>
    );
  }

  return (
    <>
      <div className={`p-4 rounded-xl border ${classes.bg} ${classes.border}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 capitalize">
              {resource === 'inspections' ? 'Inspections (This Month)' : resource}
            </span>
            {isAtLimit && <AlertCircle className="w-4 h-4 text-red-600" />}
          </div>
          {showUpgradeButton && (isAtLimit || isNearLimit) && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className={`text-xs text-white px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${classes.button}`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Upgrade</span>
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${classes.bar}`}
                style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
              {utilizationPercent}%
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>
              {currentCount} / {limit === -1 ? '∞' : limit} used
            </span>
            <span className="text-gray-500">{planName} Plan</span>
          </div>
        </div>

        {/* Warning Message */}
        {isAtLimit && (
          <div className={`text-xs ${classes.text} font-medium`}>
            ⚠️ You&apos;ve reached your {planName} plan limit. Upgrade to continue.
          </div>
        )}
        {isNearLimit && !isAtLimit && (
          <div className={`text-xs ${classes.text}`}>
            💡 You&apos;re nearing your limit. Consider upgrading soon.
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </>
  );
}
