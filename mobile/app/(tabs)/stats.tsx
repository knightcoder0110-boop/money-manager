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
import { getCategoryBreakdown } from '../../src/api/analytics';
import { formatCurrency, getCurrentMonth, getMonthName } from '../../src/utils/format';
import { haptics } from '../../src/utils/haptics';
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

function TrendingDownIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 17l-5-5-4 4-7-7" />
      <Path d="M16 17h6v-6" />
    </Svg>
  );
}

function FilterIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M7 12h10M10 18h4" />
    </Svg>
  );
}

export default function StatsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [month, setMonth] = useState(getCurrentMonth());

  const { data: dailyData, isLoading: dailyLoading, refetch: refetchDaily, isRefetching } = useQuery({
    queryKey: ['daily-spending', month.year, month.month],
    queryFn: () => getDailySpending(month.year, month.month),
  });

  const { data: categoryData, isLoading: categoryLoading, refetch: refetchCategory } = useQuery({
    queryKey: ['analytics', 'category', month.year, month.month],
    queryFn: () => getCategoryBreakdown(month.year, month.month),
  });

  const totalExpense = dailyData?.reduce((s, d) => s + d.total, 0) ?? 0;
  const totalNecessary = dailyData?.reduce((s, d) => s + d.necessary, 0) ?? 0;
  const totalUnnecessary = dailyData?.reduce((s, d) => s + d.unnecessary, 0) ?? 0;
  const totalDebatable = Math.max(0, totalExpense - totalNecessary - totalUnnecessary);
  const maxDay = dailyData?.reduce((max, d) => Math.max(max, d.total), 0) ?? 1;
  const avgDaily = dailyData && dailyData.length > 0 ? totalExpense / dailyData.length : 0;

  // Category data sorted by total
  const sortedCategories = [...(categoryData ?? [])].sort((a, b) => b.total - a.total);
  const topCategory = sortedCategories[0];

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

  const isLoading = dailyLoading || categoryLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContent}>
          <View style={styles.headerRow}>
            <Skeleton width={140} height={28} />
            <Skeleton width={44} height={44} circle />
          </View>
          <Skeleton width={200} height={36} />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </SafeAreaView>
    );
  }

  // Necessity split percentages
  const necPct = totalExpense > 0 ? (totalNecessary / totalExpense) * 100 : 0;
  const unnecPct = totalExpense > 0 ? (totalUnnecessary / totalExpense) * 100 : 0;
  const debPct = totalExpense > 0 ? (totalDebatable / totalExpense) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetchDaily(); refetchCategory(); }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.headerRow}>
          <Text variant="h1">Statistics</Text>
          <Pressable style={[styles.filterButton, { backgroundColor: colors.surface }]}>
            <FilterIcon color={colors.textSecondary} />
          </Pressable>
        </Animated.View>

        {/* Month Selector Pill */}
        <Animated.View entering={FadeInDown.delay(100)}>
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
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <LinearGradient
            colors={[colors.surfaceElevated, colors.surface]}
            style={[styles.heroCard, { borderColor: colors.border }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroHeader}>
              <View style={styles.heroTitleRow}>
                <Text variant="caption" color={colors.textSecondary}>TOTAL SPENT</Text>
                <View style={[styles.trendBadge, { backgroundColor: colors.expenseMuted }]}>
                  <TrendingDownIcon color={colors.expense} size={14} />
                </View>
              </View>
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
                      borderTopLeftRadius: necPct === 0 ? 6 : 0,
                      borderBottomLeftRadius: necPct === 0 ? 6 : 0,
                      borderTopRightRadius: unnecPct === 0 ? 6 : 0,
                      borderBottomRightRadius: unnecPct === 0 ? 6 : 0,
                    }]} />
                  )}
                  {unnecPct > 0 && (
                    <View style={[styles.splitSegment, {
                      width: `${unnecPct}%`,
                      backgroundColor: colors.unnecessary,
                      borderTopRightRadius: 6,
                      borderBottomRightRadius: 6,
                      borderTopLeftRadius: necPct === 0 && debPct === 0 ? 6 : 0,
                      borderBottomLeftRadius: necPct === 0 && debPct === 0 ? 6 : 0,
                    }]} />
                  )}
                </View>

                {/* Legend */}
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
        <Animated.View entering={FadeInUp.delay(200)} style={styles.insightRow}>
          <Card style={styles.insightCard}>
            <Text variant="caption" color={colors.textSecondary}>HIGHEST DAY</Text>
            <Text variant="amountLarge" color={colors.expense}>
              {formatCurrency(maxDay)}
            </Text>
          </Card>
          <Card style={styles.insightCard}>
            <Text variant="caption" color={colors.textSecondary}>TOP CATEGORY</Text>
            <Text variant="label" color={colors.textPrimary} numberOfLines={1}>
              {topCategory?.name ?? '—'}
            </Text>
            {topCategory && (
              <Text variant="bodySm" color={colors.expense}>{formatCurrency(topCategory.total)}</Text>
            )}
          </Card>
        </Animated.View>

        {/* Daily Spending Chart */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Daily Breakdown</Text>
          </View>
          <Card padding="lg">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chartContainer}>
                {/* Average line */}
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

        {/* Category Breakdown */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">By Category</Text>
            <Pressable onPress={() => router.push('/analytics')}>
              <Text variant="label" color={colors.accent}>View All</Text>
            </Pressable>
          </View>
          <View>
            {sortedCategories.length === 0 && (
              <View style={styles.emptyState}>
                <Text variant="body" color={colors.textTertiary} align="center">
                  No spending data this month
                </Text>
              </View>
            )}
            {sortedCategories.map((cat, index) => {
              const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
              const isLast = index === sortedCategories.length - 1;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => router.push(`/categories/${cat.id}`)}
                  style={({ pressed }) => [
                    styles.catRow,
                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.surfacePressed },
                  ]}
                >
                  <View style={[styles.catIcon, { backgroundColor: cat.color ? cat.color + '20' : colors.surfaceElevated }]}>
                    <CategoryIcon icon={cat.icon} size={20} color={cat.color || colors.textPrimary} />
                  </View>
                  <View style={styles.catDetails}>
                    <View style={styles.catNameRow}>
                      <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>{cat.name}</Text>
                      <Text variant="amount" color={colors.expense}>{formatCurrency(cat.total)}</Text>
                    </View>
                    <View style={styles.catBarRow}>
                      <View style={[styles.catBarBg, { backgroundColor: colors.surfacePressed }]}>
                        <Animated.View
                          entering={FadeInUp.delay(350 + index * 50)}
                          style={[styles.catBarFill, {
                            width: `${pct}%`,
                            backgroundColor: cat.color || colors.accent,
                          }]}
                        />
                      </View>
                      <Text variant="caption" color={colors.textTertiary} style={{ minWidth: 36, textAlign: 'right' }}>
                        {pct.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 4,
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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

  emptyState: {
    padding: 32,
  },
});
