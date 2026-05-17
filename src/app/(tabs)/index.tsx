import { Link, Redirect, type Href } from "expo-router";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  BodyText,
  Card,
  EmptyState,
  LoadingState,
  Screen,
  SectionTitle,
} from "@/components/waste-ui";
import { Fonts, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getTransactions, getWeeklyStats } from "@/lib/database";
import type { RecyclingTransaction } from "@/types/recycling-transaction";
import { formatDateTime, formatWeight } from "@/lib/recycling";
import { useAuth } from "@/providers/auth-provider";

export default function HomeScreen() {
  const theme = useTheme();
  const { user, initializing, refreshUser } = useAuth();
  const [recentTransactions, setRecentTransactions] = React.useState<
    RecyclingTransaction[]
  >([]);
  const [weeklyStats, setWeeklyStats] = React.useState({
    weight: 0,
    points: 0,
  });
  const userId = user?.id;

  React.useEffect(() => {
    if (!userId) return;
    const activeUserId = userId;

    async function load() {
      await refreshUser();
      const [transactions, stats] = await Promise.all([
        getTransactions(activeUserId, 3),
        getWeeklyStats(activeUserId),
      ]);
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
  const progress = Math.min(
    100,
    Math.round((weeklyStats.weight / weeklyGoal) * 100),
  );

  return (
    <Screen title="" subtitle="">
      <View style={styles.topBar}>
        <View>
          <BodyText muted>Welcome back,</BodyText>
          <Text style={[styles.username, { color: theme.primaryDark }]}>
            {user.username}!
          </Text>
        </View>
        <View style={styles.bell}>
          <Text style={[styles.bellIcon, { color: theme.text }]}>⌂</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
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
        <View style={styles.coin}>
          <Text style={styles.coinStar}>★</Text>
        </View>
        <Link href="/rewards" asChild>
          <Pressable style={styles.rewardButton}>
            <Image
              source={require("@/assets/images/rewards/gift.png")}
              style={styles.rewardGift}
              contentFit="contain"
            />
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
              <BodyText style={[styles.positive, { color: theme.primaryDark }]}>
                +{transaction.points} pts
              </BodyText>
            </View>
            <BodyText muted>
              {formatWeight(transaction.weightGrams)} •{" "}
              {formatDateTime(transaction.createdAt)}
            </BodyText>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No recycling yet"
          body="Use Weigh Now to save your first recycling transaction."
        />
      )}
    </Screen>
  );
}

function QuickAction({
  href,
  label,
  icon,
}: {
  href: Href;
  label: string;
  icon: string;
}) {
  const theme = useTheme();

  return (
    <Link href={href} asChild>
      <Pressable
        style={StyleSheet.flatten([
          styles.actionButton,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ])}
      >
        <Text style={[styles.actionIcon, { color: theme.primaryDark }]}>
          {icon}
        </Text>
        <Text style={[styles.actionText, { color: theme.primaryDark }]}>
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.one,
  },
  username: {
    fontFamily: Fonts.black,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: 900,
  },
  bell: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    fontFamily: Fonts.extraBold,
    fontSize: 23,
  },
  badge: {
    position: "absolute",
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#E89B2D",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontFamily: Fonts.black,
    fontSize: 10,
    fontWeight: 900,
  },
  pointsCard: {
    backgroundColor: "#2E8B3C",
    minHeight: 182,
    justifyContent: "space-between",
    borderRadius: 12,
    padding: Spacing.three,
  },
  pointsLabel: {
    color: "#FFFFFF",
    fontFamily: Fonts.bold,
    fontSize: 14,
    fontWeight: 700,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
  },
  pointsText: {
    color: "#FFFFFF",
    fontSize: 44,
    lineHeight: 50,
    fontWeight: 900,
    fontVariant: ["tabular-nums"],
    fontFamily: Fonts.black,
  },
  pts: {
    color: "#FFFFFF",
    fontFamily: Fonts.extraBold,
    fontSize: 18,
    fontWeight: 800,
    paddingBottom: 8,
  },
  coin: {
    position: "absolute",
    top: 28,
    right: 26,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F4C542",
    borderWidth: 5,
    borderColor: "#E89B2D",
    alignItems: "center",
    justifyContent: "center",
  },
  coinStar: {
    color: "#FFFFFF",
    fontFamily: Fonts.black,
    fontSize: 38,
    lineHeight: 42,
  },
  rewardButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.two,
  },
  rewardGift: {
    width: 24,
    height: 24,
  },
  rewardButtonText: {
    color: "#1F6E2A",
    fontFamily: Fonts.black,
    fontSize: 15,
    fontWeight: 900,
  },
  grid: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  gridCard: {
    flex: 1,
    minHeight: 82,
    position: "relative",
  },
  statIcon: {
    position: "absolute",
    right: Spacing.three,
    bottom: Spacing.three,
    fontFamily: Fonts.black,
    color: "#2E8B3C",
    fontSize: 34,
    fontWeight: 900,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  actionButton: {
    width: "48%",
    minHeight: 110,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.two,
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actionIcon: {
    fontFamily: Fonts.black,
    fontSize: 42,
    lineHeight: 46,
  },
  actionText: {
    fontFamily: Fonts.black,
    fontWeight: 900,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  positive: {
    fontFamily: Fonts.black,
    fontWeight: 900,
  },
});
