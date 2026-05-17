import type { RewardName, WasteType } from '@/types/recycling';

export type UserRow = {
  id: number;
  username: string;
  points: number;
  total_weight: number;
  created_at: string;
};

export type TransactionRow = {
  id: number;
  user_id: number;
  waste_type: WasteType;
  weight_grams: number;
  points: number;
  created_at: string;
};

export type RewardRow = {
  id: number;
  name: RewardName;
  points_required: number;
};

export type RedemptionRow = {
  id: number;
  user_id: number;
  reward_id: number;
  reward_name: RewardName;
  points_spent: number;
  created_at: string;
};

export type LeaderboardRowRaw = {
  user_id: number;
  username: string;
  total_points: number | null;
  total_weight: number | null;
};
