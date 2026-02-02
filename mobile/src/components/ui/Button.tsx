import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Text } from './Text';
import { useThemeColors } from '../../theme';
import { borderRadius, spacing } from '../../theme/spacing';
import { haptics } from '../../utils/haptics';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();

  const bgColors = {
    primary: colors.accent,
    secondary: colors.surfaceElevated,
    ghost: 'transparent',
    danger: colors.danger,
  };

  const pressedBgColors = {
    primary: colors.accentPressed,
    secondary: colors.surfacePressed,
    ghost: colors.surfacePressed,
    danger: '#CC3A47',
  };

  const textColors = {
    primary: '#FFFFFF',
    secondary: colors.textPrimary,
    ghost: colors.accent,
    danger: '#FFFFFF',
  };

  const heights = { sm: 36, md: 44, lg: 52 };
  const paddingsH = { sm: 12, md: 16, lg: 20 };
  const textVariants = { sm: 'label' as const, md: 'bodyMedium' as const, lg: 'bodyMedium' as const };

  const handlePress = (e: any) => {
    haptics.light();
    onPress?.(e);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          height: heights[size],
          paddingHorizontal: paddingsH[size],
          backgroundColor: pressed ? pressedBgColors[variant] : bgColors[variant],
          borderColor: variant === 'secondary' ? colors.border : 'transparent',
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        pressed && { transform: [{ scale: 0.97 }] },
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text variant={textVariants[size]} color={textColors[variant]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
});
