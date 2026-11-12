/**
 * Types for the "Build Your Dream Home" construction-requirement flow
 * (Construction Entry -> Project Requirement -> Budget & Timeline ->
 * Matching Builders/Plans -> Package Comparison).
 *
 * NOTE: Deliberately NOT re-exported from `./index.ts`. `construction.types.ts`
 * already exports a `ConstructionPackage` type (cost-calculator package tiers
 * used by the existing Services > Construction Dashboard flow) with a
 * different shape. Re-exporting this file's `ConstructionPackage` from the
 * shared `@/types` barrel would collide with that existing export. Screens
 * and components in this feature import directly from
 * `@/types/constructionRequirement.types` instead of `@/types`.
 *
 * This file is UI-only scaffolding: shapes are designed so the mock data in
 * `@/data/mockConstructionRequirement` can later be swapped for real API
 * responses without changing screens/components.
 */
import type {Identifier} from './common.types';

export type BuildType = 'Independent House' | 'Villa' | 'Row House' | 'Plot Construction' | 'Other';

export type PlanTier = 'Premium' | 'Gold' | 'Silver';

export type BudgetRangeOption =
  | 'Below ₹25 Lakh'
  | '₹25 - 50 Lakh'
  | '₹50 Lakh - 1 Crore'
  | '₹1 - 2 Crore'
  | 'Above ₹2 Crore';

export type ConstructionStartOption =
  | 'Within 1 month'
  | '1 - 3 months'
  | '3 - 6 months'
  | 'Not decided yet';

export interface Builder {
  id: Identifier;
  name: string;
  verified: boolean;
  location: string;
  yearsInBusiness?: number;
  completedProjects?: number;
  rating?: number;
}

export interface ConstructionPlan {
  id: Identifier;
  builderId: Identifier;
  packageId: Identifier;
  tier: PlanTier;
  planName: string;
  pricePerSqFt: number;
  matchesLocation?: boolean;
  matchesArea?: boolean;
  isRecommended?: boolean;
  isBestValue?: boolean;
}

export type SpecificationStatus =
  | 'Included'
  | 'Not Included'
  | 'Optional Upgrade'
  | 'Conditional';

export interface ConstructionPackage {
  id: Identifier;
  tier: PlanTier;
  name: string;
  pricePerSqFt: number;
  summary: string;
}

export interface MaterialCategory {
  id: Identifier;
  name: string;
  icon?: string;
}

export interface MaterialSpecification {
  id: Identifier;
  packageId: Identifier;
  categoryId: Identifier;
  status: SpecificationStatus;
  detail?: string;
}

/** Local selection state carried through the requirement flow via route params. */
export interface ProjectRequirementSelection {
  location: string;
  buildType: BuildType;
  plotAreaSqFt?: number;
  plotAreaNotSure?: boolean;
  builtUpAreaSqFt?: number;
  builtUpAreaNotSure?: boolean;
}

export interface BudgetTimelineSelection {
  budgetRange: BudgetRangeOption;
  customBudget?: string;
  floors: number;
  constructionStart: ConstructionStartOption;
}
