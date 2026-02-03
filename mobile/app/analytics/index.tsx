import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, Card, AmountDisplay, IconButton, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getMonthlyTrends, getTopCategories } from '../../src/api/analytics';
import { formatCurrency, getCurrentMonth, getMonthDateRange } from '../../src/utils/format';
import { NECESSITY_COLORS } from '../../src/constants';
import { CategoryIcon } from '../../src/components/icons/category-icon';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
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

  // Compute max for mini chart
  const maxAmount = trends?.reduce((max, t) => Math.max(max, t.expense, t.income), 0) ?? 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon={<BackIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2">Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

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
            {/* Monthly Trends */}
            <Animated.View entering={FadeInUp.delay(100)}>
              <Card>
                <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
                  MONTHLY TRENDS (LAST 6 MONTHS)
                </Text>
                <View style={styles.trendChart}>
                  {trends?.map((month, i) => {
                    const monthLabel = new Date(month.month + '-01').toLocaleDateString('en-IN', { month: 'short' });
                    const incomeH = maxAmount > 0 ? (month.income / maxAmount) * 100 : 0;
                    const expenseH = maxAmount > 0 ? (month.expense / maxAmount) * 100 : 0;
                    return (
                      <View key={month.month} style={styles.trendCol}>
                        <View style={styles.trendBars}>
                          <View style={[styles.trendBar, { height: incomeH, backgroundColor: colors.income + '80' }]} />
                          <View style={[styles.trendBar, { height: expenseH, backgroundColor: colors.expense + '80' }]} />
                        </View>
                        <Text variant="caption" color={colors.textTertiary} style={{ fontSize: 9 }}>
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
              </Card>
            </Animated.View>

            {/* Savings Trend */}
            <Animated.View entering={FadeInUp.delay(200)}>
              <Card>
                <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 8 }}>
                  MONTHLY SAVINGS
                </Text>
                {trends?.map((month) => {
                  const monthLabel = new Date(month.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
                  return (
                    <View key={month.month} style={styles.savingsRow}>
                      <Text variant="bodySm" color={colors.textSecondary} style={{ width: 60 }}>{monthLabel}</Text>
                      <View style={{ flex: 1 }}>
                        <AmountDisplay
                          amount={month.savings}
                          variant="amount"
                          type={month.savings >= 0 ? 'income' : 'expense'}
                          showSign
                        />
                      </View>
                    </View>
                  );
                })}
              </Card>
            </Animated.View>

            {/* Top Categories */}
            <Animated.View entering={FadeInUp.delay(300)}>
              <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginBottom: 8 }}>
                TOP CATEGORIES THIS MONTH
              </Text>
              {topCats?.map((cat, index) => (
                <Card key={cat.category_name} style={{ marginBottom: 8 }}>
                  <View style={styles.topCatRow}>
                    <CategoryIcon icon={cat.category_icon} size={20} color={colors.textPrimary} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.topCatHeader}>
                        <Text variant="bodyMedium">{cat.category_name}</Text>
                        <Text variant="amount" color={colors.expense}>{formatCurrency(cat.total)}</Text>
                      </View>
                      <View style={[styles.topCatBarBg, { backgroundColor: colors.surfacePressed }]}>
                        <View style={[styles.topCatBarFill, { width: `${cat.percentage}%`, backgroundColor: colors.accent }]} />
                      </View>
                    </View>
                    <Text variant="bodySm" color={colors.textTertiary}>{Math.round(cat.percentage)}%</Text>
                  </View>
                </Card>
              ))}
            </Animated.View>

            {/* Necessity Overview */}
            {trends && trends.length > 0 && (
              <Animated.View entering={FadeInUp.delay(400)}>
                <Card>
                  <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 8 }}>
                    NECESSITY SPLIT (THIS MONTH)
                  </Text>
                  {(() => {
                    const latest = trends[trends.length - 1];
                    const total = latest.necessary + latest.unnecessary;
                    const necPct = total > 0 ? (latest.necessary / total) * 100 : 0;
                    return (
                      <View style={{ gap: 8 }}>
                        <View style={[styles.splitBar, { backgroundColor: colors.surfacePressed }]}>
                          <View style={[styles.splitFill, { width: `${necPct}%`, backgroundColor: colors.necessary }]} />
                        </View>
                        <View style={styles.splitLabels}>
                          <Text variant="bodySm" color={colors.necessary}>
                            Necessary: {formatCurrency(latest.necessary)} ({Math.round(necPct)}%)
                          </Text>
                          <Text variant="bodySm" color={colors.unnecessary}>
                            Unnecessary: {formatCurrency(latest.unnecessary)} ({Math.round(100 - necPct)}%)
                          </Text>
                        </View>
                      </View>
                    );
                  })()}
                </Card>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 8,
  },
  content: { paddingHorizontal: spacing.lg, gap: 16 },
  trendChart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 120, marginBottom: 8 },
  trendCol: { alignItems: 'center', gap: 4 },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  trendBar: { width: 16, borderRadius: 4, minHeight: 4 },
  trendLegend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  savingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  topCatRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topCatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  topCatBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  topCatBarFill: { height: '100%', borderRadius: 2 },
  splitBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  splitFill: { height: '100%', borderRadius: 4 },
  splitLabels: { flexDirection: 'row', justifyContent: 'space-between' },
});
