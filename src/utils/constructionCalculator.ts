import type {
  ConstructionQuality,
  ConstructionQuote,
} from '@/types';

const COST_MAP: Record<ConstructionQuality, number> = {
  Basic: 1400,
  Standard: 1700,
  Premium: 2200,
  Luxury: 3000,
  'Ultra Luxury': 3800,
};

export function calculateConstructionQuote(params: {
  plotSizeSqFt: number;
  builtUpAreaSqFt: number;
  floors: number;
  quality: ConstructionQuality;
  costPerSqFt?: number;
}): Omit<ConstructionQuote, 'id' | 'createdAt'> {
  const {plotSizeSqFt, builtUpAreaSqFt, floors, quality, costPerSqFt} = params;
  const totalArea = builtUpAreaSqFt * floors;
  const totalCost = totalArea * (costPerSqFt ?? COST_MAP[quality]);
  const materialCost = totalCost * 0.65;
  const labourCost = totalCost * 0.35;
  const estimatedTimelineMonths = Math.max(6, floors * 4);

  return {
    plotSizeSqFt,
    builtUpAreaSqFt,
    floors,
    quality,
    materialCost,
    labourCost,
    totalCost,
    estimatedTimelineMonths,
  };
}
