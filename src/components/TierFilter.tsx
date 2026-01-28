'use client';

import { PriorityTier } from '@/types';

interface TierFilterProps {
  activeTiers: Set<PriorityTier>;
  onToggleTier: (tier: PriorityTier) => void;
  tierCounts: Record<PriorityTier, number>;
}

const TIERS: { key: PriorityTier; label: string; color: string; activeColor: string }[] = [
  {
    key: 'high',
    label: '🔴 High Priority',
    color: 'bg-white border-red-200 text-red-700 hover:bg-red-50',
    activeColor: 'bg-red-100 border-red-400 text-red-800 ring-2 ring-red-200',
  },
  {
    key: 'medium',
    label: '🟡 Medium',
    color: 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50',
    activeColor: 'bg-amber-100 border-amber-400 text-amber-800 ring-2 ring-amber-200',
  },
  {
    key: 'low',
    label: '🟢 Low',
    color: 'bg-white border-green-200 text-green-700 hover:bg-green-50',
    activeColor: 'bg-green-100 border-green-400 text-green-800 ring-2 ring-green-200',
  },
];

export default function TierFilter({
  activeTiers,
  onToggleTier,
  tierCounts,
}: TierFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 mr-2">Priority:</span>
      {TIERS.map((tier) => {
        const isActive = activeTiers.has(tier.key);
        const count = tierCounts[tier.key] || 0;

        return (
          <button
            key={tier.key}
            onClick={() => onToggleTier(tier.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-1.5 ${
              isActive ? tier.activeColor : tier.color
            }`}
          >
            <span>{tier.label}</span>
            <span className="text-xs opacity-75">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
