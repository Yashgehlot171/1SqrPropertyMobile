import type {
  Identifier,
  LocationInfo,
  UploadedDocument,
  UserSummary,
} from './common.types';

export type PropertyType =
  | 'Plot'
  | 'House'
  | 'Flat'
  | 'Agriculture Land'
  | 'Commercial Plot'
  | 'Commercial House'
  | 'Shop'
  | 'Office'
  | 'Warehouse';

export type PropertyCategory =
  | 'All'
  | 'New Launches'
  | 'Owner'
  | 'Ready To Move'
  | 'Verified';

export type PropertyReadyState =
  | 'Ready To Move'
  | 'Under Construction'
  | 'New Launch'
  | 'Resale';

export type PropertyLifecycleStatus =
  | 'Active'
  | 'Pending'
  | 'Sold'
  | 'Rejected'
  | 'Draft';

export interface PropertyMedia {
  id: Identifier;
  type: 'image' | 'video';
  uri: string;
  thumbnail?: string;
  isPrimary?: boolean;
}

export interface Property {
  id: Identifier;
  title: string;
  description: string;
  price: number;
  areaSqFt: number;
  propertyType: PropertyType;
  category: PropertyCategory;
  listingType: 'Sell' | 'Rent';
  bhk?: string;
  facing?: string;
  roadWidthFt?: number;
  furnishing?: string;
  constructionYear?: number;
  floorNumber?: number;
  totalFloors?: number;
  readyState: PropertyReadyState;
  status: PropertyLifecycleStatus;
  amenities: string[];
  verified: boolean;
  ownerType: 'Owner' | 'Broker';
  owner: UserSummary;
  location: LocationInfo;
  media: PropertyMedia[];
  documents: UploadedDocument[];
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
}

export interface PropertyFilterState {
  search: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  propertyType?: PropertyType;
  bhk?: string;
  facing?: string;
  city?: string;
  readyToMoveOnly?: boolean;
  verifiedOnly?: boolean;
  ownerOnly?: boolean;
}

export interface AddPropertyPayload
  extends Omit<Property, 'id' | 'createdAt' | 'updatedAt'> {}

export interface PropertyDraftState extends AddPropertyPayload {
  tempId?: string;
}
