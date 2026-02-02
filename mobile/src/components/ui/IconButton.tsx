import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '../../theme';
import { haptics } from '../../utils/haptics';

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  variant?: 'default' | 'filled';
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  size = 40,
  variant = 'default',
  disabled = false,
}: IconButtonProps) {
  const colors = useThemeColors();

  const handlePress = () => {
    haptics.light();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: variant === 'filled'
            ? pressed ? colors.surfacePressed : colors.surfaceElevated
            : pressed ? colors.surfacePressed : 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        pressed && { transform: [{ scale: 0.9 }] },
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
