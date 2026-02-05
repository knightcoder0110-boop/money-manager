import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useThemeColors, useColorSchemeValue } from '../../src/theme';
import { haptics } from '../../src/utils/haptics';

function HomeIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <Path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Svg>
  );
}

function StatsIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <Path d="M7 16l4-8 4 4 4-8" />
    </Svg>
  );
}

function PlusIcon({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function CalendarIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M8 2v4M16 2v4M3 10h18" />
      <Path d="M21 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5" />
    </Svg>
  );
}

function MenuIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 12h18M3 6h18M3 18h18" />
    </Svg>
  );
}

export default function TabLayout() {
  const colors = useThemeColors();
  const scheme = useColorSchemeValue();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={[styles.tabBarBg, { backgroundColor: colors.tabBar, borderColor: colors.border }]}>
            {Platform.OS === 'ios' && (
              <BlurView tint={scheme === 'dark' ? 'dark' : 'light'} intensity={90} style={StyleSheet.absoluteFill} />
            )}
          </View>
        ),
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
        listeners={{ tabPress: () => haptics.selection() }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <StatsIcon color={color} />,
        }}
        listeners={{ tabPress: () => haptics.selection() }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={[fabStyles.addButton, { backgroundColor: colors.accent }]}>
              <PlusIcon color="#FFFFFF" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
        listeners={{ tabPress: () => haptics.medium() }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: 'Daily',
          tabBarIcon: ({ color }) => <CalendarIcon color={color} />,
        }}
        listeners={{ tabPress: () => haptics.selection() }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <MenuIcon color={color} />,
        }}
        listeners={{ tabPress: () => haptics.selection() }}
      />
    </Tabs>
  );
}

const fabStyles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3DD68C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

const styles = StyleSheet.create({
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
});
