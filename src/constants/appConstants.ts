import type {
  ConstructionQuality,
  LegalStatus,
  LeadStatus,
  LoanStatus,
  PropertyCategory,
  PropertyLifecycleStatus,
  PropertyReadyState,
  PropertyType,
  SupportTicketStatus,
  UserRole,
} from '@/types';

export const USER_ROLES: UserRole[] = ['buyer', 'seller', 'broker'];

export const PROPERTY_TYPES: PropertyType[] = [
  'Plot',
  'House',
  'Flat',
  'Agriculture Land',
  'Commercial Plot',
  'Commercial House',
  'Shop',
  'Office',
  'Warehouse',
];

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  'All',
  'New Launches',
  'Owner',
  'Ready To Move',
  'Verified',
];

export const BHK_OPTIONS = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

export const FACING_OPTIONS = [
  'East',
  'West',
  'North',
  'South',
  'North-East',
  'North-West',
  'South-East',
  'South-West',
];

export const READY_TO_MOVE_OPTIONS: PropertyReadyState[] = [
  'Ready To Move',
  'Under Construction',
  'New Launch',
  'Resale',
];

export const PROPERTY_STATUSES: PropertyLifecycleStatus[] = [
  'Active',
  'Pending',
  'Sold',
  'Rejected',
  'Draft',
];

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Interested',
  'Site Visit',
  'Negotiation',
  'Closed',
  'Lost',
  'Converted',
];

export const LEGAL_STATUSES: LegalStatus[] = [
  'Submitted',
  'Under Review',
  'Document Required',
  'Verified',
  'Rejected',
  'Completed',
];

export const LOAN_STATUSES: LoanStatus[] = [
  'New',
  'In Review',
  'Document Required',
  'Processing',
  'Approved',
  'Rejected',
  'Disbursed',
];

export const SUPPORT_TICKET_STATUSES: SupportTicketStatus[] = [
  'Open',
  'In Progress',
  'Waiting for User',
  'Resolved',
  'Closed',
];

export const CONSTRUCTION_QUALITIES: ConstructionQuality[] = [
  'Basic',
  'Standard',
  'Premium',
  'Luxury',
  'Ultra Luxury',
];

export const STATIC_OTP = '123456';
