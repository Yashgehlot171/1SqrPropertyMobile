export type Identifier = string;

export type UserRole = 'buyer' | 'seller' | 'broker';

export type UploadStatus = 'uploaded' | 'uploading' | 'pending';

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface UploadedDocument {
  id: Identifier;
  name: string;
  type: 'PDF' | 'JPG' | 'PNG';
  uri: string;
  uploadedAt: string;
  status: UploadStatus;
}

export interface Remark {
  id: Identifier;
  text: string;
  addedBy: string;
  date: string;
}

export interface StatusHistoryEntry<TStatus = string> {
  id: Identifier;
  status: TStatus;
  updatedBy: string;
  updatedAt: string;
  note?: string;
}

export interface LocationInfo {
  city: string;
  state: string;
  district?: string;
  area?: string;
  address?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UserSummary {
  id: Identifier;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  city: string;
  avatar?: string;
}
