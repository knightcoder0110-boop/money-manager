import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Text } from './ui';
import { useThemeColors, spacing, borderRadius } from '../theme';
import { haptics } from '../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MilestoneCelebrationProps {
  visible: boolean;
  milestone: number;
  onDismiss: () => void;
}

// Confetti particle component
function Particle({ delay, startX }: { delay: number; startX: number }) {
  const colors = useThemeColors();
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  const particleColors = [colors.income, colors.expense, colors.accent, colors.warning, '#FFD700'];
  const color = particleColors[Math.floor(Math.random() * particleColors.length)];
  const size = 8 + Math.random() * 8;

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
    translateY.value = withDelay(
      delay,
      withTiming(SCREEN_HEIGHT * 0.8, { duration: 2000 + Math.random() * 1000, easing: Easing.out(Easing.quad) })
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX + (Math.random() - 0.5) * 200, { duration: 2000 + Math.random() * 1000 })
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (2 + Math.random() * 2), { duration: 2500 })
    );
    opacity.value = withDelay(delay + 1500, withTiming(0, { duration: 500 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, backgroundColor: color, borderRadius: size / 2 },
        animatedStyle,
      ]}
    />
  );
}

export function MilestoneCelebration({ visible, milestone, onDismiss }: MilestoneCelebrationProps) {
  const colors = useThemeColors();
  const backdropOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.5);
  const cardOpacity = useSharedValue(0);
  const emojiScale = useSharedValue(0);

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 300,
    startX: Math.random() * SCREEN_WIDTH,
  }));

  useEffect(() => {
    if (visible) {
      haptics.success();
      backdropOpacity.value = withTiming(1, { duration: 200 });
      cardScale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 200 }));
      cardOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));
      emojiScale.value = withDelay(300, withSequence(
        withSpring(1.3, { damping: 4 }),
        withSpring(1, { damping: 8 })
      ));
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      cardScale.value = withTiming(0.8, { duration: 150 });
      cardOpacity.value = withTiming(0, { duration: 150 });
      emojiScale.value = 0;
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const handleDismiss = () => {
    haptics.light();
    onDismiss();
  };

  if (!visible) return null;

  const getMessage = () => {
    if (milestone >= 365) return "Legendary! A full year!";
    if (milestone >= 100) return "Incredible dedication!";
    if (milestone >= 60) return "Two months strong!";
    if (milestone >= 30) return "One month champion!";
    if (milestone >= 14) return "Two weeks running!";
    if (milestone >= 7) return "One week wonder!";
    return "You're on fire!";
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Confetti particles */}
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} startX={p.startX} />
      ))}

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={styles.backdropPressable} onPress={handleDismiss} />
      </Animated.View>

      {/* Card */}
      <Animated.View style={[styles.cardContainer, cardStyle]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Animated.View style={emojiStyle}>
            <Text style={styles.emoji}>🔥</Text>
          </Animated.View>
          <Text variant="h1" align="center" style={{ marginTop: 8 }}>
            {milestone}-Day Streak!
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
            {getMessage()}
          </Text>
          <Pressable
            onPress={handleDismiss}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text variant="label" color="#FFFFFF">Keep Going!</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropPressable: {
    flex: 1,
  },
  cardContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
  },
  particle: {
    position: 'absolute',
    top: 0,
  },
});
