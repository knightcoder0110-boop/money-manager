import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { borderRadius } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  color: string;
  backgroundColor: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, backgroundColor, size = 'sm' }: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          paddingHorizontal: size === 'sm' ? 8 : 10,
          paddingVertical: size === 'sm' ? 2 : 4,
        },
      ]}
    >
      <Text
        variant={size === 'sm' ? 'caption' : 'label'}
        color={color}
        style={size === 'sm' ? { fontSize: 10, textTransform: 'uppercase' } : undefined}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
});
