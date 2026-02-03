import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Card, AmountDisplay, Badge, Skeleton, SkeletonCard } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getDashboard } from '../../src/api/dashboard';
import { formatCurrency, formatDateShort, getRelativeDate } from '../../src/utils/format';
import { NECESSITY_COLORS, TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { TransactionWithDetails, CategoryBreakdownItem } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';

export default function DashboardScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Skeleton width={150} height={20} />
            <Skeleton width={100} height={14} />
          </View>
          <SkeletonCard />
          <View style={styles.row}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
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
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.header}>
          <Text variant="h1">Money Manager</Text>
          <Text variant="bodySm" color={colors.textSecondary}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </Animated.View>

        {/* Balance Card */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <LinearGradient
            colors={[colors.accent + '20', colors.accent + '05']}
            style={[styles.balanceCard, { borderColor: colors.border }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text variant="caption" color={colors.textSecondary}>TOTAL BALANCE</Text>
            <AmountDisplay
              amount={data?.balance ?? 0}
              variant="displayLarge"
              type={data && data.balance >= 0 ? 'neutral' : 'expense'}
            />
          </LinearGradient>
        </Animated.View>

        {/* Budget Mode Banner */}
        {data?.budget_mode?.active && (
          <Animated.View entering={FadeInUp.delay(200)}>
            <Card style={[styles.budgetBanner, { backgroundColor: colors.expenseMuted, borderColor: colors.expense + '30' }]}>
              <View style={styles.budgetDot} />
              <View style={{ flex: 1 }}>
                <Text variant="label" color={colors.expense}>Budget Mode Active</Text>
                <Text variant="bodySm" color={colors.textSecondary}>
                  {formatCurrency(data.budget_mode.today_remaining)} remaining today
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Today + Month Summary */}
        <Animated.View entering={FadeInUp.delay(250)} style={styles.row}>
          <Card style={styles.summaryCard}>
            <Text variant="caption" color={colors.textSecondary}>TODAY</Text>
            <AmountDisplay amount={data?.today_expense ?? 0} variant="amountLarge" type="expense" />
            <View style={styles.summaryRow}>
              <Text variant="bodySm" color={colors.income}>+{formatCurrency(data?.today_income ?? 0)}</Text>
            </View>
          </Card>
          <Card style={styles.summaryCard}>
            <Text variant="caption" color={colors.textSecondary}>THIS MONTH</Text>
            <AmountDisplay amount={data?.month_expense ?? 0} variant="amountLarge" type="expense" />
            <View style={styles.summaryRow}>
              <Text variant="bodySm" color={colors.income}>+{formatCurrency(data?.month_income ?? 0)}</Text>
            </View>
          </Card>
        </Animated.View>

        {/* Necessity Breakdown */}
        {data && (data.month_necessary > 0 || data.month_unnecessary > 0 || data.month_debatable > 0) && (
          <Animated.View entering={FadeInUp.delay(300)}>
            <Card>
              <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
                SPENDING BREAKDOWN
              </Text>
              <View style={styles.necessityRow}>
                <NecessityBar
                  label="Necessary"
                  amount={data.month_necessary}
                  total={data.month_expense}
                  color={NECESSITY_COLORS.necessary.color}
                  bg={NECESSITY_COLORS.necessary.bg}
                />
                <NecessityBar
                  label="Unnecessary"
                  amount={data.month_unnecessary}
                  total={data.month_expense}
                  color={NECESSITY_COLORS.unnecessary.color}
                  bg={NECESSITY_COLORS.unnecessary.bg}
                />
                <NecessityBar
                  label="Debatable"
                  amount={data.month_debatable}
                  total={data.month_expense}
                  color={NECESSITY_COLORS.debatable.color}
                  bg={NECESSITY_COLORS.debatable.bg}
                />
              </View>
            </Card>
          </Animated.View>
        )}

        {/* Category Breakdown */}
        {data?.category_breakdown && data.category_breakdown.length > 0 && (
          <Animated.View entering={FadeInUp.delay(350)}>
            <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 8, marginLeft: 4 }}>
              TOP CATEGORIES
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {data.category_breakdown.slice(0, 8).map((cat: CategoryBreakdownItem) => (
                <Pressable
                  key={cat.category_id}
                  onPress={() => router.push(`/categories/${cat.category_id}`)}
                  style={({ pressed }) => [
                    styles.categoryPill,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}
                >
                  <CategoryIcon icon={cat.category_icon} size={20} color={colors.textPrimary} />
                  <Text variant="bodySm" numberOfLines={1}>{cat.category_name}</Text>
                  <Text variant="amount" color={colors.expense}>{formatCurrency(cat.total)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Recent Transactions */}
        <Animated.View entering={FadeInUp.delay(400)}>
          <View style={styles.sectionHeader}>
            <Text variant="caption" color={colors.textSecondary}>RECENT TRANSACTIONS</Text>
            <Pressable onPress={() => router.push('/transactions')}>
              <Text variant="label" color={colors.accent}>See All</Text>
            </Pressable>
          </View>
          <Card padding="sm">
            {data?.recent_transactions?.length === 0 && (
              <View style={styles.emptyState}>
                <Text variant="body" color={colors.textTertiary} align="center">
                  No transactions yet
                </Text>
              </View>
            )}
            {data?.recent_transactions?.slice(0, 10).map((txn: TransactionWithDetails, index: number) => (
              <TransactionRow key={txn.id} transaction={txn} isLast={index === (data.recent_transactions.length - 1)} />
            ))}
          </Card>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function NecessityBar({ label, amount, total, color, bg }: {
  label: string; amount: number; total: number; color: string; bg: string;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <View style={styles.necessityItem}>
      <View style={styles.necessityHeader}>
        <Text variant="bodySm" color={color}>{label}</Text>
        <Text variant="amount" color={color}>{formatCurrency(amount)}</Text>
      </View>
      <View style={[styles.necessityBarBg, { backgroundColor: bg }]}>
        <View style={[styles.necessityBarFill, { backgroundColor: color, width: `${Math.min(pct, 100)}%` }]} />
      </View>
    </View>
  );
}

function TransactionRow({ transaction: txn, isLast }: { transaction: TransactionWithDetails; isLast: boolean }) {
  const colors = useThemeColors();
  const router = useRouter();
  const typeColor = TRANSACTION_TYPE_COLORS[txn.type];

  return (
    <Pressable
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
      <View style={styles.txnDetails}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {txn.note || txn.category?.name || 'Transaction'}
        </Text>
        <Text variant="bodySm" color={colors.textTertiary} numberOfLines={1}>
          {txn.category?.name}{txn.subcategory ? ` · ${txn.subcategory.name}` : ''} · {getRelativeDate(txn.transaction_date)}
        </Text>
      </View>
      <View style={styles.txnAmount}>
        <Text variant="amount" color={typeColor.color}>
          {typeColor.prefix}{formatCurrency(txn.amount)}
        </Text>
        {txn.necessity && (
          <Badge
            label={txn.necessity}
            color={NECESSITY_COLORS[txn.necessity].color}
            backgroundColor={NECESSITY_COLORS[txn.necessity].bg}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: 16 },
  header: { paddingTop: 8, paddingBottom: 4 },
  balanceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 8,
  },
  budgetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  row: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, gap: 6 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  necessityRow: { gap: 10 },
  necessityItem: { gap: 4 },
  necessityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  necessityBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  necessityBarFill: { height: '100%', borderRadius: 3 },
  categoryScroll: { gap: 10, paddingRight: 16 },
  categoryPill: {
    alignItems: 'center',
    gap: 4,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    width: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginLeft: 4,
    marginRight: 4,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnDetails: { flex: 1, gap: 2 },
  txnAmount: { alignItems: 'flex-end', gap: 4 },
  emptyState: { padding: 24 },
});
