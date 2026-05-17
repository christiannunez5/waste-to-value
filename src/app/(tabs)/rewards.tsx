import { Redirect } from "expo-router";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  BodyText,
  Card,
  EmptyState,
  LoadingState,
  PrimaryButton,
  Screen,
  SectionTitle,
} from "@/components/waste-ui";
import { Fonts, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getRedemptions, getRewards, redeemReward } from "@/lib/database";
import type { Redemption } from "@/types/redemption";
import type { Reward } from "@/types/reward";
import { formatDateTime } from "@/lib/recycling";
import { useAuth } from "@/providers/auth-provider";

export default function RewardsScreen() {
  const theme = useTheme();
  const { user, initializing, refreshUser } = useAuth();
  const [rewards, setRewards] = React.useState<Reward[]>([]);
  const [redemptions, setRedemptions] = React.useState<Redemption[]>([]);
  const [message, setMessage] = React.useState("");
  const [redeemingId, setRedeemingId] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    if (!user) return;

    const [nextRewards, nextRedemptions] = await Promise.all([
      getRewards(),
      getRedemptions(user.id),
    ]);
    setRewards(nextRewards);
    setRedemptions(nextRedemptions);
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (initializing) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  async function handleRedeem(reward: Reward) {
    setMessage("");
    setRedeemingId(reward.id);

    try {
      await redeemReward(user!.id, reward.id);
      await refreshUser();
      await load();
      setMessage(`${reward.name} redeemed successfully.`);
    } catch (caughtError) {
      setMessage(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to redeem reward.",
      );
    } finally {
      setRedeemingId(null);
    }
  }

  return (
    <Screen title="View Rewards" subtitle="">
      <View
        style={[
          styles.pointsPill,
          { backgroundColor: theme.backgroundElement },
        ]}
      >
        <Text style={styles.coinText}>★</Text>
        <Text style={[styles.pointsPillText, { color: theme.text }]}>
          {user.points.toLocaleString()} PTS
        </Text>
      </View>
      {message ? (
        <Card>
          <BodyText>{message}</BodyText>
        </Card>
      ) : null}

      <SectionTitle>Catalog</SectionTitle>
      {rewards.map((reward) => {
        const canRedeem = user.points >= reward.pointsRequired;

        return (
          <Card key={reward.id}>
            <View style={styles.rowBetween}>
              <Image
                source={rewardImage(reward.name)}
                style={styles.rewardImage}
                contentFit="cover"
              />
              <View style={styles.rewardText}>
                <SectionTitle>{reward.name}</SectionTitle>
                <Text
                  style={[styles.rewardPoints, { color: theme.primaryDark }]}
                >
                  {reward.pointsRequired.toLocaleString()} PTS
                </Text>
              </View>
              <PrimaryButton
                title={canRedeem ? "Redeem" : "Locked"}
                onPress={() => handleRedeem(reward)}
                disabled={!canRedeem || redeemingId === reward.id}
              />
            </View>
          </Card>
        );
      })}

      <SectionTitle>Redemption History</SectionTitle>
      {redemptions.length ? (
        redemptions.map((redemption) => (
          <Card key={redemption.id}>
            <View style={styles.rowBetween}>
              <BodyText>{redemption.rewardName}</BodyText>
              <BodyText muted>-{redemption.pointsSpent} pts</BodyText>
            </View>
            <BodyText muted>{formatDateTime(redemption.createdAt)}</BodyText>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No rewards claimed"
          body="Redeemed rewards will appear here after points are spent."
        />
      )}
    </Screen>
  );
}

function rewardImage(name: string) {
  if (name.includes("Eco"))
    return require("@/assets/images/rewards/eco-bag.png");
  if (name.includes("Rice")) return require("@/assets/images/rewards/rice.png");
  if (name.includes("Canned"))
    return require("@/assets/images/rewards/canned-goods.png");
  if (name.includes("GCash"))
    return require("@/assets/images/rewards/gcash.png");
  return require("@/assets/images/rewards/school-supplies.png");
}

const styles = StyleSheet.create({
  pointsPill: {
    position: "absolute",
    top: 12,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
  },
  coinText: {
    color: "#F4C542",
    fontFamily: Fonts.black,
    fontSize: 16,
    fontWeight: 900,
  },
  pointsPillText: {
    fontFamily: Fonts.black,
    fontSize: 12,
    fontWeight: 900,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  rewardImage: {
    width: 92,
    height: 92,
    borderRadius: 9,
    backgroundColor: "#F3FAF4",
  },
  rewardText: {
    flex: 1,
    gap: Spacing.one,
  },
  rewardPoints: {
    fontFamily: Fonts.black,
    fontSize: 22,
    fontWeight: 900,
  },
});
