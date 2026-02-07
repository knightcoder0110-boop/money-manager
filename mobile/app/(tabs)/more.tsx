import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Alert, Switch, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import { Text, Card } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { useAppStore } from '../../src/store/app';
import { useAuthStore } from '../../src/store/auth';
import { getSettings, updateSetting, toggleBudgetMode } from '../../src/api/settings';
import { BudgetModeSettings } from '../../src/types';

// Icons
function ReceiptIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <Path d="M12 17.5v-11" />
    </Svg>
  );
}

function CalendarDaysIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 2v4M16 2v4" />
      <Path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5" />
      <Path d="M3 10h18" />
    </Svg>
  );
}

function FolderIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </Svg>
  );
}

function FlameIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </Svg>
  );
}

function WalletIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <Path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </Svg>
  );
}

function ShieldIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function ServerIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <Rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <Path d="M6 6h.01M6 18h.01" />
    </Svg>
  );
}

function LockIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

const QUICK_LINKS = [
  { label: 'Transactions', route: '/transactions', icon: ReceiptIcon, colorKey: 'featureExchange' as const },
  { label: 'Events', route: '/events', icon: CalendarDaysIcon, colorKey: 'featureBills' as const },
  { label: 'Categories', route: '/categories', icon: FolderIcon, colorKey: 'featureTransfer' as const },
];

