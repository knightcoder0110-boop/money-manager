import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Text } from './Text';
import { useThemeColors } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import { haptics } from '../../utils/haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_SIZE = Math.floor((SCREEN_WIDTH - spacing.lg * 2 - 48 - 6 * 4) / 7);

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  accentColor?: string;
}

export function DatePicker({ value, onChange, accentColor }: DatePickerProps) {
  const colors = useThemeColors();
  const [visible, setVisible] = useState(false);
  const parsed = parseDate(value);
  const [viewYear, setViewYear] = useState(parsed.year);
  const [viewMonth, setViewMonth] = useState(parsed.month);

  const accent = accentColor || colors.accent;
  const today = getToday();

  const open = () => {
    const p = parseDate(value);
    setViewYear(p.year);
    setViewMonth(p.month);
    setVisible(true);
  };

  const close = () => setVisible(false);

  const selectDate = (dateStr: string) => {
    haptics.selection();
    onChange(dateStr);
    close();
  };

  const navigateMonth = (delta: number) => {
    haptics.light();
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const goToToday = () => {
    haptics.light();
    const t = parseDate(today);
    setViewYear(t.year);
    setViewMonth(t.month);
  };

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const days: { day: number; dateStr: string; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      let pm = viewMonth - 1;
      let py = viewYear;
      if (pm < 0) { pm = 11; py--; }
      const dateStr = toDateStr(py, pm, d);
      days.push({ day: d, dateStr, isCurrentMonth: false, isToday: dateStr === today, isSelected: dateStr === value });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toDateStr(viewYear, viewMonth, d);
      days.push({ day: d, dateStr, isCurrentMonth: true, isToday: dateStr === today, isSelected: dateStr === value });
    }

    // Next month leading days
    const remaining = 42 - days.length; // 6 rows
    for (let d = 1; d <= remaining; d++) {
      let nm = viewMonth + 1;
      let ny = viewYear;
      if (nm > 11) { nm = 0; ny++; }
      const dateStr = toDateStr(ny, nm, d);
      days.push({ day: d, dateStr, isCurrentMonth: false, isToday: dateStr === today, isSelected: dateStr === value });
    }

    return days;
  }, [viewYear, viewMonth, value, today]);

  // Display label
  const displayLabel = useMemo(() => {
    if (value === today) return 'Today';
    const p = parseDate(value);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (value === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (value === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
    return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [value, today]);

  // Quick date options
  const quickDates = useMemo(() => {
    const t = new Date();
    const y = new Date(); y.setDate(y.getDate() - 1);
    return [
      { label: 'Today', dateStr: t.toISOString().split('T')[0] },
      { label: 'Yesterday', dateStr: y.toISOString().split('T')[0] },
    ];
  }, []);

  return (
    <>
      {/* Trigger */}
      <Pressable
        onPress={open}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          pressed && { backgroundColor: colors.surfacePressed },
        ]}
      >
        <View style={[styles.calendarIconBox, { backgroundColor: accent + '15' }]}>
          <Text variant="bodySm" color={accent}>📅</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="caption" color={colors.textTertiary} style={{ fontSize: 10 }}>DATE</Text>
          <Text variant="bodyMedium" color={colors.textPrimary}>{displayLabel}</Text>
        </View>
        <Text variant="bodySm" color={colors.textTertiary}>
          {new Date(value).toLocaleDateString('en-IN', { weekday: 'short' })}
        </Text>
      </Pressable>

      {/* Modal Calendar */}
      <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          <Animated.View
            entering={SlideInDown.springify().damping(20).stiffness(200)}
            exiting={SlideOutDown.duration(200)}
            style={[styles.sheet, { backgroundColor: colors.surface }]}
          >
            {/* Handle */}
            <View style={styles.handleRow}>
              <View style={[styles.handle, { backgroundColor: colors.textTertiary + '40' }]} />
            </View>

            {/* Month nav */}
            <View style={styles.monthNav}>
              <Pressable onPress={() => navigateMonth(-1)} style={styles.monthArrow}>
                <Text variant="h2" color={accent}>‹</Text>
              </Pressable>
              <Pressable onPress={goToToday} style={styles.monthTitle}>
                <Text variant="h3" color={colors.textPrimary}>
                  {MONTHS[viewMonth]} {viewYear}
                </Text>
              </Pressable>
              <Pressable onPress={() => navigateMonth(1)} style={styles.monthArrow}>
                <Text variant="h2" color={accent}>›</Text>
              </Pressable>
            </View>

            {/* Quick dates */}
            <View style={styles.quickDates}>
              {quickDates.map((q) => (
                <Pressable
                  key={q.label}
                  onPress={() => selectDate(q.dateStr)}
                  style={[
                    styles.quickPill,
                    {
                      backgroundColor: value === q.dateStr ? accent + '20' : colors.surfaceElevated,
                      borderColor: value === q.dateStr ? accent + '50' : colors.border,
                    },
                  ]}
                >
                  <Text variant="label" color={value === q.dateStr ? accent : colors.textSecondary}>
                    {q.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((wd) => (
                <View key={wd} style={styles.weekdayCell}>
                  <Text variant="caption" color={colors.textTertiary} align="center">{wd}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((d, i) => (
                <Pressable
                  key={i}
                  onPress={() => selectDate(d.dateStr)}
                  style={({ pressed }) => [
                    styles.dayCell,
                    d.isSelected && { backgroundColor: accent, borderRadius: DAY_SIZE / 2 },
                    d.isToday && !d.isSelected && {
                      borderWidth: 1.5,
                      borderColor: accent,
                      borderRadius: DAY_SIZE / 2,
                    },
                    pressed && !d.isSelected && { backgroundColor: colors.surfacePressed, borderRadius: DAY_SIZE / 2 },
                  ]}
                >
                  <Text
                    variant="bodyMedium"
                    color={
                      d.isSelected
                        ? '#FFFFFF'
                        : d.isCurrentMonth
                          ? colors.textPrimary
                          : colors.textTertiary + '60'
                    }
                  >
                    {d.day}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Bottom padding */}
            <View style={{ height: 16 }} />
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  calendarIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthArrow: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    flex: 1,
    alignItems: 'center',
  },
  quickDates: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
