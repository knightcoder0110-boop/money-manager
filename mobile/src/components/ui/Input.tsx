import React, { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useThemeColors, typography } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          typography.body,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.danger
              : isFocused
              ? colors.borderFocused
              : colors.border,
          },
          style,
        ]}
        placeholderTextColor={colors.textTertiary}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <Text variant="bodySm" color={colors.danger} style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    marginLeft: 4,
  },
  input: {
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  error: {
    marginLeft: 4,
  },
});
