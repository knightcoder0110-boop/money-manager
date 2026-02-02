export const colors = {
  dark: {
    background: '#0A0A0F',
    surface: '#14141F',
    surfaceElevated: '#1C1C2E',
    surfacePressed: '#252540',

    textPrimary: '#FFFFFF',
    textSecondary: '#8B8BA3',
    textTertiary: '#555570',

    accent: '#6C5CE7',
    accentLight: '#A29BFE',
    accentMuted: 'rgba(108, 92, 231, 0.15)',
    accentPressed: '#5A4BD6',

    income: '#00D68F',
    incomeMuted: 'rgba(0, 214, 143, 0.12)',
    expense: '#FF6B6B',
    expenseMuted: 'rgba(255, 107, 107, 0.12)',

    necessary: '#00D68F',
    necessaryMuted: 'rgba(0, 214, 143, 0.12)',
    unnecessary: '#FF6B6B',
    unnecessaryMuted: 'rgba(255, 107, 107, 0.12)',
    debatable: '#FFD93D',
    debatableMuted: 'rgba(255, 217, 61, 0.12)',

    border: 'rgba(255, 255, 255, 0.06)',
    borderFocused: 'rgba(108, 92, 231, 0.5)',

    tabBar: 'rgba(10, 10, 15, 0.85)',
    overlay: 'rgba(0, 0, 0, 0.6)',

    skeleton: '#1C1C2E',
    skeletonHighlight: '#252540',

    danger: '#FF4757',
    dangerMuted: 'rgba(255, 71, 87, 0.12)',
    success: '#00D68F',
    warning: '#FFD93D',
  },
  light: {
    background: '#F5F5FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfacePressed: '#EDEDF5',

    textPrimary: '#1A1A2E',
    textSecondary: '#6B6B80',
    textTertiary: '#9999AA',

    accent: '#6C5CE7',
    accentLight: '#A29BFE',
    accentMuted: 'rgba(108, 92, 231, 0.08)',
    accentPressed: '#5A4BD6',

    income: '#00B87A',
    incomeMuted: 'rgba(0, 184, 122, 0.10)',
    expense: '#E74C3C',
    expenseMuted: 'rgba(231, 76, 60, 0.10)',

    necessary: '#00B87A',
    necessaryMuted: 'rgba(0, 184, 122, 0.10)',
    unnecessary: '#E74C3C',
    unnecessaryMuted: 'rgba(231, 76, 60, 0.10)',
    debatable: '#E6A800',
    debatableMuted: 'rgba(230, 168, 0, 0.10)',

    border: 'rgba(0, 0, 0, 0.06)',
    borderFocused: 'rgba(108, 92, 231, 0.4)',

    tabBar: 'rgba(255, 255, 255, 0.92)',
    overlay: 'rgba(0, 0, 0, 0.4)',

    skeleton: '#EDEDF5',
    skeletonHighlight: '#E0E0ED',

    danger: '#E74C3C',
    dangerMuted: 'rgba(231, 76, 60, 0.10)',
    success: '#00B87A',
    warning: '#E6A800',
  },
} as const;

export type ThemeColors = {
  [K in keyof typeof colors.dark]: string;
};
export type ColorScheme = 'dark' | 'light';
