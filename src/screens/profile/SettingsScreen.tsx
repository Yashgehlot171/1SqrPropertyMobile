import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  AppButton,
  AppHeader,
  ConfirmationModal,
  ScreenContainer,
  ServiceCard,
  SectionHeader,
} from '@/components';
import {ROUTES} from '@/constants/routes';
import {spacing} from '@/constants/spacing';
import {useAuthStore} from '@/store/authStore';
import type {ProfileStackParamList} from '@/types';
import {showToast} from '@/utils/toast';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const tabNavigation = navigation.getParent<any>();
  const logout = useAuthStore(state => state.logout);
  const deleteAccount = useAuthStore(state => state.deleteAccount);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <ScreenContainer>
      <AppHeader
        title="Settings"
        subtitle="Preferences, shortcuts and account actions"
        onBackPress={navigation.goBack}
      />
      <SectionHeader title="Account" />
      <View style={styles.grid}>
        <ServiceCard
          description="Update name, email and city"
          icon="create-outline"
          onPress={() => navigation.navigate(ROUTES.profile.editProfile)}
          title="Edit Profile"
        />
        <ServiceCard
          description="Open local notifications and mark them read"
          icon="notifications-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.homeStack, {
              screen: ROUTES.home.notifications,
            })
          }
          title="Notifications"
        />
      </View>
      <SectionHeader title="App Shortcuts" />
      <View style={styles.grid}>
        <ServiceCard
          description="Open support tickets and issue workflow"
          icon="help-buoy-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.supportDashboard,
            })
          }
          title="Support"
        />
        <ServiceCard
          description="Open finance request tracking"
          icon="cash-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.loanRequestTracking,
            })
          }
          title="Finance"
        />
        <ServiceCard
          description="Open legal request tracking"
          icon="shield-checkmark-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.servicesStack, {
              screen: ROUTES.services.legalRequestTracking,
            })
          }
          title="Legal"
        />
        <ServiceCard
          description="Open saved properties buckets"
          icon="heart-outline"
          onPress={() =>
            tabNavigation?.navigate(ROUTES.tabs.savedStack, {
              screen: ROUTES.saved.savedProperties,
            })
          }
          title="Saved"
        />
      </View>
      <SectionHeader title="Security" />
      <Text>Logout clears the current session. Delete account clears the local account session and returns to login.</Text>
      <View style={styles.actions}>
        <AppButton
          label="Logout"
          onPress={() => setShowLogoutConfirm(true)}
          style={styles.button}
          variant="outlined"
        />
        <AppButton
          label="Delete Account"
          onPress={() => setShowDeleteConfirm(true)}
          style={styles.button}
          variant="danger"
        />
      </View>
      <ConfirmationModal
        confirmLabel="Logout"
        message="Logout from the local session?"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
          showToast('Logged out.');
        }}
        title="Logout"
        visible={showLogoutConfirm}
      />
      <ConfirmationModal
        confirmLabel="Delete"
        message="Delete this local account session and return to login?"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          setShowDeleteConfirm(false);
          await deleteAccount();
          showToast('Local account deleted.');
        }}
        title="Delete Account"
        visible={showDeleteConfirm}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
