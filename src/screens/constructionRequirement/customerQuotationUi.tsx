import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {FlowInfo, FlowSection, flow} from './FlowUI';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import {formatDate} from '@/utils/dateTime';

export const money = (value?: string | number | null) => value == null || value === '' ? 'Not available' : `₹${Number(value).toLocaleString('en-IN', {maximumFractionDigits: 2})}`;
export const area = (value?: string | number | null) => value == null || value === '' ? 'Not available' : `${Number(value).toLocaleString('en-IN', {maximumFractionDigits: 2})} sq.ft.`;
export const dateLabel = (value?: string | null) => formatDate(value);
export const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
export const label = (value: unknown) => typeof value === 'string' || typeof value === 'number' ? String(value) : '';
export function QuoteCard({title, children}: {title: string; children: React.ReactNode}) {return <View style={styles.card}><Text style={styles.cardTitle}>{title}</Text>{children}</View>;}
export function QuoteAction({label: text, onPress, selected, disabled}: {label: string; onPress: () => void; selected?: boolean; disabled?: boolean}) {return <Pressable testID={`construction-quote-action-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.action, selected && styles.selected, disabled && styles.disabled]}><Text style={[styles.actionText, selected && styles.selectedText]}>{text}</Text></Pressable>;}
export function QuoteGroup({title, children, defaultOpen = false}: {title: string; children: React.ReactNode; defaultOpen?: boolean}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return <View style={styles.group}><Pressable onPress={() => setOpen(!open)} style={styles.groupHead}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.toggle}>{open ? '−' : '+'}</Text></Pressable>{open ? <View style={styles.groupBody}>{children}</View> : null}</View>;
}
export function InfoList({rows}: {rows: [string, string][]}) {return <View>{rows.map(([title, value]) => <FlowInfo key={title} label={title} value={value || 'Not available'} />)}</View>;}
export function StringList({title, items}: {title: string; items: string[]}) {return <FlowSection title={title}><QuoteCard title={title}>{items.length ? items.map((item, i) => <Text key={`${i}-${item}`} style={styles.item}>•  {item}</Text>) : <Text style={styles.muted}>None listed.</Text>}</QuoteCard></FlowSection>;}
const styles = StyleSheet.create({card: {padding: spacing.md, backgroundColor: flow.surface, borderRadius: spacing.radiusMd, borderWidth: 1, borderColor: flow.line, gap: spacing.sm}, cardTitle: {fontSize: typography.fontSize.sm, lineHeight: typography.lineHeight.sm, color: flow.ink, fontWeight: typography.fontWeight.bold}, action: {paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', borderRadius: spacing.radiusSm, borderWidth: 1, borderColor: flow.blue, backgroundColor: flow.surface}, actionText: {...typography.styles.label, color: flow.blue}, selected: {backgroundColor: flow.blue}, selectedText: {color: flow.surface}, disabled: {opacity: .5}, muted: {...typography.styles.bodySmall, color: flow.muted}, item: {...typography.styles.bodySmall, color: flow.ink}, group: {borderWidth: 1, borderColor: flow.line, borderRadius: spacing.radiusMd, overflow: 'hidden', backgroundColor: flow.surface}, groupHead: {padding: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}, toggle: {fontSize: typography.fontSize.xl, color: flow.blue}, groupBody: {paddingHorizontal: spacing.md, paddingBottom: spacing.sm}});
