import type {
  Identifier,
  Remark,
  StatusHistoryEntry,
  UserSummary,
} from './common.types';
import type {Property} from './property.types';

// Backend's leadStatusSlugSchema (1SqrPropertyBackend/src/validators/lead.validator.ts)
// has 8 lowercase-kebab slugs: new, contacted, interested, site-visit, negotiation,
// closed, lost, converted. This union is the Title-Case mobile-facing equivalent of
// those same 8 values (1:1, not a lossy reduction) — 'Converted' was added here to
// cover the backend's terminal "converted" outcome, which the original mock model
// never had. See leadApi.ts's STATUS_SLUG_TO_LABEL/LABEL_TO_STATUS_SLUG for the
// two-way mapping.
export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Site Visit'
  | 'Negotiation'
  | 'Closed'
  | 'Lost'
  | 'Converted';

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
