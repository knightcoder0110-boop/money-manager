import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, Button } from '../../src/components/ui';
import { useThemeColors, spacing } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/auth';

type Screen = 'setup' | 'login' | 'signup';

export default function AuthScreen() {
  const colors = useThemeColors();
  const { serverUrl, setServerUrl } = useAuthStore();

  const [screen, setScreen] = useState<Screen>(serverUrl ? 'login' : 'setup');
  const [urlInput, setUrlInput] = useState(serverUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!urlInput?.trim()) return;
    setLoading(true);
    setError('');
    try {
      await setServerUrl(urlInput.trim());
      setScreen('login');
    } catch {
      setError('Could not save URL. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      haptics.error();
    } else {
      haptics.success();
    }
    setLoading(false);
  };

  const handleSignup = async () => {
    if (!email.trim() || !password) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) {
      setError(error.message);
      haptics.error();
    } else {
      haptics.success();
    }
    setLoading(false);
  };

  // Server URL setup screen
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
            <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
              <Text variant="bodySm" color={colors.textTertiary} style={{ marginBottom: 4 }}>Server URL</Text>
              <TextInput
                placeholder="https://your-server.com"
                placeholderTextColor={colors.textTertiary}
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.textInput, { color: colors.textPrimary }]}
              />
            </View>
            {error ? (
              <Text variant="bodySm" color={colors.danger}>{error}</Text>
            ) : null}
            <Button
              title={loading ? 'Connecting...' : 'Connect'}
              onPress={handleConnect}
              loading={loading}
              fullWidth
              size="lg"
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Login / Signup screen
  const isSignup = screen === 'signup';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.accent + '15', 'transparent']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.springify()} style={styles.authContent}>
            <View style={styles.logoContainer}>
              <Text variant="displaySmall" align="center">💰</Text>
              <Text variant="h1" align="center" style={{ marginTop: 12 }}>
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text variant="body" color={colors.textSecondary} align="center" style={{ marginTop: 8 }}>
                {isSignup ? 'Sign up to start tracking' : 'Sign in to your account'}
              </Text>
            </View>

            <View style={styles.form}>
              {isSignup && (
                <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                  <Text variant="bodySm" color={colors.textTertiary} style={{ marginBottom: 4 }}>Display Name</Text>
                  <TextInput
                    placeholder="Your name"
                    placeholderTextColor={colors.textTertiary}
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    style={[styles.textInput, { color: colors.textPrimary }]}
                  />
                </View>
              )}

              <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                <Text variant="bodySm" color={colors.textTertiary} style={{ marginBottom: 4 }}>Email</Text>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={[styles.textInput, { color: colors.textPrimary }]}
                />
              </View>

              <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                <Text variant="bodySm" color={colors.textTertiary} style={{ marginBottom: 4 }}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    placeholder={isSignup ? 'At least 6 characters' : 'Your password'}
                    placeholderTextColor={colors.textTertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[styles.textInput, styles.passwordInput, { color: colors.textPrimary }]}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={colors.textTertiary} />
                    ) : (
                      <Eye size={20} color={colors.textTertiary} />
                    )}
                  </Pressable>
                </View>
              </View>

              {error ? (
                <Text variant="bodySm" color={colors.danger}>{error}</Text>
              ) : null}

              <Button
                title={loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
                onPress={isSignup ? handleSignup : handleLogin}
                loading={loading}
                fullWidth
                size="lg"
              />

              <Pressable
                onPress={() => {
                  haptics.selection();
                  setError('');
                  setScreen(isSignup ? 'login' : 'signup');
                }}
                style={styles.switchButton}
              >
                <Text variant="body" color={colors.textSecondary} align="center">
                  {isSignup ? 'Already have an account? ' : "Don't have an account? "}
                  <Text variant="bodyMedium" color={colors.accent}>
                    {isSignup ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Text>
              </Pressable>

              {/* Server URL change option */}
              <Pressable
                onPress={() => {
                  haptics.selection();
                  setError('');
                  setScreen('setup');
                }}
                style={styles.switchButton}
              >
                <Text variant="bodySm" color={colors.textTertiary} align="center">
                  Change server URL
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  gradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  setupContent: { flex: 1, justifyContent: 'center', paddingHorizontal: 32, gap: 48 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  authContent: { paddingHorizontal: 32, gap: 48 },
  logoContainer: { alignItems: 'center' },
  form: { gap: 12 },
  inputRow: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    height: 28,
    padding: 0,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  switchButton: {
    paddingVertical: 8,
  },
});
