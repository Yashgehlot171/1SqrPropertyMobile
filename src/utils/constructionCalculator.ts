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

export function calculateCornerPlotArea(params: {
  lengthFt: number;
  widthFt: number;
  isCornerPlot: boolean;
}) {
  const plotAreaSqFt = params.lengthFt * params.widthFt;
  const cornerAdditionSqFt = params.isCornerPlot
    ? 2.5 * (params.lengthFt + params.widthFt)
    : 0;
  return {
    plotAreaSqFt,
    cornerAdditionSqFt,
    totalConstructionAreaSqFt: plotAreaSqFt + cornerAdditionSqFt,
  };
}

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
