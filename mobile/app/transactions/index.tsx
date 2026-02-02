import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, Badge, Skeleton, IconButton } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getTransactions } from '../../src/api/transactions';
import { formatCurrency, getRelativeDate } from '../../src/utils/format';
import { NECESSITY_COLORS, TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { haptics } from '../../src/utils/haptics';
import { TransactionWithDetails, TransactionType, Necessity } from '../../src/types';

const PAGE_SIZE = 20;

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

export default function TransactionsListScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [necessityFilter, setNecessityFilter] = useState<Necessity | 'all'>('all');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['transactions', { type: typeFilter, necessity: necessityFilter, search }],
    queryFn: ({ pageParam = 0 }) =>
      getTransactions({
        type: typeFilter === 'all' ? undefined : typeFilter,
        necessity: necessityFilter === 'all' ? undefined : necessityFilter,
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

  const renderItem = useCallback(
    ({ item: txn, index }: { item: TransactionWithDetails; index: number }) => {
      const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
      return (
        <Pressable
          onPress={() => router.push(`/transactions/${txn.id}`)}
          style={({ pressed }) => [
            styles.txnRow,
            { borderBottomColor: colors.border },
            pressed && { backgroundColor: colors.surfacePressed },
          ]}
        >
          <View style={[styles.txnIcon, { backgroundColor: txn.category?.color + '20' }]}>
            <Text style={{ fontSize: 18 }}>{txn.category?.icon || '💰'}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="bodyMedium" numberOfLines={1}>
              {txn.note || txn.category?.name || 'Transaction'}
            </Text>
            <Text variant="bodySm" color={colors.textTertiary} numberOfLines={1}>
              {txn.category?.name}{txn.subcategory ? ` · ${txn.subcategory.name}` : ''} · {getRelativeDate(txn.transaction_date)}
            </Text>
          </View>
          <View style={styles.txnAmountCol}>
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
    },
    [colors, router]
  );

  const filterChips: { label: string; value: string; active: boolean; onPress: () => void }[] = [
    { label: 'All', value: 'all', active: typeFilter === 'all', onPress: () => setTypeFilter('all') },
    { label: 'Expenses', value: 'expense', active: typeFilter === 'expense', onPress: () => setTypeFilter('expense') },
    { label: 'Income', value: 'income', active: typeFilter === 'income', onPress: () => setTypeFilter('income') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={<BackIcon color={colors.textPrimary} />}
          onPress={() => router.back()}
          variant="filled"
        />
        <Text variant="h2">Transactions</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search transactions..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            fontFamily: 'Inter-Regular',
          }]}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.chipContainer}>
        {filterChips.map((chip) => (
          <Pressable
            key={chip.value}
            onPress={() => { haptics.selection(); chip.onPress(); }}
            style={[
              styles.chip,
              {
                backgroundColor: chip.active ? colors.accentMuted : colors.surface,
                borderColor: chip.active ? colors.accent : colors.border,
              },
            ]}
          >
            <Text variant="label" color={chip.active ? colors.accent : colors.textSecondary}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
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
            <View style={{ gap: 8, padding: 16 }}>
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
            <View style={{ padding: 16 }}><Skeleton height={40} /></View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  searchContainer: { paddingHorizontal: spacing.lg, marginBottom: 8 },
  searchInput: {
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnAmountCol: { alignItems: 'flex-end', gap: 4 },
  empty: { padding: 48 },
});
