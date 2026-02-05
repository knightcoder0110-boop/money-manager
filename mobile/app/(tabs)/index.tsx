import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, AmountDisplay, Skeleton, SkeletonCard } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getDashboard } from '../../src/api/dashboard';
import { formatCurrency } from '../../src/utils/format';
import { TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { TransactionWithDetails } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';

// Icons
function BellIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Svg>
  );
}

function ExchangeIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 3l4 4-4 4" />
      <Path d="M20 7H4" />
      <Path d="M8 21l-4-4 4-4" />
      <Path d="M4 17h16" />
    </Svg>
  );
}

function BillsIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Path d="M14 2v6h6" />
      <Path d="M16 13H8" />
      <Path d="M16 17H8" />
      <Path d="M10 9H8" />
    </Svg>
  );
}

function TransferIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M22 2L11 13" />
      <Path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </Svg>
  );
}

function WalletIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </Svg>
  );
}

function MoreDotsIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <Path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <Path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    </Svg>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const FEATURES = [
  { key: 'exchange', label: 'Exchange', icon: ExchangeIcon, colorKey: 'featureExchange' as const },
  { key: 'bills', label: 'Bills', icon: BillsIcon, colorKey: 'featureBills' as const },
  { key: 'transfer', label: 'Transfer', icon: TransferIcon, colorKey: 'featureTransfer' as const },
  { key: 'wallet', label: 'Categories', icon: WalletIcon, colorKey: 'featureLoans' as const },
  { key: 'more', label: 'More', icon: MoreDotsIcon, colorKey: 'featureMore' as const },
];

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
          <View style={styles.headerRow}>
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
          <Pressable style={[styles.bellButton, { backgroundColor: colors.surface }]}>
            <BellIcon color={colors.textSecondary} size={22} />
          </Pressable>
        </Animated.View>

        {/* Balance Card */}
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <LinearGradient
            colors={[colors.surfaceElevated, colors.surface]}
            style={[styles.balanceCard, { borderColor: colors.border }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <View>
                <Text variant="displayLarge" style={{ letterSpacing: -1 }}>
                  {formatCurrency(data?.balance ?? 0)}
                </Text>
              </View>
              <View style={[styles.cardChip, { backgroundColor: colors.expense }]} />
            </View>
            <View style={styles.cardDetails}>
              <Text variant="body" color={colors.textSecondary} style={{ letterSpacing: 2 }}>
                4208 •••• •••• 0210
              </Text>
              <Text variant="label" color={colors.textSecondary}>MONEY MANAGER</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Features Grid */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Features</Text>
            <Pressable onPress={() => router.push('/more')}>
              <Text variant="label" color={colors.accent}>View All</Text>
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.featuresScroll}
          >
            {FEATURES.map((feature) => (
              <Pressable
                key={feature.key}
                onPress={() => {
                  if (feature.key === 'wallet') router.push('/categories');
                  else if (feature.key === 'more') router.push('/more');
                }}
                style={({ pressed }) => [
                  styles.featureItem,
                  pressed && { transform: [{ scale: 0.95 }] },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: (colors as any)[feature.colorKey] }]}>
                  <feature.icon color="#FFFFFF" size={24} />
                </View>
                <Text variant="bodySm" color={colors.textSecondary}>{feature.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View entering={FadeInUp.delay(250)} style={styles.row}>
          <Card style={styles.statCard}>
            <Text variant="caption" color={colors.textSecondary}>TODAY</Text>
            <AmountDisplay amount={data?.today_expense ?? 0} variant="amountLarge" type="expense" />
            <Text variant="bodySm" color={colors.income}>+{formatCurrency(data?.today_income ?? 0)}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text variant="caption" color={colors.textSecondary}>THIS MONTH</Text>
            <AmountDisplay amount={data?.month_expense ?? 0} variant="amountLarge" type="expense" />
            <Text variant="bodySm" color={colors.income}>+{formatCurrency(data?.month_income ?? 0)}</Text>
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
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Balance Card
  balanceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 24,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardChip: {
    width: 40,
    height: 28,
    borderRadius: 6,
  },
  cardDetails: {
    gap: 4,
  },

  // Features
  featuresScroll: {
    gap: 20,
    paddingRight: 16,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Stats
  row: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, gap: 6 },

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
