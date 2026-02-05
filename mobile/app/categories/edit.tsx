import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Input } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { getCategories, updateCategory, deleteCategory } from '../../src/api/categories';
import { haptics } from '../../src/utils/haptics';
import { KEY_ICON_MAP, CategoryIcon } from '../../src/components/icons/category-icon';

const PRESET_COLORS = [
  '#FF5733', '#FF6B6B', '#E74C3C', '#FF9F43', '#FECA57',
  '#00D68F', '#10AC84', '#3B82F6', '#6C5CE7', '#A29BFE',
  '#E84393', '#00B4D8', '#6B7280', '#8B5CF6',
];

const ICON_KEYS = Object.keys(KEY_ICON_MAP);

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

function CheckIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

export default function CategoryEditScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(true),
  });

  const category = categories?.find((c) => c.id === id);

  const [name, setName] = useState(category?.name ?? '');
  const [icon, setIcon] = useState(category?.icon ?? ICON_KEYS[0]);
  const [color, setColor] = useState(category?.color ?? PRESET_COLORS[0]);
  const [isEssential, setIsEssential] = useState(category?.is_essential ?? false);

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
      setIsEssential(category.is_essential);
    }
  }, [category]);

  const updateMutation = useMutation({
    mutationFn: () => updateCategory(id!, { name: name.trim(), icon, color, is_essential: isEssential }),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      router.back();
    },
    onError: () => {
      haptics.error();
      Alert.alert('Error', 'Failed to update category.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(id!),
    onSuccess: () => {
      haptics.success();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      router.back();
    },
    onError: () => {
      haptics.error();
      Alert.alert('Error', 'Failed to delete category.');
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Category name is required.');
      return;
    }
    updateMutation.mutate();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ],
    );
  };

  const isPending = updateMutation.isPending || deleteMutation.isPending;

  if (!category) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: colors.surface }]}
          >
            <CloseIcon color={colors.textPrimary} />
          </Pressable>
          <Text variant="h1">Edit Category</Text>
          <View style={{ width: 44 }} />
        </Animated.View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" color={colors.textSecondary}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeButton, { backgroundColor: colors.surface }]}
        >
          <CloseIcon color={colors.textPrimary} />
        </Pressable>
        <Text variant="h1">Edit Category</Text>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Preview */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.previewSection}>
          <View style={[styles.previewIcon, { backgroundColor: color + '25' }]}>
            <CategoryIcon icon={icon} size={28} color={color} />
          </View>
          <Text variant="h2" color={colors.textPrimary}>{name || 'Category'}</Text>
        </Animated.View>

        {/* Name */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Category name"
            editable={!isPending}
          />
        </Animated.View>

        {/* Icon Picker */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text variant="caption" color={colors.textSecondary} style={styles.fieldLabel}>ICON</Text>
          <View style={styles.iconGrid}>
            {ICON_KEYS.map((key) => {
              const isSelected = key === icon;
              return (
                <Pressable
                  key={key}
                  onPress={() => { haptics.selection(); setIcon(key); }}
                  disabled={isPending}
                  style={[
                    styles.iconCell,
                    {
                      backgroundColor: isSelected ? color + '25' : 'transparent',
                    },
                  ]}
                >
                  <CategoryIcon icon={key} size={22} color={isSelected ? color : colors.textTertiary} />
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Color Picker */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <Text variant="caption" color={colors.textSecondary} style={styles.fieldLabel}>COLOR</Text>
          <View style={styles.colorGrid}>
            {PRESET_COLORS.map((c) => {
              const isSelected = c === color;
              return (
                <Pressable
                  key={c}
                  onPress={() => { haptics.selection(); setColor(c); }}
                  disabled={isPending}
                  style={[
                    styles.colorCell,
                    {
                      backgroundColor: c,
                      transform: [{ scale: isSelected ? 1.2 : 1 }],
                      borderWidth: isSelected ? 3 : 0,
                      borderColor: colors.background,
                    },
                  ]}
                >
                  {isSelected && <CheckIcon color="#FFFFFF" />}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Essential Toggle */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={[styles.switchRow, { backgroundColor: colors.surface }]}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium">Essential</Text>
              <Text variant="bodySm" color={colors.textTertiary}>Mark as essential expense</Text>
            </View>
            <Switch
              value={isEssential}
              onValueChange={(val) => { haptics.selection(); setIsEssential(val); }}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#FFFFFF"
              disabled={isPending}
            />
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInUp.delay(350)} style={{ gap: 12 }}>
          <Pressable
            onPress={handleSave}
            disabled={isPending}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: colors.accent,
                opacity: pressed || isPending ? 0.8 : 1,
              },
            ]}
          >
            <Text variant="label" color="#FFFFFF">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            disabled={isPending}
            style={({ pressed }) => [
              styles.deleteButton,
              {
                backgroundColor: colors.dangerMuted,
                opacity: pressed || isPending ? 0.8 : 1,
              },
            ]}
          >
            <Text variant="label" color={colors.danger}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Category'}
            </Text>
          </Pressable>
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
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: 20,
    paddingTop: 8,
  },
  previewSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    marginLeft: 4,
    marginBottom: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
  },
  saveButton: {
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
