import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, Card, Button, IconButton, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getEvents } from '../../src/api/events';
import { formatCurrency, formatDate } from '../../src/utils/format';
import { haptics } from '../../src/utils/haptics';
import { EventWithDetails } from '../../src/types';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

export default function EventsScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { data: rawEvents, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const events = Array.isArray(rawEvents) ? rawEvents : [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon={<BackIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2">Events</Text>
        <Button title="New" size="sm" onPress={() => router.push('/events/new')} />
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
            {[1, 2, 3].map((i) => <Skeleton key={i} height={100} />)}
          </View>
        ) : events.length === 0 ? (
          <Card>
            <Text variant="body" color={colors.textTertiary} align="center" style={{ padding: 32 }}>
              No events yet. Create one to start tracking trip expenses.
            </Text>
          </Card>
        ) : (
          events.map((event: EventWithDetails, index: number) => {
            const now = new Date();
            const endDate = new Date(event.end_date);
            const isActive = endDate >= now;

            return (
              <Animated.View key={event.id} entering={FadeInUp.delay(index * 80)}>
                <Card
                  onPress={() => router.push(`/events/${event.id}`)}
                  style={!isActive ? { opacity: 0.6 } : undefined}
                >
                  <View style={styles.eventHeader}>
                    <Text variant="h3">{event.name}</Text>
                    {isActive && (
                      <View style={[styles.activeBadge, { backgroundColor: colors.incomeMuted }]}>
                        <Text variant="caption" color={colors.income} style={{ fontSize: 10 }}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text variant="bodySm" color={colors.textSecondary}>
                    {formatDate(event.start_date)} — {formatDate(event.end_date)}
                  </Text>
                  <View style={styles.eventStats}>
                    <Text variant="amount" color={colors.expense}>
                      {formatCurrency(event.total_spent)} spent
                    </Text>
                    <Text variant="bodySm" color={colors.textTertiary}>
                      {event.transaction_count} transactions
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            );
          })
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
  content: { paddingHorizontal: spacing.lg, gap: 12 },
  eventHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  eventStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
});
