import { Link, Redirect, type Href } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, Card, EmptyState, LoadingState, Screen, SectionTitle } from '@/components/waste-ui';
import { Fonts, Spacing } from '@/constants/theme';
import { getTransactions, getWeeklyStats, RecyclingTransaction } from '@/lib/database';
import { formatDateTime, formatWeight } from '@/lib/recycling';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { user, initializing, refreshUser } = useAuth();
  const [recentTransactions, setRecentTransactions] = React.useState<RecyclingTransaction[]>([]);
  const [weeklyStats, setWeeklyStats] = React.useState({ weight: 0, points: 0 });
  const userId = user?.id;

  React.useEffect(() => {
    if (!userId) return;
    const activeUserId = userId;

    async function load() {
      await refreshUser();
      const [transactions, stats] = await Promise.all([getTransactions(activeUserId, 3), getWeeklyStats(activeUserId)]);
      setRecentTransactions(transactions);
      setWeeklyStats(stats);
    }

    load();
  }, [refreshUser, userId]);

  if (initializing) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  const weeklyGoal = 2000;
  const progress = Math.min(100, Math.round((weeklyStats.weight / weeklyGoal) * 100));

  return (
    <Screen title="" subtitle="">
      <View style={styles.topBar}>
        <View>
          <BodyText muted>Welcome back,</BodyText>
          <Text style={styles.username}>{user.username}!</Text>
        </View>
        <View style={styles.bell}>
          <Text style={styles.bellIcon}>⌂</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
        </View>
      </View>

      <Card style={styles.pointsCard}>
        <View>
          <Text style={styles.pointsLabel}>Your Points</Text>
          <View style={styles.pointsRow}>
            <Text selectable style={styles.pointsText}>
              {user.points.toLocaleString()}
            </Text>
            <Text style={styles.pts}>PTS</Text>
          </View>
        </View>
        <View style={styles.coin}><Text style={styles.coinStar}>★</Text></View>
        <Link href="/rewards" asChild>
          <Pressable style={styles.rewardButton}>
            <Image source={require('@/assets/images/rewards/gift.png')} style={styles.rewardGift} contentFit="contain" />
            <Text style={styles.rewardButtonText}>View Rewards</Text>
          </Pressable>
        </Link>
      </Card>

      <View style={styles.grid}>
        <Card style={styles.gridCard}>
          <BodyText muted>Total Recycled</BodyText>
          <SectionTitle>{formatWeight(user.totalWeight)}</SectionTitle>
          <Text style={styles.statIcon}>♻</Text>
        </Card>
        <Card style={styles.gridCard}>
          <BodyText muted>This Week</BodyText>
          <SectionTitle>{formatWeight(weeklyStats.weight)}</SectionTitle>
          <Text style={styles.statIcon}>↗</Text>
          <BodyText muted>{progress}% goal</BodyText>
        </Card>
      </View>

      <SectionTitle>What would you like to do?</SectionTitle>
      <View style={styles.actions}>
        <QuickAction href="/weigh" label="Weigh Now" icon="⚖" />
        <QuickAction href="/rewards" label="View Rewards" icon="□" />
        <QuickAction href="/history" label="History" icon="↻" />
        <QuickAction href="/leaderboard" label="Leaderboard" icon="♕" />
      </View>

      <SectionTitle>Recent Activity</SectionTitle>
      {recentTransactions.length ? (
        recentTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <View style={styles.rowBetween}>
              <BodyText>{transaction.wasteType}</BodyText>
              <BodyText style={styles.positive}>+{transaction.points} pts</BodyText>
            </View>
            <BodyText muted>
              {formatWeight(transaction.weightGrams)} • {formatDateTime(transaction.createdAt)}
            </BodyText>
          </Card>
        ))
      ) : (
        <EmptyState title="No recycling yet" body="Use Weigh Now to save your first recycling transaction." />
      )}
    </Screen>
  );
}

function QuickAction({ href, label, icon }: { href: Href; label: string; icon: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.actionButton}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <Text style={styles.actionText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  username: {
    color: '#277F36',
    fontFamily: Fonts.sans,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: 900,
  },
  bell: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 23,
    color: '#101010',
  },
  badge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E53222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 900,
  },
  pointsCard: {
    backgroundColor: '#277F36',
    minHeight: 182,
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: Spacing.three,
  },
  pointsLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: 700,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 50,
    fontWeight: 900,
    fontVariant: ['tabular-nums'],
    fontFamily: Fonts.sans,
  },
  pts: {
    color: '#FFFFFF',
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: 800,
    paddingBottom: 8,
  },
  coin: {
    position: 'absolute',
    top: 28,
    right: 26,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F7B718',
    borderWidth: 5,
    borderColor: '#FFD85B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinStar: {
    color: '#FFE783',
    fontSize: 38,
    lineHeight: 42,
  },
  rewardButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  rewardGift: {
    width: 24,
    height: 24,
  },
  rewardButtonText: {
    color: '#277F36',
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: 900,
  },
  grid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  gridCard: {
    flex: 1,
    minHeight: 82,
    position: 'relative',
  },
  statIcon: {
    position: 'absolute',
    right: Spacing.three,
    bottom: Spacing.three,
    color: '#54A441',
    fontSize: 34,
    fontWeight: 900,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actionButton: {
    width: '48%',
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E9DF',
    boxShadow: '0 3px 12px rgba(16, 46, 26, 0.06)',
  },
  actionIcon: {
    color: '#277F36',
    fontSize: 42,
    lineHeight: 46,
  },
  actionText: {
    color: '#0E6E27',
    fontFamily: Fonts.sans,
    fontWeight: 900,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  positive: {
    color: '#2E8B3C',
    fontWeight: 900,
  },
});
