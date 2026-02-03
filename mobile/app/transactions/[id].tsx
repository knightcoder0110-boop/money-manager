import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, Button, IconButton, DatePicker } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { getTransaction, updateTransaction, deleteTransaction } from '../../src/api/transactions';
import { getCategories } from '../../src/api/categories';
import { formatCurrency, getToday } from '../../src/utils/format';
import { NECESSITY_COLORS } from '../../src/constants';
import { Necessity, CategoryWithSubs, Subcategory } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

export default function EditTransactionScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: txn, isLoading } = useQuery({
    queryKey: ['transactions', id],
    queryFn: () => getTransaction(id!),
    enabled: !!id,
  });

  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(true),
  });

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithSubs | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [necessity, setNecessity] = useState<Necessity>('necessary');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getToday());

  useEffect(() => {
    if (txn) {
      setAmount(String(txn.amount));
      setNecessity(txn.necessity || 'necessary');
      setNote(txn.note || '');
      setDate(txn.transaction_date || getToday());
    }
  }, [txn]);

  useEffect(() => {
    if (txn && allCategories) {
      const cat = allCategories.find((c) => c.id === txn.category_id);
      setSelectedCategory(cat || null);
      if (cat && txn.subcategory_id) {
        const sub = cat.subcategories?.find((s) => s.id === txn.subcategory_id);
        setSelectedSubcategory(sub || null);
      }
    }
  }, [txn, allCategories]);

  const categories = useMemo(() => {
    if (!allCategories || !txn) return [];
    return allCategories.filter((c) =>
      txn.type === 'income' ? c.is_income : !c.is_income
    );
  }, [allCategories, txn]);

  const updateMutation = useMutation({
    mutationFn: (input: Parameters<typeof updateTransaction>[1]) =>
      updateTransaction(id!, input),
    onSuccess: (result) => {
      if (result.error) { Alert.alert('Error', result.error); return; }
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      router.back();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTransaction(id!),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      router.back();
    },
  });

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      haptics.warning();
      Alert.alert('Enter a valid amount');
      return;
    }
    updateMutation.mutate({
      amount: numAmount,
      category_id: selectedCategory?.id,
      subcategory_id: selectedSubcategory?.id || undefined,
      necessity: txn?.type === 'expense' ? necessity : undefined,
      note: note.trim() || undefined,
      transaction_date: date,
    });
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (isLoading || !txn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <IconButton icon={<CloseIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
          <Text variant="h2">Edit Transaction</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <IconButton icon={<CloseIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2">Edit {txn.type === 'expense' ? 'Expense' : 'Income'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.amountSection}>
          <Text variant="caption" color={colors.textSecondary}>AMOUNT</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            style={[styles.amountInput, {
              color: txn.type === 'expense' ? colors.expense : colors.income,
              fontFamily: 'JetBrainsMono-Bold',
            }]}
            placeholder="0"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Category Grid */}
        <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>CATEGORY</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                haptics.light();
                setSelectedCategory(cat);
                setSelectedSubcategory(null);
              }}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: selectedCategory?.id === cat.id ? cat.color + '20' : colors.surface,
                  borderColor: selectedCategory?.id === cat.id ? cat.color + '60' : colors.border,
                },
              ]}
            >
              <CategoryIcon icon={cat.icon} size={22} color={colors.textPrimary} />
              <Text variant="bodySm" numberOfLines={1} align="center"
                color={selectedCategory?.id === cat.id ? colors.textPrimary : colors.textSecondary}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Subcategories */}
        {selectedCategory?.subcategories && selectedCategory.subcategories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {selectedCategory.subcategories.map((sub) => (
              <Pressable
                key={sub.id}
                onPress={() => {
                  haptics.light();
                  setSelectedSubcategory(selectedSubcategory?.id === sub.id ? null : sub);
                }}
                style={[styles.subcatPill, {
                  backgroundColor: selectedSubcategory?.id === sub.id ? colors.accentMuted : colors.surface,
                  borderColor: selectedSubcategory?.id === sub.id ? colors.accent : colors.border,
                }]}
              >
                <Text variant="bodySm" color={selectedSubcategory?.id === sub.id ? colors.accent : colors.textSecondary}>
                  {sub.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Necessity (expense only) */}
        {txn.type === 'expense' && (
          <View>
            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginBottom: 8 }}>
              HOW NECESSARY?
            </Text>
            <View style={styles.necessityToggle}>
              {(['necessary', 'unnecessary', 'debatable'] as Necessity[]).map((n) => {
                const nc = NECESSITY_COLORS[n];
                const selected = necessity === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => { haptics.selection(); setNecessity(n); }}
                    style={[styles.necessityBtn, {
                      backgroundColor: selected ? nc.bg : colors.surface,
                      borderColor: selected ? nc.color + '60' : colors.border,
                    }]}
                  >
                    <Text variant="label" color={selected ? nc.color : colors.textTertiary}>{nc.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Date */}
        <DatePicker
          value={date}
          onChange={setDate}
          accentColor={txn.type === 'expense' ? colors.expense : colors.income}
        />

        {/* Note */}
        <TextInput
          placeholder="Note (optional)"
          placeholderTextColor={colors.textTertiary}
          value={note}
          onChangeText={setNote}
          style={[styles.noteInput, {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: colors.border,
            fontFamily: 'Inter-Regular',
          }]}
        />

        {/* Actions */}
        <Button
          title={updateMutation.isPending ? 'Saving...' : 'Update Transaction'}
          onPress={handleSave}
          loading={updateMutation.isPending}
          fullWidth
          size="lg"
        />
        <Button
          title="Delete Transaction"
          variant="danger"
          onPress={handleDelete}
          loading={deleteMutation.isPending}
          fullWidth
          size="lg"
        />

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
  content: { paddingHorizontal: spacing.lg, gap: 16, paddingTop: 8 },
  amountSection: { alignItems: 'center', gap: 4, paddingVertical: 8 },
  amountInput: { fontSize: 40, textAlign: 'center', minWidth: 150 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryItem: {
    width: '22%', aspectRatio: 1, borderRadius: borderRadius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', gap: 4, padding: 4,
  },
  subcatPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.full, borderWidth: 1,
  },
  necessityToggle: { flexDirection: 'row', gap: 8 },
  necessityBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: borderRadius.md, borderWidth: 1,
  },
  noteInput: {
    height: 48, borderRadius: borderRadius.md, borderWidth: 1, paddingHorizontal: 16, fontSize: 15,
  },
});
