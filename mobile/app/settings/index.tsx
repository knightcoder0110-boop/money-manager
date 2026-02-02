import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, Button, Input, IconButton } from '../../src/components/ui';
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
      <View style={styles.header}>
        <IconButton icon={<BackIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2">Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Initial Balance */}
        <Card>
          <Text variant="h3" style={{ marginBottom: 12 }}>Initial Balance</Text>
          <Input
            placeholder="e.g., 50000"
            value={initialBalance}
            onChangeText={setInitialBalance}
            keyboardType="numeric"
          />
          <Button
            title="Save Balance"
            variant="secondary"
            onPress={handleSaveBalance}
            loading={updateSettingMutation.isPending}
            size="sm"
          />
        </Card>

        {/* Budget Mode */}
        <Card>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text variant="h3">Budget Mode</Text>
              <Text variant="bodySm" color={colors.textSecondary}>
                Restrict spending to essentials only
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
            <View style={{ marginTop: 12, gap: 8 }}>
              <Input
                label="Daily Limit (₹)"
                placeholder="e.g., 500"
                value={dailyLimit}
                onChangeText={setDailyLimit}
                keyboardType="numeric"
              />
              <Button
                title="Update Limit"
                variant="secondary"
                onPress={handleSaveBudgetLimit}
                size="sm"
              />
            </View>
          )}
        </Card>

        {/* Server URL */}
        <Card>
          <Text variant="h3" style={{ marginBottom: 12 }}>Server Connection</Text>
          <Input
            placeholder="https://your-server.com"
            value={urlInput}
            onChangeText={setUrlInput}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Button title="Update URL" variant="secondary" onPress={handleUpdateUrl} size="sm" />
        </Card>

        {/* Categories */}
        <Card onPress={() => router.push('/categories')}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text variant="h3">Manage Categories</Text>
              <Text variant="bodySm" color={colors.textSecondary}>
                View and organize categories
              </Text>
            </View>
            <Text variant="body" color={colors.textTertiary}>›</Text>
          </View>
        </Card>

        {/* Lock App */}
        <Button title="Lock App" variant="danger" onPress={handleLogout} fullWidth />

        {/* Version */}
        <Text variant="bodySm" color={colors.textTertiary} align="center">
          Money Manager v1.0.0
        </Text>

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
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
