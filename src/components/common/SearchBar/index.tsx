import React from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface SearchBarProps {
  value: string;
  placeholder?: string;
  onChangeText: (value: string) => void;
}

export function SearchBar({
  value,
  placeholder = 'Search properties, city or area',
  onChangeText,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Icon color={colors.textSecondary} name="search" size={18} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: spacing.radiusMd,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    paddingHorizontal: spacing.md,
  },
});
