import { Redirect } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
import { getTransactions } from "@/lib/database";
import { formatWeight } from "@/lib/recycling";
import { useAuth } from "@/providers/auth-provider";
import type { RecyclingTransaction } from "@/types/recycling-transaction";

export default function HistoryScreen() {
  const theme = useTheme();
  const { user, initializing } = useAuth();
  const [transactions, setTransactions] = React.useState<
    RecyclingTransaction[]
  >([]);

  React.useEffect(() => {
    if (!user) return;

    getTransactions(user.id).then(setTransactions);
  }, [user]);

  if (initializing) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Screen title="History" subtitle="">
      <Card style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {formatWeight(user.totalWeight)}
          </Text>
          <Text style={styles.summaryLabel}>Total Recycled</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {user.points.toLocaleString()} PTS
          </Text>
          <Text style={styles.summaryLabel}>Total Earned</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{transactions.length}</Text>
          <Text style={styles.summaryLabel}>Transactions</Text>
        </View>
      </Card>
      {transactions.length ? (
        transactions.map((transaction) => (
          <Card key={transaction.id}>
            <View style={styles.historyRow}>
              <View style={styles.dateBox}>
                <Text style={styles.month}>
                  {new Date(transaction.createdAt)
                    .toLocaleString(undefined, { month: "short" })
                    .toUpperCase()}
                </Text>
                <Text style={styles.day}>
                  {new Date(transaction.createdAt).getDate()}
                </Text>
              </View>
              <View style={styles.historyText}>
                <SectionTitle>{transaction.wasteType}</SectionTitle>
                <BodyText muted>
                  {formatWeight(transaction.weightGrams)}
                </BodyText>
              </View>
              <View style={styles.pointsCol}>
                <BodyText
                  style={[styles.positive, { color: theme.primaryDark }]}
                >
                  +{transaction.points} PTS
                </BodyText>
                <BodyText muted>
                  {new Date(transaction.createdAt).toLocaleTimeString(
                    undefined,
                    { hour: "2-digit", minute: "2-digit" },
                  )}
                </BodyText>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No transactions"
          body="Your weigh-and-earn activity will appear here."
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#2E8B3C",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.one,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontFamily: Fonts.black,
    fontSize: 18,
    fontWeight: 900,
    textAlign: "center",
  },
  summaryLabel: {
    color: "#FFFFFF",
    fontFamily: Fonts.bold,
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  dateBox: {
    width: 58,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#F3FAF4",
    alignItems: "center",
    justifyContent: "center",
  },
  month: {
    color: "#1F2937",
    fontFamily: Fonts.extraBold,
    fontSize: 11,
    fontWeight: 800,
  },
  day: {
    color: "#1F2937",
    fontFamily: Fonts.black,
    fontSize: 25,
    fontWeight: 900,
  },
  historyText: {
    flex: 1,
    gap: Spacing.one,
  },
  pointsCol: {
    alignItems: "flex-end",
    gap: Spacing.one,
  },
  positive: {
    fontFamily: Fonts.black,
    fontWeight: 900,
  },
});
