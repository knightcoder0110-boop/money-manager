import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getCategoryBreakdown } from '../../src/api/analytics';
import { getTransactions } from '../../src/api/transactions';
import { formatCurrency, getCurrentMonth, getMonthName, getMonthDateRange, getRelativeDate } from '../../src/utils/format';
import { NECESSITY_COLORS, TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { haptics } from '../../src/utils/haptics';
import { CategoryIcon } from '../../src/components/icons/category-icon';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

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

export default function CategoryDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [month, setMonth] = useState(getCurrentMonth());

  const range = getMonthDateRange(month.year, month.month);

  const { data: analytics } = useQuery({
    queryKey: ['analytics', 'category', month.year, month.month, id],
    queryFn: () => getCategoryBreakdown(month.year, month.month, id),
    enabled: !!id,
  });

  const { data: txnData, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', { category_id: id, date_from: range.start, date_to: range.end }],
    queryFn: () => getTransactions({
      category_id: id,
      date_from: range.start,
      date_to: range.end,
      limit: 100,
    }),
    enabled: !!id,
  });

  const cat = analytics?.[0];
  const transactions = txnData?.data ?? [];

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
        <View style={styles.headerCenter}>
          {cat && (
            <View style={[styles.headerCatIcon, { backgroundColor: (cat.color || colors.accent) + '20' }]}>
              <CategoryIcon icon={cat.icon} size={18} color={cat.color || colors.textPrimary} />
            </View>
          )}
          <Text variant="h1" numberOfLines={1}>{cat?.name || 'Category'}</Text>
        </View>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />
        }
      >
        {/* Month Selector */}
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

        {/* Hero Card */}
        {cat && (
          <Animated.View entering={FadeInUp.delay(150).springify()}>
            <LinearGradient
              colors={[colors.surfaceElevated, colors.surface]}
              style={[styles.heroCard, { borderColor: colors.border }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text variant="caption" color={colors.textSecondary}>TOTAL THIS MONTH</Text>
              <Text variant="displayLarge" color={colors.expense} style={{ letterSpacing: -1 }}>
                {formatCurrency(cat.total)}
              </Text>
              <Text variant="bodySm" color={colors.textTertiary}>
                {cat.transaction_count} transactions
              </Text>

              {/* Necessity Split */}
              {(cat.necessary > 0 || cat.unnecessary > 0 || cat.debatable > 0) && (
                <View style={styles.necessitySection}>
                  <View style={[styles.necessityDivider, { backgroundColor: colors.border }]} />
                  {[
                    { label: 'Necessary', amount: cat.necessary, nc: NECESSITY_COLORS.necessary },
                    { label: 'Unnecessary', amount: cat.unnecessary, nc: NECESSITY_COLORS.unnecessary },
                    { label: 'Debatable', amount: cat.debatable, nc: NECESSITY_COLORS.debatable },
                  ].map((item) => item.amount > 0 && (
                    <View key={item.label} style={styles.necessityItem}>
                      <View style={[styles.necessityDot, { backgroundColor: item.nc.color }]} />
                      <Text variant="bodySm" color={colors.textSecondary} style={{ flex: 1 }}>{item.label}</Text>
                      <Text variant="amount" color={item.nc.color}>{formatCurrency(item.amount)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        )}

        {/* Transactions */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Transactions</Text>
            <Text variant="bodySm" color={colors.textTertiary}>{transactions.length}</Text>
          </View>
          {isLoading ? (
            <View style={{ gap: 8 }}>{[1, 2, 3].map((i) => <Skeleton key={i} height={50} />)}</View>
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
              <Text variant="bodyMedium" color={colors.textSecondary} align="center">
                Nothing here yet
              </Text>
              <Text variant="bodySm" color={colors.textTertiary} align="center" style={{ marginTop: 4 }}>
                No transactions in this category this month
              </Text>
            </View>
          ) : (
            transactions.map((txn, index) => {
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
                  <View style={styles.txnDetails}>
                    <Text variant="bodyMedium" numberOfLines={1}>
                      {txn.note || txn.subcategory?.name || 'Transaction'}
                    </Text>
                    <Text variant="bodySm" color={colors.textTertiary}>
                      {getRelativeDate(txn.transaction_date)}
                    </Text>
                  </View>
                  <Text variant="amount" color={typeColor.color}>
                    {typeColor.prefix}{formatCurrency(txn.amount)}
                  </Text>
                </Pressable>
              );
            })
          )}
        </Animated.View>

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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerCatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.lg, gap: 20, paddingTop: 8 },

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
    gap: 6,
  },
  necessitySection: {
    marginTop: 8,
    gap: 8,
  },
  necessityDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  necessityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  necessityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Transactions
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  txnDetails: {
    flex: 1,
    gap: 2,
  },
  emptyState: {
    padding: 32,
  },
});
