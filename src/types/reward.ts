import type { RewardName } from '@/types/recycling';

export type Reward = {
  id: number;
  name: RewardName;
  pointsRequired: number;
};
