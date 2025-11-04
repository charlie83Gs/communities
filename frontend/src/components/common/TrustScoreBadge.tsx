import { Component, Show } from 'solid-js';
import { Badge } from './Badge';
import { formatTrustScore, getTrustLevel } from '@/utils/trustLevels';
import type { TrustLevel } from '@/types/community.types';

export interface TrustScoreBadgeProps {
  score: number;
  trustLevels?: TrustLevel[];
  showLevelName?: boolean;
}

/**
 * Component to display a trust score with optional level name and color coding
 * Example: "15 (Stable)" with appropriate badge color
 */
export const TrustScoreBadge: Component<TrustScoreBadgeProps> = (props) => {
  const showLevelName = () => props.showLevelName !== false; // Default to true

  const trustLevel = () => {
    if (!props.trustLevels || props.trustLevels.length === 0) return undefined;
    const sorted = [...props.trustLevels].sort((a, b) => a.threshold - b.threshold);
    return getTrustLevel(props.score, sorted);
  };

  // Determine badge variant based on level index - using forest/leaf greens for trust
  const badgeVariant = () => {
    if (!trustLevel()) return 'secondary';

    const level = trustLevel()!;
    const allLevels = [...(props.trustLevels || [])].sort((a, b) => a.threshold - b.threshold);
    const levelIndex = allLevels.findIndex(l => l.id === level.id);

    // Map level indices to badge colors - trust uses nature greens
    if (levelIndex === 0) return 'warning'; // Lowest level
    if (levelIndex === allLevels.length - 1) return 'success'; // Highest level (forest green)
    return 'success'; // Middle levels also use success/green for trust theme
  };

  const displayText = () => {
    if (!showLevelName() || !props.trustLevels || props.trustLevels.length === 0) {
      return String(props.score);
    }

    const sorted = [...props.trustLevels].sort((a, b) => a.threshold - b.threshold);
    return formatTrustScore(props.score, sorted);
  };

  return (
    <Badge variant={badgeVariant()}>
      {displayText()}
    </Badge>
  );
};
