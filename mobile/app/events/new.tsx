import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, DatePicker } from '../../src/components/ui';
import { useThemeColors, spacing, borderRadius } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { createEvent } from '../../src/api/events';
import { getToday } from '../../src/utils/format';

function CloseIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

function CalendarIcon({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 2v4M16 2v4M3 10h18" />
      <Path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5" />
    </Svg>
  );
}

export default function NewEventScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(getToday());
  const [endDate, setEndDate] = useState(getToday());

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (result) => {
      if (result.error) { Alert.alert('Error', result.error); return; }
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['events'] });
      router.back();
    },
    onError: () => {
      haptics.error();
      Alert.alert('Error', 'Failed to create event');
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      haptics.warning();
      Alert.alert('Enter a name');
      return;
    }
    mutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      start_date: startDate,
      end_date: endDate,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.closeButton, { backgroundColor: colors.surface }]}
        >
          <CloseIcon color={colors.textPrimary} />
        </Pressable>
        <Text variant="h1">New Event</Text>
        <View style={{ width: 44 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Icon */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.iconSection}>
          <View style={[styles.bigIcon, { backgroundColor: colors.featureTransfer + '20' }]}>
            <CalendarIcon color={colors.featureTransfer} />
          </View>
        </Animated.View>

        {/* Name */}
        <Animated.View entering={FadeInUp.delay(150)}>
          <Text variant="caption" color={colors.textSecondary} style={styles.fieldLabel}>EVENT NAME</Text>
          <TextInput
            placeholder="e.g., Goa Trip"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            style={[styles.input, {
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              fontFamily: 'Inter-Regular',
            }]}
          />
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Text variant="caption" color={colors.textSecondary} style={styles.fieldLabel}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            placeholder="What's the occasion?"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea, {
              color: colors.textPrimary,
              backgroundColor: colors.surface,
              fontFamily: 'Inter-Regular',
            }]}
          />
        </Animated.View>

        {/* Dates */}
        <Animated.View entering={FadeInUp.delay(250)}>
          <Text variant="caption" color={colors.textSecondary} style={styles.fieldLabel}>START DATE</Text>
          <DatePicker value={startDate} onChange={setStartDate} accentColor={colors.featureTransfer} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <Text variant="caption" color={colors.textSecondary} style={styles.fieldLabel}>END DATE</Text>
          <DatePicker value={endDate} onChange={setEndDate} accentColor={colors.featureTransfer} />
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInUp.delay(350)}>
          <Pressable
            onPress={handleSave}
            disabled={mutation.isPending}
            style={({ pressed }) => [
              styles.saveButton,
              {
                backgroundColor: colors.accent,
                opacity: pressed || mutation.isPending ? 0.8 : 1,
              },
            ]}
          >
            <Text variant="label" color="#FFFFFF">
              {mutation.isPending ? 'Creating...' : 'Create Event'}
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
  iconSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  bigIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    marginLeft: 4,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  saveButton: {
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
