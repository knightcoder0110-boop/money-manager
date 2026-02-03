import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, Card, AmountDisplay, IconButton, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
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
      <View style={styles.header}>
        <IconButton icon={<BackIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <View style={styles.headerCenter}>
          {cat && <CategoryIcon icon={cat.icon} size={24} color={colors.textPrimary} />}
          <Text variant="h2">{cat?.name || 'Category'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />
        }
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Pressable onPress={() => changeMonth(-1)} style={{ padding: 8 }}>
            <Text variant="h2" color={colors.accent}>‹</Text>
          </Pressable>
          <Text variant="h3">{getMonthName(month.year, month.month)}</Text>
          <Pressable onPress={() => changeMonth(1)} style={{ padding: 8 }}>
            <Text variant="h2" color={colors.accent}>›</Text>
          </Pressable>
        </View>

        {/* Total */}
        {cat && (
          <Animated.View entering={FadeInUp.delay(100)}>
            <Card>
              <Text variant="caption" color={colors.textSecondary}>TOTAL THIS MONTH</Text>
              <AmountDisplay amount={cat.total} variant="displayMedium" type="expense" />
              <Text variant="bodySm" color={colors.textTertiary}>
                {cat.transaction_count} transactions
              </Text>

              {/* Necessity Split */}
              <View style={styles.necessitySplit}>
                {[
                  { label: 'Necessary', amount: cat.necessary, nc: NECESSITY_COLORS.necessary },
                  { label: 'Unnecessary', amount: cat.unnecessary, nc: NECESSITY_COLORS.unnecessary },
                  { label: 'Debatable', amount: cat.debatable, nc: NECESSITY_COLORS.debatable },
                ].map((item) => item.amount > 0 && (
                  <View key={item.label} style={styles.necessityItem}>
                    <View style={[styles.necessityDot, { backgroundColor: item.nc.color }]} />
                    <Text variant="bodySm" color={colors.textSecondary}>{item.label}</Text>
                    <Text variant="amount" color={item.nc.color}>{formatCurrency(item.amount)}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Transactions */}
        <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
          TRANSACTIONS
        </Text>
        {isLoading ? (
          <View style={{ gap: 8 }}>{[1, 2, 3].map((i) => <Skeleton key={i} height={50} />)}</View>
        ) : transactions.length === 0 ? (
          <Card>
            <Text variant="body" color={colors.textTertiary} align="center" style={{ padding: 24 }}>
              No transactions this month
            </Text>
          </Card>
        ) : (
          <Card padding="sm">
            {transactions.map((txn, index) => {
              const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
              const isLast = index === transactions.length - 1;
              return (
                <Pressable
                  key={txn.id}
                  onPress={() => router.push(`/transactions/${txn.id}`)}
                  style={[
                    styles.txnRow,
                    !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" numberOfLines={1}>{txn.note || txn.subcategory?.name || 'Transaction'}</Text>
                    <Text variant="bodySm" color={colors.textTertiary}>{getRelativeDate(txn.transaction_date)}</Text>
                  </View>
                  <Text variant="amount" color={typeColor.color}>
                    {typeColor.prefix}{formatCurrency(txn.amount)}
                  </Text>
                </Pressable>
              );
            })}
          </Card>
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
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  content: { paddingHorizontal: spacing.lg, gap: 12 },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  necessitySplit: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.06)', gap: 8 },
  necessityItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  necessityDot: { width: 8, height: 8, borderRadius: 4 },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 12 },
});
