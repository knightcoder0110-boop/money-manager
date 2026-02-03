import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, Card, AmountDisplay, IconButton, Button, Skeleton } from '../../src/components/ui';
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
      <View style={styles.header}>
        <IconButton icon={<BackIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {data?.event?.name || 'Event'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />
        }
      >
        {isLoading ? (
          <View style={{ gap: 12 }}>
            <Skeleton height={100} />
            <Skeleton height={200} />
          </View>
        ) : data ? (
          <>
            <Animated.View entering={FadeInUp.delay(100)}>
              <Card>
                <Text variant="caption" color={colors.textSecondary}>TOTAL SPENT</Text>
                <AmountDisplay amount={data.total} variant="displayMedium" type="expense" />
                <Text variant="bodySm" color={colors.textSecondary}>
                  {formatDate(data.event.start_date)} — {formatDate(data.event.end_date)}
                </Text>
                {data.event.description && (
                  <Text variant="body" color={colors.textSecondary} style={{ marginTop: 8 }}>
                    {data.event.description}
                  </Text>
                )}
              </Card>
            </Animated.View>

            {/* Category Breakdown */}
            {data.category_breakdown?.length > 0 && (
              <Animated.View entering={FadeInUp.delay(200)}>
                <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginBottom: 8 }}>
                  BREAKDOWN
                </Text>
                {data.category_breakdown.map((cat: any, index: number) => (
                  <Card key={cat.category_name ?? index} style={{ marginBottom: 8 }}>
                    <View style={styles.catRow}>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium">{cat.category_name}</Text>
                      </View>
                      <Text variant="amount" color={colors.expense}>{formatCurrency(cat.amount ?? cat.total ?? 0)}</Text>
                    </View>
                  </Card>
                ))}
              </Animated.View>
            )}

            {/* Transactions */}
            <Animated.View entering={FadeInUp.delay(300)}>
              <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginBottom: 8 }}>
                TRANSACTIONS ({data.transactions?.length || 0})
              </Text>
              <Card padding="sm">
                {data.transactions?.map((txn, index) => {
                  const typeColor = TRANSACTION_TYPE_COLORS[txn.type];
                  const isLast = index === data.transactions.length - 1;
                  return (
                    <Pressable
                      key={txn.id}
                      onPress={() => router.push(`/transactions/${txn.id}`)}
                      style={[
                        styles.txnRow,
                        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={[styles.txnIcon, { backgroundColor: txn.category?.color + '20' }]}>
                        <CategoryIcon icon={txn.category?.icon || 'wallet'} size={16} color={colors.textPrimary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium" numberOfLines={1}>{txn.note || txn.category?.name}</Text>
                        <Text variant="bodySm" color={colors.textTertiary}>{getRelativeDate(txn.transaction_date)}</Text>
                      </View>
                      <Text variant="amount" color={typeColor.color}>
                        {typeColor.prefix}{formatCurrency(txn.amount)}
                      </Text>
                    </Pressable>
                  );
                })}
              </Card>
            </Animated.View>

            <Button title="Delete Event" variant="danger" onPress={handleDelete} fullWidth />
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 8,
  },
  content: { paddingHorizontal: spacing.lg, gap: 16 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  txnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, gap: 12 },
  txnIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
