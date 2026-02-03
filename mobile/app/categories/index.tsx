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
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  X,
} from 'lucide-react-native';
import { Text, Card, IconButton, Skeleton } from '../../src/components/ui';
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

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 12H5M12 19l-7-7 7-7" />
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
          <Check size={18} color={colors.accent} />
        </Pressable>
        <Pressable onPress={() => { setEditName(sub.name); setEditing(false); }} disabled={isPending} hitSlop={8}>
          <X size={18} color={colors.textTertiary} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.subRow, { borderTopColor: colors.border }]}>
      <Text variant="body" style={{ flex: 1 }}>{sub.name}</Text>
      <Pressable onPress={() => { haptics.selection(); setEditing(true); }} disabled={isPending} hitSlop={8}>
        <Pencil size={16} color={colors.textTertiary} />
      </Pressable>
      <Pressable onPress={handleDelete} disabled={isPending} hitSlop={8}>
        <Trash2 size={16} color={colors.danger} />
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
          <Check size={18} color={colors.accent} />
        </Pressable>
        <Pressable onPress={() => { setNewName(''); setAdding(false); }} disabled={createMut.isPending} hitSlop={8}>
          <X size={18} color={colors.textTertiary} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.subRow, { borderTopColor: colors.border }]}
      onPress={() => { haptics.selection(); setAdding(true); }}
    >
      <Plus size={16} color={colors.accent} />
      <Text variant="bodySm" color={colors.accent}>Add subcategory</Text>
    </Pressable>
  );
}

// ─── Category card ─────────────────────────────────────────────────

function CategoryCard({
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
      <Card>
        <View style={styles.catRow}>
          <Pressable onPress={() => router.push(`/categories/${cat.id}`)} style={[styles.catIcon, { backgroundColor: cat.color + '20' }]}>
            <CategoryIcon icon={cat.icon} size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={() => router.push(`/categories/${cat.id}`)} style={{ flex: 1 }}>
            <Text variant="bodyMedium">{cat.name}</Text>
            <Text variant="bodySm" color={colors.textTertiary}>
              {subCount} subcategor{subCount === 1 ? 'y' : 'ies'}
              {cat.is_essential ? ' · Essential' : ''}
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push(`/categories/edit?id=${cat.id}`)} hitSlop={8} style={{ padding: 4 }}>
            <Pencil size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable onPress={toggleExpand} hitSlop={8} style={{ padding: 4 }}>
            {expanded ? (
              <ChevronUp size={20} color={colors.textTertiary} />
            ) : (
              <ChevronDown size={20} color={colors.textTertiary} />
            )}
          </Pressable>
        </View>

        {expanded && (
          <View style={{ marginTop: 8 }}>
            {(cat.subcategories ?? []).map((sub) => (
              <SubcategoryRow key={sub.id} sub={sub} colors={colors} disabled={false} />
            ))}
            <AddSubcategoryRow categoryId={cat.id} colors={colors} />
          </View>
        )}
      </Card>
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
      <View style={styles.header}>
        <IconButton icon={<BackIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2">Categories</Text>
        <View style={{ width: 40 }} />
      </View>

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
            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
              EXPENSE CATEGORIES ({expenseCategories.length})
            </Text>
            {expenseCategories.map((cat, index) => (
              <CategoryCard key={cat.id} cat={cat} index={index} colors={colors} />
            ))}

            <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 4, marginTop: 16 }}>
              INCOME CATEGORIES ({incomeCategories.length})
            </Text>
            {incomeCategories.map((cat, index) => (
              <CategoryCard key={cat.id} cat={cat} index={expenseCategories.length + index} colors={colors} />
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  content: { paddingHorizontal: spacing.lg, gap: 8 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
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
