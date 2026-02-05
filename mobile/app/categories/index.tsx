import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  TextInput,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Skeleton } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius, typography } from '../../src/theme';
import {
  getCategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '../../src/api/categories';
import { haptics } from '../../src/utils/haptics';
import { CategoryIcon } from '../../src/components/icons/category-icon';
import type { CategoryWithSubs, Subcategory } from '../../src/types';

// Custom SVG Icons (replacing lucide-react-native)
function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
    </Svg>
  );
}

function PencilIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <Path d="m15 5 4 4" />
    </Svg>
  );
}

function TrashIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <Path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

function ChevronDownIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function ChevronUpIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 15l-6-6-6 6" />
    </Svg>
  );
}

function PlusIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function CheckIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

function XIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
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

// ─── Inline subcategory editing ────────────────────────────────────

function SubcategoryRow({
  sub,
  colors,
  disabled,
}: {
  sub: Subcategory;
  colors: ReturnType<typeof useThemeColors>;
  disabled: boolean;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(sub.name);

  const updateMut = useMutation({
    mutationFn: () => updateSubcategory(sub.id, editName.trim()),
    onSuccess: () => {
      haptics.success();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditing(false);
    },
    onError: () => {
      haptics.error();
      Alert.alert('Error', 'Failed to update subcategory.');
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteSubcategory(sub.id),
    onSuccess: () => {
      haptics.success();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: () => {
      haptics.error();
      Alert.alert('Error', 'Failed to delete subcategory.');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Delete Subcategory',
      `Delete "${sub.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMut.mutate() },
      ],
    );
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    if (editName.trim() === sub.name) {
      setEditing(false);
      return;
    }
    updateMut.mutate();
  };

  const isPending = updateMut.isPending || deleteMut.isPending || disabled;

  if (editing) {
    return (
      <View style={[styles.subRow, { borderTopColor: colors.border }]}>
        <TextInput
          style={[
            styles.inlineInput,
            typography.body,
            {
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor: colors.borderFocused,
            },
          ]}
          value={editName}
          onChangeText={setEditName}
          autoFocus
          editable={!isPending}
          onSubmitEditing={handleSaveEdit}
        />
        <Pressable onPress={handleSaveEdit} disabled={isPending} hitSlop={8}>
          <CheckIcon color={colors.accent} />
        </Pressable>
        <Pressable onPress={() => { setEditName(sub.name); setEditing(false); }} disabled={isPending} hitSlop={8}>
          <XIcon color={colors.textTertiary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.subRow, { borderTopColor: colors.border }]}>
      <Text variant="body" style={{ flex: 1 }}>{sub.name}</Text>
      <Pressable onPress={() => { haptics.selection(); setEditing(true); }} disabled={isPending} hitSlop={8}>
        <PencilIcon color={colors.textTertiary} />
      </Pressable>
      <Pressable onPress={handleDelete} disabled={isPending} hitSlop={8}>
        <TrashIcon color={colors.danger} />
      </Pressable>
    </View>
  );
}

function AddSubcategoryRow({
  categoryId,
  colors,
}: {
  categoryId: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const createMut = useMutation({
    mutationFn: () => createSubcategory({ category_id: categoryId, name: newName.trim() }),
    onSuccess: () => {
      haptics.success();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewName('');
      setAdding(false);
    },
    onError: () => {
      haptics.error();
      Alert.alert('Error', 'Failed to create subcategory.');
    },
  });

  const handleSave = () => {
    if (!newName.trim()) return;
    createMut.mutate();
  };

  if (adding) {
    return (
      <View style={[styles.subRow, { borderTopColor: colors.border }]}>
        <TextInput
          style={[
            styles.inlineInput,
            typography.body,
            {
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor: colors.borderFocused,
            },
          ]}
          value={newName}
          onChangeText={setNewName}
          placeholder="Subcategory name"
          placeholderTextColor={colors.textTertiary}
          autoFocus
          editable={!createMut.isPending}
          onSubmitEditing={handleSave}
        />
        <Pressable onPress={handleSave} disabled={createMut.isPending} hitSlop={8}>
          <CheckIcon color={colors.accent} />
        </Pressable>
        <Pressable onPress={() => { setNewName(''); setAdding(false); }} disabled={createMut.isPending} hitSlop={8}>
          <XIcon color={colors.textTertiary} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.subRow, { borderTopColor: colors.border }]}
      onPress={() => { haptics.selection(); setAdding(true); }}
    >
      <PlusIcon color={colors.accent} />
      <Text variant="bodySm" color={colors.accent}>Add subcategory</Text>
    </Pressable>
  );
}

// ─── Category Row ─────────────────────────────────────────────────

function CategoryRow({
  cat,
  index,
  colors,
}: {
  cat: CategoryWithSubs;
  index: number;
  colors: ReturnType<typeof useThemeColors>;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    haptics.light();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const subCount = cat.subcategories?.length || 0;

  return (
    <Animated.View entering={FadeInUp.delay(index * 40)}>
      <View style={styles.catContainer}>
        <View style={styles.catRow}>
          <Pressable
            onPress={() => router.push(`/categories/${cat.id}`)}
            style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}
          >
            <CategoryIcon icon={cat.icon} size={22} color={cat.color || colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => router.push(`/categories/${cat.id}`)} style={{ flex: 1 }}>
            <Text variant="bodyMedium">{cat.name}</Text>
            <Text variant="bodySm" color={colors.textTertiary}>
              {subCount} subcategor{subCount === 1 ? 'y' : 'ies'}
              {cat.is_essential ? ' · Essential' : ''}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push(`/categories/edit?id=${cat.id}`)} hitSlop={8} style={{ padding: 4 }}>
            <PencilIcon color={colors.textSecondary} size={18} />
          </Pressable>
          <Pressable onPress={toggleExpand} hitSlop={8} style={{ padding: 4 }}>
            {expanded ? (
              <ChevronUpIcon color={colors.textTertiary} />
            ) : (
              <ChevronDownIcon color={colors.textTertiary} />
            )}
          </Pressable>
        </View>

        {expanded && (
          <View style={{ marginTop: 4 }}>
            {(cat.subcategories ?? []).map((sub) => (
              <SubcategoryRow key={sub.id} sub={sub} colors={colors} disabled={false} />
            ))}
            <AddSubcategoryRow categoryId={cat.id} colors={colors} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Main screen ───────────────────────────────────────────────────

export default function CategoriesScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const { data: categories, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(true),
  });

  const expenseCategories = categories?.filter((c) => !c.is_income) ?? [];
  const incomeCategories = categories?.filter((c) => c.is_income) ?? [];

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
        <Text variant="h1">Categories</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.accent} />
        }
      >
        {isLoading ? (
          <View style={{ gap: 8 }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} height={60} />)}
          </View>
        ) : (
          <>
            {/* Expense Categories */}
            <View style={styles.sectionHeader}>
              <Text variant="h3">Expenses</Text>
              <Text variant="bodySm" color={colors.textTertiary}>{expenseCategories.length}</Text>
            </View>
            {expenseCategories.map((cat, index) => (
              <CategoryRow key={cat.id} cat={cat} index={index} colors={colors} />
            ))}

            {/* Income Categories */}
            <View style={[styles.sectionHeader, { marginTop: 12 }]}>
              <Text variant="h3">Income</Text>
              <Text variant="bodySm" color={colors.textTertiary}>{incomeCategories.length}</Text>
            </View>
            {incomeCategories.map((cat, index) => (
              <CategoryRow key={cat.id} cat={cat} index={expenseCategories.length + index} colors={colors} />
            ))}
          </>
        )}
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
  content: { paddingHorizontal: spacing.lg, gap: 8, paddingTop: 8 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  catContainer: {
    paddingVertical: 4,
  },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginLeft: 56,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inlineInput: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
});
