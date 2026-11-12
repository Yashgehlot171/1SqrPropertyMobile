import type {Identifier} from './common.types';

export type NotificationCategory =
  | 'Properties'
  | 'Legal'
  | 'Loans'
  | 'Construction'
  | 'Offers'
  | 'System'
  | 'Leads'
  | 'Support';

export interface AppNotification {
  id: Identifier;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string;
}
