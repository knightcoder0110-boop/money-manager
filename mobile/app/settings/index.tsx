import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { getSettings, updateSetting, toggleBudgetMode } from '../../src/api/settings';
import { useAuthStore } from '../../src/store/auth';
import { BudgetModeSettings } from '../../src/types';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function WalletIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <Path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </Svg>
  );
}

function ShieldIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function ServerIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <Rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <Circle cx="6" cy="6" r="0" />
      <Path d="M6 6h.01M6 18h.01" />
    </Svg>
  );
}

function GridIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="3" width="7" height="7" />
      <Rect x="14" y="3" width="7" height="7" />
      <Rect x="14" y="14" width="7" height="7" />
      <Rect x="3" y="14" width="7" height="7" />
    </Svg>
  );
}

function LockIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

export default function SettingsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { serverUrl, setServerUrl, clearToken } = useAuthStore();

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

  const handleLogout = () => {
    Alert.alert('Lock App', 'This will lock the app and require your PIN to re-enter.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Lock',
        style: 'destructive',
        onPress: async () => {
          await clearToken();
          haptics.medium();
        },
      },
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
        <Text variant="h1" style={{ flex: 1 }}>Settings</Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Initial Balance */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.featureExchange + '20' }]}>
              <WalletIcon color={colors.featureExchange} size={18} />
            </View>
            <Text variant="h3">Initial Balance</Text>
          </View>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Text variant="bodySm" color={colors.textTertiary} style={{ marginBottom: 4 }}>Amount</Text>
            <TextInput
              placeholder="e.g., 50000"
              placeholderTextColor={colors.textTertiary}
              value={initialBalance}
              onChangeText={setInitialBalance}
              keyboardType="numeric"
              style={[styles.textInput, { color: colors.textPrimary }]}
            />
          </View>
          <Pressable
            onPress={handleSaveBalance}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.accentMuted },
              pressed && { opacity: 0.8 },
            ]}
          >
            {updateSettingMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text variant="label" color={colors.accent}>Save Balance</Text>
            )}
          </Pressable>
        </Animated.View>

        {/* Budget Mode */}
        <Animated.View entering={FadeInUp.delay(170)}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.featureBills + '20' }]}>
              <ShieldIcon color={colors.featureBills} size={18} />
            </View>
            <Text variant="h3">Budget Mode</Text>
          </View>
          <View style={[styles.settingRow, { backgroundColor: colors.surface }]}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Restrict Spending</Text>
              <Text variant="bodySm" color={colors.textTertiary}>
                Limit to essentials only
              </Text>
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
              <View style={[styles.inputRow, { backgroundColor: colors.surface, marginTop: 8 }]}>
                <Text variant="bodySm" color={colors.textTertiary} style={{ marginBottom: 4 }}>Daily Limit (₹)</Text>
                <TextInput
                  placeholder="e.g., 500"
                  placeholderTextColor={colors.textTertiary}
                  value={dailyLimit}
                  onChangeText={setDailyLimit}
                  keyboardType="numeric"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>
              <Pressable
                onPress={handleSaveBudgetLimit}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.accentMuted },
                  pressed && { opacity: 0.8 },
                ]}
              >
                {budgetMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text variant="label" color={colors.accent}>Update Limit</Text>
                )}
              </Pressable>
            </Animated.View>
          )}
        </Animated.View>

        {/* Server Connection */}
        <Animated.View entering={FadeInUp.delay(240)}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.featureTransfer + '20' }]}>
              <ServerIcon color={colors.featureTransfer} size={18} />
            </View>
            <Text variant="h3">Server Connection</Text>
          </View>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Text variant="bodySm" color={colors.textTertiary} style={{ marginBottom: 4 }}>Server URL</Text>
            <TextInput
              placeholder="https://your-server.com"
              placeholderTextColor={colors.textTertiary}
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              keyboardType="url"
              style={[styles.textInput, { color: colors.textPrimary }]}
            />
          </View>
          <Pressable
            onPress={handleUpdateUrl}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.accentMuted },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text variant="label" color={colors.accent}>Update URL</Text>
          </Pressable>
        </Animated.View>

        {/* Manage Categories */}
        <Animated.View entering={FadeInUp.delay(310)}>
          <Pressable
            onPress={() => { haptics.selection(); router.push('/categories'); }}
            style={({ pressed }) => [
              styles.navRow,
              { backgroundColor: colors.surface },
              pressed && { backgroundColor: colors.surfacePressed },
            ]}
          >
            <View style={[styles.navIcon, { backgroundColor: colors.featureLoans + '20' }]}>
              <GridIcon color={colors.featureLoans} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Manage Categories</Text>
              <Text variant="bodySm" color={colors.textTertiary}>View and organize categories</Text>
            </View>
            <ChevronRightIcon color={colors.textTertiary} size={18} />
          </Pressable>
        </Animated.View>

        {/* Lock App */}
        <Animated.View entering={FadeInUp.delay(380)}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.lockButton,
              { backgroundColor: colors.dangerMuted },
              pressed && { opacity: 0.8 },
            ]}
          >
            <LockIcon color={colors.danger} size={18} />
            <Text variant="label" color={colors.danger}>Lock App</Text>
          </Pressable>
        </Animated.View>

        {/* Version */}
        <Animated.View entering={FadeInUp.delay(430)}>
          <Text variant="bodySm" color={colors.textTertiary} align="center">
            Money Manager v1.0.0
          </Text>
        </Animated.View>

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
  content: {
    paddingHorizontal: spacing.lg,
    gap: 24,
    paddingTop: 8,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Input row
  inputRow: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    height: 28,
    padding: 0,
  },

  // Settings row (switch)
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Action button
  actionButton: {
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  // Navigation row
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Lock button
  lockButton: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
