import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { BackgroundGradient, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
  /**
   * Draw the app's background gradient behind this view's children.
   *
   * Opt-in rather than automatic: most ThemedViews are cards and rows nested
   * inside a screen, and giving all of them a gradient would stack dozens of
   * them. Screen roots pass it; nothing else should.
   */
  gradient?: boolean;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  type,
  gradient = false,
  children,
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const base = { backgroundColor: theme[type ?? 'background'] };

  if (!gradient) {
    return (
      <View style={[base, style]} {...otherProps}>
        {children}
      </View>
    );
  }

  return (
    <View style={[base, style]} {...otherProps}>
      <LinearGradient
        colors={[...BackgroundGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
