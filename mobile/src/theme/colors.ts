export const colors = {
  dark: {
    // Backgrounds - Deep dark with subtle green tint
    background: '#0D0F11',
    surface: '#1A1D21',
    surfaceElevated: '#1E2726',
    surfacePressed: '#243330',

    // Text hierarchy
    textPrimary: '#FFFFFF',
    textSecondary: '#8B9A8F',
    textTertiary: '#5A6B5E',

    // Accent - Vibrant finance green
    accent: '#3DD68C',
    accentLight: '#5EEAA3',
    accentMuted: 'rgba(61, 214, 140, 0.15)',
    accentPressed: '#2BC47A',

    // Income/Expense
    income: '#3DD68C',
    incomeMuted: 'rgba(61, 214, 140, 0.15)',
    expense: '#FF6B6B',
    expenseMuted: 'rgba(255, 107, 107, 0.12)',

    // Necessity tags
    necessary: '#3DD68C',
    necessaryMuted: 'rgba(61, 214, 140, 0.15)',
    unnecessary: '#FF6B6B',
    unnecessaryMuted: 'rgba(255, 107, 107, 0.12)',
    debatable: '#FFD93D',
    debatableMuted: 'rgba(255, 217, 61, 0.12)',

    // Borders
    border: 'rgba(255, 255, 255, 0.08)',
    borderFocused: 'rgba(61, 214, 140, 0.5)',

    // UI elements
    tabBar: 'rgba(13, 15, 17, 0.95)',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Skeleton loading
    skeleton: '#1E2726',
    skeletonHighlight: '#243330',

    // Status colors
    danger: '#FF4757',
    dangerMuted: 'rgba(255, 71, 87, 0.12)',
    success: '#3DD68C',
    warning: '#FFD93D',

    // Feature icon backgrounds
    featureExchange: '#3DD68C',
    featureBills: '#FFD93D',
    featureTransfer: '#4ECDC4',
    featureLoans: '#A78BFA',
    featureMore: '#F472B6',

    // Card gradients
    cardDark: '#1A1D21',
    cardAccent: '#243330',
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

    // Feature icon backgrounds
    featureExchange: '#00B87A',
    featureBills: '#E6A800',
    featureTransfer: '#3498DB',
    featureLoans: '#6C5CE7',
    featureMore: '#E84393',

    // Card gradients
    cardDark: '#FFFFFF',
    cardAccent: '#F0F0FA',
  },
} as const;

export type ThemeColors = {
  [K in keyof typeof colors.dark]: string;
};
export type ColorScheme = 'dark' | 'light';
