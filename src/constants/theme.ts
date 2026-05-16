/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#102E1A',
    background: '#FBFCF7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EAF6DE',
    textSecondary: '#647064',
    primary: '#277F36',
    primaryDark: '#0E4E25',
    accent: '#F7B718',
    warning: '#D46E1E',
    info: '#0057D9',
    danger: '#B42318',
    border: '#E5E9DF',
    surfaceTint: '#F1F8E8',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0F1F13',
    backgroundElement: '#172B1B',
    backgroundSelected: '#234B2C',
    textSecondary: '#B7C7BC',
    primary: '#65B76F',
    primaryDark: '#A8DDB0',
    accent: '#F4C542',
    warning: '#F0A33A',
    info: '#6EA8FF',
    danger: '#FFB4AB',
    border: '#2E5C37',
    surfaceTint: '#1B351E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Lexend_500Medium',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Lexend_500Medium',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'Lexend_500Medium',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
