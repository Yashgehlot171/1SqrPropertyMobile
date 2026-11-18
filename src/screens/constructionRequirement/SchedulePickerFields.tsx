import React, {useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import DateTimePicker, {type DateTimePickerEvent} from '@react-native-community/datetimepicker';

import {formatDate, formatTime, localDateKey, localTimeKey, scheduleDate} from '@/utils/dateTime';
import {flow} from './FlowUI';

export function SchedulePickerFields({date, time, onDateChange, onTimeChange, minimumDate = new Date(), dateLabel = 'Visit date', timeLabel = 'Visit time'}: {date: string; time: string; onDateChange: (value: string) => void; onTimeChange: (value: string) => void; minimumDate?: Date; dateLabel?: string; timeLabel?: string}) {
  const [mode, setMode] = useState<'date' | 'time' | null>(null);
  const current = date && time ? scheduleDate(date, time) : date ? scheduleDate(date, '12:00') : new Date();
  const changed = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setMode(null);
    if (!selected) return;
    if (mode === 'date') onDateChange(localDateKey(selected));
    if (mode === 'time') onTimeChange(localTimeKey(selected));
  };
  return <View style={styles.wrap}>
    <Text style={styles.label}>{dateLabel}</Text><Pressable accessibilityRole="button" onPress={() => setMode('date')} style={styles.field}><Text style={date ? styles.value : styles.placeholder}>{date ? formatDate(date) : 'Choose date'}</Text></Pressable>
    <Text style={styles.label}>{timeLabel}</Text><Pressable accessibilityRole="button" onPress={() => setMode('time')} style={styles.field}><Text style={time ? styles.value : styles.placeholder}>{time ? formatTime(time) : 'Choose time'}</Text></Pressable>
    {mode ? <DateTimePicker value={current} mode={mode} display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={mode === 'date' ? minimumDate : undefined} onChange={changed} /> : null}
    {Platform.OS === 'ios' && mode ? <Pressable onPress={() => setMode(null)} style={styles.done}><Text style={styles.doneText}>Done</Text></Pressable> : null}
  </View>;
}

export function DatePickerField({label, value, onChange, minimumDate}: {label: string; value: string; onChange: (value: string) => void; minimumDate?: Date}) {
  const [visible, setVisible] = useState(false);
  const selected = value ? scheduleDate(value, '12:00') : new Date();
  return <View style={styles.wrap}><Text style={styles.label}>{label}</Text><Pressable accessibilityRole="button" onPress={() => setVisible(true)} style={styles.field}><Text style={value ? styles.value : styles.placeholder}>{value ? formatDate(value) : 'Choose date'}</Text></Pressable>{visible ? <DateTimePicker value={selected} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={minimumDate} onChange={(_event, next) => {if (Platform.OS === 'android') setVisible(false); if (next) onChange(localDateKey(next));}}/> : null}{Platform.OS === 'ios' && visible ? <Pressable onPress={() => setVisible(false)} style={styles.done}><Text style={styles.doneText}>Done</Text></Pressable> : null}</View>;
}

const styles = StyleSheet.create({wrap: {gap: 7}, label: {fontSize: 11, fontWeight: '700', color: flow.ink}, field: {minHeight: 44, justifyContent: 'center', paddingHorizontal: 11, borderWidth: 1, borderColor: flow.line, borderRadius: 7, backgroundColor: flow.background}, value: {fontSize: 12, color: flow.ink}, placeholder: {fontSize: 12, color: flow.muted}, done: {alignSelf: 'flex-end', paddingVertical: 7, paddingHorizontal: 12}, doneText: {fontWeight: '800', color: flow.blue}});
