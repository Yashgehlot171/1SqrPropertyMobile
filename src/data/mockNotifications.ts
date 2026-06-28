import type {AppNotification} from '@/types';

const categories: AppNotification['category'][] = [
  'Properties',
  'Legal',
  'Loans',
  'Construction',
  'Offers',
];

export const mockNotifications: AppNotification[] = Array.from(
  {length: 15},
  (_, index) => ({
    id: `notification-${index + 1}`,
    title: `Update ${index + 1}`,
    message: `This is a seeded ${categories[index % categories.length]} notification for local workflow testing.`,
    category: categories[index % categories.length],
    isRead: index > 6,
    createdAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')}T10:00:00.000Z`,
  }),
);
