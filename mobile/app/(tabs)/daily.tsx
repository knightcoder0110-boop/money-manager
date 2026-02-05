import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Skeleton, SkeletonCard } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getTransactions } from '../../src/api/transactions';
import { formatCurrency, formatDate, getToday } from '../../src/utils/format';
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

export default function DailyScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(getToday());

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

        {/* Date Navigator Pill */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={[styles.datePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              onPress={() => changeDay(-1)}
              style={({ pressed }) => [styles.dateArrow, pressed && { backgroundColor: colors.surfacePressed }]}
            >
              <ChevronLeftIcon color={colors.accent} />
            </Pressable>
            <View style={styles.dateCenter}>
              <Text variant="h3" style={{ textAlign: 'center' }}>
                {formatDate(currentDate)}
              </Text>
              {isToday && (
                <View style={[styles.todayBadge, { backgroundColor: colors.accentMuted }]}>
                  <Text variant="caption" color={colors.accent} style={{ fontSize: 9 }}>TODAY</Text>
                </View>
              )}
            </View>
            <Pressable
              onPress={() => changeDay(1)}
              style={({ pressed }) => [styles.dateArrow, pressed && { backgroundColor: colors.surfacePressed }]}
            >
              <ChevronRightIcon color={colors.accent} />
            </Pressable>
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
                <Text variant="body" color={colors.textTertiary} align="center">
                  No transactions on this day
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

  // Date Navigator
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  dateArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
