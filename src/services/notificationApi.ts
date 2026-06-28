import {mockNotifications} from '@/data/mockNotifications';
import type {AppNotification} from '@/types';

import {simulateNetwork} from './serviceUtils';

let notifications = [...mockNotifications];

export async function getNotifications(): Promise<AppNotification[]> {
  return simulateNetwork(notifications);
}

export async function markNotificationRead(
  notificationId: string,
): Promise<AppNotification | undefined> {
  let updatedNotification: AppNotification | undefined;

  notifications = notifications.map(item => {
    if (item.id !== notificationId) {
      return item;
    }

    updatedNotification = {...item, isRead: true};
    return updatedNotification;
  });

  return simulateNetwork(updatedNotification);
}

export async function markAllNotificationsRead(): Promise<AppNotification[]> {
  notifications = notifications.map(item => ({...item, isRead: true}));
  return simulateNetwork(notifications);
}

export async function deleteNotification(
  notificationId: string,
): Promise<boolean> {
  notifications = notifications.filter(item => item.id !== notificationId);
  return simulateNetwork(true);
}

// Currently using static data. Replace this with real API integration later.
