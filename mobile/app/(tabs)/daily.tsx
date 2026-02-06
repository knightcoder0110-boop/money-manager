import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Skeleton, SkeletonCard, Card } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getTransactions } from '../../src/api/transactions';
import { getDailySpending } from '../../src/api/dashboard';
import { formatCurrency, formatDate, getToday, getCurrentMonth } from '../../src/utils/format';
import { TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { haptics } from '../../src/utils/haptics';
import { TransactionWithDetails } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';

// Custom SVG Icons
function ChevronLeftIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

function ChevronRightIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

function CalendarIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 2v4M16 2v4M3 10h18" />
      <Path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5" />
    </Svg>
  );
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getWeekDays(dateStr: string): string[] {
  const date = new Date(dateStr);
  const day = date.getDay();
  // Adjust to get Monday (day 0 = Sunday, so Monday = 1)
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DailyScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(getToday());

  // Get week days for calendar
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const currentMonth = getCurrentMonth();

  // Fetch daily spending for the week view
  const { data: dailySpending } = useQuery({
    queryKey: ['daily-spending', currentMonth.year, currentMonth.month],
    queryFn: () => getDailySpending(currentMonth.year, currentMonth.month),
  });

  // Create a map of date -> spending for quick lookup
  const spendingByDate = useMemo(() => {
    const map: Record<string, number> = {};
    dailySpending?.forEach(d => {
      map[d.date] = d.total;
    });
    return map;
  }, [dailySpending]);

  // Calculate max spending for the week to determine intensity
  const weekMaxSpending = useMemo(() => {
    return weekDays.reduce((max, day) => Math.max(max, spendingByDate[day] || 0), 0);
  }, [weekDays, spendingByDate]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', { date_from: currentDate, date_to: currentDate }],
    queryFn: () => getTransactions({ date_from: currentDate, date_to: currentDate, limit: 100 }),
  });

  const transactions = data?.data ?? [];
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);

  const necessaryTotal = transactions
    .filter((t) => t.necessity === 'necessary')
    .reduce((s, t) => s + t.amount, 0);
  const unnecessaryTotal = transactions
    .filter((t) => t.necessity === 'unnecessary')
    .reduce((s, t) => s + t.amount, 0);
  const debatableTotal = transactions
    .filter((t) => t.necessity === 'debatable')
    .reduce((s, t) => s + t.amount, 0);

  const changeDay = (delta: number) => {
    haptics.selection();
    setCurrentDate((d) => addDays(d, delta));
  };

  const goToToday = () => {
    haptics.selection();
    setCurrentDate(getToday());
  };

  const isToday = currentDate === getToday();

  // Necessity percentages for split bar
  const necPct = totalExpense > 0 ? (necessaryTotal / totalExpense) * 100 : 0;
  const unnecPct = totalExpense > 0 ? (unnecessaryTotal / totalExpense) * 100 : 0;
  const debPct = totalExpense > 0 ? (debatableTotal / totalExpense) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.headerRow}>
          <Text variant="h1">Daily</Text>
          <Pressable
            onPress={goToToday}
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
          >
            <CalendarIcon color={isToday ? colors.accent : colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {/* Week Calendar Strip */}
        <Animated.View entering={FadeInDown.delay(80)}>
          <Card style={styles.weekCalendar}>
            <View style={styles.weekRow}>
              {weekDays.map((day, index) => {
                const isSelected = day === currentDate;
                const isTodayDate = day === getToday();
                const dayNum = new Date(day).getDate();
                const spending = spendingByDate[day] || 0;

                // Calculate intensity (0-1) based on spending relative to week max
                const intensity = weekMaxSpending > 0 ? spending / weekMaxSpending : 0;
                const hasSpending = spending > 0;

                return (
                  <Pressable
                    key={day}
                    onPress={() => {
                      haptics.selection();
                      setCurrentDate(day);
                    }}
                    style={[
                      styles.weekDay,
                      isSelected && { backgroundColor: colors.accent },
                    ]}
                  >
                    <Text
                      variant="caption"
                      color={isSelected ? '#FFFFFF' : colors.textTertiary}
                      style={{ fontSize: 10 }}
                    >
                      {DAY_NAMES[index]}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      color={isSelected ? '#FFFFFF' : (isTodayDate ? colors.accent : colors.textPrimary)}
                    >
                      {dayNum}
                    </Text>
                    {/* Spending intensity indicator */}
                    <View
                      style={[
                        styles.spendingDot,
                        {
                          backgroundColor: hasSpending
                            ? (isSelected ? 'rgba(255,255,255,0.8)' : colors.expense)
                            : 'transparent',
                          opacity: hasSpending ? (0.3 + intensity * 0.7) : 0,
                        },
                      ]}
                    />
                  </Pressable>
                );
              })}
            </View>
            {/* Week navigation */}
            <View style={styles.weekNav}>
              <Pressable
                onPress={() => {
                  haptics.selection();
                  setCurrentDate(addDays(weekDays[0], -7));
                }}
                style={({ pressed }) => [styles.weekNavButton, pressed && { opacity: 0.6 }]}
              >
                <ChevronLeftIcon color={colors.textSecondary} size={16} />
                <Text variant="caption" color={colors.textSecondary}>Prev Week</Text>
              </Pressable>
              <Text variant="caption" color={colors.textTertiary}>
                {formatDate(weekDays[0]).split(',')[0]} - {formatDate(weekDays[6]).split(',')[0]}
              </Text>
              <Pressable
                onPress={() => {
                  haptics.selection();
                  setCurrentDate(addDays(weekDays[0], 7));
                }}
                style={({ pressed }) => [styles.weekNavButton, pressed && { opacity: 0.6 }]}
              >
                <Text variant="caption" color={colors.textSecondary}>Next Week</Text>
                <ChevronRightIcon color={colors.textSecondary} size={16} />
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        {/* Selected Date Display */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={styles.selectedDateRow}>
            <Text variant="h3">{formatDate(currentDate)}</Text>
            {isToday && (
              <View style={[styles.todayBadge, { backgroundColor: colors.accentMuted }]}>
                <Text variant="caption" color={colors.accent} style={{ fontSize: 9 }}>TODAY</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Day Summary Hero Card */}
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <Animated.View entering={FadeInUp.delay(150).springify()}>
            <LinearGradient
              colors={[colors.surfaceElevated, colors.surface]}
              style={[styles.heroCard, { borderColor: colors.border }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroStats}>
                <View style={styles.heroStatCol}>
                  <Text variant="caption" color={colors.textSecondary}>SPENT</Text>
                  <Text variant="displayMedium" color={colors.expense} style={{ letterSpacing: -1 }}>
                    {formatCurrency(totalExpense)}
                  </Text>
                </View>
                {totalIncome > 0 && (
                  <View style={styles.heroStatCol}>
                    <Text variant="caption" color={colors.textSecondary}>EARNED</Text>
                    <Text variant="displaySmall" color={colors.income} style={{ letterSpacing: -0.5 }}>
                      {formatCurrency(totalIncome)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Necessity split bar */}
              {totalExpense > 0 && (
                <View style={styles.splitSection}>
                  <View style={[styles.splitBar, { backgroundColor: colors.surfacePressed }]}>
                    {necPct > 0 && (
                      <View style={[styles.splitSegment, {
                        width: `${necPct}%`,
                        backgroundColor: colors.necessary,
                        borderTopLeftRadius: 5,
                        borderBottomLeftRadius: 5,
                        borderTopRightRadius: unnecPct === 0 && debPct === 0 ? 5 : 0,
                        borderBottomRightRadius: unnecPct === 0 && debPct === 0 ? 5 : 0,
                      }]} />
                    )}
                    {debPct > 0 && (
                      <View style={[styles.splitSegment, {
                        width: `${debPct}%`,
                        backgroundColor: colors.debatable,
                        borderTopLeftRadius: necPct === 0 ? 5 : 0,
                        borderBottomLeftRadius: necPct === 0 ? 5 : 0,
                        borderTopRightRadius: unnecPct === 0 ? 5 : 0,
                        borderBottomRightRadius: unnecPct === 0 ? 5 : 0,
                      }]} />
                    )}
                    {unnecPct > 0 && (
                      <View style={[styles.splitSegment, {
                        width: `${unnecPct}%`,
                        backgroundColor: colors.unnecessary,
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                        borderTopLeftRadius: necPct === 0 && debPct === 0 ? 5 : 0,
                        borderBottomLeftRadius: necPct === 0 && debPct === 0 ? 5 : 0,
                      }]} />
                    )}
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.necessary }]} />
                      <Text variant="bodySm" color={colors.textSecondary}>{formatCurrency(necessaryTotal)}</Text>
                    </View>
                    {debatableTotal > 0 && (
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.debatable }]} />
                        <Text variant="bodySm" color={colors.textSecondary}>{formatCurrency(debatableTotal)}</Text>
                      </View>
                    )}
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.unnecessary }]} />
                      <Text variant="bodySm" color={colors.textSecondary}>{formatCurrency(unnecessaryTotal)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        )}

        {/* Transactions */}
        {isLoading ? (
          <View style={{ gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={56} />
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Transactions</Text>
              <Text variant="label" color={colors.textTertiary}>
                {transactions.length} {transactions.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 32, marginBottom: 8 }}>✨</Text>
                <Text variant="bodyMedium" color={colors.textSecondary} align="center">
                  Clean slate!
                </Text>
                <Text variant="bodySm" color={colors.textTertiary} align="center" style={{ marginTop: 4 }}>
                  No transactions recorded on this day
                </Text>
              </View>
            ) : (
              <View>
                {transactions.map((txn: TransactionWithDetails, index: number) => {
                  const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
                  const isLast = index === transactions.length - 1;
                  return (
                    <Pressable
                      key={txn.id}
                      onPress={() => router.push(`/transactions/${txn.id}`)}
                      style={({ pressed }) => [
                        styles.txnRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        pressed && { backgroundColor: colors.surfacePressed },
                      ]}
                    >
                      <View style={[styles.txnIcon, { backgroundColor: txn.category?.color ? txn.category.color + '25' : colors.surfaceElevated }]}>
                        <CategoryIcon icon={txn.category?.icon || 'wallet'} size={20} color={txn.category?.color || colors.textPrimary} />
                      </View>
                      <View style={styles.txnDetails}>
                        <Text variant="bodyMedium" numberOfLines={1}>
                          {txn.note || txn.category?.name || 'Transaction'}
                        </Text>
                        <Text variant="bodySm" color={colors.textTertiary} numberOfLines={1}>
                          {txn.category?.name}{txn.subcategory ? ` · ${txn.subcategory.name}` : ''}
                        </Text>
                      </View>
                      <Text variant="amount" color={typeColor.color}>
                        {typeColor.prefix}{formatCurrency(txn.amount)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: 20 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Week Calendar
  weekCalendar: {
    gap: 12,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  spendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  weekNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-end',
  },
  heroStatCol: {
    gap: 4,
  },

  // Split bar
  splitSection: {
    gap: 12,
  },
  splitBar: {
    height: 8,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  splitSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Transactions (matching home screen exactly)
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  txnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnDetails: {
    flex: 1,
    gap: 2,
  },

  emptyState: {
    padding: 32,
  },
});
