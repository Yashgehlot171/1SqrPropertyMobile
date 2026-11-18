import {create} from 'zustand';
import type {PaymentPreference, PropertyRequirement} from '@/services/propertyRequirementApi';

export interface RequirementDraft {
  id?: string;
  stateId?: number;
  cityId?: number;
  localityIds: number[];
  propertyTypeId?: number;
  nearbyLocalityAllowed: boolean;
  budgetMin?: string;
  budgetMax?: string;
  areaMin?: string;
  areaMax?: string;
  areaUnit?: string;
  purchaseTimeline?: string;
  targetPurchaseDate?: string;
  paymentPreference?: PaymentPreference;
  occupation?: string;
  loanRequirement?: string;
  loanStatus?: string;
  preferences: Record<string, unknown>;
  additionalRequirement?: string;
  consentAccepted: boolean;
  status?: string;
}

export const emptyRequirement = (): RequirementDraft => ({
  localityIds: [],
  nearbyLocalityAllowed: false,
  preferences: {},
  consentAccepted: false,
});

const loan = (value?: PaymentPreference) => value === 'HOME_LOAN' || value === 'PART_LOAN';

interface State {
  draft: RequirementDraft;
  set: (patch: Partial<RequirementDraft>) => void;
  setState: (stateId?: number) => void;
  setCity: (cityId?: number) => void;
  setPayment: (paymentPreference?: PaymentPreference) => void;
  hydrate: (item: PropertyRequirement) => void;
  reset: () => void;
  payload: () => Record<string, unknown>;
}

export const usePropertyRequirementStore = create<State>((set, get) => ({
  draft: emptyRequirement(),
  set: patch => set(state => ({draft: {...state.draft, ...patch}})),
  setState: stateId => set(state => ({draft: {...state.draft, stateId, cityId: undefined, localityIds: []}})),
  setCity: cityId => set(state => ({draft: {...state.draft, cityId, localityIds: []}})),
  setPayment: paymentPreference => set(state => ({
    draft: {
      ...state.draft,
      paymentPreference,
      ...(!loan(paymentPreference) ? {occupation: undefined, loanRequirement: undefined, loanStatus: undefined} : {}),
    },
  })),
  hydrate: item => set({draft: {
    id: item.id,
    stateId: item.state?.id,
    cityId: item.city?.id,
    localityIds: item.localities.map(locality => locality.id),
    propertyTypeId: item.propertyType?.id,
    nearbyLocalityAllowed: item.nearbyLocalityAllowed,
    budgetMin: item.budgetMin ?? undefined,
    budgetMax: item.budgetMax ?? undefined,
    areaMin: item.areaMin ?? undefined,
    areaMax: item.areaMax ?? undefined,
    areaUnit: item.areaUnit ?? undefined,
    purchaseTimeline: item.purchaseTimeline ?? undefined,
    targetPurchaseDate: item.targetPurchaseDate ?? undefined,
    paymentPreference: item.paymentPreference ?? undefined,
    occupation: item.occupation ?? undefined,
    loanRequirement: item.loanRequirement ?? undefined,
    loanStatus: item.loanStatus ?? undefined,
    preferences: item.preferences ?? {},
    additionalRequirement: item.additionalRequirement ?? undefined,
    consentAccepted: item.consentAccepted,
    status: item.status,
  }}),
  reset: () => set({draft: emptyRequirement()}),
  // Only send fields accepted by the requirement API; local identity/status are not input fields.
  payload: () => {
    const draft = get().draft;
    return {
      stateId: draft.stateId,
      cityId: draft.cityId,
      localityIds: draft.localityIds,
      propertyTypeId: draft.propertyTypeId,
      nearbyLocalityAllowed: draft.nearbyLocalityAllowed,
      budgetMin: draft.budgetMin,
      budgetMax: draft.budgetMax,
      areaMin: draft.areaMin,
      areaMax: draft.areaMax,
      areaUnit: draft.areaUnit,
      purchaseTimeline: draft.purchaseTimeline,
      targetPurchaseDate: draft.targetPurchaseDate,
      paymentPreference: draft.paymentPreference,
      occupation: draft.occupation,
      loanRequirement: draft.loanRequirement,
      loanStatus: draft.loanStatus,
      preferences: draft.preferences,
      additionalRequirement: draft.additionalRequirement,
      consentAccepted: draft.consentAccepted,
    };
  },
}));
