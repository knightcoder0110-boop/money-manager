import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { Text, Button, Input, IconButton } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
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
      <View style={styles.header}>
        <IconButton icon={<CloseIcon color={colors.textPrimary} />} onPress={() => router.back()} variant="filled" />
        <Text variant="h2">New Event</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Input label="Event Name" placeholder="e.g., Goa Trip" value={name} onChangeText={setName} />
        <Input label="Description (optional)" placeholder="What's the occasion?" value={description} onChangeText={setDescription} />
        <Input label="Start Date" placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
        <Input label="End Date" placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
        <View style={{ marginTop: 8 }}>
          <Button
            title={mutation.isPending ? 'Creating...' : 'Create Event'}
            onPress={handleSave}
            loading={mutation.isPending}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 8,
  },
  content: { paddingHorizontal: spacing.lg, gap: 16, paddingTop: 16 },
});
