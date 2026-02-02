import React from 'react';
import { View, ViewProps, StyleSheet, Pressable } from 'react-native';
import { useThemeColors } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  padding?: keyof typeof spacing;
  onPress?: () => void;
}

export function Card({
  variant = 'default',
  padding = 'lg',
  onPress,
  style,
  children,
  ...props
}: CardProps) {
  const colors = useThemeColors();

  const cardStyle = [
    styles.base,
    {
      backgroundColor: variant === 'elevated' ? colors.surfaceElevated : colors.surface,
      borderColor: colors.border,
      padding: spacing[padding],
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.98 }] },
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
});
