import React from 'react';
import { View } from 'react-native';
import { useThemeColors } from '../../src/theme';

// This screen is never actually displayed.
// The tab press is intercepted in _layout.tsx to open QuickAddSheet instead.
export default function AddPlaceholder() {
  const colors = useThemeColors();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
