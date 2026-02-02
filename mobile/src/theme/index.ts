import { useColorScheme } from 'react-native';
import { colors, ThemeColors, ColorScheme } from './colors';
import { typography, fonts, TypographyVariant } from './typography';
import { spacing, borderRadius } from './spacing';

export { colors, typography, fonts, spacing, borderRadius };
export type { ThemeColors, ColorScheme, TypographyVariant };

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'light' ? colors.light : colors.dark;
}

export function useColorSchemeValue(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'light' ? 'light' : 'dark';
}
