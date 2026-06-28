import React, {useMemo, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  EmptyState,
  ScreenContainer,
  SectionHeader,
  StatusChip,
} from '@/components';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useNotificationStore} from '@/store/notificationStore';
import type {HomeStackParamList, NotificationCategory} from '@/types';
import {formatDate} from '@/utils/dateUtils';
import {showToast} from '@/utils/toast';

type NotificationFilter = 'All' | NotificationCategory;
type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

export function NotificationsScreen({navigation}: Props) {
  const notifications = useNotificationStore(state => state.notifications);
  const markRead = useNotificationStore(state => state.markRead);
  const markAllRead = useNotificationStore(state => state.markAllRead);
  const deleteNotification = useNotificationStore(
    state => state.deleteNotification,
  );
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('All');

  const categories = useMemo(
    () =>
      ['All', ...new Set(notifications.map(item => item.category))] as NotificationFilter[],
    [notifications],
  );

  const visibleNotifications = useMemo(
    () =>
      notifications.filter(
        item => activeFilter === 'All' || item.category === activeFilter,
      ),
    [activeFilter, notifications],
  );

  return (
    <ScreenContainer>
      <AppHeader
        title="Notifications"
        subtitle="Local notifications with category filter and read actions"
        onBackPress={navigation.goBack}
      />
      <View style={styles.actions}>
        <AppButton
          label="Mark All Read"
          onPress={() => {
            markAllRead();
            showToast('All notifications marked as read.');
          }}
          style={styles.button}
          variant="outlined"
        />
      </View>
      <View style={styles.filters}>
        {categories.map(item => (
          <Pressable
            key={item}
            onPress={() => setActiveFilter(item)}
            style={[
              styles.filterChip,
              activeFilter === item && styles.filterChipSelected,
            ]}>
            <Text
              style={[
                styles.filterText,
                activeFilter === item && styles.filterTextSelected,
              ]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
      <SectionHeader
        title="Recent Updates"
        actionLabel={`${notifications.filter(item => !item.isRead).length} unread`}
      />
      {visibleNotifications.length ? (
        visibleNotifications.map(notification => (
          <Pressable
            key={notification.id}
            onPress={() => {
              if (!notification.isRead) {
                markRead(notification.id);
                showToast('Notification marked as read.');
              }
            }}
            style={[
              styles.card,
              !notification.isRead && styles.unreadCard,
            ]}>
            <View style={styles.row}>
              <View style={styles.copy}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.message}>{notification.message}</Text>
              </View>
              <StatusChip label={notification.category} />
            </View>
            <View style={styles.footer}>
              <Text style={styles.date}>{formatDate(notification.createdAt)}</Text>
              <View style={styles.footerActions}>
                {!notification.isRead ? (
                  <Pressable
                    onPress={() => {
                      markRead(notification.id);
                      showToast('Notification marked as read.');
                    }}>
                    <Text style={styles.actionText}>Mark Read</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={() => {
                    deleteNotification(notification.id);
                    showToast('Notification deleted locally.');
                  }}>
                  <Text style={[styles.actionText, styles.deleteText]}>
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))
      ) : (
        <EmptyState
          description="No notifications match the selected category."
          title="No notifications found"
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTextSelected: {
    color: colors.white,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
  },
  message: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
  },
  date: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionText: {
    color: colors.secondary,
    fontWeight: typography.fontWeight.semiBold,
  },
  deleteText: {
    color: colors.error,
  },
});
