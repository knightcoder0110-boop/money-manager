import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
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

function PlusIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function CalendarIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 2v4M16 2v4M3 10h18" />
      <Path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5" />
    </Svg>
  );
}

function ChevronRightIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
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
  const activeEvents = events.filter((e) => new Date(e.end_date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.end_date) < new Date());

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
        <Text variant="h1" style={{ flex: 1 }}>Events</Text>
        <Pressable
          onPress={() => { haptics.medium(); router.push('/events/new'); }}
          style={[styles.addButton, { backgroundColor: colors.accent }]}
        >
          <PlusIcon color="#FFFFFF" />
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
            {[1, 2, 3].map((i) => <Skeleton key={i} height={100} />)}
          </View>
        ) : events.length === 0 ? (
          <Animated.View entering={FadeInUp.delay(100)} style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface }]}>
              <CalendarIcon color={colors.textTertiary} size={32} />
            </View>
            <Text variant="h3" color={colors.textSecondary} align="center">
              No Events Yet
            </Text>
            <Text variant="bodySm" color={colors.textTertiary} align="center">
              Create an event to track trip or occasion expenses
            </Text>
          </Animated.View>
        ) : (
          <>
            {/* Active Events */}
            {activeEvents.length > 0 && (
              <Animated.View entering={FadeInUp.delay(100)}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3">Active</Text>
                  <View style={[styles.countBadge, { backgroundColor: colors.incomeMuted }]}>
                    <Text variant="caption" color={colors.income} style={{ fontSize: 10 }}>
                      {activeEvents.length}
                    </Text>
                  </View>
                </View>
                {activeEvents.map((event: EventWithDetails, index: number) => (
                  <Animated.View key={event.id} entering={FadeInUp.delay(150 + index * 60)}>
                    <Pressable
                      onPress={() => router.push(`/events/${event.id}`)}
                      style={({ pressed }) => [
                        styles.eventRow,
                        !index && { borderTopWidth: 0 },
                        index < activeEvents.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        pressed && { backgroundColor: colors.surfacePressed },
                      ]}
                    >
                      <View style={[styles.eventIcon, { backgroundColor: colors.featureTransfer + '25' }]}>
                        <CalendarIcon color={colors.featureTransfer} size={22} />
                      </View>
                      <View style={styles.eventDetails}>
                        <View style={styles.eventNameRow}>
                          <Text variant="bodyMedium" numberOfLines={1} style={{ flex: 1 }}>
                            {event.name}
                          </Text>
                          <View style={[styles.activeBadge, { backgroundColor: colors.incomeMuted }]}>
                            <Text variant="caption" color={colors.income} style={{ fontSize: 9, textTransform: 'none' }}>Active</Text>
                          </View>
                        </View>
                        <Text variant="bodySm" color={colors.textTertiary}>
                          {formatDate(event.start_date)} — {formatDate(event.end_date)}
                        </Text>
                        <View style={styles.eventStatsRow}>
                          <Text variant="amount" color={colors.expense}>
                            {formatCurrency(event.total_spent)}
                          </Text>
                          <Text variant="bodySm" color={colors.textTertiary}>
                            · {event.transaction_count} txns
                          </Text>
                        </View>
                      </View>
                      <ChevronRightIcon color={colors.textTertiary} />
                    </Pressable>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <Animated.View entering={FadeInUp.delay(250)}>
                <View style={styles.sectionHeader}>
                  <Text variant="h3">Past</Text>
                  <Text variant="bodySm" color={colors.textTertiary}>{pastEvents.length} events</Text>
                </View>
                {pastEvents.map((event: EventWithDetails, index: number) => (
                  <Animated.View key={event.id} entering={FadeInUp.delay(300 + index * 60)}>
                    <Pressable
                      onPress={() => router.push(`/events/${event.id}`)}
                      style={({ pressed }) => [
                        styles.eventRow,
                        { opacity: 0.7 },
                        index < pastEvents.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                        pressed && { backgroundColor: colors.surfacePressed, opacity: 1 },
                      ]}
                    >
                      <View style={[styles.eventIcon, { backgroundColor: colors.textTertiary + '15' }]}>
                        <CalendarIcon color={colors.textTertiary} size={22} />
                      </View>
                      <View style={styles.eventDetails}>
                        <Text variant="bodyMedium" numberOfLines={1}>{event.name}</Text>
                        <Text variant="bodySm" color={colors.textTertiary}>
                          {formatDate(event.start_date)} — {formatDate(event.end_date)}
                        </Text>
                        <View style={styles.eventStatsRow}>
                          <Text variant="amount" color={colors.expense}>
                            {formatCurrency(event.total_spent)}
                          </Text>
                          <Text variant="bodySm" color={colors.textTertiary}>
                            · {event.transaction_count} txns
                          </Text>
                        </View>
                      </View>
                      <ChevronRightIcon color={colors.textTertiary} />
                    </Pressable>
                  </Animated.View>
                ))}
              </Animated.View>
            )}
          </>
        )}
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.lg, gap: 20, paddingTop: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDetails: {
    flex: 1,
    gap: 2,
  },
  eventNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
