import type {
  Identifier,
  Remark,
  StatusHistoryEntry,
  UploadedDocument,
} from './common.types';

export type LoanStatus =
  | 'New'
  | 'In Review'
  | 'Document Required'
  | 'Processing'
  | 'Approved'
  | 'Rejected'
  | 'Disbursed';

export interface LoanBank {
  id: Identifier;
  name: string;
  interestRate: number;
  processingFee: string;
  eligibility: string;
  maxLoanAmount: number;
  turnaroundTime: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  city: string;
  highlights: string[];
}

export interface LoanRequest {
  id: Identifier;
  preferredBankId?: Identifier;
  applicantName: string;
  mobile: string;
  email: string;
  monthlyIncome: number;
  employmentType: string;
  loanAmount: number;
  downPayment: number;
  tenureYears: number;
  interestRate: number;
  propertyDetails: string;
  status: LoanStatus;
  documents: UploadedDocument[];
  remarks: Remark[];
  history: StatusHistoryEntry<LoanStatus>[];
  createdAt: string;
}

export interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalPayable: number;
}
