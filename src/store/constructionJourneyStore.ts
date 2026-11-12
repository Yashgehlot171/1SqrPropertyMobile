import { create } from 'zustand';

export type BalconyType = 'FRONT' | 'SIDE';

export interface BalconyRequirement {
  type: BalconyType;
  enabled: boolean;
  lengthFt: number;
  projectionFt: number;
}

export interface AdditionalSpaceRequirement {
  id: string;
  name: string;
  quantity: number;
}

export interface FloorRequirement {
  id: string;
  name: string;
  bedrooms: number;
  halls: number;
  kitchens: number;
  bathrooms: number;
  parking: number;
  additionalSpaces: AdditionalSpaceRequirement[];
  balconies: BalconyRequirement[];
}

export interface SelectedConstructionBuilder {
  id: string;
  name: string;
  serviceType: string;
  experienceYears?: number | null;
  isVerified: boolean;
  minPrice?: number | null;
}

function floorName(index: number): string {
  if (index === 0) return 'Ground Floor';
  if (index === 1) return 'First Floor';
  if (index === 2) return 'Second Floor';
  if (index === 3) return 'Third Floor';
  return `Floor ${index + 1}`;
}

export function createFloorRequirement(index: number): FloorRequirement {
  return {
    id: `floor-${index}`,
    name: floorName(index),
    bedrooms: 0,
    halls: 0,
    kitchens: 0,
    bathrooms: 0,
    parking: 0,
    additionalSpaces: [],
    balconies: [
      {type: 'FRONT', enabled: false, lengthFt: 0, projectionFt: 2.5},
      {type: 'SIDE', enabled: false, lengthFt: 0, projectionFt: 2.5},
    ],
  };
}

interface ConstructionJourneyState {
  planId: string;
  tier: 'Silver' | 'Gold' | 'Premium';
  areaSqFt: number;
  plotAreaSqFt?: number;
  floors: number;
  location: string;
  hasPlot: boolean;
  plotLengthFt: number;
  plotWidthFt: number;
  facing: string;
  isCornerPlot: boolean;
  locationState: string;
  locationStateId?: number;
  locationCity: string;
  locationCityId?: number;
  locationArea: string;
  locationAreaId?: number;
  locationAddress: string;
  locationLandmark: string;
  floorCount: number;
  floorRequirements: FloorRequirement[];
  selectedBuilders: SelectedConstructionBuilder[];
  buildType: string;
  bedrooms: number;
  builtUpPreference: 'Standard' | 'Premium' | 'Luxury';
  quality: 'Standard' | 'Premium' | 'Luxury';
  additionalPreferences: string[];
  notes: string;
  upgrades: string[];
  requestId: string | null;
  draftRequestId: string | null;
  hasRequirementDraft: boolean;
  selectPlan: (planId: string) => void;
  selectTier: (tier: ConstructionJourneyState['tier']) => void;
  setArea: (areaSqFt: number) => void;
  setRequirements: (details: {
    areaSqFt?: number;
    plotAreaSqFt?: number;
    floors: number;
    location: string;
  }) => void;
  setPropertyDetails: (details: {
    hasPlot: boolean;
    plotLengthFt: number;
    plotWidthFt: number;
    facing: string;
    isCornerPlot: boolean;
    location: string;
  }) => void;
  setPlotLocation: (details: {
    state: string;
    stateId?: number;
    city: string;
    cityId?: number;
    area: string;
    areaId?: number;
    address: string;
    landmark: string;
  }) => void;
  setFloorCount: (floorCount: number) => void;
  updateFloorRequirement: (floorId: string, updates: Partial<FloorRequirement>) => void;
  setRequirementDraft: () => void;
  clearRequirementDraft: () => void;
  setSelectedBuilders: (builders: SelectedConstructionBuilder[]) => void;
  setHomeRequirements: (details: {
    buildType: string;
    floors: number;
    bedrooms: number;
    builtUpPreference: 'Standard' | 'Premium' | 'Luxury';
  }) => void;
  setPreferences: (details: {
    quality: 'Standard' | 'Premium' | 'Luxury';
    additionalPreferences: string[];
    notes: string;
  }) => void;
  toggleUpgrade: (id: string) => void;
  requestQuote: (id: string) => void;
  selectRequest: (id: string) => void;
}

export const useConstructionJourneyStore = create<ConstructionJourneyState>(
  set => ({
    planId: 'plan-abc-gold',
    tier: 'Gold',
    areaSqFt: 2000,
    floors: 1,
    location: '',
    hasPlot: true,
    plotLengthFt: 20,
    plotWidthFt: 50,
    facing: 'East',
    isCornerPlot: false,
    locationState: '',
    locationStateId: undefined,
    locationCity: '',
    locationCityId: undefined,
    locationArea: '',
    locationAreaId: undefined,
    locationAddress: '',
    locationLandmark: '',
    floorCount: 1,
    floorRequirements: [createFloorRequirement(0)],
    selectedBuilders: [],
    buildType: 'Independent House',
    bedrooms: 3,
    builtUpPreference: 'Premium',
    quality: 'Premium',
    additionalPreferences: [],
    notes: '',
    upgrades: [],
    requestId: null,
    draftRequestId: null,
    hasRequirementDraft: false,
    selectPlan: planId =>
      set({ planId, upgrades: [], requestId: null, draftRequestId: null }),
    selectTier: tier =>
      set({ tier, upgrades: [], requestId: null, draftRequestId: null }),
    setArea: areaSqFt => set({ areaSqFt }),
    setRequirements: details =>
      set(state => ({
        areaSqFt: details.areaSqFt ?? state.areaSqFt,
        plotAreaSqFt: details.plotAreaSqFt,
        floors: details.floors,
        location: details.location,
      })),
    setPropertyDetails: details => set({...details, hasRequirementDraft: true}),
    setPlotLocation: details => set({...details, hasRequirementDraft: true}),
    setFloorCount: floorCount => set(state => {
      const normalizedCount = Math.max(1, Math.min(10, floorCount));
      const floors = Array.from({length: normalizedCount}, (_, index) =>
        state.floorRequirements[index] ?? createFloorRequirement(index),
      );
      return {floorCount: normalizedCount, floors: normalizedCount, floorRequirements: floors, hasRequirementDraft: true};
    }),
    updateFloorRequirement: (floorId, updates) => set(state => ({
      floorRequirements: state.floorRequirements.map(floor =>
        floor.id === floorId ? {...floor, ...updates} : floor,
      ),
      hasRequirementDraft: true,
    })),
    setRequirementDraft: () => set({hasRequirementDraft: true}),
    clearRequirementDraft: () => set({hasRequirementDraft: false}),
    setSelectedBuilders: selectedBuilders => set({selectedBuilders}),
    setHomeRequirements: details => set(details),
    setPreferences: details => set(details),
    toggleUpgrade: id =>
      set(state => ({
        upgrades: state.upgrades.includes(id)
          ? state.upgrades.filter(item => item !== id)
          : [...state.upgrades, id],
      })),
    requestQuote: requestId => set({ requestId, draftRequestId: requestId }),
    selectRequest: requestId => set({ requestId }),
  }),
);