export default function ProfileScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { serverUrl, setServerUrl, signOut, session } = useAuthStore();
  const streak = useAppStore((s) => s.streak);
  const streakInfo = { current: streak.currentStreak, longest: streak.longestStreak, total: streak.totalTransactions };

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  const [initialBalance, setInitialBalance] = useState('');
  const [budgetActive, setBudgetActive] = useState(false);
  const [dailyLimit, setDailyLimit] = useState('');
  const [urlInput, setUrlInput] = useState(serverUrl);

  useEffect(() => {
    if (settings) {
      const balance = settings.initial_balance as { amount?: number };
      if (balance?.amount !== undefined) setInitialBalance(String(balance.amount));

      const budget = settings.budget_mode as BudgetModeSettings | undefined;
      if (budget) {
        setBudgetActive(budget.active);
        setDailyLimit(String(budget.daily_limit || ''));
      }
    }
  }, [settings]);

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) => updateSetting(key, value),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const budgetMutation = useMutation({
    mutationFn: ({ active, limit }: { active: boolean; limit?: number }) =>
      toggleBudgetMode(active, limit),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleSaveBalance = () => {
    const amount = parseFloat(initialBalance);
    if (isNaN(amount)) {
      Alert.alert('Enter a valid amount');
      return;
    }
    updateSettingMutation.mutate({ key: 'initial_balance', value: { amount } });
  };

  const handleToggleBudget = (active: boolean) => {
    haptics.selection();
    setBudgetActive(active);
    const limit = parseFloat(dailyLimit) || 0;
    budgetMutation.mutate({ active, limit: active ? limit : undefined });
  };

  const handleSaveBudgetLimit = () => {
    const limit = parseFloat(dailyLimit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Enter a valid daily limit');
      return;
    }
    budgetMutation.mutate({ active: budgetActive, limit });
  };

  const handleUpdateUrl = async () => {
    if (!urlInput?.trim()) return;
    await setServerUrl(urlInput.trim());
    haptics.success();
    Alert.alert('Server URL updated');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          haptics.medium();
        },
      },
    ]);
  };

  // Streak message
  const getStreakMessage = () => {
    if (streakInfo.current >= 30) return 'Incredible discipline!';
    if (streakInfo.current >= 14) return 'Two weeks strong!';
    if (streakInfo.current >= 7) return 'One week streak!';
    if (streakInfo.current >= 3) return 'Building momentum!';
    if (streakInfo.current >= 1) return 'Keep it going!';
    return 'Start tracking today';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.headerRow}>
          <Text variant="h1">Profile</Text>
        </Animated.View>

        {/* Streak Hero Card */}
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <LinearGradient
            colors={[colors.surfaceElevated, colors.surface]}
            style={[styles.streakCard, { borderColor: colors.border }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.streakTop}>
              <View style={[styles.avatar, { backgroundColor: colors.accentMuted }]}>
                <Text variant="displayLarge" style={{ fontSize: 28 }}>
                  {streakInfo.current > 0 ? '🔥' : '👤'}
                </Text>
              </View>
              <View style={styles.streakInfo}>
                <View style={styles.streakBadge}>
                  <FlameIcon color={streakInfo.current > 0 ? colors.accent : colors.textTertiary} />
                  <Text variant="h2" color={streakInfo.current > 0 ? colors.accent : colors.textTertiary}>
                    {streakInfo.current} day{streakInfo.current !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text variant="bodySm" color={colors.textSecondary}>
                  {getStreakMessage()}
                </Text>
              </View>
            </View>

            <View style={[styles.streakStats, { borderTopColor: colors.border }]}>
              <View style={styles.streakStat}>
                <Text variant="amountLarge" color={colors.textPrimary}>{streakInfo.longest}</Text>
                <Text variant="caption" color={colors.textTertiary}>Best Streak</Text>
              </View>
              <View style={[styles.streakDivider, { backgroundColor: colors.border }]} />
              <View style={styles.streakStat}>
                <Text variant="amountLarge" color={colors.textPrimary}>{streakInfo.total}</Text>
                <Text variant="caption" color={colors.textTertiary}>Total Logged</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Links */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <View style={styles.quickLinks}>
            {QUICK_LINKS.map((item) => {
              const iconColor = (colors as any)[item.colorKey];
              return (
                <Pressable
                  key={item.route}
                  onPress={() => { haptics.light(); router.push(item.route as any); }}
                  style={({ pressed }) => [
                    styles.quickLink,
                    { backgroundColor: colors.surface },
                    pressed && { backgroundColor: colors.surfacePressed },
                  ]}
                >
                  <View style={[styles.quickLinkIcon, { backgroundColor: iconColor + '20' }]}>
                    <item.icon color={iconColor} size={20} />
                  </View>
                  <Text variant="bodySm" color={colors.textPrimary} numberOfLines={1}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>PREFERENCES</Text>

          {/* Initial Balance */}
          <View style={[styles.prefCard, { backgroundColor: colors.surface }]}>
            <View style={styles.prefRow}>
              <View style={[styles.prefIcon, { backgroundColor: colors.featureExchange + '20' }]}>
                <WalletIcon color={colors.featureExchange} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">Initial Balance</Text>
              </View>
            </View>
            <View style={styles.prefInputRow}>
              <TextInput
                placeholder="e.g., 50000"
                placeholderTextColor={colors.textTertiary}
                value={initialBalance}
                onChangeText={setInitialBalance}
                keyboardType="numeric"
                style={[styles.textInput, { color: colors.textPrimary, backgroundColor: colors.surfacePressed }]}
              />
              <Pressable
                onPress={handleSaveBalance}
                style={({ pressed }) => [
                  styles.miniButton,
                  { backgroundColor: colors.accentMuted },
                  pressed && { opacity: 0.8 },
                ]}
              >
                {updateSettingMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text variant="label" color={colors.accent}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Budget Mode */}
          <View style={[styles.prefCard, { backgroundColor: colors.surface, marginTop: 10 }]}>
            <View style={styles.prefRow}>
              <View style={[styles.prefIcon, { backgroundColor: colors.featureBills + '20' }]}>
                <ShieldIcon color={colors.featureBills} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">Budget Mode</Text>
                <Text variant="bodySm" color={colors.textTertiary}>Limit to essentials</Text>
              </View>
              <Switch
                value={budgetActive}
                onValueChange={handleToggleBudget}
                trackColor={{ false: colors.surfacePressed, true: colors.accent + '60' }}
                thumbColor={budgetActive ? colors.accent : colors.textTertiary}
              />
            </View>
            {budgetActive && (
              <Animated.View entering={FadeInUp.delay(50).springify()}>
                <View style={styles.prefInputRow}>
                  <TextInput
                    placeholder="Daily limit (₹)"
                    placeholderTextColor={colors.textTertiary}
                    value={dailyLimit}
                    onChangeText={setDailyLimit}
                    keyboardType="numeric"
                    style={[styles.textInput, { color: colors.textPrimary, backgroundColor: colors.surfacePressed }]}
                  />
                  <Pressable
                    onPress={handleSaveBudgetLimit}
                    style={({ pressed }) => [
                      styles.miniButton,
                      { backgroundColor: colors.accentMuted },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    {budgetMutation.isPending ? (
                      <ActivityIndicator size="small" color={colors.accent} />
                    ) : (
                      <Text variant="label" color={colors.accent}>Save</Text>
                    )}
                  </Pressable>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* Advanced Section */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <Text variant="caption" color={colors.textTertiary} style={styles.sectionLabel}>ADVANCED</Text>

          {/* Server URL */}
          <View style={[styles.prefCard, { backgroundColor: colors.surface }]}>
            <View style={styles.prefRow}>
              <View style={[styles.prefIcon, { backgroundColor: colors.featureTransfer + '20' }]}>
                <ServerIcon color={colors.featureTransfer} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">Server URL</Text>
              </View>
            </View>
            <View style={styles.prefInputRow}>
              <TextInput
                placeholder="https://your-server.com"
                placeholderTextColor={colors.textTertiary}
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                keyboardType="url"
                style={[styles.textInput, { color: colors.textPrimary, backgroundColor: colors.surfacePressed }]}
              />
              <Pressable
                onPress={handleUpdateUrl}
                style={({ pressed }) => [
                  styles.miniButton,
                  { backgroundColor: colors.accentMuted },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text variant="label" color={colors.accent}>Update</Text>
              </Pressable>
            </View>
          </View>

          {/* Sign Out */}
          {session?.user?.email && (
            <Text variant="bodySm" color={colors.textTertiary} align="center" style={{ marginBottom: 4 }}>
              Signed in as {session.user.email}
            </Text>
          )}
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.lockButton,
              { backgroundColor: colors.dangerMuted },
              pressed && { opacity: 0.8 },
            ]}
          >
            <LockIcon color={colors.danger} />
            <Text variant="label" color={colors.danger}>Sign Out</Text>
          </Pressable>
        </Animated.View>

        {/* App Info */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.appInfo}>
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

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },

  // Streak Card
  streakCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  streakTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flex: 1,
    gap: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakStats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  streakDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    gap: 10,
  },
  quickLink: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section label
  sectionLabel: {
    marginBottom: 10,
    marginLeft: 4,
  },

  // Preference cards
  prefCard: {
    borderRadius: borderRadius.lg,
    padding: 14,
    gap: 12,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    height: 40,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
  },
  miniButton: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Lock button
  lockButton: {
    height: 48,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },

  // App info
  appInfo: {
    gap: 4,
  },
});
