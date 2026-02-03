import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import * as Updates from 'expo-updates';
import { colors } from '../theme';
import { Text } from './ui';
import { Download, X, RefreshCw } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const scheme = useColorScheme();
  const theme = scheme === 'light' ? colors.light : colors.dark;

  useEffect(() => {
    if (__DEV__) return;

    async function checkForUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          setUpdateAvailable(true);
        }
      } catch {
        // Silently fail — no network or update server issue
      }
    }

    checkForUpdate();
  }, []);

  async function handleUpdate() {
    setDownloading(true);
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch {
      setDownloading(false);
    }
  }

  if (!updateAvailable || dismissed) return null;

  return (
    <Modal transparent animationType="fade" visible>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.surfaceElevated }]}
            onPress={() => setDismissed(true)}
            disabled={downloading}
          >
            <X size={18} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.iconContainer, { backgroundColor: theme.accentMuted }]}>
            <Download size={32} color={theme.accent} />
          </View>

          <Text variant="h3" style={styles.title}>
            Update Available
          </Text>
          <Text variant="bodySm" color={theme.textSecondary} style={styles.description}>
            A new version is ready. Update now to get the latest features and fixes.
          </Text>

          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: theme.accent }]}
            onPress={handleUpdate}
            disabled={downloading}
            activeOpacity={0.8}
          >
            {downloading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text variant="body" color="#FFFFFF" style={styles.buttonText}>
                  Updating...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <RefreshCw size={18} color="#FFFFFF" />
                <Text variant="body" color="#FFFFFF" style={styles.buttonText}>
                  Update Now
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDismissed(true)}
            disabled={downloading}
            style={styles.laterButton}
          >
            <Text variant="bodySm" color={theme.textTertiary}>
              Maybe Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: width - 64,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  updateButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
  laterButton: {
    marginTop: 14,
    padding: 4,
  },
});
