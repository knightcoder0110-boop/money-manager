import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Button, Input } from '../../src/components/ui';
import { useThemeColors } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { useAuthStore } from '../../src/store/auth';
import { verifyPassword, getAuthStatus } from '../../src/api/auth';

const PIN_LENGTH = 6;

type Screen = 'setup' | 'pin';

function PinDot({ dotScale, borderColor, accentColor }: { dotScale: Animated.SharedValue<number>; borderColor: string; accentColor: string }) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    backgroundColor: dotScale.value > 0.5 ? accentColor : 'transparent',
  }));

  return (
    <View style={[styles.dotOuter, { borderColor }]}>
      <Animated.View style={[styles.dotInner, { backgroundColor: accentColor }, animStyle]} />
    </View>
  );
}

export default function LockScreen() {
  const colors = useThemeColors();
  const { serverUrl, setServerUrl, unlock, setHasPassword } = useAuthStore();

  const [screen, setScreen] = useState<Screen>(serverUrl ? 'pin' : 'setup');
  const [urlInput, setUrlInput] = useState(serverUrl);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const shakeX = useSharedValue(0);
  const dot0 = useSharedValue(0);
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);
  const dot4 = useSharedValue(0);
  const dot5 = useSharedValue(0);
  const dotScales = [dot0, dot1, dot2, dot3, dot4, dot5];

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-12, { duration: 50 }),
      withTiming(12, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-4, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleConnect = async () => {
    if (!urlInput?.trim()) return;
    setConnecting(true);
    setError('');
    try {
      await setServerUrl(urlInput.trim());
      const status = await getAuthStatus();
      setHasPassword(status.has_password);
      if (status.has_password) {
        setScreen('pin');
      } else {
        await unlock('no-auth');
      }
    } catch {
      setError('Could not connect. Check the URL and try again.');
    } finally {
      setConnecting(false);
    }
  };

  const handlePinPress = useCallback(
    async (digit: string) => {
      if (pin.length >= PIN_LENGTH) return;
      haptics.light();

      const newPin = pin + digit;
      setPin(newPin);
      setError('');

      const idx = newPin.length - 1;
      if (idx < dotScales.length) {
        dotScales[idx].value = withSpring(1, { damping: 12, stiffness: 300 });
      }

      if (newPin.length === PIN_LENGTH) {
        setLoading(true);
        try {
          const result = await verifyPassword(newPin);
          haptics.success();
          await unlock(result.token);
        } catch {
          haptics.error();
          triggerShake();
          setError('Wrong PIN. Try again.');
          dotScales.forEach((s) => {
            s.value = withTiming(0, { duration: 200 });
          });
          setTimeout(() => setPin(''), 300);
        } finally {
          setLoading(false);
        }
      }
    },
    [pin, dotScales]
  );

  const handleBackspace = useCallback(() => {
    if (pin.length === 0) return;
    haptics.light();
    const idx = pin.length - 1;
    dotScales[idx].value = withTiming(0, { duration: 150 });
    setPin((p) => p.slice(0, -1));
  }, [pin, dotScales]);

  if (screen === 'setup') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[colors.accent + '15', 'transparent']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
        />
        <Animated.View entering={FadeInUp.springify()} style={styles.setupContent}>
          <View style={styles.logoContainer}>
            <Text variant="displaySmall" align="center">💰</Text>
            <Text variant="h1" align="center" style={{ marginTop: 12 }}>
              Money Manager
            </Text>
            <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
              Connect to your server to get started
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Server URL"
              placeholder="https://your-server.com"
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              error={error}
            />
            <Button
              title={connecting ? 'Connecting...' : 'Connect'}
              onPress={handleConnect}
              loading={connecting}
              fullWidth
              size="lg"
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'back'],
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.accent + '15', 'transparent']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      <Animated.View entering={FadeIn.delay(200)} style={styles.pinContent}>
        <View style={styles.pinHeader}>
          <Text variant="displaySmall" align="center">🔒</Text>
          <Text variant="h2" align="center" style={{ marginTop: 12 }}>
            Enter your PIN
          </Text>
        </View>

        <Animated.View style={[styles.dotsContainer, shakeStyle]}>
          {dotScales.map((dotScale, i) => (
            <PinDot key={i} dotScale={dotScale} borderColor={colors.border} accentColor={colors.accent} />
          ))}
        </Animated.View>

        {error ? (
          <Animated.View entering={FadeIn}>
            <Text variant="bodySm" color={colors.danger} align="center">{error}</Text>
          </Animated.View>
        ) : (
          <View style={{ height: 20 }} />
        )}

        <View style={styles.numpad}>
          {numpadKeys.map((row, ri) => (
            <View key={ri} style={styles.numpadRow}>
              {row.map((key, ki) => {
                if (key === '') return <View key={ki} style={styles.numpadKey} />;
                if (key === 'back') {
                  return (
                    <Pressable
                      key={ki}
                      style={({ pressed }) => [
                        styles.numpadKey,
                        pressed && { backgroundColor: colors.surfacePressed },
                      ]}
                      onPress={handleBackspace}
                      onLongPress={() => {
                        haptics.medium();
                        dotScales.forEach((s) => { s.value = withTiming(0, { duration: 150 }); });
                        setPin('');
                      }}
                    >
                      <Text variant="h2" color={colors.textSecondary}>⌫</Text>
                    </Pressable>
                  );
                }
                return (
                  <Pressable
                    key={ki}
                    style={({ pressed }) => [
                      styles.numpadKey,
                      pressed && { backgroundColor: colors.surfacePressed, transform: [{ scale: 0.95 }] },
                    ]}
                    onPress={() => handlePinPress(key)}
                    disabled={loading}
                  >
                    <Text variant="displaySmall" color={colors.textPrimary}>{key}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  setupContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, gap: 48 },
  logoContainer: { alignItems: 'center' },
  form: { gap: 16 },
  pinContent: { flex: 1, paddingTop: 60, alignItems: 'center' },
  pinHeader: { alignItems: 'center', marginBottom: 32 },
  dotsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  dotOuter: {
    width: 16, height: 16, borderRadius: 8, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  dotInner: { width: 16, height: 16, borderRadius: 8 },
  numpad: { marginTop: 32, gap: 12 },
  numpadRow: { flexDirection: 'row', gap: 24 },
  numpadKey: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
  },
});
