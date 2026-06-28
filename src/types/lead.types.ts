import type {
  Identifier,
  Remark,
  StatusHistoryEntry,
  UserSummary,
} from './common.types';
import type {Property} from './property.types';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Site Visit'
  | 'Negotiation'
  | 'Closed'
  | 'Lost';

export interface Lead {
  id: Identifier;
  buyer: UserSummary;
  property: Pick<Property, 'id' | 'title' | 'price' | 'location'>;
  status: LeadStatus;
  lastRemark?: string;
  followUpDate?: string;
  remarks: Remark[];
  history: StatusHistoryEntry<LeadStatus>[];
  createdAt: string;
}

export interface LeadActivityUpdate {
  remarkText?: string;
  followUpDate?: string;
  status?: LeadStatus;
}
