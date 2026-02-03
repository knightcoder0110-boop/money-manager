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
import { X, Check } from 'lucide-react-native';
import { Text, Button, Input, IconButton } from '../../src/components/ui';
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

  // Sync state when category loads
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
        <View style={styles.headerBar}>
          <IconButton icon={<X size={22} color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
          <Text variant="h3">Edit Category</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="body" color={colors.textSecondary}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.headerBar}>
        <IconButton icon={<X size={22} color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h3">Edit Category</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name */}
        <Input
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Category name"
          editable={!isPending}
        />

        {/* Icon Picker */}
        <View style={{ gap: 6 }}>
          <Text variant="label" color={colors.textSecondary} style={{ marginLeft: 4 }}>
            Icon
          </Text>
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
                      backgroundColor: isSelected ? color + '25' : colors.surface,
                      borderColor: isSelected ? color : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <CategoryIcon icon={key} size={22} color={isSelected ? color : colors.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Color Picker */}
        <View style={{ gap: 6 }}>
          <Text variant="label" color={colors.textSecondary} style={{ marginLeft: 4 }}>
            Color
          </Text>
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
                  {isSelected && <Check size={16} color="#FFFFFF" strokeWidth={3} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Essential Toggle */}
        <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text variant="bodyMedium">Essential</Text>
          <Switch
            value={isEssential}
            onValueChange={(val) => { haptics.selection(); setIsEssential(val); }}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#FFFFFF"
            disabled={isPending}
          />
        </View>

        {/* Save */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={updateMutation.isPending}
          disabled={isPending}
          fullWidth
          size="lg"
        />

        {/* Delete */}
        <Button
          title="Delete Category"
          variant="danger"
          onPress={handleDelete}
          loading={deleteMutation.isPending}
          disabled={isPending}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: 20,
    paddingTop: 8,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
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
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
});
