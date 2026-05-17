import type { WasteType } from '@/types/recycling';

export type RecyclingTransaction = {
  id: number;
  userId: number;
  wasteType: WasteType;
  weightGrams: number;
  points: number;
  createdAt: string;
};
