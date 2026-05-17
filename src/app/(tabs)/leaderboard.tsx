import { Redirect } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BodyText, Card, LoadingState, Pill, Screen, SectionTitle } from '@/components/waste-ui';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getLeaderboard } from '@/lib/database';
import type { LeaderboardRow } from '@/types/leaderboard';
import { formatWeight, getEcoBadge } from '@/lib/recycling';
import { useAuth } from '@/providers/auth-provider';

type Period = 'weekly' | 'monthly' | 'all-time';

const periods: { label: string; value: Period }[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All-Time', value: 'all-time' },
];

export default function LeaderboardScreen() {
  const theme = useTheme();
  const { user, initializing } = useAuth();
  const [period, setPeriod] = React.useState<Period>('weekly');
  const [rows, setRows] = React.useState<LeaderboardRow[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      getLeaderboard(period).then(setRows);
    }, [period]),
  );

  if (initializing) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/auth" />;
  }

  return (
    <Screen title="Leaderboard" subtitle="Compare recycling impact across weekly, monthly, and all-time views.">
      <View style={styles.pills}>
        {periods.map((item) => (
          <Pressable key={item.value} onPress={() => setPeriod(item.value)}>
            <Pill selected={period === item.value}>{item.label}</Pill>
          </Pressable>
        ))}
      </View>

      <Card style={styles.podium}>
        {rows.slice(0, 3).map((row, index) => (
          <View key={row.userId} style={[styles.podiumPerson, index === 0 && styles.podiumFirst]}>
            <View style={[styles.medal, { backgroundColor: index === 0 ? '#F4C542' : index === 1 ? '#6B7280' : '#E89B2D' }]}>
              <Text style={styles.medalText}>{index + 1}</Text>
            </View>
            <View style={styles.avatar}><Text style={styles.avatarText}>{row.username.slice(0, 1)}</Text></View>
            <Text style={styles.podiumName}>{row.username.split(' ')[0]}</Text>
            <Text style={[styles.podiumPoints, { color: theme.primaryDark }]}>{row.totalPoints.toLocaleString()} PTS</Text>
          </View>
        ))}
      </Card>

      {rows.slice(3).map((row, index) => (
        <Card key={row.userId}>
          <View style={styles.row}>
            <Text style={[styles.rank, { color: theme.primaryDark }]}>{index + 4}</Text>
            <View style={styles.details}>
              <SectionTitle>{row.username}</SectionTitle>
              <BodyText muted>{getEcoBadge(row.totalPoints)} • {formatWeight(row.totalWeight)}</BodyText>
            </View>
            <BodyText style={[styles.points, { color: theme.primaryDark }]}>{row.totalPoints.toLocaleString()} pts</BodyText>
          </View>
        </Card>
      ))}

      <Card style={styles.encourageCard}>
        <Text style={styles.trophy}>♕</Text>
        <BodyText style={styles.encourageText}>Keep recycling and climb the leaderboard!</BodyText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'center',
  },
  podium: {
    minHeight: 210,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    backgroundColor: '#DFF3E3',
    paddingBottom: Spacing.four,
  },
  podiumPerson: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  podiumFirst: {
    paddingBottom: Spacing.four,
  },
  medal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    color: '#FFFFFF',
    fontFamily: Fonts.black,
    fontSize: 18,
    fontWeight: 900,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3FAF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#1F2937',
    fontFamily: Fonts.black,
    fontSize: 24,
    fontWeight: 900,
  },
  podiumName: {
    color: '#1F2937',
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    fontWeight: 800,
    textAlign: 'center',
  },
  podiumPoints: {
    fontFamily: Fonts.black,
    fontSize: 16,
    fontWeight: 900,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  rank: {
    width: 42,
    fontSize: 20,
    fontWeight: 900,
    fontFamily: Fonts.black,
  },
  details: {
    flex: 1,
    gap: Spacing.one,
  },
  points: {
    fontFamily: Fonts.black,
    fontWeight: 900,
  },
  encourageCard: {
    minHeight: 80,
    backgroundColor: '#DFF3E3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  trophy: {
    color: '#F4C542',
    fontFamily: Fonts.black,
    fontSize: 42,
  },
  encourageText: {
    flex: 1,
    fontFamily: Fonts.black,
    fontWeight: 900,
  },
});
