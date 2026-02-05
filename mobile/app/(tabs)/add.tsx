import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { Text, Card, Button, DatePicker } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { getCategories } from '../../src/api/categories';
import { createTransaction } from '../../src/api/transactions';
import { getEvents } from '../../src/api/events';
import { formatCurrency, getToday } from '../../src/utils/format';
import { NECESSITY_COLORS } from '../../src/constants';
import { Necessity, TransactionType, CategoryWithSubs, Subcategory } from '../../src/types';
import { CategoryIcon } from '../../src/components/icons/category-icon';

// Backspace Icon
function BackspaceIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <Path d="M18 9l-6 6" />
      <Path d="M12 9l6 6" />
    </Svg>
  );
}

export default function AddTransactionScreen() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithSubs | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [necessity, setNecessity] = useState<Necessity>('necessary');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getToday());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(true),
  });

  const { data: events } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const categories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter((c) =>
      type === 'income' ? c.is_income : !c.is_income
    );
  }, [allCategories, type]);

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (result) => {
      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      // Reset form
      setAmount('');
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setNecessity('necessary');
      setNote('');
      setDate(getToday());
      setSelectedEventId(null);
    },
    onError: () => {
      haptics.error();
      Alert.alert('Error', 'Failed to save transaction');
    },
  });

  const handleNumpadPress = (key: string) => {
    haptics.light();
    if (key === 'back') {
      setAmount((a) => a.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) setAmount((a) => a + '.');
    } else {
      // Limit decimals to 2
      const parts = amount.split('.');
      if (parts.length === 2 && parts[1].length >= 2) return;
      setAmount((a) => a + key);
    }
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      haptics.warning();
      Alert.alert('Enter an amount');
      return;
    }
    if (!selectedCategory) {
      haptics.warning();
      Alert.alert('Select a category');
      return;
    }

    mutation.mutate({
      type,
      amount: numAmount,
      category_id: selectedCategory.id,
      subcategory_id: selectedSubcategory?.id,
      necessity: type === 'expense' ? necessity : undefined,
      note: note.trim() || undefined,
      transaction_date: date,
      event_id: selectedEventId || undefined,
    });
  };

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'back'],
  ];

  const amountNum = parseFloat(amount) || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Text variant="h1" style={styles.headerTitle}>Add Transaction</Text>

        {/* Type Toggle */}
        <View style={[styles.typeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={() => { setType('expense'); setSelectedCategory(null); haptics.selection(); }}
            style={[
              styles.typeButton,
              type === 'expense' && { backgroundColor: colors.expenseMuted },
            ]}
          >
            <Text variant="label" color={type === 'expense' ? colors.expense : colors.textTertiary}>
              Expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => { setType('income'); setSelectedCategory(null); haptics.selection(); }}
            style={[
              styles.typeButton,
              type === 'income' && { backgroundColor: colors.incomeMuted },
            ]}
          >
            <Text variant="label" color={type === 'income' ? colors.income : colors.textTertiary}>
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount Display */}
        <View style={[styles.amountCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="caption" color={colors.textSecondary}>AMOUNT</Text>
          <Text
            variant="displayLarge"
            color={amount ? (type === 'expense' ? colors.expense : colors.income) : colors.textTertiary}
            style={styles.amountText}
          >
            {amount ? formatCurrency(amountNum) : '₹0'}
          </Text>
        </View>

        {/* Numpad */}
        <View style={styles.numpad}>
          {numpadKeys.map((row, ri) => (
            <View key={ri} style={styles.numpadRow}>
              {row.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => handleNumpadPress(key)}
                  style={({ pressed }) => [
                    styles.numKey,
                    { backgroundColor: pressed ? colors.surfacePressed : colors.surface },
                  ]}
                >
                  {key === 'back' ? (
                    <BackspaceIcon color={colors.textSecondary} size={24} />
                  ) : (
                    <Text variant="h2" color={colors.textPrimary}>
                      {key}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>

        {/* Category Grid */}
        <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
          CATEGORY
        </Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                haptics.light();
                setSelectedCategory(cat);
                setSelectedSubcategory(null);
              }}
              style={({ pressed }) => [
                styles.categoryItem,
                {
                  backgroundColor: selectedCategory?.id === cat.id
                    ? cat.color + '20'
                    : colors.surface,
                  borderColor: selectedCategory?.id === cat.id
                    ? cat.color + '60'
                    : colors.border,
                },
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <View style={[styles.categoryIconBg, { backgroundColor: cat.color + '20' }]}>
                <CategoryIcon icon={cat.icon} size={22} color={cat.color || colors.textPrimary} />
              </View>
              <Text variant="bodySm" numberOfLines={1} align="center" color={
                selectedCategory?.id === cat.id ? colors.textPrimary : colors.textSecondary
              }>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Subcategory Pills */}
        {selectedCategory && selectedCategory.subcategories?.length > 0 && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginBottom: 8 }}>
              SUBCATEGORY
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subcategoryScroll}>
              {selectedCategory.subcategories.map((sub) => (
                <Pressable
                  key={sub.id}
                  onPress={() => {
                    haptics.light();
                    setSelectedSubcategory(selectedSubcategory?.id === sub.id ? null : sub);
                  }}
                  style={[
                    styles.subcategoryPill,
                    {
                      backgroundColor: selectedSubcategory?.id === sub.id
                        ? colors.accentMuted
                        : colors.surface,
                      borderColor: selectedSubcategory?.id === sub.id
                        ? colors.accent
                        : colors.border,
                    },
                  ]}
                >
                  <Text
                    variant="bodySm"
                    color={selectedSubcategory?.id === sub.id ? colors.accent : colors.textSecondary}
                  >
                    {sub.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Necessity Toggle (expense only) */}
        {type === 'expense' && (
          <View>
            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginBottom: 8 }}>
              HOW NECESSARY?
            </Text>
            <View style={styles.necessityToggle}>
              {(['necessary', 'unnecessary', 'debatable'] as Necessity[]).map((n) => {
                const nColors = NECESSITY_COLORS[n];
                const isSelected = necessity === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => { haptics.selection(); setNecessity(n); }}
                    style={[
                      styles.necessityButton,
                      {
                        backgroundColor: isSelected ? nColors.bg : colors.surface,
                        borderColor: isSelected ? nColors.color + '60' : colors.border,
                      },
                    ]}
                  >
                    <Text variant="label" color={isSelected ? nColors.color : colors.textTertiary}>
                      {nColors.label}
                    </Text>
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
          accentColor={type === 'expense' ? colors.expense : colors.income}
        />

        {/* Note */}
        <TextInput
          placeholder="Add a note (optional)"
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

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={mutation.isPending}
          style={({ pressed }) => [
            styles.saveButton,
            { 
              backgroundColor: type === 'expense' ? colors.expense : colors.accent,
              opacity: pressed || mutation.isPending ? 0.8 : 1,
            },
          ]}
        >
          <Text variant="label" color="#FFFFFF">
            {mutation.isPending ? 'Saving...' : `Save ${type === 'expense' ? 'Expense' : 'Income'}`}
          </Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, gap: 16, paddingTop: 8 },
  
  headerTitle: {
    marginBottom: 8,
  },
  
  typeToggle: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
  },
  
  amountCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    gap: 8,
  },
  amountText: {
    letterSpacing: -1,
  },
  
  numpad: { gap: 10 },
  numpadRow: { flexDirection: 'row', gap: 10 },
  numKey: {
    flex: 1,
    height: 58,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 6,
  },
  categoryIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  subcategoryScroll: { gap: 8 },
  subcategoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  
  necessityToggle: {
    flexDirection: 'row',
    gap: 10,
  },
  necessityButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  
  noteInput: {
    height: 52,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  
  saveButton: {
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
