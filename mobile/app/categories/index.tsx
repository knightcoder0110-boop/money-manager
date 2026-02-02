import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text, Card, IconButton, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getCategories } from '../../src/api/categories';
import { haptics } from '../../src/utils/haptics';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

export default function CategoriesScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { data: categories, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(true),
  });

  const expenseCategories = categories?.filter((c) => !c.is_income) ?? [];
  const incomeCategories = categories?.filter((c) => c.is_income) ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon={<BackIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2">Categories</Text>
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
          <View style={{ gap: 8 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={60} />)}
          </View>
        ) : (
          <>
            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
              EXPENSE CATEGORIES ({expenseCategories.length})
            </Text>
            {expenseCategories.map((cat, index) => (
              <Animated.View key={cat.id} entering={FadeInUp.delay(index * 40)}>
                <Card onPress={() => router.push(`/categories/${cat.id}`)}>
                  <View style={styles.catRow}>
                    <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                      <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{cat.name}</Text>
                      <Text variant="bodySm" color={colors.textTertiary}>
                        {cat.subcategories?.length || 0} subcategories
                        {cat.is_essential ? ' · Essential' : ''}
                      </Text>
                    </View>
                    <Text variant="bodySm" color={colors.textTertiary}>›</Text>
                  </View>
                </Card>
              </Animated.View>
            ))}

            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginTop: 16 }}>
              INCOME CATEGORIES ({incomeCategories.length})
            </Text>
            {incomeCategories.map((cat, index) => (
              <Animated.View key={cat.id} entering={FadeInUp.delay((expenseCategories.length + index) * 40)}>
                <Card onPress={() => router.push(`/categories/${cat.id}`)}>
                  <View style={styles.catRow}>
                    <View style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
                      <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{cat.name}</Text>
                      <Text variant="bodySm" color={colors.textTertiary}>
                        {cat.subcategories?.length || 0} subcategories
                      </Text>
                    </View>
                    <Text variant="bodySm" color={colors.textTertiary}>›</Text>
                  </View>
                </Card>
              </Animated.View>
            ))}
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 8,
  },
  content: { paddingHorizontal: spacing.lg, gap: 8 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
