import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Card, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getMonthlyTrends, getTopCategories } from '../../src/api/analytics';
import { formatCurrency, getCurrentMonth, getMonthDateRange } from '../../src/utils/format';
import { CategoryIcon } from '../../src/components/icons/category-icon';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function TrendUpIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 7l-5 5-4-4-7 7" />
      <Path d="M16 7h6v6" />
    </Svg>
  );
}

function TrendDownIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 17l-5-5-4 4-7-7" />
      <Path d="M16 17h6v-6" />
    </Svg>
  );
}

export default function AnalyticsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const current = getCurrentMonth();
  const range = getMonthDateRange(current.year, current.month);

  const { data: trends, isLoading: trendsLoading, refetch: refetchTrends, isRefetching } = useQuery({
    queryKey: ['analytics', 'monthly', 6],
    queryFn: () => getMonthlyTrends(6),
  });

  const { data: topCats, isLoading: topLoading, refetch: refetchTop } = useQuery({
    queryKey: ['analytics', 'top', range.start, range.end],
    queryFn: () => getTopCategories(range.start, range.end, 10),
  });

  const isLoading = trendsLoading || topLoading;
  const maxAmount = trends?.reduce((max, t) => Math.max(max, t.expense, t.income), 0) ?? 1;

  const latest = trends && trends.length > 0 ? trends[trends.length - 1] : null;
  const prevMonth = trends && trends.length > 1 ? trends[trends.length - 2] : null;
  const expenseChange = latest && prevMonth && prevMonth.expense > 0
    ? ((latest.expense - prevMonth.expense) / prevMonth.expense) * 100
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
        >
          <BackIcon color={colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Analytics</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetchTrends(); refetchTop(); }}
            tintColor={colors.accent}
          />
        }
      >
        {isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={200} />
            <Skeleton height={150} />
          </View>
        ) : (
          <>
            {/* Monthly Trends Chart */}
            <Animated.View entering={FadeInUp.delay(100).springify()}>
              <LinearGradient
                colors={[colors.surfaceElevated, colors.surface]}
                style={[styles.heroCard, { borderColor: colors.border }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroTitleRow}>
                  <Text variant="caption" color={colors.textSecondary}>MONTHLY TRENDS</Text>
                  {expenseChange !== 0 && (
                    <View style={[styles.changeBadge, { backgroundColor: expenseChange > 0 ? colors.expenseMuted : colors.incomeMuted }]}>
                      {expenseChange > 0
                        ? <TrendUpIcon color={colors.expense} size={12} />
                        : <TrendDownIcon color={colors.income} size={12} />
                      }
                      <Text variant="caption" color={expenseChange > 0 ? colors.expense : colors.income} style={{ fontSize: 10, textTransform: 'none' }}>
                        {Math.abs(expenseChange).toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.trendChart}>
                  {trends?.map((month, i) => {
                    const monthLabel = new Date(month.month + '-01').toLocaleDateString('en-IN', { month: 'short' });
                    const incomeH = maxAmount > 0 ? (month.income / maxAmount) * 100 : 0;
                    const expenseH = maxAmount > 0 ? (month.expense / maxAmount) * 100 : 0;
                    const isLatest = i === (trends?.length ?? 0) - 1;
                    return (
                      <View key={month.month} style={styles.trendCol}>
                        <View style={styles.trendBars}>
                          <View style={[styles.trendBar, {
                            height: Math.max(incomeH, 3),
                            backgroundColor: isLatest ? colors.income : colors.income + '60',
                            borderRadius: 3,
                          }]} />
                          <View style={[styles.trendBar, {
                            height: Math.max(expenseH, 3),
                            backgroundColor: isLatest ? colors.expense : colors.expense + '60',
                            borderRadius: 3,
                          }]} />
                        </View>
                        <Text
                          variant="caption"
                          color={isLatest ? colors.textPrimary : colors.textTertiary}
                          style={{ fontSize: 9 }}
                        >
                          {monthLabel}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.trendLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
                    <Text variant="bodySm" color={colors.textSecondary}>Income</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
                    <Text variant="bodySm" color={colors.textSecondary}>Expense</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Savings Overview */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.savingsRow}>
              <Card style={styles.savingsCard}>
                <Text variant="caption" color={colors.textSecondary}>THIS MONTH</Text>
                {latest && (
                  <>
                    <Text variant="amountLarge" color={latest.savings >= 0 ? colors.income : colors.expense}>
                      {latest.savings >= 0 ? '+' : ''}{formatCurrency(latest.savings)}
                    </Text>
                    <Text variant="bodySm" color={colors.textTertiary}>savings</Text>
                  </>
                )}
              </Card>
              <Card style={styles.savingsCard}>
                <Text variant="caption" color={colors.textSecondary}>AVG SAVINGS</Text>
                {trends && (
                  <>
                    {(() => {
                      const avg = trends.reduce((s, t) => s + t.savings, 0) / trends.length;
                      return (
                        <>
                          <Text variant="amountLarge" color={avg >= 0 ? colors.income : colors.expense}>
                            {avg >= 0 ? '+' : ''}{formatCurrency(avg)}
                          </Text>
                          <Text variant="bodySm" color={colors.textTertiary}>per month</Text>
                        </>
                      );
                    })()}
                  </>
                )}
              </Card>
            </Animated.View>

            {/* Monthly Savings List */}
            <Animated.View entering={FadeInUp.delay(250)}>
              <View style={styles.sectionHeader}>
                <Text variant="h3">Monthly Savings</Text>
              </View>
              {trends?.map((month, index) => {
                const monthLabel = new Date(month.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                const isLast = index === (trends?.length ?? 0) - 1;
                return (
                  <View
                    key={month.month}
                    style={[
                      styles.savingsListRow,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    ]}
                  >
                    <Text variant="bodyMedium" color={colors.textSecondary} style={{ width: 60 }}>
                      {monthLabel}
                    </Text>
                    <View style={[styles.savingsBarBg, { backgroundColor: colors.surfacePressed }]}>
                      <View style={[
                        styles.savingsBarFill,
                        {
                          width: `${Math.min(Math.abs(month.savings) / (maxAmount || 1) * 100, 100)}%`,
                          backgroundColor: month.savings >= 0 ? colors.income + '80' : colors.expense + '80',
                        },
                      ]} />
                    </View>
                    <Text
                      variant="amount"
                      color={month.savings >= 0 ? colors.income : colors.expense}
                      style={{ minWidth: 80, textAlign: 'right' }}
                    >
                      {month.savings >= 0 ? '+' : ''}{formatCurrency(month.savings)}
                    </Text>
                  </View>
                );
              })}
            </Animated.View>

            {/* Top Categories */}
            <Animated.View entering={FadeInUp.delay(300)}>
              <View style={styles.sectionHeader}>
                <Text variant="h3">Top Categories</Text>
                <Text variant="bodySm" color={colors.textTertiary}>this month</Text>
              </View>
              {topCats?.map((cat, index) => {
                const isLast = index === (topCats?.length ?? 0) - 1;
                return (
                  <Pressable
                    key={cat.category_name}
                    onPress={() => {
                      if (cat.category_id) router.push(`/categories/${cat.category_id}`);
                    }}
                    style={({ pressed }) => [
                      styles.topCatRow,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      pressed && { backgroundColor: colors.surfacePressed },
                    ]}
                  >
                    <View style={[styles.topCatIcon, { backgroundColor: (cat.category_color || colors.accent) + '20' }]}>
                      <CategoryIcon icon={cat.category_icon} size={20} color={cat.category_color || colors.textPrimary} />
                    </View>
                    <View style={styles.topCatDetails}>
                      <View style={styles.topCatNameRow}>
                        <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>{cat.category_name}</Text>
                        <Text variant="amount" color={colors.expense}>{formatCurrency(cat.total)}</Text>
                      </View>
                      <View style={styles.topCatBarRow}>
                        <View style={[styles.topCatBarBg, { backgroundColor: colors.surfacePressed }]}>
                          <Animated.View
                            entering={FadeInUp.delay(350 + index * 50)}
                            style={[styles.topCatBarFill, {
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.category_color || colors.accent,
                            }]}
                          />
                        </View>
                        <Text variant="caption" color={colors.textTertiary} style={{ minWidth: 36, textAlign: 'right' }}>
                          {Math.round(cat.percentage)}%
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </Animated.View>

            {/* Necessity Split */}
            {latest && (latest.necessary > 0 || latest.unnecessary > 0) && (
              <Animated.View entering={FadeInUp.delay(400)}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3">Necessity Split</Text>
                  <Text variant="bodySm" color={colors.textTertiary}>this month</Text>
                </View>
                {(() => {
                  const total = latest.necessary + latest.unnecessary;
                  const necPct = total > 0 ? (latest.necessary / total) * 100 : 0;
                  return (
                    <View style={{ gap: 12 }}>
                      <View style={[styles.splitBar, { backgroundColor: colors.surfacePressed }]}>
                        <View style={[styles.splitFill, {
                          width: `${necPct}%`,
                          backgroundColor: colors.necessary,
                          borderTopLeftRadius: 6,
                          borderBottomLeftRadius: 6,
                          borderTopRightRadius: necPct >= 100 ? 6 : 0,
                          borderBottomRightRadius: necPct >= 100 ? 6 : 0,
                        }]} />
                        <View style={[styles.splitFill, {
                          width: `${100 - necPct}%`,
                          backgroundColor: colors.unnecessary,
                          borderTopRightRadius: 6,
                          borderBottomRightRadius: 6,
                          borderTopLeftRadius: necPct <= 0 ? 6 : 0,
                          borderBottomLeftRadius: necPct <= 0 ? 6 : 0,
                        }]} />
                      </View>
                      <View style={styles.splitLabels}>
                        <View style={styles.splitLabelItem}>
                          <View style={[styles.splitDot, { backgroundColor: colors.necessary }]} />
                          <View>
                            <Text variant="bodySm" color={colors.textSecondary}>Necessary</Text>
                            <Text variant="amount" color={colors.necessary}>{formatCurrency(latest.necessary)}</Text>
                          </View>
                        </View>
                        <View style={[styles.splitLabelItem, { justifyContent: 'flex-end' }]}>
                          <View>
                            <Text variant="bodySm" color={colors.textSecondary} align="right">Unnecessary</Text>
                            <Text variant="amount" color={colors.unnecessary} align="right">{formatCurrency(latest.unnecessary)}</Text>
                          </View>
                          <View style={[styles.splitDot, { backgroundColor: colors.unnecessary }]} />
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </Animated.View>
            )}
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.lg, gap: 20, paddingTop: 8 },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  heroTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  // Trend Chart
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  trendCol: { alignItems: 'center', gap: 6 },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  trendBar: { width: 16, minHeight: 3 },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },

  // Savings
  savingsRow: { flexDirection: 'row', gap: 12 },
  savingsCard: { flex: 1, gap: 6 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Monthly savings list
  savingsListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  savingsBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  savingsBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Top Categories
  topCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  topCatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCatDetails: {
    flex: 1,
    gap: 8,
  },
  topCatNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topCatBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topCatBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  topCatBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Necessity split
  splitBar: {
    height: 10,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  splitFill: {
    height: '100%',
  },
  splitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitLabelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  splitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
