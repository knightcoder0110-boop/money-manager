import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';

// Custom SVG Icons
function ReceiptIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <Path d="M12 17.5v-11" />
    </Svg>
  );
}

function CalendarDaysIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 2v4M16 2v4" />
      <Path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5" />
      <Path d="M3 10h18" />
      <Path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
    </Svg>
  );
}

function FolderIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </Svg>
  );
}

function BarChartIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <Path d="M7 16l4-8 4 4 4-8" />
    </Svg>
  );
}

function SettingsIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <Path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
    </Svg>
  );
}

function ChevronRightIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 18l6-6-6-6" />
    </Svg>
  );
}

const MENU_ITEMS = [
  { label: 'Transactions', route: '/transactions', description: 'View all transactions', icon: ReceiptIcon, colorKey: 'featureExchange' as const },
  { label: 'Events', route: '/events', description: 'Trips & events', icon: CalendarDaysIcon, colorKey: 'featureBills' as const },
  { label: 'Categories', route: '/categories', description: 'Manage categories', icon: FolderIcon, colorKey: 'featureTransfer' as const },
  { label: 'Analytics', route: '/analytics', description: 'Charts & insights', icon: BarChartIcon, colorKey: 'featureLoans' as const },
  { label: 'Settings', route: '/settings', description: 'App preferences', icon: SettingsIcon, colorKey: 'featureMore' as const },
];

export default function MoreScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.headerRow}>
          <Text variant="h1">More</Text>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <View>
            {MENU_ITEMS.map((item, index) => {
              const iconColor = (colors as any)[item.colorKey];
              const isLast = index === MENU_ITEMS.length - 1;
              return (
                <Animated.View key={item.route} entering={FadeInUp.delay(120 + index * 60)}>
                  <Pressable
                    onPress={() => {
                      haptics.light();
                      router.push(item.route as any);
                    }}
                    style={({ pressed }) => [
                      styles.menuRow,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                      pressed && { backgroundColor: colors.surfacePressed },
                    ]}
                  >
                    <View style={[styles.menuIcon, { backgroundColor: iconColor + '20' }]}>
                      <item.icon color={iconColor} size={22} />
                    </View>
                    <View style={styles.menuDetails}>
                      <Text variant="bodyMedium">{item.label}</Text>
                      <Text variant="bodySm" color={colors.textTertiary}>{item.description}</Text>
                    </View>
                    <ChevronRightIcon color={colors.textTertiary} />
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInUp.delay(450)} style={styles.appInfo}>
          <Text variant="bodySm" color={colors.textTertiary} align="center">Money Manager</Text>
          <Text variant="caption" color={colors.textTertiary} align="center" style={{ textTransform: 'none' }}>
            v1.0.0
          </Text>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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

  // Menu items
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    gap: 14,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDetails: {
    flex: 1,
    gap: 2,
  },

  // App info
  appInfo: {
    paddingTop: 20,
    gap: 4,
  },
});
