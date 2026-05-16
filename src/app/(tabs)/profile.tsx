import { Link, Redirect, router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, Card, LoadingState, PrimaryButton, Screen, SectionTitle } from '@/components/waste-ui';
import { Fonts, Spacing } from '@/constants/theme';
import { getRedemptions } from '@/lib/database';
import { formatWeight, getEcoBadge } from '@/lib/recycling';
import { useAuth } from '@/providers/auth-provider';

export default function ProfileScreen() {
  const { user, initializing, signOut } = useAuth();
  const [redemptionCount, setRedemptionCount] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;

    getRedemptions(user.id).then((redemptions) => setRedemptionCount(redemptions.length));
  }, [user]);

  if (initializing) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  async function handleLogout() {
    await signOut();
    router.replace('/auth');
  }

  return (
    <Screen title="Profile" subtitle="Your personal recycling summary and app settings.">
      <Card style={styles.hero}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.username.slice(0, 1).toUpperCase()}</Text></View>
        <SectionTitle>{user.username}</SectionTitle>
        <BodyText style={styles.badge}>{getEcoBadge(user.points)}</BodyText>
      </Card>

      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <BodyText muted>Points</BodyText>
          <Text selectable style={styles.bigValue}>{user.points.toLocaleString()}</Text>
        </Card>
        <Card style={styles.gridCard}>
          <BodyText muted>Recycled</BodyText>
          <Text selectable style={styles.bigValue}>{formatWeight(user.totalWeight)}</Text>
        </Card>
      </View>

      <Card>
        <BodyText muted>Rewards Claimed</BodyText>
        <SectionTitle>{redemptionCount.toLocaleString()}</SectionTitle>
      </Card>

      <Link href="/leaderboard" asChild>
        <Pressable>
          <Card>
            <SectionTitle>Leaderboard</SectionTitle>
            <BodyText muted>View weekly, monthly, and all-time recycling rankings.</BodyText>
          </Card>
        </Pressable>
      </Link>

      <Card>
        <SectionTitle>App Info</SectionTitle>
        <BodyText muted>Offline-first demo • Android BLE scale support • Expo SDK 55</BodyText>
      </Card>

      <PrimaryButton title="Logout" onPress={handleLogout} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  gridCard: {
    flex: 1,
  },
  bigValue: {
    color: '#2E8B3C',
    fontFamily: Fonts.sans,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 900,
    fontVariant: ['tabular-nums'],
  },
  hero: {
    alignItems: 'center',
    backgroundColor: '#F1F8E8',
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#DCEFE0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#0E6E27',
    fontFamily: Fonts.sans,
    fontSize: 32,
    fontWeight: 900,
  },
  badge: {
    color: '#0E6E27',
    fontWeight: 900,
  },
});
