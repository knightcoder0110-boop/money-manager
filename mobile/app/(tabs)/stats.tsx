import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, Skeleton, SkeletonCard } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getDailySpending } from '../../src/api/dashboard';
import { getCategoryBreakdown, getMonthlyTrends, getTopCategories } from '../../src/api/analytics';
import { formatCurrency, getCurrentMonth, getMonthName, getMonthDateRange } from '../../src/utils/format';
import { haptics } from '../../src/utils/haptics';
import { CategoryIcon } from '../../src/components/icons/category-icon';

// Icons
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

function TrendUpIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 7l-5 5-4-4-7 7" />
      <Path d="M16 7h6v6" />
    </Svg>
  );
}

function TrendDownIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 17l-5-5-4 4-7-7" />
      <Path d="M16 17h6v-6" />
    </Svg>
  );
}

type ViewMode = 'spending' | 'trends' | 'categories';

const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: 'spending', label: 'Spending' },
  { key: 'trends', label: 'Trends' },
  { key: 'categories', label: 'Categories' },
];

export default function AnalyticsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('spending');
  const [month, setMonth] = useState(getCurrentMonth());
  const range = getMonthDateRange(month.year, month.month);

  // --- Spending tab queries ---
  const { data: dailyData, isLoading: dailyLoading, refetch: refetchDaily, isRefetching } = useQuery({
    queryKey: ['daily-spending', month.year, month.month],
    queryFn: () => getDailySpending(month.year, month.month),
    enabled: viewMode === 'spending',
  });

  const { data: categoryData, isLoading: categoryLoading, refetch: refetchCategory } = useQuery({
    queryKey: ['analytics', 'category', month.year, month.month],
    queryFn: () => getCategoryBreakdown(month.year, month.month),
    enabled: viewMode === 'spending',
  });

  // --- Trends tab queries ---
  const { data: trends, isLoading: trendsLoading, refetch: refetchTrends } = useQuery({
    queryKey: ['analytics', 'monthly', 6],
    queryFn: () => getMonthlyTrends(6),
    enabled: viewMode === 'trends',
  });

  // --- Categories tab queries ---
  const { data: topCategories, isLoading: topCatLoading, refetch: refetchTopCat } = useQuery({
    queryKey: ['analytics', 'top', range.start, range.end],
    queryFn: () => getTopCategories(range.start, range.end, 10),
    enabled: viewMode === 'categories',
  });

  // Spending calculations
  const totalExpense = dailyData?.reduce((s, d) => s + d.total, 0) ?? 0;
  const totalNecessary = dailyData?.reduce((s, d) => s + d.necessary, 0) ?? 0;
  const totalUnnecessary = dailyData?.reduce((s, d) => s + d.unnecessary, 0) ?? 0;
  const totalDebatable = Math.max(0, totalExpense - totalNecessary - totalUnnecessary);
  const maxDay = dailyData?.reduce((max, d) => Math.max(max, d.total), 0) ?? 1;
  const avgDaily = dailyData && dailyData.length > 0 ? totalExpense / dailyData.length : 0;
  const sortedCategories = [...(categoryData ?? [])].sort((a, b) => b.total - a.total);

  // Trends calculations
  const maxTrendAmount = trends?.reduce((max, t) => Math.max(max, t.expense, t.income), 0) ?? 1;
  const latestMonth = trends && trends.length > 0 ? trends[trends.length - 1] : null;
  const prevMonth = trends && trends.length > 1 ? trends[trends.length - 2] : null;
  const expenseChange = latestMonth && prevMonth && prevMonth.expense > 0
    ? ((latestMonth.expense - prevMonth.expense) / prevMonth.expense) * 100
    : 0;

  // Necessity percentages
  const necPct = totalExpense > 0 ? (totalNecessary / totalExpense) * 100 : 0;
  const unnecPct = totalExpense > 0 ? (totalUnnecessary / totalExpense) * 100 : 0;
  const debPct = totalExpense > 0 ? (totalDebatable / totalExpense) * 100 : 0;

  const changeMonth = (delta: number) => {
    haptics.selection();
    setMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { year: y, month: m };
    });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    haptics.selection();
    setViewMode(mode);
  };

  const handleRefresh = () => {
    if (viewMode === 'spending') {
      refetchDaily();
      refetchCategory();
    } else if (viewMode === 'trends') {
      refetchTrends();
    } else {
      refetchTopCat();
    }
  };

  const isLoading = viewMode === 'spending'
    ? (dailyLoading || categoryLoading)
    : viewMode === 'trends'
      ? trendsLoading
      : topCatLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContent}>
          <Skeleton width={140} height={28} />
          <Skeleton width={200} height={44} />
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
            onRefresh={handleRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.headerRow}>
          <Text variant="h1">Analytics</Text>
        </Animated.View>

        {/* 3-Segment Toggle */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={[styles.viewToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {VIEW_TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => handleViewModeChange(tab.key)}
                style={[
                  styles.viewButton,
                  viewMode === tab.key && { backgroundColor: colors.accentMuted },
                ]}
              >
                <Text
                  variant="label"
                  color={viewMode === tab.key ? colors.accent : colors.textTertiary}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ===== SPENDING TAB ===== */}
        {viewMode === 'spending' && (
          <>
            {/* Month Selector */}
            <Animated.View entering={FadeInDown.delay(150)}>
              <View style={[styles.monthPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Pressable
                  onPress={() => changeMonth(-1)}
                  style={({ pressed }) => [styles.monthArrow, pressed && { backgroundColor: colors.surfacePressed }]}
                >
                  <ChevronLeftIcon color={colors.accent} />
                </Pressable>
                <Text variant="h3" style={{ minWidth: 160, textAlign: 'center' }}>
                  {getMonthName(month.year, month.month)}
                </Text>
                <Pressable
                  onPress={() => changeMonth(1)}
                  style={({ pressed }) => [styles.monthArrow, pressed && { backgroundColor: colors.surfacePressed }]}
                >
                  <ChevronRightIcon color={colors.accent} />
                </Pressable>
              </View>
            </Animated.View>

            {/* Hero Spending Card */}
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <LinearGradient
                colors={[colors.surfaceElevated, colors.surface]}
                style={[styles.heroCard, { borderColor: colors.border }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.heroHeader}>
                  <Text variant="caption" color={colors.textSecondary}>TOTAL SPENT</Text>
                  <Text variant="displayLarge" style={{ letterSpacing: -1 }}>
                    {formatCurrency(totalExpense)}
                  </Text>
                  <Text variant="bodySm" color={colors.textTertiary}>
                    Avg {formatCurrency(avgDaily)}/day
                  </Text>
                </View>

                {/* Necessity Split Bar */}
                {totalExpense > 0 && (
                  <View style={styles.splitSection}>
                    <View style={[styles.splitBar, { backgroundColor: colors.surfacePressed }]}>
                      {necPct > 0 && (
                        <View style={[styles.splitSegment, {
                          width: `${necPct}%`,
                          backgroundColor: colors.necessary,
                          borderTopLeftRadius: 6,
                          borderBottomLeftRadius: 6,
                          borderTopRightRadius: unnecPct === 0 && debPct === 0 ? 6 : 0,
                          borderBottomRightRadius: unnecPct === 0 && debPct === 0 ? 6 : 0,
                        }]} />
                      )}
                      {debPct > 0 && (
                        <View style={[styles.splitSegment, {
                          width: `${debPct}%`,
                          backgroundColor: colors.debatable,
                        }]} />
                      )}
                      {unnecPct > 0 && (
                        <View style={[styles.splitSegment, {
                          width: `${unnecPct}%`,
                          backgroundColor: colors.unnecessary,
                          borderTopRightRadius: 6,
                          borderBottomRightRadius: 6,
                        }]} />
                      )}
                    </View>

                    <View style={styles.legendRow}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.necessary }]} />
                        <View>
                          <Text variant="bodySm" color={colors.textSecondary}>Needed</Text>
                          <Text variant="amount" color={colors.necessary}>{formatCurrency(totalNecessary)}</Text>
                        </View>
                      </View>
                      {totalDebatable > 0 && (
                        <View style={styles.legendItem}>
                          <View style={[styles.legendDot, { backgroundColor: colors.debatable }]} />
                          <View>
                            <Text variant="bodySm" color={colors.textSecondary}>Maybe</Text>
                            <Text variant="amount" color={colors.debatable}>{formatCurrency(totalDebatable)}</Text>
                          </View>
                        </View>
                      )}
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.unnecessary }]} />
                        <View>
                          <Text variant="bodySm" color={colors.textSecondary}>Wants</Text>
                          <Text variant="amount" color={colors.unnecessary}>{formatCurrency(totalUnnecessary)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>

            {/* Quick Insight Cards */}
            <Animated.View entering={FadeInUp.delay(250)} style={styles.insightRow}>
              <Card style={styles.insightCard}>
                <Text variant="caption" color={colors.textSecondary}>HIGHEST DAY</Text>
                <Text variant="amountLarge" color={colors.expense}>
                  {formatCurrency(maxDay)}
                </Text>
              </Card>
              <Card style={styles.insightCard}>
                <Text variant="caption" color={colors.textSecondary}>TOP CATEGORY</Text>
                <Text variant="label" color={colors.textPrimary} numberOfLines={1}>
                  {sortedCategories[0]?.name ?? '—'}
                </Text>
                {sortedCategories[0] && (
                  <Text variant="bodySm" color={colors.expense}>{formatCurrency(sortedCategories[0].total)}</Text>
                )}
              </Card>
            </Animated.View>

            {/* Daily Spending Chart */}
            <Animated.View entering={FadeInUp.delay(300)}>
              <View style={styles.sectionHeader}>
                <Text variant="h3">Daily Breakdown</Text>
              </View>
              <Card padding="lg">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chartContainer}>
                    {avgDaily > 0 && maxDay > 0 && (
                      <View style={[styles.avgLine, {
                        bottom: (avgDaily / maxDay) * 130 + 20,
                        borderColor: colors.accent + '40',
                      }]}>
                        <View style={[styles.avgLabel, { backgroundColor: colors.accentMuted }]}>
                          <Text variant="caption" color={colors.accent} style={{ fontSize: 8, textTransform: 'none' }}>avg</Text>
                        </View>
                      </View>
                    )}
                    <View style={styles.barChart}>
                      {dailyData?.map((day) => {
                        const dayNum = new Date(day.date).getDate();
                        const height = maxDay > 0 ? (day.total / maxDay) * 130 : 0;
                        const necHeight = maxDay > 0 ? (day.necessary / maxDay) * 130 : 0;
                        const isHighest = day.total === maxDay && day.total > 0;
                        return (
                          <View key={day.date} style={styles.barCol}>
                            <View style={[styles.barWrapper, { height: Math.max(height, 3) }]}>
                              <View style={[styles.barSegment, {
                                flex: necHeight,
                                backgroundColor: isHighest ? colors.necessary : colors.necessary + '90',
                                borderTopLeftRadius: 4,
                                borderTopRightRadius: 4,
                              }]} />
                              {height - necHeight > 0 && (
                                <View style={[styles.barSegment, {
                                  flex: height - necHeight,
                                  backgroundColor: isHighest ? colors.unnecessary : colors.unnecessary + '70',
                                  borderBottomLeftRadius: necHeight === 0 ? 4 : 0,
                                  borderBottomRightRadius: necHeight === 0 ? 4 : 0,
                                  borderTopLeftRadius: necHeight === 0 ? 4 : 0,
                                  borderTopRightRadius: necHeight === 0 ? 4 : 0,
                                }]} />
                              )}
                            </View>
                            {isHighest && (
                              <View style={[styles.highestDot, { backgroundColor: colors.expense }]} />
                            )}
                            <Text
                              variant="caption"
                              color={isHighest ? colors.textPrimary : colors.textTertiary}
                              style={{ fontSize: 9, marginTop: 4 }}
                            >
                              {dayNum}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </Card>
            </Animated.View>
          </>
        )}

        {/* ===== TRENDS TAB ===== */}
        {viewMode === 'trends' && (
          <>
            {/* 6-Month Trends Chart */}
            <Animated.View entering={FadeInUp.delay(150).springify()}>
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
                  {trends?.map((m, i) => {
                    const monthLabel = new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short' });
                    const incomeH = maxTrendAmount > 0 ? (m.income / maxTrendAmount) * 100 : 0;
                    const expenseH = maxTrendAmount > 0 ? (m.expense / maxTrendAmount) * 100 : 0;
                    const isLatest = i === (trends?.length ?? 0) - 1;
                    return (
                      <View key={m.month} style={styles.trendCol}>
                        <View style={styles.trendBars}>
                          <View style={[styles.trendBar, {
                            height: Math.max(incomeH, 3),
                            backgroundColor: isLatest ? colors.income : colors.income + '60',
                          }]} />
                          <View style={[styles.trendBar, {
                            height: Math.max(expenseH, 3),
                            backgroundColor: isLatest ? colors.expense : colors.expense + '60',
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

            {/* Savings Summary */}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.insightRow}>
              <Card style={styles.insightCard}>
                <Text variant="caption" color={colors.textSecondary}>THIS MONTH</Text>
                {latestMonth && (
                  <>
                    <Text variant="amountLarge" color={latestMonth.savings >= 0 ? colors.income : colors.expense}>
                      {latestMonth.savings >= 0 ? '+' : ''}{formatCurrency(latestMonth.savings)}
                    </Text>
                    <Text variant="bodySm" color={colors.textTertiary}>savings</Text>
                  </>
                )}
              </Card>
              <Card style={styles.insightCard}>
                <Text variant="caption" color={colors.textSecondary}>AVG SAVINGS</Text>
                {trends && (
                  (() => {
                    const avg = trends.reduce((s, t) => s + t.savings, 0) / trends.length;
                    return (
                      <>
                        <Text variant="amountLarge" color={avg >= 0 ? colors.income : colors.expense}>
                          {avg >= 0 ? '+' : ''}{formatCurrency(avg)}
                        </Text>
                        <Text variant="bodySm" color={colors.textTertiary}>per month</Text>
                      </>
                    );
                  })()
                )}
              </Card>
            </Animated.View>

            {/* Monthly Savings List */}
            <Animated.View entering={FadeInUp.delay(250)}>
              <View style={styles.sectionHeader}>
                <Text variant="h3">Monthly Savings</Text>
              </View>
              <Card>
                {trends?.map((m, index) => {
                  const monthLabel = new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                  const isLast = index === (trends?.length ?? 0) - 1;
                  return (
                    <View
                      key={m.month}
                      style={[
                        styles.savingsRow,
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
                            width: `${Math.min(Math.abs(m.savings) / (maxTrendAmount || 1) * 100, 100)}%`,
                            backgroundColor: m.savings >= 0 ? colors.income + '80' : colors.expense + '80',
                          },
                        ]} />
                      </View>
                      <Text
                        variant="amount"
                        color={m.savings >= 0 ? colors.income : colors.expense}
                        style={{ minWidth: 80, textAlign: 'right' }}
                      >
                        {m.savings >= 0 ? '+' : ''}{formatCurrency(m.savings)}
                      </Text>
                    </View>
                  );
                })}
              </Card>
            </Animated.View>

            {/* Necessity Split for Latest Month */}
            {latestMonth && (latestMonth.necessary > 0 || latestMonth.unnecessary > 0) && (
              <Animated.View entering={FadeInUp.delay(300)}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3">Necessity Split</Text>
                  <Text variant="bodySm" color={colors.textTertiary}>this month</Text>
                </View>
                <Card>
                  {(() => {
                    const total = latestMonth.necessary + latestMonth.unnecessary;
                    const necPctTrend = total > 0 ? (latestMonth.necessary / total) * 100 : 0;
                    return (
                      <View style={{ gap: 12 }}>
                        <View style={[styles.splitBar, { backgroundColor: colors.surfacePressed }]}>
                          <View style={[styles.splitSegment, {
                            width: `${necPctTrend}%`,
                            backgroundColor: colors.necessary,
                            borderTopLeftRadius: 6,
                            borderBottomLeftRadius: 6,
                            borderTopRightRadius: necPctTrend >= 100 ? 6 : 0,
                            borderBottomRightRadius: necPctTrend >= 100 ? 6 : 0,
                          }]} />
                          <View style={[styles.splitSegment, {
                            width: `${100 - necPctTrend}%`,
                            backgroundColor: colors.unnecessary,
                            borderTopRightRadius: 6,
                            borderBottomRightRadius: 6,
                            borderTopLeftRadius: necPctTrend <= 0 ? 6 : 0,
                            borderBottomLeftRadius: necPctTrend <= 0 ? 6 : 0,
                          }]} />
                        </View>
                        <View style={styles.legendRow}>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.necessary }]} />
                            <View>
                              <Text variant="bodySm" color={colors.textSecondary}>Necessary</Text>
                              <Text variant="amount" color={colors.necessary}>{formatCurrency(latestMonth.necessary)}</Text>
                            </View>
                          </View>
                          <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.unnecessary }]} />
                            <View>
                              <Text variant="bodySm" color={colors.textSecondary}>Unnecessary</Text>
                              <Text variant="amount" color={colors.unnecessary}>{formatCurrency(latestMonth.unnecessary)}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  })()}
                </Card>
              </Animated.View>
            )}
          </>
        )}

        {/* ===== CATEGORIES TAB ===== */}
        {viewMode === 'categories' && (
          <>
            {/* Month Selector */}
            <Animated.View entering={FadeInDown.delay(150)}>
              <View style={[styles.monthPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Pressable
                  onPress={() => changeMonth(-1)}
                  style={({ pressed }) => [styles.monthArrow, pressed && { backgroundColor: colors.surfacePressed }]}
                >
                  <ChevronLeftIcon color={colors.accent} />
                </Pressable>
                <Text variant="h3" style={{ minWidth: 160, textAlign: 'center' }}>
                  {getMonthName(month.year, month.month)}
                </Text>
                <Pressable
                  onPress={() => changeMonth(1)}
                  style={({ pressed }) => [styles.monthArrow, pressed && { backgroundColor: colors.surfacePressed }]}
                >
                  <ChevronRightIcon color={colors.accent} />
                </Pressable>
              </View>
            </Animated.View>

            {/* Top Categories List */}
            <Animated.View entering={FadeInUp.delay(200)}>
              <View style={styles.sectionHeader}>
                <Text variant="h3">Top Categories</Text>
                <Text variant="bodySm" color={colors.textTertiary}>
                  {getMonthName(month.year, month.month).split(' ')[0]}
                </Text>
              </View>
              {(!topCategories || topCategories.length === 0) ? (
                <View style={styles.emptyState}>
                  <Text variant="body" color={colors.textTertiary} align="center">
                    No spending data for this month
                  </Text>
                </View>
              ) : (
                topCategories.map((cat, index) => {
                  const isLast = index === topCategories.length - 1;
                  return (
                    <Pressable
                      key={cat.category_name + index}
                      onPress={() => {
                        if (cat.category_id) router.push(`/categories/${cat.category_id}`);
                      }}
                      style={({ pressed }) => [
                        styles.catRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        pressed && { backgroundColor: colors.surfacePressed },
                      ]}
                    >
                      <View style={[styles.catIcon, { backgroundColor: (cat.category_color || colors.accent) + '20' }]}>
                        <CategoryIcon icon={cat.category_icon} size={20} color={cat.category_color || colors.textPrimary} />
                      </View>
                      <View style={styles.catDetails}>
                        <View style={styles.catNameRow}>
                          <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>{cat.category_name}</Text>
                          <Text variant="amount" color={colors.expense}>{formatCurrency(cat.total)}</Text>
                        </View>
                        <View style={styles.catBarRow}>
                          <View style={[styles.catBarBg, { backgroundColor: colors.surfacePressed }]}>
                            <Animated.View
                              entering={FadeInUp.delay(250 + index * 50)}
                              style={[styles.catBarFill, {
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
                })
              )}
            </Animated.View>
          </>
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
  loadingContent: { paddingHorizontal: spacing.lg, gap: 16, paddingTop: 8 },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },

  // View Toggle
  viewToggle: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },

  // Month Selector
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  monthArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  heroHeader: {
    gap: 4,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  // Split bar
  splitSection: {
    gap: 16,
  },
  splitBar: {
    height: 10,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  splitSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Insight cards
  insightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    gap: 6,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // Chart
  chartContainer: {
    position: 'relative',
    paddingBottom: 4,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 160,
    paddingBottom: 20,
  },
  barCol: {
    alignItems: 'center',
    width: 18,
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: 12,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barSegment: {
    width: '100%',
  },
  highestDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
  avgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    zIndex: 1,
  },
  avgLabel: {
    position: 'absolute',
    right: 0,
    top: -10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
  trendBar: { width: 16, minHeight: 3, borderRadius: 3 },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },

  // Category breakdown
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catDetails: {
    flex: 1,
    gap: 8,
  },
  catNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Savings list
  savingsRow: {
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

  emptyState: {
    padding: 32,
  },
});
