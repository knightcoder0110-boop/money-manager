import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Text } from './Text';
import { useThemeColors, spacing, borderRadius } from '../../theme';
import { haptics } from '../../utils/haptics';

function CheckIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

function XIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function Toast({
  visible,
  message,
  type = 'success',
  onDismiss,
  duration = 2500,
  action,
}: ToastProps) {
  const colors = useThemeColors();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Animate in
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });

      // Animate checkmark
      checkScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1.2, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      // Auto dismiss
      const timer = setTimeout(() => {
        dismissToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const dismissToast = () => {
    translateY.value = withTiming(100, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismiss)();
    });
    scale.value = withTiming(0.9, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  if (!visible) return null;

  const typeColors = {
    success: { bg: colors.incomeMuted, icon: colors.income, border: colors.income + '40' },
    error: { bg: colors.expenseMuted, icon: colors.expense, border: colors.expense + '40' },
    info: { bg: colors.accentMuted, icon: colors.accent, border: colors.accent + '40' },
  };

  const currentColors = typeColors[type];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={[styles.toast, { backgroundColor: colors.surface, borderColor: currentColors.border }]}>
        {/* Icon */}
        <Animated.View style={[styles.iconContainer, { backgroundColor: currentColors.bg }, checkAnimatedStyle]}>
          <CheckIcon color={currentColors.icon} size={18} />
        </Animated.View>

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text variant="bodyMedium" color={colors.textPrimary} numberOfLines={2}>
            {message}
          </Text>
        </View>

        {/* Action button */}
        {action && (
          <Pressable
            onPress={() => {
              haptics.light();
              action.onPress();
              dismissToast();
            }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: colors.accentMuted },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text variant="label" color={colors.accent}>
              {action.label}
            </Text>
          </Pressable>
        )}

        {/* Dismiss button */}
        <Pressable
          onPress={() => {
            haptics.light();
            dismissToast();
          }}
          style={styles.dismissButton}
        >
          <XIcon color={colors.textTertiary} size={16} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    flex: 1,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  dismissButton: {
    padding: 4,
  },
});
