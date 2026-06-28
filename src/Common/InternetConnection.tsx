import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {AppButton} from '@/components/common/AppButton';
import Colors from '@/Themes/Colors';

interface InternetConnectionProps {
  onPress?: () => void;
}

export default function InternetConnection({
  onPress,
}: InternetConnectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>No internet connection</Text>
      <Text style={styles.subtitle}>
        Check your network and try again.
      </Text>
      <AppButton label="Retry" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
});
