import "@/global.css";
import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1F2937",
    background: "#F3FAF4",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#DFF3E3",
    textSecondary: "#6B7280",
    primary: "#2E8B3C",
    primaryDark: "#1F6E2A",
    accent: "#F4C542",
    warning: "#E89B2D",
    info: "#0057D9",
    danger: "#E89B2D",
    border: "#E5E5E5",
    surfaceTint: "#DFF3E3",
  },
  dark: {
    text: "#1F2937",
    background: "#F3FAF4",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#DFF3E3",
    textSecondary: "#6B7280",
    primary: "#2E8B3C",
    primaryDark: "#1F6E2A",
    accent: "#F4C542",
    warning: "#E89B2D",
    info: "#0057D9",
    danger: "#E89B2D",
    border: "#E5E5E5",
    surfaceTint: "#DFF3E3",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    regular: "Lexend_400Regular",
    sans: "Lexend_500Medium",
    semiBold: "Lexend_600SemiBold",
    bold: "Lexend_700Bold",
    extraBold: "Lexend_800ExtraBold",
    black: "Lexend_900Black",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    regular: "Lexend_400Regular",
    sans: "Lexend_500Medium",
    semiBold: "Lexend_600SemiBold",
    bold: "Lexend_700Bold",
    extraBold: "Lexend_800ExtraBold",
    black: "Lexend_900Black",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    regular: "Lexend_400Regular",
    sans: "Lexend_500Medium",
    semiBold: "Lexend_600SemiBold",
    bold: "Lexend_700Bold",
    extraBold: "Lexend_800ExtraBold",
    black: "Lexend_900Black",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
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
