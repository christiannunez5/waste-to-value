import type { RewardName } from '@/types/recycling';

export type Redemption = {
  id: number;
  userId: number;
  rewardId: number;
  rewardName: RewardName;
  pointsSpent: number;
  createdAt: string;
};
