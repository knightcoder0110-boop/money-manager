import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { getEvent, deleteEvent } from '../../src/api/events';
import { formatCurrency, formatDate, getRelativeDate } from '../../src/utils/format';
import { TRANSACTION_TYPE_COLORS } from '../../src/constants';
import { haptics } from '../../src/utils/haptics';
import { CategoryIcon } from '../../src/components/icons/category-icon';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function TrashIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

export default function EventDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEvent(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id!),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Event', 'This will not delete the transactions, just the event grouping.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
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
        <Text variant="h1" numberOfLines={1} style={{ flex: 1 }}>
          {data?.event?.name || 'Event'}
        </Text>
        <Pressable
          onPress={handleDelete}
          style={[styles.deleteButton, { backgroundColor: colors.dangerMuted }]}
        >
          <TrashIcon color={colors.danger} />
        </Pressable>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />
        }
      >
        {isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={140} />
            <Skeleton height={200} />
          </View>
        ) : data ? (
          <>
            {/* Hero Card */}
            <Animated.View entering={FadeInUp.delay(100).springify()}>
              <LinearGradient
                colors={[colors.surfaceElevated, colors.surface]}
                style={[styles.heroCard, { borderColor: colors.border }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text variant="caption" color={colors.textSecondary}>TOTAL SPENT</Text>
                <Text variant="displayLarge" color={colors.expense} style={{ letterSpacing: -1 }}>
                  {formatCurrency(data.total)}
                </Text>
                <View style={styles.heroMeta}>
                  <Text variant="bodySm" color={colors.textTertiary}>
                    {formatDate(data.event.start_date)} — {formatDate(data.event.end_date)}
                  </Text>
                  <Text variant="bodySm" color={colors.textTertiary}>
                    {data.transactions?.length || 0} transactions
                  </Text>
                </View>
                {data.event.description && (
                  <Text variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>
                    {data.event.description}
                  </Text>
                )}
              </LinearGradient>
            </Animated.View>

            {/* Category Breakdown */}
            {data.category_breakdown?.length > 0 && (
              <Animated.View entering={FadeInUp.delay(200)}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3">Breakdown</Text>
                </View>
                {data.category_breakdown.map((cat: any, index: number) => {
                  const total = data.total || 1;
                  const pct = ((cat.amount ?? cat.total ?? 0) / total) * 100;
                  const isLast = index === data.category_breakdown.length - 1;
                  return (
                    <View
                      key={cat.category_name ?? index}
                      style={[
                        styles.breakdownRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={[styles.breakdownIcon, { backgroundColor: (cat.category_color || colors.accent) + '20' }]}>
                        <CategoryIcon icon={cat.category_icon || 'wallet'} size={18} color={cat.category_color || colors.textPrimary} />
                      </View>
                      <View style={styles.breakdownDetails}>
                        <View style={styles.breakdownNameRow}>
                          <Text variant="bodyMedium" style={{ flex: 1 }}>{cat.category_name}</Text>
                          <Text variant="amount" color={colors.expense}>
                            {formatCurrency(cat.amount ?? cat.total ?? 0)}
                          </Text>
                        </View>
                        <View style={[styles.breakdownBarBg, { backgroundColor: colors.surfacePressed }]}>
                          <View style={[styles.breakdownBarFill, {
                            width: `${pct}%`,
                            backgroundColor: cat.category_color || colors.accent,
                          }]} />
                        </View>
                      </View>
                      <Text variant="caption" color={colors.textTertiary} style={{ minWidth: 32, textAlign: 'right' }}>
                        {pct.toFixed(0)}%
                      </Text>
                    </View>
                  );
                })}
              </Animated.View>
            )}

            {/* Transactions */}
            {data.transactions?.length > 0 && (
              <Animated.View entering={FadeInUp.delay(300)}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3">Transactions</Text>
                  <Text variant="bodySm" color={colors.textTertiary}>{data.transactions.length}</Text>
                </View>
                {data.transactions.map((txn: any, index: number) => {
                  const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
                  const isLast = index === data.transactions.length - 1;
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
                      <View style={[styles.txnIcon, { backgroundColor: txn.category?.color ? txn.category.color + '25' : colors.surfaceElevated }]}>
                        <CategoryIcon icon={txn.category?.icon || 'wallet'} size={20} color={txn.category?.color || colors.textPrimary} />
                      </View>
                      <View style={styles.txnDetails}>
                        <Text variant="bodyMedium" numberOfLines={1}>{txn.note || txn.category?.name}</Text>
                        <Text variant="bodySm" color={colors.textTertiary}>{getRelativeDate(txn.transaction_date)}</Text>
                      </View>
                      <Text variant="amount" color={typeColor.color}>
                        {typeColor.prefix}{formatCurrency(txn.amount)}
                      </Text>
                    </Pressable>
                  );
                })}
              </Animated.View>
            )}
          </>
        ) : null}
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
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.lg, gap: 20, paddingTop: 8 },

  // Hero
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 6,
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  // Category breakdown
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownDetails: {
    flex: 1,
    gap: 6,
  },
  breakdownNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 2,
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
  txnDetails: {
    flex: 1,
    gap: 2,
  },
});
