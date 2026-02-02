import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useThemeColors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  circle?: boolean;
}

export function Skeleton({ width = '100%', height = 16, radius, circle }: SkeletonProps) {
  const colors = useThemeColors();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 1], [0.4, 0.8]),
  }));

  return (
    <Animated.View
      style={[
        {
          width: circle ? height : (width as any),
          height,
          borderRadius: circle ? height / 2 : (radius ?? borderRadius.sm),
          backgroundColor: colors.skeleton,
        },
        animatedStyle,
      ]}
    />
  );
}

export function SkeletonCard() {
  const colors = useThemeColors();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Skeleton width={120} height={14} />
      <Skeleton width={80} height={24} />
      <View style={skeletonStyles.row}>
        <Skeleton width={60} height={12} />
        <Skeleton width={60} height={12} />
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
