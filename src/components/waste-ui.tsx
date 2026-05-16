import { Link, type Href } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Screen({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.screenContent,
        {
          paddingTop: Math.max(insets.top, Spacing.three),
          paddingBottom: insets.bottom + BottomTabInset + Spacing.six,
        },
      ]}>
      <View style={styles.contentWidth}>
        <View style={styles.header}>
          <Text selectable style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text selectable style={[styles.subtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  const theme = useTheme();

  return <Text style={[styles.sectionTitle, { color: theme.text }]}>{children}</Text>;
}

export function BodyText({
  children,
  style,
  muted,
}: {
  children: React.ReactNode;
  style?: TextStyle;
  muted?: boolean;
}) {
  const theme = useTheme();

  return (
    <Text selectable style={[styles.body, { color: muted ? theme.textSecondary : theme.text }, style]}>
      {children}
    </Text>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = 'primary',
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const theme = useTheme();
  const backgroundColor =
    variant === 'danger' ? theme.danger : variant === 'secondary' ? '#FFFFFF' : theme.primary;
  const color = '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: disabled ? 0.45 : pressed ? 0.78 : 1 },
      ]}>
      <Text style={[styles.buttonText, { color }]}>{title}</Text>
    </Pressable>
  );
}

export function LinkButton({ href, title }: { href: Href; title: string }) {
  return (
    <Link href={href} asChild>
      <Pressable>
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.7 : 1 }}>
            <PrimaryButton title={title} onPress={() => {}} variant="secondary" />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

export function Pill({ children, selected }: { children: React.ReactNode; selected?: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundElement,
          borderColor: selected ? theme.primaryDark : theme.border,
        },
      ]}>
      <Text style={[styles.pillText, { color: selected ? '#FFFFFF' : theme.text }]}>{children}</Text>
    </View>
  );
}

export function LoadingState() {
  const theme = useTheme();

  return (
    <View style={[styles.loading, { backgroundColor: theme.background }]}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card style={styles.empty}>
      <SectionTitle>{title}</SectionTitle>
      <BodyText muted>{body}</BodyText>
    </Card>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  contentWidth: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: 800,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
    boxShadow: '0 4px 16px rgba(16, 46, 26, 0.08)',
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: 800,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 500,
  },
  button: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    boxShadow: '0 3px 10px rgba(39, 127, 54, 0.18)',
  },
  buttonText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: 800,
  },
  pill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    minWidth: 76,
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: 800,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'flex-start',
  },
});
