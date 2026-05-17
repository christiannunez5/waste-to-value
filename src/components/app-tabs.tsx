import { type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabIconName = 'home' | 'weigh' | 'rewards' | 'profile';

const visibleTabs: { name: string; label: string; icon: TabIconName }[] = [
  { name: 'index', label: 'Home', icon: 'home' },
  { name: 'weigh', label: 'Weigh', icon: 'weigh' },
  { name: 'rewards', label: 'Rewards', icon: 'rewards' },
  { name: 'profile', label: 'Profile', icon: 'profile' },
];

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
      <View style={[styles.nav, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
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
            <RecycleIcon color="#FFFFFF" />
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
  icon: TabIconName;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const tabColor = active ? theme.primaryDark : theme.textSecondary;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <TabIcon name={icon} color={tabColor} />
      <Text style={[styles.label, { color: tabColor }]}>{label}</Text>
    </Pressable>
  );
}

function TabIcon({ name, color }: { name: TabIconName; color: string }) {
  if (name === 'home') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.homeRoof, { borderBottomColor: color }]} />
        <View style={[styles.homeBody, { backgroundColor: color }]} />
      </View>
    );
  }

  if (name === 'weigh') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.scaleTop, { backgroundColor: color }]} />
        <View style={[styles.scaleHook, { backgroundColor: color }]} />
        <View style={[styles.scaleBody, { borderColor: color }]} />
      </View>
    );
  }

  if (name === 'rewards') {
    return (
      <View style={styles.iconBox}>
        <View style={[styles.giftLid, { backgroundColor: color }]} />
        <View style={[styles.giftBox, { borderColor: color }]}>
          <View style={[styles.giftRibbon, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.iconBox}>
      <View style={[styles.profileHead, { backgroundColor: color }]} />
      <View style={[styles.profileBody, { backgroundColor: color }]} />
    </View>
  );
}

function RecycleIcon({ color }: { color: string }) {
  return (
    <View style={styles.recycleIcon}>
      <View style={[styles.recycleBar, styles.recycleTop, { backgroundColor: color }]} />
      <View style={[styles.recycleBar, styles.recycleLeft, { backgroundColor: color }]} />
      <View style={[styles.recycleBar, styles.recycleRight, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  navWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  nav: {
    width: '100%',
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    minHeight: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconBox: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  homeBody: {
    width: 14,
    height: 12,
    borderRadius: 2,
    marginTop: -1,
  },
  scaleTop: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  scaleHook: {
    width: 3,
    height: 6,
  },
  scaleBody: {
    width: 16,
    height: 12,
    borderWidth: 3,
    borderRadius: 8,
  },
  giftLid: {
    width: 19,
    height: 5,
    borderRadius: 2,
  },
  giftBox: {
    width: 17,
    height: 15,
    borderWidth: 3,
    borderRadius: 2,
    alignItems: 'center',
  },
  giftRibbon: {
    width: 3,
    height: '100%',
  },
  profileHead: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  profileBody: {
    width: 18,
    height: 10,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    marginTop: 2,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.bold,
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
  },
  recycleIcon: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recycleBar: {
    position: 'absolute',
    width: 18,
    height: 7,
    borderRadius: 2,
  },
  recycleTop: {
    top: 6,
    transform: [{ rotate: '0deg' }],
  },
  recycleLeft: {
    bottom: 7,
    left: 5,
    transform: [{ rotate: '120deg' }],
  },
  recycleRight: {
    bottom: 7,
    right: 5,
    transform: [{ rotate: '-120deg' }],
  },
  pressed: {
    opacity: 0.72,
  },
});
