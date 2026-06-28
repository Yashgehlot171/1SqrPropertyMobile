import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {ScreenContainer} from '@/components';
import {colors} from '@/constants/colors';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {useAuthStore} from '@/store/authStore';
import {useLeadStore} from '@/store/leadStore';
import {useNotificationStore} from '@/store/notificationStore';
import {usePropertyStore} from '@/store/propertyStore';
import {useSavedStore} from '@/store/savedStore';
import type {ProfileStackParamList} from '@/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export function ProfileScreen({navigation}: Props) {
  const tabNavigation = navigation.getParent<any>();
  const user = useAuthStore(state => state.user);
  const properties = usePropertyStore(state => state.properties);
  const leads = useLeadStore(state => state.leads);
  const notifications = useNotificationStore(state => state.notifications);
  const favouriteIds = useSavedStore(state => state.favouriteIds);
  const initials = (user?.name ?? 'A1')
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.cameraDot}>
              <Icon color={colors.white} name="camera" size={10} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name ?? 'Profile'}</Text>
            <Text style={styles.userMeta}>
              {user?.role ?? 'User'} | {user?.city ?? 'Unknown City'}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate(ROUTES.profile.editProfile)}
            style={styles.editPill}>
            <Text style={styles.editPillText}>Edit Profile</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <ProfileStat label="Saved Properties" value={favouriteIds.length} />
        <ProfileStat label="My Leads" value={leads.length} />
        <ProfileStat label="My Properties" value={properties.length} />
        <ProfileStat
          label="Unread Alerts"
          value={notifications.filter(item => !item.isRead).length}
        />
      </View>

      <SectionLabel title="My Activities" />
      <View style={styles.activityGrid}>
        <ActivityCard
          icon="home-outline"
          title="My Properties"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.addPropertyStack, {
              screen: ROUTES.addProperty.myProperties,
            })
          }
        />
        <ActivityCard
          icon="people-outline"
          title="Leads"
          onPress={() => navigation.navigate(ROUTES.portfolio.leadList)}
        />
        <ActivityCard
          icon="heart-outline"
          title="Saved Properties"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.savedStack, {
              screen: ROUTES.saved.savedProperties,
            })
          }
        />
        <ActivityCard
          icon="cash-outline"
          title="Loan Requests"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.loanRequestTracking,
            })
          }
        />
        <ActivityCard
          icon="document-text-outline"
          title="Legal Requests"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.legalRequestTracking,
            })
          }
        />
        <ActivityCard
          icon="logo-whatsapp"
          title="Support Tickets"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.supportDashboard,
            })
          }
        />
      </View>

      <SectionLabel title="Account" />
      <View style={styles.accountRow}>
        <AccountItem
          icon="create-outline"
          title="Edit Profile"
          onPress={() => navigation.navigate(ROUTES.profile.editProfile)}
        />
        <AccountItem
          icon="settings-outline"
          title="Settings"
          onPress={() => navigation.navigate(ROUTES.profile.settings)}
        />
      </View>
    </ScreenContainer>
  );
}

function ProfileStat({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionLabel({title}: {title: string}) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function ActivityCard({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.activityCard}>
      <View style={styles.activityIcon}>
        <Icon color={colors.primary} name={icon} size={24} />
      </View>
      <Text style={styles.activityTitle}>{title}</Text>
    </Pressable>
  );
}

function AccountItem({
  icon,
  title,
  onPress,
}: {
  icon: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.accountItem}>
      <Icon color={colors.textPrimary} name={icon} size={18} />
      <Text style={styles.accountText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    marginHorizontal: -spacing.screenHorizontal,
    marginTop: -spacing.screenVertical,
    paddingHorizontal: spacing.screenHorizontal,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    backgroundColor: colors.darkPurple,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarText: {
    color: colors.darkPurple,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  userMeta: {
    color: colors.textOnPrimarySoft,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  editPill: {
    borderWidth: 1,
    borderColor: colors.textOnPrimarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editPillText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  summaryCard: {
    marginTop: -spacing.xxl,
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    marginTop: -spacing.sm,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activityCard: {
    width: '30.8%',
    minHeight: 92,
    backgroundColor: colors.white,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 1,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
  },
  accountRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  accountItem: {
    flex: 1,
    minHeight: 48,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  accountText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
});
