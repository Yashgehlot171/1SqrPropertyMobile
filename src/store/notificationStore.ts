import {create} from 'zustand';
import * as api from '@/services/notificationApi';
import {useAuthStore} from './authStore';
import type {AppNotification} from '@/types';
interface NotificationStore {
  notifications: AppNotification[]; loading: boolean; error: string | null;
  load: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}
let epoch = 0;
export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [], loading: false, error: null,
  load: async () => {
    if (get().loading) { return; }
    const started = epoch;
    set({loading: true, error: null});
    try { const notifications = await api.getNotifications(); if (started === epoch) { set({notifications, loading: false}); } }
    catch (error) { if (started === epoch) { set({loading: false, error: error instanceof Error ? error.message : 'Unable to load notifications.'}); } throw error; }
  },
  markRead: async id => {
    const started = epoch;
    const notification = await api.markNotificationRead(id);
    if (started !== epoch) { throw new Error('Session changed.'); }
    if (!notification) { set(state => ({notifications: state.notifications.filter(item => item.id !== id)})); return; }
    set(state => ({notifications: state.notifications.map(item => item.id === id ? notification : item)}));
  },
  markAllRead: async () => {
    const started = epoch; const notifications = await api.markAllNotificationsRead();
    if (started === epoch) { set({notifications}); }
  },
  deleteNotification: async id => {
    const started = epoch; await api.deleteNotification(id);
    if (started === epoch) { set(state => ({notifications: state.notifications.filter(item => item.id !== id)})); }
  },
}));
useAuthStore.subscribe((state, previous) => {
  if (state.user?.id !== previous.user?.id || state.isLoggedIn !== previous.isLoggedIn) {
    epoch += 1; useNotificationStore.setState({notifications: [], loading: false, error: null});
  }
});
