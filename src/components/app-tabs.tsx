import { Tabs } from 'expo-router';
import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const visibleTabs = [
  { name: 'index', label: 'Home', icon: '⌂' },
  { name: 'weigh', label: 'Weigh', icon: '⚖' },
  { name: 'rewards', label: 'Rewards', icon: '□' },
  { name: 'profile', label: 'Profile', icon: '●' },
] as const;

export default function AppTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <WasteTabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="weigh" />
      <Tabs.Screen name="rewards" />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function WasteTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  function goTo(routeName: string) {
    navigation.navigate(routeName);
  }

  return (
    <View style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}>
      <View style={styles.nav}>
        {visibleTabs.slice(0, 2).map((tab) => (
          <TabButton
            key={tab.name}
            label={tab.label}
            icon={tab.icon}
            active={activeRoute === tab.name}
            onPress={() => goTo(tab.name)}
          />
        ))}

        <Pressable onPress={() => goTo('weigh')} style={({ pressed }) => [styles.centerTap, pressed && styles.pressed]}>
          <View style={[styles.centerButton, { backgroundColor: theme.primary }]}>
            <Text style={styles.centerIcon}>♻</Text>
          </View>
        </Pressable>

        {visibleTabs.slice(2).map((tab) => (
          <TabButton
            key={tab.name}
            label={tab.label}
            icon={tab.icon}
            active={activeRoute === tab.name}
            onPress={() => goTo(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}

function TabButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <Text style={[styles.icon, { color: active ? theme.primary : '#707070' }]}>{icon}</Text>
      <Text style={[styles.label, { color: active ? theme.primary : '#707070' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  nav: {
    width: '100%',
    maxWidth: MaxContentWidth,
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E6E9E1',
    boxShadow: '0 -6px 18px rgba(16, 46, 26, 0.08)',
  },
  tabButton: {
    flex: 1,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: 800,
    fontFamily: Fonts.sans,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: Fonts.sans,
  },
  centerTap: {
    width: 72,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -12 }],
    boxShadow: '0 8px 18px rgba(39, 127, 54, 0.28)',
  },
  centerIcon: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: 900,
  },
  pressed: {
    opacity: 0.72,
  },
});
