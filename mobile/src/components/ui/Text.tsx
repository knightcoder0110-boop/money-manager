import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typography, TypographyVariant, useThemeColors } from '../../theme';

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function Text({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...props
}: TextProps) {
  const colors = useThemeColors();
  const typo = typography[variant];

  return (
    <RNText
      style={[
        typo,
        { color: color || colors.textPrimary },
        align && { textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
