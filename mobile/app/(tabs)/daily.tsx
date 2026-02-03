import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInUp, SlideInLeft, SlideInRight } from 'react-native-reanimated';
import { Text, Card, AmountDisplay, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getTransactions } from '../../src/api/transactions';
import { formatCurrency, formatDate, getToday } from '../../src/utils/format';
import { NECESSITY_COLORS, TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { haptics } from '../../src/utils/haptics';
import { TransactionWithDetails } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';

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

  const changeDay = (delta: number) => {
    haptics.selection();
    setCurrentDate((d) => addDays(d, delta));
  };

  const isToday = currentDate === getToday();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />
        }
      >
        <Text variant="h1" style={{ paddingTop: 8 }}>Daily View</Text>

        {/* Date Navigator */}
        <View style={styles.dateNav}>
          <Pressable onPress={() => changeDay(-1)} style={styles.dateArrow}>
            <Text variant="h2" color={colors.accent}>‹</Text>
          </Pressable>
          <View style={styles.dateCenter}>
            <Text variant="h3">{formatDate(currentDate)}</Text>
            {isToday && (
              <View style={[styles.todayBadge, { backgroundColor: colors.accentMuted }]}>
                <Text variant="caption" color={colors.accent} style={{ fontSize: 10 }}>TODAY</Text>
              </View>
            )}
          </View>
          <Pressable onPress={() => changeDay(1)} style={styles.dateArrow}>
            <Text variant="h2" color={colors.accent}>›</Text>
          </Pressable>
        </View>

        {/* Day Summary */}
        <Card>
          <View style={styles.daySummary}>
            <View style={styles.dayStatColumn}>
              <Text variant="caption" color={colors.textSecondary}>SPENT</Text>
              <AmountDisplay amount={totalExpense} variant="amountLarge" type="expense" />
            </View>
            {totalIncome > 0 && (
              <View style={styles.dayStatColumn}>
                <Text variant="caption" color={colors.textSecondary}>EARNED</Text>
                <AmountDisplay amount={totalIncome} variant="amountLarge" type="income" />
              </View>
            )}
          </View>
          {totalExpense > 0 && (
            <View style={styles.necessitySummary}>
              <View style={styles.necessityDot}>
                <View style={[styles.dot, { backgroundColor: colors.necessary }]} />
                <Text variant="bodySm" color={colors.textSecondary}>
                  {formatCurrency(necessaryTotal)}
                </Text>
              </View>
              <View style={styles.necessityDot}>
                <View style={[styles.dot, { backgroundColor: colors.unnecessary }]} />
                <Text variant="bodySm" color={colors.textSecondary}>
                  {formatCurrency(unnecessaryTotal)}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Transactions */}
        {isLoading ? (
          <View style={{ gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <Card key={i}><Skeleton height={40} /></Card>
            ))}
          </View>
        ) : transactions.length === 0 ? (
          <Card>
            <Text variant="body" color={colors.textTertiary} align="center" style={{ padding: 32 }}>
              No transactions on this day
            </Text>
          </Card>
        ) : (
          <Animated.View entering={FadeInUp.delay(100)}>
            <Card padding="sm">
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
                    <View style={[styles.txnIcon, { backgroundColor: txn.category?.color + '20' }]}>
                      <CategoryIcon icon={txn.category?.icon || 'wallet'} size={18} color={colors.textPrimary} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {txn.note || txn.category?.name}
                      </Text>
                      <Text variant="bodySm" color={colors.textTertiary}>
                        {txn.category?.name}{txn.subcategory ? ` · ${txn.subcategory.name}` : ''}
                      </Text>
                    </View>
                    <Text variant="amount" color={typeColor.color}>
                      {typeColor.prefix}{formatCurrency(txn.amount)}
                    </Text>
                  </Pressable>
                );
              })}
            </Card>
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
  content: { paddingHorizontal: spacing.lg, gap: 16 },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  dateArrow: { padding: 8 },
  dateCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  todayBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  daySummary: { flexDirection: 'row', gap: 24 },
  dayStatColumn: { gap: 4 },
  necessitySummary: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.06)' },
  necessityDot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 12 },
  txnIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
