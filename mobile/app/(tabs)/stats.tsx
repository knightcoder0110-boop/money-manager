import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, Card, AmountDisplay, Skeleton, SkeletonCard } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getDailySpending } from '../../src/api/dashboard';
import { getCategoryBreakdown } from '../../src/api/analytics';
import { formatCurrency, getCurrentMonth, getMonthName, getMonthDateRange } from '../../src/utils/format';
import { NECESSITY_COLORS } from '../../src/constants';
import { haptics } from '../../src/utils/haptics';
import { CategoryIcon } from '../../src/components/icons/category-icon';

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
  const maxDay = dailyData?.reduce((max, d) => Math.max(max, d.total), 0) ?? 1;

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
          />
        }
      >
        <Text variant="h1" style={{ paddingTop: 8 }}>Monthly Stats</Text>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Pressable onPress={() => changeMonth(-1)} style={styles.monthArrow}>
            <Text variant="h2" color={colors.accent}>‹</Text>
          </Pressable>
          <Text variant="h3">{getMonthName(month.year, month.month)}</Text>
          <Pressable onPress={() => changeMonth(1)} style={styles.monthArrow}>
            <Text variant="h2" color={colors.accent}>›</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Overview Card */}
            <Animated.View entering={FadeInUp.delay(100)}>
              <Card>
                <Text variant="caption" color={colors.textSecondary}>TOTAL SPENT</Text>
                <AmountDisplay amount={totalExpense} variant="displayMedium" type="expense" />
                <View style={styles.row}>
                  <View style={styles.statItem}>
                    <Text variant="bodySm" color={colors.necessary}>Necessary</Text>
                    <Text variant="amount" color={colors.necessary}>{formatCurrency(totalNecessary)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text variant="bodySm" color={colors.unnecessary}>Unnecessary</Text>
                    <Text variant="amount" color={colors.unnecessary}>{formatCurrency(totalUnnecessary)}</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>

            {/* Daily Bar Chart */}
            <Animated.View entering={FadeInUp.delay(200)}>
              <Card>
                <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
                  DAILY SPENDING
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.barChart}>
                    {dailyData?.map((day, i) => {
                      const dayNum = new Date(day.date).getDate();
                      const height = maxDay > 0 ? (day.total / maxDay) * 120 : 0;
                      const necHeight = maxDay > 0 ? (day.necessary / maxDay) * 120 : 0;
                      return (
                        <View key={day.date} style={styles.barCol}>
                          <View style={[styles.bar, { height: Math.max(height, 2) }]}>
                            <View style={[styles.barNec, { height: necHeight, backgroundColor: colors.necessary + '80' }]} />
                            <View style={[styles.barUnnec, {
                              height: height - necHeight,
                              backgroundColor: colors.unnecessary + '80',
                            }]} />
                          </View>
                          <Text variant="caption" color={colors.textTertiary} style={{ fontSize: 9 }}>
                            {dayNum}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </Card>
            </Animated.View>

            {/* Category Breakdown */}
            <Animated.View entering={FadeInUp.delay(300)}>
              <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginBottom: 8 }}>
                BY CATEGORY
              </Text>
              {categoryData?.map((cat) => {
                const pct = totalExpense > 0 ? (cat.total / totalExpense) * 100 : 0;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => router.push(`/categories/${cat.id}`)}
                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                  >
                    <Card style={{ marginBottom: 8 }}>
                      <View style={styles.catRow}>
                        <CategoryIcon icon={cat.icon} size={20} color={colors.textPrimary} />
                        <View style={{ flex: 1 }}>
                          <View style={styles.catHeader}>
                            <Text variant="bodyMedium">{cat.name}</Text>
                            <Text variant="amount" color={colors.expense}>{formatCurrency(cat.total)}</Text>
                          </View>
                          <View style={[styles.catBarBg, { backgroundColor: colors.surfacePressed }]}>
                            <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                          </View>
                        </View>
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
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
  content: { paddingHorizontal: spacing.lg, gap: 16 },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  monthArrow: { padding: 8 },
  row: { flexDirection: 'row', gap: 16, marginTop: 8 },
  statItem: { flex: 1, gap: 2 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 140, paddingBottom: 16 },
  barCol: { alignItems: 'center', width: 16, justifyContent: 'flex-end' },
  bar: { width: 10, borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' },
  barNec: { width: '100%' },
  barUnnec: { width: '100%' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  catBarBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 2 },
});
