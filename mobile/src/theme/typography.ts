import { TextStyle } from 'react-native';

export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  mono: 'JetBrainsMono-Bold',
} as const;

export const typography = {
  displayLarge: {
    fontFamily: fonts.mono,
    fontSize: 40,
    lineHeight: 48,
  } as TextStyle,
  displayMedium: {
    fontFamily: fonts.mono,
    fontSize: 32,
    lineHeight: 40,
  } as TextStyle,
  displaySmall: {
    fontFamily: fonts.mono,
    fontSize: 24,
    lineHeight: 32,
  } as TextStyle,

  h1: {
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 32,
  } as TextStyle,
  h2: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  } as TextStyle,
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  bodyMedium: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  bodySm: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  } as TextStyle,
  bodySmMedium: {
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,

  amount: {
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 22,
  } as TextStyle,
  amountLarge: {
    fontFamily: fonts.mono,
    fontSize: 22,
    lineHeight: 28,
  } as TextStyle,
} as const;

export type TypographyVariant = keyof typeof typography;
