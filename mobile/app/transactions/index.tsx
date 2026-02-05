import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { Text, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getTransactions } from '../../src/api/transactions';
import { formatCurrency, getRelativeDate } from '../../src/utils/format';
import { TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { haptics } from '../../src/utils/haptics';
import { TransactionWithDetails, TransactionType } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';

const PAGE_SIZE = 20;

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function SearchIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="11" cy="11" r="8" />
      <Path d="M21 21l-4.35-4.35" />
    </Svg>
  );
}

export default function TransactionsListScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['transactions', { type: typeFilter, search }],
    queryFn: ({ pageParam = 0 }) =>
      getTransactions({
        type: typeFilter === 'all' ? undefined : typeFilter,
        search: search || undefined,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((s, p) => s + p.data.length, 0);
      return loaded < lastPage.count ? loaded : undefined;
    },
    initialPageParam: 0,
  });

  const transactions = data?.pages.flatMap((p) => p.data) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;

  const renderItem = useCallback(
    ({ item: txn, index }: { item: TransactionWithDetails; index: number }) => {
      const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
      const isLast = index === transactions.length - 1;
      return (
        <Animated.View entering={FadeInUp.delay(100 + index * 30).springify()}>
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
                {txn.category?.name}{txn.subcategory ? ` · ${txn.subcategory.name}` : ''} · {getRelativeDate(txn.transaction_date)}
              </Text>
            </View>
            <Text variant="amount" color={typeColor.color}>
              {typeColor.prefix}{formatCurrency(txn.amount)}
            </Text>
          </Pressable>
        </Animated.View>
      );
    },
    [colors, router, transactions.length]
  );

  const filterChips: { label: string; value: string; active: boolean; onPress: () => void }[] = [
    { label: 'All', value: 'all', active: typeFilter === 'all', onPress: () => setTypeFilter('all') },
    { label: 'Expenses', value: 'expense', active: typeFilter === 'expense', onPress: () => setTypeFilter('expense') },
    { label: 'Income', value: 'income', active: typeFilter === 'income', onPress: () => setTypeFilter('income') },
  ];

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
        <Text variant="h1">Transactions</Text>
      </Animated.View>

      {/* Search */}
      <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface }]}>
          <SearchIcon color={colors.textTertiary} size={18} />
          <TextInput
            placeholder="Search transactions..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, {
              color: colors.textPrimary,
              fontFamily: 'Inter-Regular',
            }]}
          />
        </View>
      </Animated.View>

      {/* Filter Chips + Count */}
      <Animated.View entering={FadeInDown.delay(150)} style={styles.filterRow}>
        <View style={styles.chipContainer}>
          {filterChips.map((chip) => (
            <Pressable
              key={chip.value}
              onPress={() => { haptics.selection(); chip.onPress(); }}
              style={[
                styles.chip,
                {
                  backgroundColor: chip.active ? colors.accentMuted : colors.surface,
                },
              ]}
            >
              <Text variant="label" color={chip.active ? colors.accent : colors.textSecondary}>
                {chip.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {totalCount > 0 && (
          <Text variant="bodySm" color={colors.textTertiary}>
            {totalCount} total
          </Text>
        )}
      </Animated.View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text variant="h3">All Transactions</Text>
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.skeletonContainer}>
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={60} />)}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text variant="body" color={colors.textTertiary} align="center">
                No transactions found
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}><Skeleton height={40} /></View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
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

  // Search
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },

  // Filters
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: 12,
  },

  // Transaction list
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
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
  txnDetails: {
    flex: 1,
    gap: 2,
  },

  // Empty / loading states
  skeletonContainer: {
    gap: 8,
    padding: 16,
  },
  empty: {
    padding: 48,
  },
  footerLoader: {
    padding: 16,
  },
});
