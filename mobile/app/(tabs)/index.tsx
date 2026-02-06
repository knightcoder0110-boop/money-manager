import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, AmountDisplay, Skeleton, SkeletonCard } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getDashboard } from '../../src/api/dashboard';
import { formatCurrency } from '../../src/utils/format';
import { TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { TransactionWithDetails } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';
import { useAppStore } from '../../src/store/app';

// Icons
function SettingsIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <Path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </Svg>
  );
}

function ArrowDownIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5v14M19 12l-7 7-7-7" />
    </Svg>
  );
}

function ArrowUpIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 19V5M5 12l7-7 7 7" />
    </Svg>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { streak } = useAppStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  // Compute daily average from monthly data
  const dailyAvg = useMemo(() => {
    if (!data) return 0;
    const today = new Date();
    const dayOfMonth = today.getDate();
    if (dayOfMonth <= 1) return data.month_expense ?? 0;
    return (data.month_expense ?? 0) / dayOfMonth;
  }, [data]);

  const todayExpense = data?.today_expense ?? 0;
  const todayVsAvg = dailyAvg > 0 ? ((todayExpense - dailyAvg) / dailyAvg) * 100 : 0;

  // Necessity calculations
  const necessary = data?.month_necessary ?? 0;
  const unnecessary = data?.month_unnecessary ?? 0;
  const debatable = data?.month_debatable ?? 0;
  const necessityTotal = necessary + unnecessary + debatable;
  const necessaryPercent = necessityTotal > 0 ? Math.round((necessary / necessityTotal) * 100) : 0;

  // Smart insight — always shows
  const insight = useMemo(() => {
    const unnecessaryPercent = necessityTotal > 0 ? Math.round((unnecessary / necessityTotal) * 100) : 0;
    const currentStreak = streak.currentStreak;

    if (currentStreak >= 7) {
      return {
        emoji: '🔥',
        text: `${currentStreak}-day streak! You're building a real habit.`,
        color: colors.warning,
      };
    }
    if (unnecessaryPercent > 40 && necessityTotal > 0) {
      return {
        emoji: '⚠️',
        text: `${unnecessaryPercent}% of spending this month was on wants. Small cuts add up!`,
        color: colors.expense,
      };
    }
    if (unnecessaryPercent < 20 && necessityTotal > 0) {
      return {
        emoji: '🎯',
        text: `Only ${unnecessaryPercent}% on wants this month. Strong discipline!`,
        color: colors.income,
      };
    }
    if ((data?.month_income ?? 0) > (data?.month_expense ?? 0) && (data?.month_income ?? 0) > 0) {
      const savingsRate = Math.round(((data?.month_income ?? 0) - (data?.month_expense ?? 0)) / (data?.month_income ?? 1) * 100);
      return {
        emoji: '📈',
        text: `You're in the green this month! Savings rate: ${savingsRate}%`,
        color: colors.income,
      };
    }
    if (currentStreak > 0) {
      return {
        emoji: '✨',
        text: `${currentStreak}-day streak! Keep tracking to build better habits.`,
        color: colors.accent,
      };
    }
    return {
      emoji: '💡',
      text: 'Log your spending daily to unlock insights about your habits.',
      color: colors.accent,
    };
  }, [data, streak, necessityTotal, unnecessary, colors]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Skeleton width={150} height={20} />
            <Skeleton width={100} height={14} />
          </View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

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
        {/* Header with Greeting */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.headerRow}>
          <View style={styles.greetingSection}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]}>
              <Text variant="h3" color={colors.accent}>M</Text>
            </View>
            <View>
              <Text variant="bodySm" color={colors.textSecondary}>Hello!</Text>
              <Text variant="h2">{getGreeting()}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            {streak.currentStreak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text variant="label" color={colors.warning}>
                  🔥 {streak.currentStreak}
                </Text>
              </View>
            )}
            <Pressable
              onPress={() => router.push('/settings')}
              style={[styles.settingsButton, { backgroundColor: colors.surface }]}
            >
              <SettingsIcon color={colors.textSecondary} size={22} />
            </Pressable>
          </View>
        </Animated.View>

        {/* TODAY'S SPENDING — THE HERO */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.heroHeader}>
              <Text variant="caption" color={colors.textSecondary}>TODAY</Text>
              {data?.budget_mode?.active && (
                <View style={[styles.budgetBadge, { backgroundColor: colors.accentMuted }]}>
                  <Text variant="caption" color={colors.accent}>BUDGET MODE</Text>
                </View>
              )}
            </View>

            {/* Big spending number */}
            <Text
              variant="displayLarge"
              color={todayExpense > 0 ? colors.expense : colors.textTertiary}
              style={{ letterSpacing: -1, marginTop: 4 }}
            >
              {formatCurrency(todayExpense)}
            </Text>

            {/* Comparison to daily average */}
            <View style={styles.comparisonRow}>
              {dailyAvg > 0 ? (
                <View style={styles.comparisonPill}>
                  {todayVsAvg <= 0 ? (
                    <ArrowDownIcon color={colors.income} size={12} />
                  ) : (
                    <ArrowUpIcon color={colors.expense} size={12} />
                  )}
                  <Text
                    variant="bodySm"
                    color={todayVsAvg <= 0 ? colors.income : colors.expense}
                  >
                    {Math.abs(Math.round(todayVsAvg))}% {todayVsAvg <= 0 ? 'below' : 'above'} daily avg
                  </Text>
                </View>
              ) : (
                <Text variant="bodySm" color={colors.textTertiary}>
                  Start tracking to see your average
                </Text>
              )}
              {(data?.today_income ?? 0) > 0 && (
                <Text variant="bodySm" color={colors.income}>
                  +{formatCurrency(data?.today_income ?? 0)}
                </Text>
              )}
            </View>

            {/* Budget remaining */}
            {data?.budget_mode?.active && (
              <View style={[styles.budgetRow, { borderTopColor: colors.border }]}>
                <Text variant="bodySm" color={colors.textSecondary}>Remaining today</Text>
                <Text
                  variant="h3"
                  color={(data?.budget_mode?.today_remaining ?? 0) >= 0 ? colors.income : colors.expense}
                >
                  {formatCurrency(data?.budget_mode?.today_remaining ?? 0)}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Necessity Quick Glance — Compact */}
        {necessityTotal > 0 && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={[styles.necessityCompact, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.necessityBarCompact}>
                {necessary > 0 && (
                  <View style={[styles.necessitySegment, { flex: necessary, backgroundColor: colors.income }]} />
                )}
                {debatable > 0 && (
                  <View style={[styles.necessitySegment, { flex: debatable, backgroundColor: colors.warning }]} />
                )}
                {unnecessary > 0 && (
                  <View style={[styles.necessitySegment, { flex: unnecessary, backgroundColor: colors.expense }]} />
                )}
              </View>
              <View style={styles.necessityLabels}>
                <Text variant="bodySm" color={colors.textSecondary}>
                  <Text variant="bodySm" color={colors.income}>{necessaryPercent}%</Text> needed
                </Text>
                <Text variant="bodySm" color={colors.textTertiary}>
                  {formatCurrency(necessityTotal)} this month
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Smart Insight — Always Present */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <View style={[styles.insightCard, { backgroundColor: insight.color + '12', borderColor: insight.color + '30' }]}>
            <Text style={styles.insightEmoji}>{insight.emoji}</Text>
            <Text variant="bodySm" color={colors.textSecondary} style={{ flex: 1 }}>
              {insight.text}
            </Text>
          </View>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Recent Transactions</Text>
            {(data?.recent_transactions?.length ?? 0) > 0 && (
              <Pressable onPress={() => router.push('/transactions')}>
                <Text variant="label" color={colors.accent}>View All</Text>
              </Pressable>
            )}
          </View>
          <View>
            {(!data?.recent_transactions || data.recent_transactions.length === 0) && (
              <View
                style={[styles.emptyState, { backgroundColor: colors.surface, borderRadius: 16 }]}
              >
                <Text style={{ fontSize: 40, marginBottom: 8 }}>📝</Text>
                <Text variant="bodyMedium" color={colors.textSecondary} align="center">
                  Your day is a clean slate
                </Text>
                <Text variant="bodySm" color={colors.textTertiary} align="center" style={{ marginTop: 4 }}>
                  Tap + to log your first expense
                </Text>
              </View>
            )}
            {data?.recent_transactions?.slice(0, 5).map((txn: TransactionWithDetails, index: number) => (
              <TransactionRow key={txn.id} transaction={txn} isLast={index === Math.min((data.recent_transactions?.length ?? 1) - 1, 4)} />
            ))}
          </View>
        </Animated.View>

        {/* Monthly Overview — Compact Secondary Card */}
        <Animated.View entering={FadeInUp.delay(350)}>
          <View style={[styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="caption" color={colors.textSecondary}>THIS MONTH</Text>
            <View style={styles.monthRow}>
              <View style={styles.monthStat}>
                <Text variant="bodySm" color={colors.textTertiary}>Income</Text>
                <Text variant="amount" color={colors.income}>{formatCurrency(data?.month_income ?? 0)}</Text>
              </View>
              <View style={[styles.monthDivider, { backgroundColor: colors.border }]} />
              <View style={styles.monthStat}>
                <Text variant="bodySm" color={colors.textTertiary}>Expense</Text>
                <Text variant="amount" color={colors.expense}>{formatCurrency(data?.month_expense ?? 0)}</Text>
              </View>
              <View style={[styles.monthDivider, { backgroundColor: colors.border }]} />
              <View style={styles.monthStat}>
                <Text variant="bodySm" color={colors.textTertiary}>Balance</Text>
                <Text variant="amount" color={(data?.balance ?? 0) >= 0 ? colors.income : colors.expense}>
                  {formatCurrency(data?.balance ?? 0)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

function TransactionRow({ transaction: txn, isLast }: { transaction: TransactionWithDetails; isLast: boolean }) {
  const colors = useThemeColors();
  const router = useRouter();
  const typeColor = TRANSACTION_TYPE_COLORS[txn.type];

  const formattedDate = new Date(txn.transaction_date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });

  return (
    <Pressable
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
          {formattedDate}
        </Text>
      </View>
      <Text variant="amount" color={typeColor.color}>
        {typeColor.prefix}{formatCurrency(txn.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: 16 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  // Hero Card — Today's Spending
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  comparisonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },

  // Necessity — Compact
  necessityCompact: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  necessityBarCompact: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  necessitySegment: {
    height: '100%',
    borderRadius: 3,
  },
  necessityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Insight Card
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  insightEmoji: {
    fontSize: 24,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Transactions
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
  txnDetails: { flex: 1, gap: 2 },
  emptyState: { padding: 24, alignItems: 'center' },

  // Monthly Overview — Compact
  monthCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  monthDivider: {
    width: 1,
    height: 30,
  },
});
