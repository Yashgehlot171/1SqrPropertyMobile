import type {
  Identifier,
  LocationInfo,
  Remark,
  StatusHistoryEntry,
  UploadedDocument,
} from './common.types';

export type ConstructionQuality =
  | 'Basic'
  | 'Standard'
  | 'Premium'
  | 'Luxury'
  | 'Ultra Luxury';

export interface ConstructionPackage {
  id: Identifier;
  name: ConstructionQuality;
  costPerSqFt: number;
  materialQuality: string;
  labourIncluded: boolean;
  timeline: string;
  features: string[];
}

export interface DirectoryEntry {
  id: Identifier;
  name: string;
  location: string;
  rating: number;
  phone: string;
  whatsapp: string;
  tags?: string[];
}

export interface MaterialBrand {
  id: Identifier;
  category: string;
  brand: string;
  specification: string;
  rating: number;
  priceRange: string;
}

export interface ConstructionQuote {
  id: Identifier;
  plotSizeSqFt: number;
  builtUpAreaSqFt: number;
  floors: number;
  quality: ConstructionQuality;
  materialCost: number;
  labourCost: number;
  totalCost: number;
  estimatedTimelineMonths: number;
  createdAt: string;
}

export interface ConstructionRequest {
  id: Identifier;
  customerName: string;
  mobile: string;
  location: LocationInfo;
  quoteId?: string;
  documents: UploadedDocument[];
  remarks: Remark[];
  history: StatusHistoryEntry<string>[];
}
