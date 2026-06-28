import type {
  Identifier,
  Remark,
  StatusHistoryEntry,
  UploadedDocument,
} from './common.types';

export type SupportTicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Waiting for User'
  | 'Resolved'
  | 'Closed';

export interface SupportTicket {
  id: Identifier;
  issueType: string;
  relatedProperty?: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  documents: UploadedDocument[];
  remarks: Remark[];
  history: StatusHistoryEntry<SupportTicketStatus>[];
  createdAt: string;
}
