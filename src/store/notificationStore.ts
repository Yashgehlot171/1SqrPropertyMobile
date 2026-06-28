import {create} from 'zustand';

import {mockNotifications} from '@/data/mockNotifications';
import type {AppNotification} from '@/types';

interface NotificationStore {
  notifications: AppNotification[];
  markRead: (notificationId: string) => void;
  markAllRead: () => void;
  deleteNotification: (notificationId: string) => void;
}

export const useNotificationStore = create<NotificationStore>(set => ({
  notifications: mockNotifications,
  markRead: notificationId =>
    set(state => ({
      notifications: state.notifications.map(item =>
        item.id === notificationId ? {...item, isRead: true} : item,
      ),
    })),
  markAllRead: () =>
    set(state => ({
      notifications: state.notifications.map(item => ({
        ...item,
        isRead: true,
      })),
    })),
  deleteNotification: notificationId =>
    set(state => ({
      notifications: state.notifications.filter(
        item => item.id !== notificationId,
      ),
    })),
}));
