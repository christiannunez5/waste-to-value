import type { WasteType } from '@/types/recycling';

export const MATERIAL_MULTIPLIERS: Record<WasteType, number> = {
  Sachet: 2,
  'Plastic Bottle': 3,
  Aluminum: 4,
  'Mixed Waste': 1,
};

export const WASTE_TYPES = Object.keys(MATERIAL_MULTIPLIERS) as WasteType[];

export function calculatePoints(weightGrams: number, wasteType: WasteType) {
  if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
    return 0;
  }

  return Math.round(weightGrams * MATERIAL_MULTIPLIERS[wasteType]);
}

export function getEcoBadge(points: number) {
  if (points >= 5000) return 'Eco Champion';
  if (points >= 2000) return 'Recycling Hero';
  if (points >= 750) return 'Green Builder';
  if (points >= 250) return 'Waste Warrior';
  return 'Eco Starter';
}

export function formatWeight(grams: number) {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`;
  }

  return `${Math.round(grams)} g`;
}

export function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function getStartOfWeek(date = new Date()) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result.toISOString();
}

export function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}
