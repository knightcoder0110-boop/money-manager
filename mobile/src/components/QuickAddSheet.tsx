import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { Text, Toast } from './ui';
import { useThemeColors, spacing, borderRadius } from '../theme';
import { haptics } from '../utils/haptics';
import { getCategories } from '../api/categories';
import { createTransaction } from '../api/transactions';
import { formatCurrency, getToday } from '../utils/format';
import { CategoryWithSubs, Subcategory, Necessity } from '../types';
import { CategoryIcon } from './icons/category-icon';
import { NECESSITY_COLORS } from '../constants';
import { useAppStore } from '../store/app';

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

// Animated Category Chip with bounce effect
function AnimatedCategoryChip({
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
    scale.value = withSpring(1.1, { damping: 8, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.categoryChip,
          {
            backgroundColor: isSelected ? cat.color + '20' : colors.surface,
            borderColor: isSelected ? cat.color : colors.border,
          },
        ]}
      >
        <CategoryIcon icon={cat.icon} size={18} color={cat.color || colors.textPrimary} />
        <Text
          variant="bodySm"
          color={isSelected ? colors.textPrimary : colors.textSecondary}
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
}

type TransactionType = 'expense' | 'income';

export function QuickAddSheet({ visible, onClose }: QuickAddSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Category usage and streak tracking from store
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
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });

  // Fetch all categories
  const { data: allCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(true),
  });

  // Filter and sort categories - frequent ones first
  const categories = useMemo(() => {
    const filtered = allCategories?.filter(c =>
      type === 'income' ? c.is_income : !c.is_income
    ) ?? [];

    const frequentIds = getFrequentCategoryIds(6);

    // Split into frequent and rest
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

    // Return frequent first, then rest
    return [...frequent, ...rest];
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
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      // Track category usage for frequency sorting
      if (selectedCategory) {
        incrementCategoryUsage(selectedCategory.id);
        setLastCategory(type, selectedCategory.id);
      }

      // Update streak and check for milestone
      const { newMilestone } = updateStreak(getToday());

      const savedAmount = formatCurrency(parseFloat(amount));
      const categoryName = selectedCategory?.name || 'Unknown';

      // Show milestone celebration or regular toast
      if (newMilestone) {
        // Show the celebration modal for milestones
        showCelebration(newMilestone);
      } else {
        setToast({
          visible: true,
          message: `${savedAmount} logged to ${categoryName}`,
          type: 'success',
        });
      }

      // Close after brief delay to show toast
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: () => {
      haptics.error();
      setToast({ visible: true, message: 'Failed to save', type: 'error' });
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
    }
  }, [visible]);

  // Reset category when type changes
  const handleTypeChange = (newType: TransactionType) => {
    haptics.selection();
    setType(newType);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

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

  const handleCategorySelect = (category: CategoryWithSubs) => {
    haptics.light();
    setSelectedCategory(category);
    setSelectedSubcategory(null);

    // Smart necessity default based on is_essential (only for expenses)
    if (type === 'expense') {
      if (category.is_essential) {
        setNecessity('necessary');
      } else {
        setNecessity('unnecessary');
      }
    }
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      haptics.warning();
      setToast({ visible: true, message: 'Enter an amount first', type: 'error' });
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
      transaction_date: getToday(),
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
          <View style={styles.amountArea}>
            <Text
              variant="displayLarge"
              color={amount ? (type === 'expense' ? colors.expense : colors.income) : colors.textTertiary}
              style={styles.amountText}
            >
              {amount ? formatCurrency(amountNum) : '₹0'}
            </Text>
          </View>

          {/* Numpad - Compact */}
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

          {/* Categories - Horizontal Scroll */}
          <View style={styles.section}>
            <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
              CATEGORY
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {categories.map((cat) => (
                <AnimatedCategoryChip
                  key={cat.id}
                  cat={cat}
                  isSelected={selectedCategory?.id === cat.id}
                  onPress={() => handleCategorySelect(cat)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Subcategories - Show if category has subcategories */}
          {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
            <Animated.View entering={FadeInDown.duration(200)} style={styles.section}>
              <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
                SUBCATEGORY (OPTIONAL)
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
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
            </Animated.View>
          )}

          {/* Necessity Toggle - Only for expenses */}
          {type === 'expense' && (
            <View style={styles.section}>
              <Text variant="caption" color={colors.textSecondary} style={styles.sectionLabel}>
                NECESSITY
              </Text>
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

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={!canSave || mutation.isPending}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: canSave
                  ? (type === 'expense' ? colors.expense : colors.income)
                  : colors.border,
                opacity: pressed || mutation.isPending ? 0.8 : 1,
              },
            ]}
          >
            {mutation.isPending ? (
              <Text variant="label" color="#FFFFFF">Saving...</Text>
            ) : (
              <View style={styles.saveButtonContent}>
                <CheckIcon color="#FFFFFF" size={20} />
                <Text variant="label" color="#FFFFFF">
                  Save {type === 'expense' ? 'Expense' : 'Income'}
                </Text>
              </View>
            )}
          </Pressable>
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
    maxHeight: '90%',
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
  categoryScroll: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  subcategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
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
  saveButton: {
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
