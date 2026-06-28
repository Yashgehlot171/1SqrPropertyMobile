import type {
  Identifier,
  LocationInfo,
  Remark,
  StatusHistoryEntry,
  UploadedDocument,
} from './common.types';

export type LegalStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Document Required'
  | 'Verified'
  | 'Rejected'
  | 'Completed';

export interface LegalTeam {
  id: Identifier;
  name: string;
  specialization: string;
  city: string;
  phone: string;
  whatsapp: string;
  email: string;
  experience: string;
  highlights: string[];
}

export interface LegalRequest {
  id: Identifier;
  type: 'Property Verification' | 'Property Registration';
  assignedTeamId?: Identifier;
  applicantName: string;
  ownerName: string;
  buyerName?: string;
  propertyDetails: string;
  location: LocationInfo;
  preferredRegistrationDate?: string;
  status: LegalStatus;
  documents: UploadedDocument[];
  remarks: Remark[];
  history: StatusHistoryEntry<LegalStatus>[];
  createdAt: string;
}
