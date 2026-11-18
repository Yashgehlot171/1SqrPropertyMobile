import React, {useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {BottomSheet} from '@/components/common/BottomSheet';
import {colors} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {MasterRecord} from '@/services/masterApi';

interface Props {
  label: string;
  value: string;
  placeholder: string;
  items: MasterRecord[];
  loading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  onSelect: (item: MasterRecord) => void;
  onRetry?: () => void;
}

export function LocationMasterPicker({label, value, placeholder, items, loading = false, disabled = false, errorMessage, onSelect, onRetry}: Props) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? items.filter(item => item.name.toLowerCase().includes(query)) : items;
  }, [items, search]);

  const close = () => {setVisible(false); setSearch('');};
  return <View style={styles.container}>
    <Text style={styles.label}>{label}<Text style={styles.required}> *</Text></Text>
    <Pressable disabled={disabled} onPress={() => setVisible(true)} style={[styles.field, disabled && styles.disabled, errorMessage && styles.invalid]}>
      <Text numberOfLines={1} style={[styles.value, !value && styles.placeholder]}>{value || placeholder}</Text>
      {loading ? <ActivityIndicator size="small" color={colors.primary}/> : <Icon name="chevron-down" size={18} color={colors.textSecondary}/>}
    </Pressable>
    {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    <BottomSheet visible={visible} onClose={close}>
      <Text style={styles.sheetTitle}>Select {label.replace(/\s*\*$/, '')}</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder={`Search ${label.toLowerCase()}`} placeholderTextColor={colors.textSecondary} autoCorrect={false} style={styles.search}/>
      {loading ? <View style={styles.state}><ActivityIndicator color={colors.primary}/><Text style={styles.stateText}>Loading options…</Text></View> : errorMessage ? <View style={styles.state}><Text style={styles.error}>{errorMessage}</Text>{onRetry ? <Pressable onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable> : null}</View> : filteredItems.length ? <FlatList data={filteredItems} keyExtractor={item => String(item.id)} style={styles.list} keyboardShouldPersistTaps="handled" renderItem={({item}) => <Pressable onPress={() => {onSelect(item); close();}} style={styles.option}><Text style={styles.optionText}>{item.name}</Text>{item.name === value ? <Icon name="checkmark" size={18} color={colors.primary}/> : null}</Pressable>} /> : <View style={styles.state}><Text style={styles.stateText}>{items.length ? 'No matching locations.' : 'No options available.'}</Text>{!items.length && onRetry ? <Pressable onPress={onRetry} style={styles.retry}><Text style={styles.retryText}>Retry</Text></Pressable> : null}</View>}
    </BottomSheet>
  </View>;
}

const styles = StyleSheet.create({
  container: {gap: spacing.sm},
  label: {fontSize: typography.fontSize.sm, color: colors.textPrimary, fontWeight: typography.fontWeight.semiBold},
  required: {color: colors.error},
  field: {minHeight: 50, borderRadius: spacing.radiusMd, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md},
  disabled: {opacity: 0.55},
  invalid: {borderColor: colors.error},
  value: {flex: 1, color: colors.textPrimary, fontSize: typography.fontSize.sm},
  placeholder: {color: colors.textSecondary},
  error: {color: colors.error, fontSize: typography.fontSize.xs},
  sheetTitle: {fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.md},
  search: {minHeight: 46, borderWidth: 1, borderColor: colors.border, borderRadius: spacing.radiusMd, paddingHorizontal: spacing.md, color: colors.textPrimary, marginBottom: spacing.md},
  list: {maxHeight: 360},
  option: {minHeight: 48, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.sm},
  optionText: {fontSize: typography.fontSize.sm, color: colors.textPrimary},
  state: {minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: spacing.md},
  stateText: {color: colors.textSecondary, fontSize: typography.fontSize.sm, textAlign: 'center'},
  retry: {minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.lg},
  retryText: {color: colors.primary, fontWeight: typography.fontWeight.bold},
});
