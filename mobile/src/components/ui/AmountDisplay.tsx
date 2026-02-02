import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Text } from './Text';
import { useThemeColors, TypographyVariant } from '../../theme';
import { formatCurrency } from '../../utils/format';

interface AmountDisplayProps {
  amount: number;
  variant?: TypographyVariant;
  showSign?: boolean;
  type?: 'expense' | 'income' | 'neutral';
  animated?: boolean;
  symbol?: string;
}

export function AmountDisplay({
  amount,
  variant = 'amountLarge',
  showSign = false,
  type = 'neutral',
  animated = false,
  symbol = '₹',
}: AmountDisplayProps) {
  const colors = useThemeColors();

  const color =
    type === 'income'
      ? colors.income
      : type === 'expense'
      ? colors.expense
      : colors.textPrimary;

  const prefix = showSign ? (type === 'income' ? '+' : type === 'expense' ? '-' : '') : '';
  const displayAmount = Math.abs(amount);

  return (
    <Text variant={variant} color={color}>
      {prefix}{formatCurrency(displayAmount, symbol)}
    </Text>
  );
}
