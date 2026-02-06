import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { Text, DatePicker, Toast } from '../../src/components/ui';
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

  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ visible: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

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
        haptics.error();
        showToast(result.error, 'error');
        return;
      }
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      // Show success toast with amount and category
      const savedAmount = formatCurrency(parseFloat(amount));
      const categoryName = selectedCategory?.name || 'Unknown';
      showToast(`${savedAmount} logged to ${categoryName}`, 'success');

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
      showToast('Failed to save transaction', 'error');
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
      showToast('How much was it?', 'error');
      return;
    }
    if (!selectedCategory) {
      haptics.warning();
      showToast('Pick a category first', 'error');
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

  // Smart category selection with auto necessity default
  const handleCategorySelect = (cat: CategoryWithSubs) => {
    haptics.light();
    setSelectedCategory(cat);
    setSelectedSubcategory(null);

    // Smart necessity default based on category's is_essential flag
    if (type === 'expense') {
      if (cat.is_essential) {
        setNecessity('necessary');
      } else {
        setNecessity('unnecessary');
      }
    }
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
        <View style={styles.amountArea}>
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
                    pressed && { opacity: 0.5 },
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
              onPress={() => handleCategorySelect(cat)}
              style={({ pressed }) => [
                styles.categoryItem,
                selectedCategory?.id === cat.id && { backgroundColor: cat.color + '12' },
                pressed && { opacity: 0.6 },
              ]}
            >
              <View style={[styles.categoryIconBg, { backgroundColor: cat.color + '20' }]}>
                <CategoryIcon icon={cat.icon} size={22} color={cat.color || colors.textPrimary} />
              </View>
              <Text variant="caption" numberOfLines={1} align="center" color={
                selectedCategory?.id === cat.id ? colors.textPrimary : colors.textTertiary
              } style={{ textTransform: 'none', letterSpacing: 0 }}>
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

        {/* Bottom spacer for fixed button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Bar - Save Button always visible */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          onPress={handleSave}
          disabled={mutation.isPending}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: type === 'expense' ? colors.expense : colors.income,
              opacity: pressed || mutation.isPending ? 0.8 : 1,
            },
          ]}
        >
          <Text variant="label" color="#FFFFFF">
            {mutation.isPending ? 'Saving...' : `Save ${type === 'expense' ? 'Expense' : 'Income'}`}
          </Text>
        </Pressable>
      </View>

      {/* Success/Error Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
        duration={2500}
      />
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
  
  amountArea: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  amountText: {
    letterSpacing: -1,
  },
  
  numpad: { gap: 10 },
  numpadRow: { flexDirection: 'row', gap: 10 },
  numKey: {
    flex: 1,
    height: 56,
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
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 4,
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
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 100, // Account for tab bar
    borderTopWidth: 1,
  },
});
