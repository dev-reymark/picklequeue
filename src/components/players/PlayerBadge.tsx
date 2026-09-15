import React from 'react';
import { SkillLevel, SKILL_CONFIG } from '@/types';
import { Badge } from '@/components/ui';

interface PlayerBadgeProps {
  skillLevel: SkillLevel;
  compact?: boolean;
  showDotOnly?: boolean;
}

export const PlayerBadge: React.FC<PlayerBadgeProps> = ({
  skillLevel,
  compact = false,
  showDotOnly = false,
}) => {
  const config = SKILL_CONFIG[skillLevel] || SKILL_CONFIG.beginner;

  if (showDotOnly) {
    return (
      <span
        title={config.label}
        className={`inline-block w-2.5 h-2.5 rounded-full ${config.colorDot}`}
      />
    );
  }

  // Map skill levels to Badge variant
  const badgeVariants: Record<SkillLevel, 'emerald' | 'sky' | 'purple' | 'amber'> = {
    beginner: 'emerald',
    'low-intermediate': 'sky',
    'high-intermediate': 'purple',
    advanced: 'amber',
  };

  return (
    <Badge
      variant={badgeVariants[skillLevel] || 'neutral'}
      size="sm"
      dot
      dotColor={config.colorDot}
    >
      <span>{compact ? config.shortLabel : config.label}</span>
    </Badge>
  );
};
