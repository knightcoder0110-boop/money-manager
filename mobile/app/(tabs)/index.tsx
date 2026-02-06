import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, AmountDisplay, Skeleton, SkeletonCard, FAB } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getDashboard } from '../../src/api/dashboard';
import { formatCurrency } from '../../src/utils/format';
import { TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { TransactionWithDetails } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';
import { QuickAddSheet } from '../../src/components/QuickAddSheet';

// Icons
function SettingsIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <Path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
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
  const [quickAddVisible, setQuickAddVisible] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });

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
          <Pressable
            onPress={() => router.push('/settings')}
            style={[styles.settingsButton, { backgroundColor: colors.surface }]}
          >
            <SettingsIcon color={colors.textSecondary} size={22} />
          </Pressable>
        </Animated.View>

        {/* Balance Hero */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <View style={[styles.balanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text variant="caption" color={colors.textSecondary}>CURRENT BALANCE</Text>
            <Text
              variant="displayLarge"
              color={(data?.balance ?? 0) >= 0 ? colors.income : colors.expense}
              style={{ letterSpacing: -1, marginTop: 4 }}
            >
              {formatCurrency(data?.balance ?? 0)}
            </Text>
            {/* Monthly Net Change */}
            <View style={styles.monthTrend}>
              {(() => {
                const monthNet = (data?.month_income ?? 0) - (data?.month_expense ?? 0);
                const isPositive = monthNet >= 0;
                return (
                  <>
                    <Text variant="bodySm" color={isPositive ? colors.income : colors.expense}>
                      {isPositive ? '+' : ''}{formatCurrency(monthNet)}
                    </Text>
                    <Text variant="bodySm" color={colors.textTertiary}> this month</Text>
                  </>
                );
              })()}
            </View>
          </View>
        </Animated.View>

        {/* Today's Status */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Card style={styles.todayCard}>
            <View style={styles.todayHeader}>
              <Text variant="caption" color={colors.textSecondary}>TODAY</Text>
              {data?.budget_mode?.active && (
                <View style={[styles.budgetBadge, { backgroundColor: colors.accentMuted }]}>
                  <Text variant="caption" color={colors.accent}>BUDGET MODE</Text>
                </View>
              )}
            </View>
            <View style={styles.todayRow}>
              <View style={{ flex: 1 }}>
                <AmountDisplay amount={data?.today_expense ?? 0} variant="amountLarge" type="expense" />
                {(data?.today_income ?? 0) > 0 && (
                  <Text variant="bodySm" color={colors.income}>+{formatCurrency(data?.today_income ?? 0)} income</Text>
                )}
              </View>
              {data?.budget_mode?.active && (
                <View style={styles.budgetRemaining}>
                  <Text variant="caption" color={colors.textTertiary}>REMAINING</Text>
                  <Text
                    variant="h3"
                    color={(data?.budget_mode?.today_remaining ?? 0) >= 0 ? colors.income : colors.expense}
                  >
                    {formatCurrency(data?.budget_mode?.today_remaining ?? 0)}
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Monthly Necessity Split */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <Card style={styles.necessityCard}>
            <Text variant="caption" color={colors.textSecondary}>THIS MONTH - NECESSITY SPLIT</Text>
            <View style={styles.necessityBar}>
              {(() => {
                const necessary = data?.month_necessary ?? 0;
                const unnecessary = data?.month_unnecessary ?? 0;
                const debatable = data?.month_debatable ?? 0;
                const total = necessary + unnecessary + debatable;
                if (total === 0) return <View style={[styles.necessitySegment, { flex: 1, backgroundColor: colors.border }]} />;
                return (
                  <>
                    {necessary > 0 && (
                      <View style={[styles.necessitySegment, { flex: necessary, backgroundColor: colors.income }]} />
                    )}
                    {debatable > 0 && (
                      <View style={[styles.necessitySegment, { flex: debatable, backgroundColor: colors.accent }]} />
                    )}
                    {unnecessary > 0 && (
                      <View style={[styles.necessitySegment, { flex: unnecessary, backgroundColor: colors.expense }]} />
                    )}
                  </>
                );
              })()}
            </View>
            <View style={styles.necessityLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
                <Text variant="bodySm" color={colors.textSecondary}>
                  {formatCurrency(data?.month_necessary ?? 0)}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
                <Text variant="bodySm" color={colors.textSecondary}>
                  {formatCurrency(data?.month_debatable ?? 0)}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.expense }]} />
                <Text variant="bodySm" color={colors.textSecondary}>
                  {formatCurrency(data?.month_unnecessary ?? 0)}
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Recent Transactions</Text>
            <Pressable onPress={() => router.push('/transactions')}>
              <Text variant="label" color={colors.accent}>View All</Text>
            </Pressable>
          </View>
          <View>
            {data?.recent_transactions?.length === 0 && (
              <View style={styles.emptyState}>
                <Text variant="body" color={colors.textTertiary} align="center">
                  No transactions yet
                </Text>
              </View>
            )}
            {data?.recent_transactions?.slice(0, 8).map((txn: TransactionWithDetails, index: number) => (
              <TransactionRow key={txn.id} transaction={txn} isLast={index === Math.min((data.recent_transactions?.length ?? 1) - 1, 7)} />
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quick Add FAB */}
      <FAB onPress={() => setQuickAddVisible(true)} />

      {/* Quick Add Sheet */}
      <QuickAddSheet
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
      />
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
    year: 'numeric',
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
  content: { paddingHorizontal: spacing.lg, gap: 20 },
  
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

  // Balance Hero
  balanceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  monthTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  // Today's Status
  todayCard: {
    gap: 12,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  budgetRemaining: {
    alignItems: 'flex-end',
  },

  // Necessity Split
  necessityCard: {
    gap: 12,
  },
  necessityBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  necessitySegment: {
    height: '100%',
    borderRadius: 4,
  },
  necessityLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  emptyState: { padding: 24 },
});
