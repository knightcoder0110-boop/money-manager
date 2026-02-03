import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Text } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { Receipt, CalendarDays, FolderOpen, BarChart3, Settings } from 'lucide-react-native';

const MENU_ITEMS = [
  { label: 'Transactions', route: '/transactions', description: 'All transactions', icon: Receipt },
  { label: 'Events', route: '/events', description: 'Trips & events', icon: CalendarDays },
  { label: 'Categories', route: '/categories', description: 'Manage categories', icon: FolderOpen },
  { label: 'Analytics', route: '/analytics', description: 'Charts & insights', icon: BarChart3 },
  { label: 'Settings', route: '/settings', description: 'App preferences', icon: Settings },
];

const CARD_GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (Dimensions.get('window').width - PADDING * 2 - CARD_GAP) / 2;

export default function MoreScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text variant="h1" style={{ paddingTop: 8 }}>More</Text>

        <View style={styles.grid}>
          {MENU_ITEMS.map((item, index) => (
            <Animated.View key={item.route} entering={FadeInUp.delay(index * 80).springify()}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  router.push(item.route as any);
                }}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    width: CARD_WIDTH,
                  },
                  pressed && {
                    backgroundColor: colors.surfacePressed,
                    transform: [{ scale: 0.96 }],
                  },
                ]}
              >
                <item.icon size={28} color={colors.accent} strokeWidth={1.8} />
                <Text variant="h3" style={{ marginTop: 8 }}>{item.label}</Text>
                <Text variant="bodySm" color={colors.textSecondary}>{item.description}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: PADDING, gap: 20 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: 20,
    gap: 4,
  },
});
