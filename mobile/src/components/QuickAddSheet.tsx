import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { Text, Toast, DatePicker } from './ui';
import { useThemeColors, spacing, borderRadius } from '../theme';
import { haptics } from '../utils/haptics';
import { getCategories } from '../api/categories';
import { createTransaction } from '../api/transactions';
import { formatCurrency, getToday } from '../utils/format';
import { CategoryWithSubs, Subcategory, Necessity } from '../types';
import { CategoryIcon } from './icons/category-icon';
import { NECESSITY_COLORS } from '../constants';
import { useAppStore } from '../store/app';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Icons
function BackspaceIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <Path d="M18 9l-6 6" />
      <Path d="M12 9l6 6" />
    </Svg>
  );
}

function XIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

function CheckIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

function ChevronDownIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function ChevronUpIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 15l-6-6-6 6" />
    </Svg>
  );
}

// Animated Grid Category Item
function GridCategoryItem({
  cat,
  isSelected,
  onPress,
}: {
  cat: CategoryWithSubs;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.92, { damping: 15, stiffness: 400 }),
      withSpring(1.05, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 300 })
    );
    onPress();
  };

  return (
    <Animated.View style={[styles.gridItem, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.gridItemInner,
          {
            backgroundColor: isSelected ? cat.color + '20' : colors.surface,
            borderColor: isSelected ? cat.color + '60' : colors.border,
          },
        ]}
      >
        <View style={[styles.gridIcon, { backgroundColor: cat.color + '20' }]}>
          <CategoryIcon icon={cat.icon} size={20} color={cat.color || colors.textPrimary} />
        </View>
        <Text
          variant="bodySm"
          numberOfLines={1}
          color={isSelected ? colors.textPrimary : colors.textSecondary}
          style={styles.gridLabel}
        >
          {cat.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: string;
}

type TransactionType = 'expense' | 'income';

export function QuickAddSheet({ visible, onClose, initialDate }: QuickAddSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const {
    getFrequentCategoryIds,
    incrementCategoryUsage,
    setLastCategory,
    updateStreak,
    showCelebration,
  } = useAppStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithSubs | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [necessity, setNecessity] = useState<Necessity>('necessary');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(getToday());
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Amount animation
  const amountScale = useSharedValue(1);
  const amountAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: amountScale.value }],
  }));

  // Save button animation
  const saveScale = useSharedValue(1);
  const saveAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  // Fetch all categories
  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(true),
  });

  // Split into frequent (top 6) and rest
  const { frequentCategories, restCategories } = useMemo(() => {
    const filtered = allCategories?.filter(c =>
      type === 'income' ? c.is_income : !c.is_income
    ) ?? [];

    const frequentIds = getFrequentCategoryIds(6);

    const frequent: CategoryWithSubs[] = [];
    const rest: CategoryWithSubs[] = [];

    filtered.forEach(cat => {
      if (frequentIds.includes(cat.id)) {
        frequent.push(cat);
      } else {
        rest.push(cat);
      }
    });

    // Sort frequent by their frequency rank
    frequent.sort((a, b) => frequentIds.indexOf(a.id) - frequentIds.indexOf(b.id));

    // If fewer than 6 frequent, fill from rest
    while (frequent.length < 6 && rest.length > 0) {
      frequent.push(rest.shift()!);
    }

    return { frequentCategories: frequent, restCategories: rest };
  }, [allCategories, type, getFrequentCategoryIds]);

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: (result) => {
      if (result.error) {
        haptics.error();
        setToast({ visible: true, message: result.error, type: 'error' });
        return;
      }
      haptics.success();

      // Animate save button: bounce then morph to checkmark
      saveScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 12, stiffness: 300 })
      );
      setSaveSuccess(true);

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['daily-spending'] });

      if (selectedCategory) {
        incrementCategoryUsage(selectedCategory.id);
        setLastCategory(type, selectedCategory.id);
      }

      const { newMilestone, isFirstToday } = updateStreak(date);
      const savedAmount = formatCurrency(parseFloat(amount));
      const categoryName = selectedCategory?.name || '';

      if (newMilestone) {
        showCelebration(newMilestone);
      } else {
        const prefix = isFirstToday ? 'First one today! ' : '';
        setToast({
          visible: true,
          message: `${prefix}${savedAmount} — ${categoryName}`,
          type: 'success',
        });
      }

      setTimeout(() => {
        onClose();
        setSaveSuccess(false);
      }, 1200);
    },
    onError: () => {
      haptics.error();
      setToast({ visible: true, message: 'Couldn\'t save. Check connection.', type: 'error' });
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setType('expense');
      setAmount('');
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setNecessity('necessary');
      setShowAllCategories(false);
      setShowMoreOptions(false);
      setNote('');
      setDate(initialDate || getToday());
      setSaveSuccess(false);
    }
  }, [visible, initialDate]);

  const handleTypeChange = (newType: TransactionType) => {
    haptics.selection();
    setType(newType);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setShowAllCategories(false);
  };

  const handleNumpadPress = useCallback((key: string) => {
    haptics.light();
    // Subtle amount bounce on each keypress
    amountScale.value = withSequence(
      withTiming(1.03, { duration: 50 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );

    if (key === 'back') {
      setAmount((a) => a.slice(0, -1));
    } else if (key === '.') {
      setAmount((a) => {
        if (!a.includes('.')) return a + '.';
        return a;
      });
    } else {
      setAmount((a) => {
        const parts = a.split('.');
        if (parts.length === 2 && parts[1].length >= 2) return a;
        return a + key;
      });
    }
  }, [amountScale]);

  const handleCategorySelect = (category: CategoryWithSubs) => {
    haptics.light();
    setSelectedCategory(category);
    setSelectedSubcategory(null);

    if (type === 'expense') {
      setNecessity(category.is_essential ? 'necessary' : 'unnecessary');
    }
  };

  const toggleAllCategories = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAllCategories(!showAllCategories);
  };

  const toggleMoreOptions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowMoreOptions(!showMoreOptions);
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      haptics.warning();
      setToast({ visible: true, message: 'Enter an amount', type: 'error' });
      return;
    }
    if (!selectedCategory) {
      haptics.warning();
      setToast({ visible: true, message: 'Pick a category', type: 'error' });
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
    });
  };

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'back'],
  ];

  const amountNum = parseFloat(amount) || 0;
  const canSave = amountNum > 0 && selectedCategory !== null;

  // Build contextual save label
  const saveLabel = canSave
    ? `Save ${formatCurrency(amountNum)} — ${selectedCategory?.name}`
    : `Save ${type === 'expense' ? 'Expense' : 'Income'}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
          />
        </Pressable>

        {/* Sheet */}
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(120)}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text variant="h2">Quick Add</Text>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  { backgroundColor: colors.surface },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <XIcon color={colors.textSecondary} size={20} />
              </Pressable>
            </View>

            {/* Type Toggle */}
            <View style={[styles.typeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable
                onPress={() => handleTypeChange('expense')}
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
                onPress={() => handleTypeChange('income')}
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
            <Animated.View style={[styles.amountArea, amountAnimStyle]}>
              <Text
                variant="displayLarge"
                color={amount ? (type === 'expense' ? colors.expense : colors.income) : colors.textTertiary}
                style={styles.amountText}
              >
                {amount ? formatCurrency(amountNum) : '₹0'}
              </Text>
            </Animated.View>

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
                        { backgroundColor: colors.surface },
                        pressed && { backgroundColor: colors.surfacePressed },
                      ]}
                    >
                      {key === 'back' ? (
                        <BackspaceIcon color={colors.textSecondary} size={22} />
                      ) : (
                        <Text variant="h3" color={colors.textPrimary}>
                          {key}
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>

            {/* Categories — 3x2 Frequent Grid */}
            <View style={styles.section}>
              <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
                CATEGORY
              </Text>
              <View style={styles.categoryGrid}>
                {frequentCategories.map((cat) => (
                  <GridCategoryItem
                    key={cat.id}
                    cat={cat}
                    isSelected={selectedCategory?.id === cat.id}
                    onPress={() => handleCategorySelect(cat)}
                  />
                ))}
              </View>

              {/* Show All Categories Toggle */}
              {restCategories.length > 0 && (
                <>
                  <Pressable
                    onPress={toggleAllCategories}
                    style={[styles.showAllButton, { borderColor: colors.border }]}
                  >
                    <Text variant="bodySm" color={colors.textTertiary}>
                      {showAllCategories ? 'Show less' : `All categories (${restCategories.length + frequentCategories.length})`}
                    </Text>
                    {showAllCategories
                      ? <ChevronUpIcon color={colors.textTertiary} size={16} />
                      : <ChevronDownIcon color={colors.textTertiary} size={16} />
                    }
                  </Pressable>

                  {showAllCategories && (
                    <View style={styles.categoryGrid}>
                      {restCategories.map((cat) => (
                        <GridCategoryItem
                          key={cat.id}
                          cat={cat}
                          isSelected={selectedCategory?.id === cat.id}
                          onPress={() => handleCategorySelect(cat)}
                        />
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Necessity Toggle — Compact, always visible for expenses */}
            {type === 'expense' && (
              <View style={styles.section}>
                <View style={styles.necessityRow}>
                  {(['necessary', 'unnecessary', 'debatable'] as Necessity[]).map((n) => {
                    const nColors = NECESSITY_COLORS[n];
                    const isSelected = necessity === n;
                    return (
                      <Pressable
                        key={n}
                        onPress={() => {
                          haptics.selection();
                          setNecessity(n);
                        }}
                        style={[
                          styles.necessityButton,
                          {
                            backgroundColor: isSelected ? nColors.bg : colors.surface,
                            borderColor: isSelected ? nColors.color + '60' : colors.border,
                          },
                        ]}
                      >
                        <Text
                          variant="caption"
                          color={isSelected ? nColors.color : colors.textTertiary}
                          style={{ textTransform: 'none', letterSpacing: 0 }}
                        >
                          {nColors.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Subcategories — always visible when category has them */}
            {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
              <View style={styles.section}>
                <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
                  SUBCATEGORY
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subcategoryScroll}
                >
                  {selectedCategory.subcategories.map((sub) => (
                    <Pressable
                      key={sub.id}
                      onPress={() => {
                        haptics.light();
                        setSelectedSubcategory(selectedSubcategory?.id === sub.id ? null : sub);
                      }}
                      style={({ pressed }) => [
                        styles.subcategoryChip,
                        {
                          backgroundColor: selectedSubcategory?.id === sub.id
                            ? colors.accentMuted
                            : colors.surface,
                          borderColor: selectedSubcategory?.id === sub.id
                            ? colors.accent
                            : colors.border,
                        },
                        pressed && { opacity: 0.7 },
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
              </View>
            )}

            {/* Date Picker — always visible */}
            <View style={styles.section}>
              <DatePicker
                value={date}
                onChange={setDate}
                accentColor={type === 'expense' ? colors.expense : colors.income}
              />
            </View>

            {/* Add Note toggle */}
            <Pressable
              onPress={toggleMoreOptions}
              style={[styles.moreOptionsToggle, { borderColor: colors.border }]}
            >
              <Text variant="bodySm" color={colors.textTertiary}>
                {showMoreOptions ? 'Hide note' : 'Add a note'}
              </Text>
              {showMoreOptions
                ? <ChevronUpIcon color={colors.textTertiary} size={16} />
                : <ChevronDownIcon color={colors.textTertiary} size={16} />
              }
            </Pressable>

            {showMoreOptions && (
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
            )}

            {/* Save Button — Contextual with success animation */}
            <Animated.View style={saveAnimStyle}>
              <Pressable
                onPress={handleSave}
                disabled={!canSave || mutation.isPending || saveSuccess}
                style={({ pressed }) => [
                  styles.saveButton,
                  {
                    backgroundColor: saveSuccess
                      ? colors.income
                      : canSave
                        ? (type === 'expense' ? colors.expense : colors.income)
                        : colors.border,
                    opacity: pressed || mutation.isPending ? 0.8 : 1,
                  },
                ]}
              >
                {saveSuccess ? (
                  <View style={styles.saveButtonContent}>
                    <CheckIcon color="#FFFFFF" size={22} />
                    <Text variant="label" color="#FFFFFF">Saved!</Text>
                  </View>
                ) : mutation.isPending ? (
                  <Text variant="label" color="#FFFFFF">Saving...</Text>
                ) : (
                  <View style={styles.saveButtonContent}>
                    <CheckIcon color="#FFFFFF" size={18} />
                    <Text variant="label" color="#FFFFFF" numberOfLines={1}>
                      {saveLabel}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          </ScrollView>
        </Animated.View>

        {/* Toast */}
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(prev => ({ ...prev, visible: false }))}
          duration={2000}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    maxHeight: '92%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 4,
    marginBottom: 8,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  amountArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  amountText: {
    letterSpacing: -1,
  },
  numpad: {
    gap: 6,
    marginBottom: 16,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 6,
  },
  numKey: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },

  // Category Grid — 3 columns
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '31.5%',
  },
  gridItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  gridIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    flex: 1,
  },

  // Show all categories toggle
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 4,
  },

  // Subcategories
  subcategoryScroll: {
    gap: 8,
    paddingRight: 16,
  },
  subcategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },

  // Necessity
  necessityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  necessityButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },

  // More options
  moreOptionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    marginBottom: 8,
  },
  moreOptionsContent: {
    gap: 4,
    marginBottom: 8,
  },

  // Note input
  noteInput: {
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  // Save button
  saveButton: {
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
